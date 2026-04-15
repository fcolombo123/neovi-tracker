import React from 'react';
import { pctWork, activePhase, getWaitingOn } from '../queries.js';

function statusBadge(p) {
  const hasOverdue = p.phases.some(ph => ph.overdue && !ph.done);
  const pct = pctWork(p);
  if (pct === 100) return <span className="badge b-success">Complete</span>;
  if (hasOverdue) return <span className="badge b-danger">Overdue</span>;
  if (p.status === 'planning') return <span className="badge b-gray">Planning</span>;
  return <span className="badge b-info">In progress</span>;
}

export default function ProjectCard({ project, selected, onClick, onDrilldown, onPhotoChange, compact }) {
  const p = project;
  const ap = activePhase(p);
  const waitingOn = getWaitingOn(p);
  const work = pctWork(p);

  const handlePhotoChange = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (onPhotoChange) onPhotoChange(p.id, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`pcard${selected ? ' sel' : ''}`}
      onClick={onClick}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Top: info left + photo right */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div
              className="pname"
              onDoubleClick={(e) => { e.stopPropagation(); onDrilldown(p.id); }}
              title="Double-click to open full view"
              style={{ cursor: 'pointer' }}
            >
              {p.name}
            </div>
            {statusBadge(p)}
          </div>
          <div className="psub">{p.address}</div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '4px', marginTop: '4px' }}>
            <span className={`badge ${p.type === 'client' ? 'b-accent' : 'b-gray'}`}>
              {p.type === 'client' ? 'Client Build' : 'Spec Build'}
            </span>
            {p.tier && <span className="badge b-gray">{p.tier}</span>}
            {(p.planningIr === 'yes' || p.planningIR === 'yes') && <span className="badge b-info">Planning IR</span>}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
            Phase {ap?.phaseNumber || '?'}: {ap?.name || 'Unknown'}
          </div>
          {waitingOn && (
            <div className="waiting-pill" style={{ marginTop: '4px' }}>
              &#9203; {waitingOn.length > 35 ? waitingOn.slice(0, 34) + '\u2026' : waitingOn}
            </div>
          )}
        </div>

        {/* Photo thumbnail */}
        {!compact && (
          <div
            style={{
              position: 'relative', width: '100px', flexShrink: 0, background: 'var(--bg3)',
              overflow: 'hidden', cursor: 'pointer'
            }}
            onDoubleClick={(e) => { e.stopPropagation(); onDrilldown(p.id); }}
          >
            {p.photoUrl ? (
              <img src={p.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '20px', opacity: 0.25 }}>&#127959;</div>
              </div>
            )}
            <label
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', bottom: '4px', right: '4px',
                background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '9px',
                padding: '2px 6px', borderRadius: '10px', cursor: 'pointer',
                backdropFilter: 'blur(2px)'
              }}
            >
              {p.photoUrl ? '\u21BB' : '+'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
          </div>
        )}
      </div>

      {/* Bottom: progress + button */}
      <div style={{ padding: '6px 12px 10px', borderTop: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', width: '34px', flexShrink: 0 }}>Work</div>
          <div className="prog-bar" style={{ flex: 1 }}>
            <div className="prog-fill" style={{ width: `${work}%` }}></div>
          </div>
          <div className="prog-lbl">{work}%</div>
        </div>
        {!compact && <button
          onClick={(e) => { e.stopPropagation(); onDrilldown(p.id); }}
          style={{
            width: '100%', background: 'var(--accent-bg)',
            border: '0.5px solid var(--accent)', borderRadius: 'var(--r)',
            padding: '6px', fontSize: '11px', cursor: 'pointer',
            color: 'var(--accent-dark)', fontFamily: 'inherit',
            fontWeight: 500, transition: 'background .1s'
          }}
          onMouseOver={(e) => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; }}
          onMouseOut={(e) => { e.target.style.background = 'var(--accent-bg)'; e.target.style.color = 'var(--accent-dark)'; }}
        >
          Open full project view &#8594;
        </button>}
      </div>
    </div>
  );
}
