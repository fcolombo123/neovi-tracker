import { PHASE_DURATIONS, TRACK_DURATIONS } from './constants.js';

// ─── DATE UTILITIES ─────────────────────────────────────────────────────────
export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function daysDiff(d) {
  return Math.round((new Date(d) - new Date()) / 86400000);
}

// ─── FORMATTING UTILITIES ───────────────────────────────────────────────────
export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
}

export function fmtTS(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) +
    ' at ' + d.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
}

export function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

// ─── SCHEDULING UTILITIES ───────────────────────────────────────────────────

/** Auto-schedule task due dates sequentially within a phase */
export function autoScheduleTasks(ph) {
  if (!ph.startDate) return;
  const dur = PHASE_DURATIONS[ph.name] || 30;
  const tasks = ph.tasks.filter(t => !t.done);
  const total = ph.tasks.length;
  if (!total) return;
  ph.tasks.forEach((t, i) => {
    if (!t.dueDate) {
      t.dueDate = addDays(ph.startDate, Math.round(dur * (i + 1) / total));
    }
  });
}

/** Auto-schedule task due dates sequentially within a construction track */
export function autoScheduleTrackTasks(tr, startDate) {
  if (!startDate) return;
  const dur = TRACK_DURATIONS[tr.id] || 14;
  const total = tr.tasks.length;
  if (!total) return;
  tr.tasks.forEach((t, i) => {
    if (!t.dueDate) {
      t.dueDate = addDays(startDate, Math.round(dur * (i + 1) / total));
    }
  });
}
