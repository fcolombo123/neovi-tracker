import React from 'react';
import { useData } from '../context/DataContext.jsx';
import { fmtDate } from '../utils.js';

export default function GateChecklist({ project, phase, phaseIndex, canEdit }) {
  const { setProjects, useSeedMode, updateGateItem } = useData();
  const gates = phase.gateChecklist || [];
  const done = gates.filter(g => g.done).length;

  const toggleGate = async (gi) => {
    if (!canEdit) return;
    const gate = gates[gi];
    if (!gate) return;
    const newDone = !gate.done;
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const g = p.phases[phaseIndex].gateChecklist[gi];
        if (g) {
          g.done = newDone;
          g.completedDate = newDone ? new Date().toISOString().split('T')[0] : null;
        }
        return next;
      });
    } else {
      await updateGateItem(gate.id, { done: newDone, completedDate: newDone ? new Date().toISOString().split('T')[0] : null });
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
