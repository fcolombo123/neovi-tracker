import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.jsx';
import TaskList from './TaskList.jsx';
import GateChecklist from './GateChecklist.jsx';
import { allPhaseTasks } from '../queries.js';
import { fmtDate } from '../utils.js';

export default function PhaseBlock({ project, phase, phaseIndex, canEdit, forceOpen }) {
  const { setProjects, useSeedMode } = useData();
  const ph = phase;
  const [isOpen, setIsOpen] = useState(ph.open || false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(ph.note || '');

  useEffect(() => {
    if (forceOpen !== undefined) setIsOpen(forceOpen);
  }, [forceOpen]);

  const tasks = allPhaseTasks(ph);
  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  const gateTotal = (ph.gateChecklist || []).length;
  const gateDone = (ph.gateChecklist || []).filter(g => g.done).length;

  const isLate = ph.overdue && !ph.done;
  const isActive = !ph.done && (phaseIndex === 0 || project.phases[phaseIndex - 1]?.done);

  let checkClass = '';
  if (ph.done) checkClass = 'done';
  else if (doneCount > 0) checkClass = 'partial';

  const toggleOpen = () => setIsOpen(!isOpen);

  const togglePhaseDone = (e) => {
    e.stopPropagation();
    if (!canEdit) return;
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const curPh = p.phases[phaseIndex];
        const newDone = !curPh.done;
        curPh.done = newDone;
        if (newDone) {
          curPh.completedDate = new Date().toISOString().split('T')[0];
          (curPh.tasks || []).forEach(t => {
            if (t.isGroup) {
              (t.tasks || []).forEach(st => { st.done = true; });
            } else {
              t.done = true;
            }
          });
          (curPh.gateChecklist || []).forEach(g => { g.done = true; });
        } else {
          curPh.completedDate = null;
        }
        return next;
      });
    }
  };

  const saveNote = () => {
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (p) p.phases[phaseIndex].note = noteText;
        return next;
      });
    }
    setEditingNote(false);
  };

  return (
    <div className={`phase-block${isOpen ? ' open' : ''}${isLate ? ' late' : ''}${isActive ? ' active-ph' : ''}`}>
      <div className="ph-header" onClick={toggleOpen}>
        <span className="chev">&#9654;</span>
        <button
          className={`ph-check ${checkClass}`}
          onClick={togglePhaseDone}
          title={ph.done ? 'Mark incomplete' : 'Mark phase complete'}
        >
          {ph.done ? '\u2713' : checkClass === 'partial' ? '\u2500' : ''}
        </button>
        <div className="ph-info">
          <div className="ph-name">
            {ph.name}
            {isLate && <span className="badge b-danger">Overdue</span>}
            {isActive && !isLate && <span className="badge b-accent">Active</span>}
            {ph.done && <span className="badge b-success">Complete</span>}
            {gateTotal > 0 && (
              <span className={`badge ${gateDone === gateTotal ? 'b-success' : 'b-gray'}`}>
                Gate {gateDone}/{gateTotal}
              </span>
            )}
          </div>
          <div className="ph-meta">
            {ph.owner}
            {ph.dueDate && ` \u00B7 Due ${fmtDate(ph.dueDate)}`}
            {totalCount > 0 && ` \u00B7 ${doneCount}/${totalCount} tasks`}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="ph-body">
          <TaskList
            project={project}
            phase={ph}
            phaseIndex={phaseIndex}
            canEdit={canEdit}
          />

          {(ph.gateChecklist || []).length > 0 && (
            <GateChecklist
              project={project}
              phase={ph}
              phaseIndex={phaseIndex}
              canEdit={canEdit}
            />
          )}

          <div className="ph-footer">
            {editingNote ? (
              <div>
                <textarea
                  className="note-inp"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Phase notes..."
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button className="btn btn-primary" onClick={saveNote}>Save</button>
                  <button className="btn" onClick={() => setEditingNote(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                {ph.note && <div className="note-disp">{ph.note}</div>}
                {canEdit && (
                  <button
                    className="btn"
                    style={{ marginTop: ph.note ? '6px' : 0, fontSize: '11px' }}
                    onClick={() => { setNoteText(ph.note || ''); setEditingNote(true); }}
                  >
                    {ph.note ? 'Edit note' : '+ Add note'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
