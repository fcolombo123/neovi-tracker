import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import ProjectCard from './ProjectCard.jsx';
import { pctWork } from '../queries.js';

export default function ProjectList({ currentRole, selectedId, onSelect, onDeselect, onDrilldown, layout }) {
  const { projects, updateProject } = useData();
  const [reordering, setReordering] = useState(false);
  const [sortBy, setSortBy] = useState('custom'); // 'custom' | 'progress-asc' | 'progress-desc'

  const visibleProjects = currentRole === 'client' ? projects.slice(0, 1) : projects;

  const sorted = [...visibleProjects].sort((a, b) => {
    if (sortBy === 'progress-asc') return pctWork(a) - pctWork(b);
    if (sortBy === 'progress-desc') return pctWork(b) - pctWork(a);
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const handlePhotoChange = (projectId, dataUrl) => {
    updateProject(projectId, { photoUrl: dataUrl });
  };

  const moveProject = async (index, direction) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swapIndex];
    const aOrder = a.sortOrder ?? index;
    const bOrder = b.sortOrder ?? swapIndex;
    await updateProject(a.id, { sortOrder: bOrder });
    await updateProject(b.id, { sortOrder: aOrder });
  };

  const cycleSortBy = () => {
    if (sortBy === 'custom') setSortBy('progress-asc');
    else if (sortBy === 'progress-asc') setSortBy('progress-desc');
    else setSortBy('custom');
    setReordering(false);
  };

  const sortLabel = sortBy === 'custom' ? 'Custom order'
    : sortBy === 'progress-asc' ? 'Progress \u2191'
    : 'Progress \u2193';

  if (layout === 'grid') {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '8px' }}>
          <button className="btn" style={{ fontSize: '11px' }} onClick={cycleSortBy}>
            Sort: {sortLabel}
          </button>
          {sortBy === 'custom' && (
            <button className="btn" style={{ fontSize: '11px' }} onClick={() => setReordering(!reordering)}>
              {reordering ? 'Done' : 'Reorder'}
            </button>
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {sorted.map((p, i) => (
            <div key={p.id} style={{ position: 'relative' }}>
              {reordering && sortBy === 'custom' && (
                <div style={{
                  position: 'absolute', top: '6px', left: '6px', zIndex: 10,
                  display: 'flex', gap: '3px',
                }}>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg)', opacity: i === 0 ? 0.3 : 1 }}
                    onClick={(e) => { e.stopPropagation(); moveProject(i, -1); }}
                    disabled={i === 0}
                  >&#8592;</button>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg)', opacity: i === sorted.length - 1 ? 0.3 : 1 }}
                    onClick={(e) => { e.stopPropagation(); moveProject(i, 1); }}
                    disabled={i === sorted.length - 1}
                  >&#8594;</button>
                </div>
              )}
              <ProjectCard
                project={p}
                selected={false}
                onClick={() => !reordering && onSelect(p.id)}
                onDrilldown={onDrilldown}
                onPhotoChange={handlePhotoChange}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div id="project-list">
      {onDeselect && (
        <button
          className="btn"
          style={{ marginBottom: '8px', fontSize: '11px', width: '100%' }}
          onClick={onDeselect}
        >
          &#8592; All projects
        </button>
      )}
      {sorted.map(p => (
        <ProjectCard
          key={p.id}
          project={p}
          selected={p.id === selectedId}
          onClick={() => onSelect(p.id)}
          onDrilldown={onDrilldown}
          onPhotoChange={handlePhotoChange}
          compact={true}
        />
      ))}
    </div>
  );
}
