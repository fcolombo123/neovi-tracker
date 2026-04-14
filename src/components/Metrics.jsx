import React from 'react';
import { useData } from '../context/DataContext.jsx';
import { pctWork, allPhaseTasks, overduePhases } from '../queries.js';

export default function Metrics({ currentRole, drilldownProjectId }) {
  const { projects } = useData();

  // Drilldown mode: show single-project metrics
  if (drilldownProjectId) {
    const p = projects.find(x => x.id === drilldownProjectId);
    if (!p) return null;
    const ov = p.phases.filter(ph => ph.overdue && !ph.done).length;
    const done = p.phases.filter(ph => ph.done).length;
    const allTasks = p.phases.flatMap(ph => allPhaseTasks(ph));
    const critical = allTasks.filter(t => t.critical && !t.done).length;
    const activePh = p.phases.find(ph => !ph.done) || p.phases[p.phases.length - 1];

    return (
      <div className="metrics" id="metrics">
        <div className="mc" style={{ borderColor: 'var(--accent)' }}>
          <div className="lbl">Work complete</div>
          <div className="val">{pctWork(p)}%</div>
        </div>
        <div className="mc" style={{ borderColor: 'var(--accent)' }}>
          <div className="lbl">Phases done</div>
          <div className="val">{done}/{p.phases.length}</div>
        </div>
        <div className="mc" style={{ borderColor: 'var(--accent)' }}>
          <div className="lbl">Active phase</div>
          <div className="val" style={{ fontSize: '13px' }}>{activePh.name}</div>
        </div>
        {critical > 0 && (
          <div className="mc" style={{ borderColor: 'var(--red)' }}>
            <div className="lbl">Critical open</div>
            <div className="val danger">{critical}</div>
          </div>
        )}
        <div className="mc" style={{ borderColor: 'var(--accent)' }}>
          <div className="lbl">Overdue phases</div>
          <div className={`val${ov > 0 ? ' danger' : ''}`}>{ov}</div>
        </div>
      </div>
    );
  }

  // Portfolio mode
  const visibleProjects = currentRole === 'client' ? projects.slice(0, 1) : projects;
  const ov = overduePhases(visibleProjects).length;
  const active = visibleProjects.filter(p => p.phases.some(ph => !ph.done)).length;
  const avgWork = Math.round(
    visibleProjects.reduce((s, p) => s + pctWork(p), 0) / Math.max(visibleProjects.length, 1)
  );
  const complete = visibleProjects.filter(p => p.phases.every(ph => ph.done)).length;

  return (
    <div className="metrics" id="metrics">
      <div className="mc">
        <div className="lbl">Total projects</div>
        <div className="val">{visibleProjects.length}</div>
      </div>
      <div className="mc">
        <div className="lbl">Active projects</div>
        <div className="val">{active}</div>
      </div>
      <div className="mc">
        <div className="lbl">Overdue phases</div>
        <div className={`val${ov > 0 ? ' danger' : ''}`}>{ov}</div>
      </div>
      <div className="mc">
        <div className="lbl">Avg. progress</div>
        <div className="val">{avgWork}%</div>
      </div>
      <div className="mc">
        <div className="lbl">Projects complete</div>
        <div className="val">{complete}</div>
      </div>
    </div>
  );
}
