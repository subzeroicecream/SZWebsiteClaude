import { useEffect, useState } from "react";

interface TimePeriod { startTime: string; endTime: string; }
interface DayHours { dayOfTheWeek: string; isOpen: boolean; is24Hours: boolean; period: TimePeriod[]; }
interface ExceptionalHours { date: string; isOpen: boolean; is24Hours: boolean; period: TimePeriod[]; }
interface HourGroup { hourTypeName: string; regularHours: DayHours[]; exceptionalHours?: ExceptionalHours[]; isTemporarilyClosed?: boolean; }
interface HoursResponse { id: string; type: "hours"; data: HourGroup[]; }

const API_ROOT = "https://embed.marqii.com/api/v2/public/widget";
const cache = new Map<string, Promise<HoursResponse>>();
const dayOrder = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function requestHours(embedId: string) {
  const cleanId = embedId.replace(/^hours-/, "");
  const existing = cache.get(cleanId);
  if (existing) return existing;
  const request = fetch(`${API_ROOT}/${encodeURIComponent(cleanId)}?widgetType=hours`, { headers: { Accept: "application/json" } })
    .then(async (response) => {
      if (!response.ok) throw new Error("Hours request failed");
      const payload = await response.json() as HoursResponse;
      if (payload.type !== "hours" || !Array.isArray(payload.data)) throw new Error("Invalid hours response");
      return payload;
    });
  cache.set(cleanId, request);
  request.catch(() => cache.delete(cleanId));
  return request;
}

function formatTime(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText ?? 0);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  const normalizedHour = hour % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDay(day: string) {
  return `${day.charAt(0)}${day.slice(1).toLowerCase()}`;
}

function formatDayHours(day: Pick<DayHours, "isOpen" | "is24Hours" | "period">) {
  if (!day.isOpen) return "Closed";
  if (day.is24Hours) return "Open 24 hours";
  if (!day.period?.length) return "Hours unavailable";
  return day.period.map((period) => `${formatTime(period.startTime)}–${formatTime(period.endTime)}`).join(", ");
}

function formatExceptionDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function MarqiiHours({ embedId }: { embedId: string }) {
  const [hours, setHours] = useState<HoursResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setHours(null); setFailed(false);
    requestHours(embedId).then((payload) => active && setHours(payload)).catch(() => active && setFailed(true));
    return () => { active = false; };
  }, [embedId]);

  if (failed) return <p className="hours-error">Hours are temporarily unavailable. Please check back shortly.</p>;
  if (!hours) return <div className="hours-loading" role="status" aria-label="Loading store hours"><span /><span /><span /></div>;

  const groups = hours.data.filter((group) => Array.isArray(group.regularHours));
  if (!groups.length) return <p className="hours-error">Hours are not currently listed.</p>;

  const today = new Date().toISOString().slice(0, 10);
  return <div className="hours-widget" aria-label="Store hours">{groups.map((group) => {
    const upcomingExceptions = (group.exceptionalHours ?? []).filter((item) => item.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
    return <section key={group.hourTypeName} className="hours-group">{groups.length > 1 && <h5>{group.hourTypeName}</h5>}{group.isTemporarilyClosed ? <p className="temporarily-closed">Temporarily closed</p> : <><dl>{[...group.regularHours].sort((a, b) => dayOrder.indexOf(a.dayOfTheWeek) - dayOrder.indexOf(b.dayOfTheWeek)).map((day) => <div key={day.dayOfTheWeek}><dt>{formatDay(day.dayOfTheWeek)}</dt><dd>{formatDayHours(day)}</dd></div>)}</dl>{upcomingExceptions.length > 0 && <div className="exception-hours"><h5>Special hours</h5><dl>{upcomingExceptions.map((item) => <div key={item.date}><dt>{formatExceptionDate(item.date)}</dt><dd>{formatDayHours(item)}</dd></div>)}</dl></div>}</>}</section>;
  })}</div>;
}
