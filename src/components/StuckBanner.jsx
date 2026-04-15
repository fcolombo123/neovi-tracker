import React from 'react';
import { useData } from '../context/DataContext.jsx';
import { allPhaseTasks } from '../queries.js';

export default function StuckBanner({ onSelectProject }) {
  const { projects } = useData();

  // Collect all stuck tasks across all projects
  const stuckItems = [];
  for (const p of projects) {
    for (const ph of (p.phases || [])) {
      const tasks = allPhaseTasks(ph);
      for (const t of tasks) {
        if (t.stuck && !t.done) {
          stuckItems.push({ project: p, phase: ph, task: t });
        }
      }
    }
  }

  if (stuckItems.length === 0) return null;

  return (
    <div style={{
      background: 'var(--red-bg)', border: '1px solid var(--red-border)',
      borderRadius: 'var(--rl)', padding: '12px 16px', marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>&#9888;</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red-text)' }}>
          {stuckItems.length} stuck {stuckItems.length === 1 ? 'item' : 'items'} — needs attention
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {stuckItems.map((item, i) => (
          <div
            key={i}
            onClick={() => onSelectProject && onSelectProject(item.project.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg)', border: '0.5px solid var(--red-border)',
              borderRadius: 'var(--r)', padding: '8px 12px', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--red)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--red-border)'}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--red-text)' }}>
                {item.task.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '1px' }}>
                {item.project.name} &middot; {item.phase.name}
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>&#8594;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
