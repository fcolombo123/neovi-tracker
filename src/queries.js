// Pure query functions extracted from index-static.html

/** Returns the first non-done phase, or the last phase if all are done. */
export function activePhase(p) {
  return p.phases.find(ph => !ph.done) || p.phases[p.phases.length - 1];
}

/** Flatten all tasks from a phase, including those inside groups and parallel tracks. */
export function allPhaseTasks(ph) {
  if (!ph.tasks) return [];
  const flat = [];
  ph.tasks.forEach(t => {
    if (t.isGroup) t.tasks.forEach(gt => flat.push(gt));
    else flat.push(t);
  });
  if (ph.parallelTracks) {
    Object.values(ph.parallelTracks).flat().forEach(tr => tr.tasks.forEach(t => flat.push(t)));
  }
  return flat;
}

/** Percentage of tasks complete across all phases of a project. */
export function pctWork(p) {
  let done = 0, total = 0;
  p.phases.forEach(ph => {
    allPhaseTasks(ph).forEach(t => { total++; if (t.done) done++; });
  });
  return total ? Math.round(done / total * 100) : 0;
}

/** Returns the name of the first critical or blocking incomplete task in the active phase. */
export function getWaitingOn(p) {
  const ap = activePhase(p);
  if (!ap || ap.done) return null;
  // First critical incomplete task
  const tasks = allPhaseTasks(ap);
  const crit = tasks.find(t => t.critical && !t.done);
  if (crit) return crit.name;
  // First task blocking others
  const blocking = tasks.find(t => !t.done && tasks.some(t2 => t2.dependsOn === t.id && !t2.done));
  if (blocking) return blocking.name;
  return null;
}

/** Returns an array of {project, phase, daysLate} for all overdue, non-done phases. */
export function overduePhases(projects) {
  const r = [];
  projects.forEach(p => {
    p.phases.forEach(ph => {
      if (!ph.done && ph.overdue) {
        const daysLate = Math.abs(Math.round((new Date(ph.dueDate) - new Date()) / 86400000));
        r.push({ project: p, phase: ph, daysLate });
      }
    });
  });
  return r;
}

/** Resolves a task by ref string. "3" => ph.tasks[3], "g2_1" => ph.tasks[2].tasks[1]. */
export function resolveTask(p, pi, ref) {
  const ph = p.phases[pi];
  if (typeof ref === 'string' && ref.startsWith('g')) {
    const [, gi, ti] = ref.match(/g(\d+)_(\d+)/);
    return ph.tasks[+gi]?.tasks?.[+ti];
  }
  return ph.tasks[+ref];
}
