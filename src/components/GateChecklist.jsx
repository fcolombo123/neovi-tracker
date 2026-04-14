import React from 'react';
import { useData } from '../context/DataContext.jsx';
import { fmtDate } from '../utils.js';

export default function GateChecklist({ project, phase, phaseIndex, canEdit }) {
  const { setProjects, useSeedMode } = useData();
  const gates = phase.gateChecklist || [];
  const done = gates.filter(g => g.done).length;

  const toggleGate = (gi) => {
    if (!canEdit) return;
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const gate = p.phases[phaseIndex].gateChecklist[gi];
        if (gate) {
          gate.done = !gate.done;
          gate.completedDate = gate.done ? new Date().toISOString().split('T')[0] : null;
        }
        return next;
      });
    }
  };

  if (!gates.length) return null;

  return (
    <div className="gate-section">
      <div className="gate-section-lbl">Phase gate checklist ({done}/{gates.length})</div>
      {gates.map((g, gi) => (
        <div className="gate-item" key={gi}>
          <button
            className={`gate-check${g.done ? ' done' : ''}`}
            onClick={() => toggleGate(gi)}
          >
            {g.done ? '\u2713' : ''}
          </button>
          <span className="gate-lbl" style={g.done ? { textDecoration: 'line-through', color: 'var(--text3)' } : {}}>
            {g.item}
          </span>
          {g.done && g.completedDate && (
            <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: 'auto' }}>
              {fmtDate(g.completedDate)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
