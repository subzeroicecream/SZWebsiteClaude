import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LogOut, MapPin, Pencil, Plus, Save, Store, Trash2, Users, X } from "lucide-react";
import { fullAddress, getLocations, saveLocations, type Location } from "./locations";
import { CmsAccess, listCmsUsers, setCmsUserRole, type CmsRole, type CmsSession, type CmsUserRole } from "./cmsAuth";

type Tab = "stores" | "flavors" | "branding" | "users" | "form";
type FormState = {
  name: string; storeType: "standard" | "flagship" | "premium" | "catering"; address: string; city: string;
  state: string; postalCode: string; country: string; phone: string; email: string; website: string; description: string;
  facebookUrl: string; instagramUrl: string; twitterUrl: string; tiktokUrl: string; marqiiEmbedId: string;
  googleMapsUrl: string; orderUrl: string; latitude: string; longitude: string; showLocationPage: boolean; showDoorDashButton: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "", storeType: "standard", address: "", city: "", state: "", postalCode: "", country: "United States",
  phone: "", email: "", website: "", description: "", facebookUrl: "", instagramUrl: "", twitterUrl: "", tiktokUrl: "",
  marqiiEmbedId: "", googleMapsUrl: "", orderUrl: "", latitude: "", longitude: "", showLocationPage: true, showDoorDashButton: true, isActive: true,
};

function formFromLocation(location: Location): FormState {
  return {
    name: location.name, storeType: location.storeType ?? (location.serviceType === "catering" ? "catering" : "standard"),
    address: location.address, city: location.city, state: location.state, postalCode: location.postalCode,
    country: location.country ?? "United States", phone: location.phone ?? "", email: location.email ?? "", website: location.website ?? "",
    description: location.description ?? "", facebookUrl: location.facebookUrl ?? "", instagramUrl: location.instagramUrl ?? "",
    twitterUrl: location.twitterUrl ?? "", tiktokUrl: location.tiktokUrl ?? "", marqiiEmbedId: location.marqiiEmbedId ?? "",
    googleMapsUrl: location.googleMapsUrl ?? "", orderUrl: location.orderUrl ?? "", latitude: String(location.latitude), longitude: String(location.longitude),
    showLocationPage: location.showLocationPage !== false, showDoorDashButton: location.showDoorDashButton !== false, isActive: location.isActive !== false,
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function StoreManagement() {
  return <CmsAccess>{(session) => <StoreManagementContent session={session} />}</CmsAccess>;
}

function StoreManagementContent({ session }: { session: CmsSession }) {
  const [tab, setTab] = useState<Tab>("stores");
  const [stores, setStores] = useState<Location[]>(() => getLocations());
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const canEdit = session.role === "admin" || session.role === "editor";
  const canAdmin = session.role === "admin";

  const sortedStores = useMemo(() => [...stores].sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city)), [stores]);

  function openAdd() {
    if (!canEdit) return;
    setForm(emptyForm); setEditingId(null); setErrors({}); setMessage(""); setTab("form");
  }

  function openEdit(store: Location) {
    if (!canEdit) return;
    setForm(formFromLocation(store)); setEditingId(store.id); setErrors({}); setMessage(""); setTab("form");
  }

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter a store name.";
    if (!form.address.trim() && form.storeType !== "catering") next.address = "Enter a street address.";
    if (!form.city.trim()) next.city = "Enter a city.";
    if (!form.state.trim()) next.state = "Enter a state.";
    if (!form.postalCode.trim()) next.postalCode = "Enter a ZIP code.";
    if (!Number.isFinite(Number(form.latitude))) next.latitude = "Enter a valid latitude.";
    if (!Number.isFinite(Number(form.longitude))) next.longitude = "Enter a valid longitude.";
    const marqii = form.marqiiEmbedId.trim().replace(/^hours-/, "");
    if (marqii && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(marqii)) next.marqiiEmbedId = "Enter the UUID from the Marqii embed code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function saveStore(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) return;
    if (!validate()) return;
    const cleanId = editingId ?? `${slugify(`${form.city}-${form.state}`)}-${Date.now().toString(36)}`;
    const location: Location = {
      id: cleanId, name: form.name.trim(), shortName: form.name.replace(/^Sub Zero (Nitrogen )?Ice Cream\s*[—-]?\s*/i, "").trim() || form.city,
      storeType: form.storeType, serviceType: form.storeType === "catering" ? "catering" : "store", address: form.address.trim(),
      city: form.city.trim(), state: form.state.trim().toUpperCase(), postalCode: form.postalCode.trim(), country: form.country,
      phone: form.phone.trim() || undefined, email: form.email.trim() || undefined, website: form.website.trim() || undefined,
      description: form.description.trim() || undefined, facebookUrl: form.facebookUrl.trim() || undefined, instagramUrl: form.instagramUrl.trim() || undefined,
      twitterUrl: form.twitterUrl.trim() || undefined, tiktokUrl: form.tiktokUrl.trim() || undefined,
      marqiiEmbedId: form.marqiiEmbedId.trim().replace(/^hours-/, "") || undefined, googleMapsUrl: form.googleMapsUrl.trim() || undefined,
      orderUrl: form.orderUrl.trim() || undefined, latitude: Number(form.latitude), longitude: Number(form.longitude),
      showLocationPage: form.showLocationPage, showDoorDashButton: form.showDoorDashButton, isActive: form.isActive,
    };
    const next = editingId ? stores.map((store) => store.id === editingId ? location : store) : [...stores, location];
    setStores(next); saveLocations(next); setMessage(editingId ? "Store updated." : "Store created."); setTab("stores"); setEditingId(null);
  }

  function deleteStore(id: string) {
    if (!canAdmin) return;
    if (pendingDelete !== id) { setPendingDelete(id); return; }
    const next = stores.filter((store) => store.id !== id);
    setStores(next); saveLocations(next); setPendingDelete(null); setMessage("Store removed.");
  }

  function toggleActive(id: string) {
    if (!canEdit) return;
    const next = stores.map((store) => store.id === id ? { ...store, isActive: store.isActive === false } : store);
    setStores(next); saveLocations(next); setMessage(next.find((store) => store.id === id)?.isActive === false ? "Store deactivated." : "Store activated.");
  }

  return (
    <main className="management-page">
      <a className="skip-link" href="#management-content">Skip to store management</a>
      <header className="management-header">
        <div><a className="management-back" href="/"><ArrowLeft size={17} /> Store locator</a><h1>Store Management</h1><p>Add and manage store locations</p></div>
        <div className="management-account"><span><strong>{session.user.email}</strong><small>{session.role}</small></span><button onClick={() => void session.signOut()} aria-label="Sign out"><LogOut size={17} /></button>{canEdit && <button className="add-store-button" onClick={openAdd}><Plus size={18} /> Add Store</button>}</div>
      </header>

      <nav className="management-tabs" aria-label="Store management sections">
        <button className={tab === "stores" ? "active" : ""} onClick={() => setTab("stores")}>All Stores ({stores.length})</button>
        <button className={tab === "flavors" ? "active" : ""} onClick={() => setTab("flavors")}>Featured Flavors</button>
        <button className={tab === "branding" ? "active" : ""} onClick={() => setTab("branding")}>Branding</button>
        {canAdmin && <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users &amp; Roles</button>}
        {canEdit && <button className={tab === "form" ? "active" : ""} onClick={openAdd}>{editingId ? "Edit Store" : "Add Store"}</button>}
      </nav>

      <div id="management-content">
        {message && <p className="management-message" role="status"><Check size={17} /> {message}</p>}

        {tab === "stores" && (
          <section className="store-table-card" aria-labelledby="all-stores-title">
            <div className="table-title"><div><h2 id="all-stores-title">All stores</h2><p>{canEdit ? "Locations currently available to the store locator." : "Read-only access to store locations."}</p></div>{canEdit && <button onClick={openAdd}><Plus size={17} /> Add store</button>}</div>
            <div className="store-table-wrap"><table><thead><tr><th>Location</th><th>Type</th><th>Marqii</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{sortedStores.map((store) => <tr key={store.id}>
                <td><strong>{store.shortName}</strong><span><MapPin size={14} /> {fullAddress(store)}</span></td>
                <td><span className="type-label">{store.storeType ?? (store.serviceType === "catering" ? "catering" : "standard")}</span></td>
                <td>{store.marqiiEmbedId ? <span className="connected"><Check size={14} /> Connected</span> : <span className="not-connected">Not set</span>}</td>
                <td><span className={store.isActive === false ? "status-inactive" : "status-active"}>{store.isActive === false ? "Inactive" : "Active"}</span></td>
                <td><div className="row-actions">{canEdit && <button className="toggle-status" onClick={() => toggleActive(store.id)}>{store.isActive === false ? "Activate" : "Deactivate"}</button>}{canEdit && <button onClick={() => openEdit(store)} aria-label={`Edit ${store.shortName}`}><Pencil size={16} /></button>}{canAdmin && <button className={pendingDelete === store.id ? "confirm-delete" : ""} onClick={() => deleteStore(store.id)} aria-label={pendingDelete === store.id ? `Confirm deleting ${store.shortName}` : `Delete ${store.shortName}`}><Trash2 size={16} />{pendingDelete === store.id && <span>Confirm</span>}</button>}</div></td>
              </tr>)}</tbody></table></div>
          </section>
        )}

        {(tab === "flavors" || tab === "branding") && <section className="management-placeholder"><Store size={28} /><h2>{tab === "flavors" ? "Featured Flavors" : "Branding"}</h2><p>This section is ready for the next set of management controls.</p></section>}

        {tab === "users" && canAdmin && <RoleManagement currentUserId={session.user.id} />}

        {tab === "form" && (
          <form className="store-form" onSubmit={saveStore} noValidate>
            <div className="form-title"><h2>{editingId ? "Edit Store" : "Add New Store"}</h2><button type="button" onClick={() => setTab("stores")} aria-label="Close form"><X size={20} /></button></div>
            <div className="form-grid two">
              <Field label="Store Name" required error={errors.name}><input value={form.name} onChange={(e) => setField("name", e.target.value)} /></Field>
              <Field label="Store Type"><select value={form.storeType} onChange={(e) => setField("storeType", e.target.value as FormState["storeType"])}><option value="standard">Standard</option><option value="flagship">Flagship</option><option value="premium">Premium</option><option value="catering">Catering only</option></select></Field>
            </div>
            <Field label="Address" required={form.storeType !== "catering"} error={errors.address}><input value={form.address} onChange={(e) => setField("address", e.target.value)} /></Field>
            <div className="form-grid four">
              <Field label="City" required error={errors.city}><input value={form.city} onChange={(e) => setField("city", e.target.value)} /></Field>
              <Field label="State" required error={errors.state}><input value={form.state} maxLength={2} onChange={(e) => setField("state", e.target.value)} /></Field>
              <Field label="ZIP Code" required error={errors.postalCode}><input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} /></Field>
              <Field label="Country" required><select value={form.country} onChange={(e) => setField("country", e.target.value)}><option>United States</option><option>Canada</option></select></Field>
            </div>
            <div className="form-grid three">
              <Field label="Phone"><input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} /></Field>
              <Field label="Website"><input type="url" value={form.website} onChange={(e) => setField("website", e.target.value)} /></Field>
            </div>
            <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} /></Field>
            <div className="form-grid two">
              <Field label="Facebook URL"><input type="url" placeholder="https://facebook.com/..." value={form.facebookUrl} onChange={(e) => setField("facebookUrl", e.target.value)} /></Field>
              <Field label="Instagram URL"><input type="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={(e) => setField("instagramUrl", e.target.value)} /></Field>
              <Field label="Twitter URL"><input type="url" placeholder="https://twitter.com/..." value={form.twitterUrl} onChange={(e) => setField("twitterUrl", e.target.value)} /></Field>
              <Field label="TikTok URL"><input type="url" placeholder="https://tiktok.com/@..." value={form.tiktokUrl} onChange={(e) => setField("tiktokUrl", e.target.value)} /></Field>
            </div>
            <Field label="Marqii Embed ID" hint='Enter only the UUID from the Marqii embed code (the part after "hours-")' error={errors.marqiiEmbedId}><input placeholder="e.g., 169967ca-c99a-4f70-9b5d-d302e7d515d9" value={form.marqiiEmbedId} onChange={(e) => setField("marqiiEmbedId", e.target.value)} /></Field>
            <Field label="Google Maps Listing URL" hint="Paste the full Google Maps URL for this store's listing"><input type="url" placeholder="https://www.google.com/maps/place/..." value={form.googleMapsUrl} onChange={(e) => setField("googleMapsUrl", e.target.value)} /></Field>
            <div className="form-grid two">
              <Field label="Latitude" required error={errors.latitude}><input inputMode="decimal" value={form.latitude} onChange={(e) => setField("latitude", e.target.value)} /></Field>
              <Field label="Longitude" required error={errors.longitude}><input inputMode="decimal" value={form.longitude} onChange={(e) => setField("longitude", e.target.value)} /></Field>
            </div>
            <Field label="DoorDash URL"><input type="url" value={form.orderUrl} onChange={(e) => setField("orderUrl", e.target.value)} /></Field>
            <fieldset className="display-settings"><legend>Display Settings</legend><label><input type="checkbox" checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} /><span><Check size={13} /></span> Active store</label><label><input type="checkbox" checked={form.showLocationPage} onChange={(e) => setField("showLocationPage", e.target.checked)} /><span><Check size={13} /></span> Show individual Location page</label><label><input type="checkbox" checked={form.showDoorDashButton} onChange={(e) => setField("showDoorDashButton", e.target.checked)} /><span><Check size={13} /></span> Show DoorDash button</label></fieldset>
            <div className="form-actions"><button className="save-store" type="submit"><Save size={17} /> {editingId ? "Save Changes" : "Create Store"}</button><button className="cancel-form" type="button" onClick={() => setTab("stores")}>Cancel</button></div>
          </form>
        )}
      </div>
    </main>
  );
}

function RoleManagement({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<CmsUserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true); setError("");
    const result = await listCmsUsers();
    if (result.error) setError("User roles could not be loaded.");
    else setUsers(result.data);
    setLoading(false);
  }

  useEffect(() => { void loadUsers(); }, []);

  async function changeRole(userId: string, role: CmsRole) {
    setSavingId(userId); setError("");
    const result = await setCmsUserRole(userId, role);
    if (result.error) setError("That role change could not be saved. The final administrator cannot be demoted.");
    else setUsers((current) => current.map((user) => user.user_id === userId ? { ...user, role } : user));
    setSavingId(null);
  }

  return <section className="role-card" aria-labelledby="roles-title"><div className="table-title"><div><h2 id="roles-title">Users &amp; roles</h2><p>Assign the minimum access each CMS user needs.</p></div><Users size={22} /></div>{error && <p className="role-error" role="alert">{error}</p>}{loading ? <p className="role-loading">Loading authorized users…</p> : <div className="role-list"><div className="role-list-head"><span>User</span><span>Role</span></div>{users.map((user) => <div className="role-row" key={user.user_id}><div><strong>{user.email}</strong>{user.user_id === currentUserId && <small>Current user</small>}</div><select aria-label={`Role for ${user.email}`} value={user.role} disabled={savingId === user.user_id} onChange={(event) => void changeRole(user.user_id, event.target.value as CmsRole)}><option value="admin">Administrator</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select></div>)}</div>}<div className="role-key"><div><strong>Administrator</strong><span>Manage stores, delete records, and assign roles.</span></div><div><strong>Editor</strong><span>Create and update stores without user administration or deletion.</span></div><div><strong>Viewer</strong><span>Read-only access to store records.</span></div></div></section>;
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className={`management-field ${error ? "has-error" : ""}`}><span>{label}{required && " *"}</span>{children}{hint && <small>{hint}</small>}{error && <small className="field-error">{error}</small>}</label>;
}
