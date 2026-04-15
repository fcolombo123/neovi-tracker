import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import PhaseBlock from './PhaseBlock.jsx';
import { pctWork } from '../queries.js';

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project.name || '');
  const [address, setAddress] = useState(project.address || '');
  const [type, setType] = useState(project.type || 'client');
  const [tier, setTier] = useState(project.tier || '');
  const [planningIr, setPlanningIr] = useState(project.planningIr || project.planningIR || 'unknown');
  const [status, setStatus] = useState(project.status || 'planning');
  const [notes, setNotes] = useState(project.notes || '');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      address: address.trim(),
      type,
      tier: type === 'client' ? tier : '',
      planningIr,
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  const fieldStyle = {
    width: '100%', padding: '7px 10px', fontSize: '13px',
    border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
    background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '.05em', color: 'var(--text2)', display: 'block', marginBottom: '3px',
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Edit project</h2>

        <div className="mf">
          <label style={labelStyle}>Project name</label>
          <input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="mf">
          <label style={labelStyle}>Address</label>
          <input style={fieldStyle} value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="mf" style={{ flex: 1 }}>
            <label style={labelStyle}>Type</label>
            <select style={fieldStyle} value={type} onChange={e => setType(e.target.value)}>
              <option value="client">Client Build</option>
              <option value="spec">Spec Build</option>
            </select>
          </div>
          <div className="mf" style={{ flex: 1 }}>
            <label style={labelStyle}>Tier</label>
            <select style={fieldStyle} value={tier} onChange={e => setTier(e.target.value)} disabled={type !== 'client'}>
              <option value="">N/A</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="mf" style={{ flex: 1 }}>
            <label style={labelStyle}>Planning IR</label>
            <select style={fieldStyle} value={planningIr} onChange={e => setPlanningIr(e.target.value)}>
              <option value="unknown">TBD</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="mf" style={{ flex: 1 }}>
            <label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>

        <div className="mf">
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...fieldStyle, resize: 'vertical', minHeight: '80px', lineHeight: '1.5' }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Project notes..."
          />
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

export default function DetailPanel({ projectId, canEdit, onBack, isDrilldown }) {
  const { projects, updateProject, useSeedMode, setProjects } = useData();
  const p = projects.find(x => x.id === projectId);
  const [expandAll, setExpandAll] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!p) return <div className="detail" style={{ color: 'var(--text2)', padding: '20px', textAlign: 'center' }}>Select a project</div>;

  const ir = p.planningIr || p.planningIR || 'unknown';

  const handleSave = async (updates) => {
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const proj = next.find(x => x.id === p.id);
        if (proj) Object.assign(proj, updates);
        return next;
      });
    } else {
      await updateProject(p.id, updates);
    }
  };

  return (
    <div id={isDrilldown ? 'project-drilldown' : 'detail-panel'}>
      {isDrilldown && (
        <div className="drilldown-header">
          <button className="back-btn" onClick={onBack}>&#8592; Back to list</button>
        </div>
      )}
      <div className="detail">
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{p.name}</div>
            {canEdit && (
              <button className="btn" style={{ fontSize: '11px' }} onClick={() => setEditing(true)}>
                Edit project
              </button>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px' }}>
            {p.type === 'client' ? 'Client Build' : 'Spec Build'}
            {p.tier ? ` \u00B7 ${p.tier}` : ''} &middot; {p.address}
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {ir === 'yes' && <span className="badge b-info">Planning IR required</span>}
            {ir === 'no' && <span className="badge b-gray">No Planning IR</span>}
            {ir === 'unknown' && <span className="badge b-warn">Planning IR: TBD</span>}
            <span className={`badge ${p.status === 'active' ? 'b-accent' : p.status === 'complete' ? 'b-success' : 'b-gray'}`}>
              {p.status || 'planning'}
            </span>
          </div>
          {p.notes && (
            <div className="note-disp" style={{ marginTop: '8px' }}>{p.notes}</div>
          )}
        </div>
        <div className="mini-metrics">
          <div className="mm">
            <div className="lbl">Work complete</div>
            <div className="val">{pctWork(p)}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div className="sec-lbl" style={{ marginBottom: 0 }}>Phases</div>
          <button className="btn" style={{ fontSize: '11px' }} onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {p.phases.map((ph, pi) => (
          <PhaseBlock
            key={ph.id || pi}
            project={p}
            phase={ph}
            phaseIndex={pi}
            canEdit={canEdit}
            forceOpen={expandAll}
          />
        ))}
      </div>

      {editing && (
        <EditProjectModal
          project={p}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
