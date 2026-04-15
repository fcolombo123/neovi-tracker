import React from 'react';
import { useData } from '../context/DataContext.jsx';
import { allPhaseTasks } from '../queries.js';

export default function StuckBanner({ onSelectProject }) {
  const { projects } = useData();

  // Group stuck tasks by project
  const stuckByProject = {};
  let totalStuck = 0;
  for (const p of projects) {
    for (const ph of (p.phases || [])) {
      const tasks = allPhaseTasks(ph);
      for (const t of tasks) {
        if (t.stuck && !t.done) {
          if (!stuckByProject[p.id]) stuckByProject[p.id] = { project: p, items: [] };
          stuckByProject[p.id].items.push({ phase: ph, task: t });
          totalStuck++;
        }
      }
    }
  }

  if (totalStuck === 0) return null;

  const projectGroups = Object.values(stuckByProject);

  return (
    <div style={{
      background: 'var(--red-bg)', border: '1px solid var(--red-border)',
      borderRadius: 'var(--rl)', padding: '12px 16px', marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
      }}>
        <span style={{ fontSize: '16px' }}>&#9888;</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red-text)' }}>
          {totalStuck} stuck {totalStuck === 1 ? 'item' : 'items'} — needs attention
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projectGroups.map(({ project, items }) => (
          <div key={project.id}>
            <div
              style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--red-text)',
                marginBottom: '4px', cursor: 'pointer',
              }}
              onClick={() => onSelectProject && onSelectProject(project.id)}
            >
              {project.name} ({items.length}) &#8594;
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => onSelectProject && onSelectProject(project.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--bg)', border: '0.5px solid var(--red-border)',
                    borderRadius: 'var(--r)', padding: '6px 12px', cursor: 'pointer',
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
                      {item.phase.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
