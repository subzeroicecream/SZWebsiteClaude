import { useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";
import { LockKeyhole, LogOut, ShieldCheck } from "lucide-react";

export type CmsRole = "admin" | "editor" | "viewer";
export type CmsSession = { user: User; role: CmsRole; signOut: () => Promise<void> };

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cmsSupabase = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

const rolePriority: Record<CmsRole, number> = { viewer: 1, editor: 2, admin: 3 };

async function resolveRole(userId: string): Promise<CmsRole | null> {
  if (!cmsSupabase) return null;
  const { data, error } = await cmsSupabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) return null;
  const roles = (data ?? []).map((row) => row.role as string).filter((role): role is CmsRole => role in rolePriority);
  return roles.sort((a, b) => rolePriority[b] - rolePriority[a])[0] ?? null;
}

export function CmsAccess({ children }: { children: (session: CmsSession) => React.ReactNode }) {
  const [state, setState] = useState<"loading" | "signed-out" | "denied" | "ready">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<CmsRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!cmsSupabase) { setState("denied"); return; }
    const applySession = async (nextUser: User | null) => {
      if (!nextUser) { setUser(null); setRole(null); setState("signed-out"); return; }
      setState("loading");
      const nextRole = await resolveRole(nextUser.id);
      setUser(nextUser); setRole(nextRole); setState(nextRole ? "ready" : "denied");
    };
    cmsSupabase.auth.getUser().then(({ data }) => applySession(data.user));
    const { data: listener } = cmsSupabase.auth.onAuthStateChange((_event, session) => { void applySession(session?.user ?? null); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    if (!cmsSupabase) return;
    const { error: authError } = await cmsSupabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError("Email or password is incorrect.");
    setSubmitting(false);
  }

  async function signOut() { if (cmsSupabase) await cmsSupabase.auth.signOut(); }

  if (state === "loading") return <main className="cms-gate"><div className="cms-gate-card"><ShieldCheck size={30} /><h1>Checking CMS access</h1><p>Verifying your account and role.</p></div></main>;
  if (state === "ready" && user && role) return <>{children({ user, role, signOut })}</>;

  if (state === "denied" && !cmsSupabase) return <main className="cms-gate"><div className="cms-gate-card"><LockKeyhole size={30} /><h1>CMS configuration required</h1><p>Connect the CMS authentication service before store management can be accessed.</p><code>VITE_SUPABASE_URL<br />VITE_SUPABASE_PUBLISHABLE_KEY</code><a href="/">Return to store locator</a></div></main>;
  if (state === "denied" && user) return <main className="cms-gate"><div className="cms-gate-card"><LockKeyhole size={30} /><h1>Access not assigned</h1><p>Your account does not have a CMS role. Ask an administrator to assign viewer, editor, or administrator access.</p><button onClick={signOut}><LogOut size={17} /> Sign out</button></div></main>;

  return <main className="cms-gate"><form className="cms-login" onSubmit={signIn}><div className="cms-login-mark"><LockKeyhole size={24} /></div><p>Sub Zero CMS</p><h1>Store management</h1><span>Sign in with an authorized account.</span><label>Email<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <div className="cms-login-error" role="alert">{error}</div>}<button type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button><a href="/">Return to store locator</a></form></main>;
}

export interface CmsUserRole { user_id: string; email: string; role: CmsRole; }

export async function listCmsUsers() {
  if (!cmsSupabase) return { data: [] as CmsUserRole[], error: new Error("CMS is not configured") };
  const result = await cmsSupabase.rpc("admin_list_cms_users");
  return { data: (result.data ?? []) as CmsUserRole[], error: result.error };
}

export async function setCmsUserRole(userId: string, role: CmsRole) {
  if (!cmsSupabase) return { error: new Error("CMS is not configured") };
  const result = await cmsSupabase.rpc("admin_set_cms_role", { target_user: userId, next_role: role });
  return { error: result.error };
}
