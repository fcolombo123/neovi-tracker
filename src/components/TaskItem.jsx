import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { fmtDate } from '../utils.js';

export default function TaskItem({ task, project, phaseIndex, groupIndex, taskIndex, canEdit }) {
  const { setProjects, useSeedMode, updateTask } = useData();
  const t = task;
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(t.note || '');

  const toggleDone = async () => {
    if (!canEdit) return;
    const newDone = !t.done;
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const ph = p.phases[phaseIndex];
        let target = groupIndex !== undefined ? ph.tasks[groupIndex]?.tasks?.[taskIndex] : ph.tasks[taskIndex];
        if (target) {
          target.done = newDone;
          target.completedDate = newDone ? new Date().toISOString().split('T')[0] : null;
        }
        return next;
      });
    } else {
      await updateTask(t.id, { done: newDone, completedDate: newDone ? new Date().toISOString().split('T')[0] : null });
    }
  };

  const toggleCritical = async () => {
    if (!canEdit) return;
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const ph = p.phases[phaseIndex];
        let target = groupIndex !== undefined ? ph.tasks[groupIndex]?.tasks?.[taskIndex] : ph.tasks[taskIndex];
        if (target) target.critical = !target.critical;
        return next;
      });
    } else {
      await updateTask(t.id, { critical: !t.critical });
    }
  };

  const saveNote = async () => {
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const ph = p.phases[phaseIndex];
        let target = groupIndex !== undefined ? ph.tasks[groupIndex]?.tasks?.[taskIndex] : ph.tasks[taskIndex];
        if (target) target.note = noteText;
        return next;
      });
    } else {
      await updateTask(t.id, { note: noteText });
    }
    setEditingNote(false);
  };

  const isOverdue = t.dueDate && !t.done && new Date(t.dueDate) < new Date();

  return (
    <div className={`task-row${t.critical ? ' crit' : ''}`}>
      <button
        className={`tcheck${t.done ? ' done' : ''}`}
        onClick={toggleDone}
        title={t.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {t.done ? '\u2713' : ''}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={`tlbl${t.done ? ' done' : ''}`}>
          {t.name}
        </div>
        {t.note && !editingNote && (
          <div className="tnote">{t.note}</div>
        )}
        {editingNote && (
          <div>
            <textarea
              className="tnote-inp"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              <button className="btn" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={saveNote}>Save</button>
              <button className="btn" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={() => setEditingNote(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {t.critical && <div className="crit-dot" title="Critical"></div>}
      {t.dueDate && (
        <span style={{ fontSize: '10px', color: isOverdue ? 'var(--red-text)' : 'var(--text3)', whiteSpace: 'nowrap' }}>
          {fmtDate(t.dueDate)}
        </span>
      )}
      {canEdit && (
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button
            className="btn"
            style={{ fontSize: '10px', padding: '1px 4px', color: t.critical ? 'var(--red-text)' : 'var(--text3)' }}
            onClick={toggleCritical}
            title="Toggle critical"
          >
            &#9873;
          </button>
          <button
            className="btn"
            style={{ fontSize: '10px', padding: '1px 4px', color: 'var(--text3)' }}
            onClick={() => { setNoteText(t.note || ''); setEditingNote(!editingNote); }}
            title="Note"
          >
            &#9998;
          </button>
        </div>
      )}
    </div>
  );
}
