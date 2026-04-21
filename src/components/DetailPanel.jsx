import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { supabase } from '../lib/supabase';
import PhaseBlock from './PhaseBlock.jsx';
import ProductionTracker from './ProductionTracker.jsx';
import { pctWork } from '../queries.js';
import { getPhase1, getPhase2 } from '../playbook.js';

function EditProjectModal({ project, onClose, onSave, onDelete, onArchive }) {
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

        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn"
              style={{ color: 'var(--accent-dark)', fontSize: '11px' }}
              onClick={() => { onArchive && onArchive(); onClose(); }}
            >
              {project.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              className="btn"
              style={{ color: 'var(--red-text)', fontSize: '11px' }}
              onClick={() => {
                if (window.confirm('Delete "' + project.name + '" permanently? This cannot be undone.')) {
                  onDelete && onDelete();
                  onClose();
                }
              }}
            >
              Delete
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailPanel({ projectId, canEdit, onBack, isDrilldown, onProjectDeleted }) {
  const { projects, updateProject, deleteProject, archiveProject, fetchProjects, useSeedMode, setProjects } = useData();
  const p = projects.find(x => x.id === projectId);
  const [expandAll, setExpandAll] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!p) return <div className="detail" style={{ color: 'var(--text2)', padding: '20px', textAlign: 'center' }}>Select a project</div>;

  const ir = p.planningIr || p.planningIR || 'unknown';

  const rebuildPhaseTasks = async (phaseId, tasks, gates) => {
    // Delete existing tasks and gates for this phase
    await supabase.from('tasks').delete().eq('phase_id', phaseId);
    await supabase.from('gate_items').delete().eq('phase_id', phaseId);
    // Insert new tasks
    if (tasks.length > 0) {
      await supabase.from('tasks').insert(
        tasks.map((name, i) => ({ phase_id: phaseId, name, done: false, sort_order: i + 1 }))
      );
    }
    // Insert new gates
    if (gates.length > 0) {
      await supabase.from('gate_items').insert(
        gates.map((item, i) => ({ phase_id: phaseId, item, done: false, sort_order: i + 1 }))
      );
    }
  };

  const handleSave = async (updates) => {
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const proj = next.find(x => x.id === p.id);
        if (proj) Object.assign(proj, updates);
        return next;
      });
    } else {
      const oldType = p.type;
      const oldIr = p.planningIr || p.planningIR || 'unknown';
      const newType = updates.type || oldType;
      const newIr = updates.planningIr || oldIr;
      const typeChanged = newType !== oldType;
      const irChanged = newIr !== oldIr;

      await updateProject(p.id, updates);

      // Rebuild Phase 1 & 2 tasks if type or IR changed
      if (typeChanged || irChanged) {
        const ph1 = p.phases.find(ph => ph.phaseNumber === 1 || ph.name === 'Project Kick Off');
        const ph2 = p.phases.find(ph => ph.phaseNumber === 2 || ph.name === 'Schematic Design');
        if (ph1) {
          const tmpl = getPhase1(newType, newIr);
          await rebuildPhaseTasks(ph1.id, tmpl.tasks, tmpl.gates);
        }
        if (ph2) {
          const tmpl = getPhase2(newType, newIr);
          await rebuildPhaseTasks(ph2.id, tmpl.tasks, tmpl.gates);
        }
        // Re-fetch to show updated tasks
        await fetchProjects();
      }
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
        {/* Project photo */}
        {p.photoUrl && (
          <div style={{
            position: 'relative', width: '100%', maxHeight: '200px', overflow: 'hidden',
            borderRadius: 'var(--r)', marginBottom: '12px',
          }}>
            <img src={p.photoUrl} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', borderRadius: 'var(--r)' }} />
            {canEdit && (
              <label style={{
                position: 'absolute', bottom: '8px', right: '8px',
                background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px',
                padding: '4px 10px', borderRadius: '10px', cursor: 'pointer',
                backdropFilter: 'blur(2px)',
              }}>
                Change photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => handleSave({ photoUrl: ev.target.result });
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>
        )}
        {!p.photoUrl && canEdit && (
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '80px', background: 'var(--bg3)', borderRadius: 'var(--r)',
            marginBottom: '12px', cursor: 'pointer', border: '1.5px dashed var(--border2)',
            fontSize: '12px', color: 'var(--text3)',
          }}>
            + Add project photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => handleSave({ photoUrl: ev.target.result });
              reader.readAsDataURL(file);
            }} />
          </label>
        )}

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

        <ProductionTracker projectName={p.name} />

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
          onDelete={async () => {
            await deleteProject(p.id);
            onProjectDeleted && onProjectDeleted();
          }}
          onArchive={async () => {
            await archiveProject(p.id, !p.archived);
            onProjectDeleted && onProjectDeleted();
          }}
        />
      )}
    </div>
  );
}
