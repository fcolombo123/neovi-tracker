import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.jsx';
import { supabase } from '../lib/supabase';
import { fmtDate } from '../utils.js';

export default function TaskItem({ task, project, phaseIndex, groupIndex, taskIndex, canEdit }) {
  const { setProjects, useSeedMode, updateTask } = useData();
  const t = task;
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(t.note || '');
  const [showAssign, setShowAssign] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignedName, setAssignedName] = useState(null);

  useEffect(() => {
    if (t.assignedTo) {
      supabase.from('team_members').select('name').eq('id', t.assignedTo).single()
        .then(({ data }) => { if (data) setAssignedName(data.name); });
    }
  }, [t.assignedTo]);

  const loadTeam = async () => {
    const { data } = await supabase.from('team_members').select('id, name, company').order('name');
    setTeamMembers(data || []);
    setShowAssign(true);
  };

  const assignTo = async (memberId) => {
    await updateTask(t.id, { assignedTo: memberId });
    setShowAssign(false);
    if (memberId) {
      const m = teamMembers.find(x => x.id === memberId);
      setAssignedName(m?.name || null);
    } else {
      setAssignedName(null);
    }
  };

  const seedUpdate = (fn) => {
    setProjects(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const p = next.find(x => x.id === project.id);
      if (!p) return prev;
      const ph = p.phases[phaseIndex];
      let target = groupIndex !== undefined ? ph.tasks[groupIndex]?.tasks?.[taskIndex] : ph.tasks[taskIndex];
      if (target) fn(target);
      return next;
    });
  };

  const toggleDone = async () => {
    if (!canEdit) return;
    const newDone = !t.done;
    const today = new Date().toISOString().split('T')[0];
    if (useSeedMode) {
      seedUpdate(target => {
        target.done = newDone;
        target.completedDate = newDone ? today : null;
        if (newDone) target.stuck = false;
      });
    } else {
      const updates = { done: newDone, completedDate: newDone ? today : null };
      if (newDone) updates.stuck = false;
      await updateTask(t.id, updates);
    }
  };

  const toggleStuck = async () => {
    if (!canEdit || t.done) return;
    const newStuck = !t.stuck;
    if (useSeedMode) {
      seedUpdate(target => { target.stuck = newStuck; });
    } else {
      await updateTask(t.id, { stuck: newStuck });
    }
  };

  const toggleCritical = async () => {
    if (!canEdit) return;
    if (useSeedMode) {
      seedUpdate(target => { target.critical = !target.critical; });
    } else {
      await updateTask(t.id, { critical: !t.critical });
    }
  };

  const saveNote = async () => {
    if (useSeedMode) {
      seedUpdate(target => { target.note = noteText; });
    } else {
      await updateTask(t.id, { note: noteText });
    }
    setEditingNote(false);
  };

  const isOverdue = t.dueDate && !t.done && new Date(t.dueDate) < new Date();
  const isStuck = t.stuck && !t.done;

  return (
    <div
      className={`task-row${t.critical ? ' crit' : ''}`}
      style={isStuck ? { background: 'var(--red-bg)', borderLeft: '3px solid var(--red)' } : {}}
    >
      <button
        className={`tcheck${t.done ? ' done' : ''}`}
        onClick={toggleDone}
        title={t.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {t.done ? '\u2713' : ''}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={`tlbl${t.done ? ' done' : ''}`}>
          {isStuck && (
            <span style={{
              background: 'var(--red)', color: '#fff', fontSize: '9px', fontWeight: 700,
              padding: '1px 5px', borderRadius: '3px', marginRight: '5px', verticalAlign: 'middle',
            }}>STUCK</span>
          )}
          {t.name}
        </div>
        {assignedName && (
          <div style={{ fontSize: '10px', color: 'var(--accent-dark)', marginTop: '1px' }}>
            &#9679; {assignedName}
          </div>
        )}
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
        {showAssign && (
          <div style={{
            marginTop: '4px', background: 'var(--bg2)', border: '0.5px solid var(--border2)',
            borderRadius: 'var(--r)', padding: '6px', maxHeight: '150px', overflowY: 'auto',
          }}>
            <div style={{ fontSize: '11px', padding: '3px 6px', cursor: 'pointer', color: 'var(--text3)' }} onClick={() => assignTo(null)}>Unassign</div>
            {teamMembers.map(m => (
              <div
                key={m.id}
                style={{ fontSize: '11px', padding: '3px 6px', cursor: 'pointer', borderRadius: '3px', background: t.assignedTo === m.id ? 'var(--accent-bg)' : 'transparent' }}
                onClick={() => assignTo(m.id)}
                onMouseOver={e => e.currentTarget.style.background = 'var(--accent-bg)'}
                onMouseOut={e => e.currentTarget.style.background = t.assignedTo === m.id ? 'var(--accent-bg)' : 'transparent'}
              >
                {m.name} <span style={{ color: 'var(--text3)' }}>({m.company})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {t.critical && <div className="crit-dot" title="Critical"></div>}
      {t.dueDate && (
        <span style={{ fontSize: '10px', color: isOverdue ? 'var(--red-text)' : 'var(--text3)', whiteSpace: 'nowrap' }}>
          {fmtDate(t.dueDate)}
        </span>
      )}
      {canEdit && !t.done && (
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button
            className="btn"
            style={{
              fontSize: '9px', padding: '2px 6px',
              background: isStuck ? 'var(--red)' : 'none',
              color: isStuck ? '#fff' : 'var(--text3)',
              borderColor: isStuck ? 'var(--red)' : undefined,
              fontWeight: isStuck ? 700 : 400,
            }}
            onClick={toggleStuck}
            title={isStuck ? 'Unstick' : 'Mark as stuck'}
          >
            {isStuck ? 'UNSTICK' : 'Stuck?'}
          </button>
          <button
            className="btn"
            style={{ fontSize: '9px', padding: '2px 6px', color: 'var(--accent-dark)' }}
            onClick={loadTeam}
            title="Assign team member"
          >
            {assignedName ? '\u21BB' : 'Assign'}
          </button>
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
