// Registration clock values are interpreted in the institution's Asia/Kolkata zone.
// Date-only legacy records retain their entire closing day; explicitly entered
// times use exact instants, matching Assignment 7's DateTime component design.
export const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
function boundary(day, time, end = false) {
  if (!day || typeof day !== 'string') return NaN;
  if (day.includes('T')) return Date.parse(day);
  const parsed = new Date(day + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0,10) !== day) return NaN;
  if (time && !validTime(time)) return NaN;
  return Date.parse(day + 'T' + (time ? time + ':00' : end ? '23:59:59.999' : '00:00:00') + '+05:30');
}
export function registrationBounds(event) {
  return {
    start: boundary(event.registrationStart, event.registrationStartTime),
    end: boundary(event.registrationEnd, event.registrationEndTime, true)
  };
}
export function registrationPeriodError(event) {
  for (const key of ['registrationStartTime', 'registrationEndTime'])
    if (event[key] && !validTime(event[key])) return 'Enter valid registration times.';
  if (!event.registrationStart || !event.registrationEnd) return null; // incomplete draft
  const {start,end} = registrationBounds(event);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Enter valid registration dates and times.';
  return end < start ? 'Registration end must not precede registration start.' : null;
}
export function registrationWindowState(event, now = new Date()) {
  const {start,end} = registrationBounds(event);
  const instant = new Date(now).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(instant) || end < start) return 'closed';
  if (instant < start) return 'before';
  if (instant > end) return 'closed';
  const eventStart = Date.parse(event.date + 'T' + event.startTime + ':00+05:30');
  if (!Number.isFinite(eventStart) || instant >= eventStart) return 'closed';
  return 'open';
}
