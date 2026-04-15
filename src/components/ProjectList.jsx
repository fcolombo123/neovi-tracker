import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext.jsx';
import ProjectCard from './ProjectCard.jsx';
import { pctWork } from '../queries.js';

export default function ProjectList({ currentRole, selectedId, onSelect, onDeselect, onDrilldown, layout }) {
  const { projects, updateProject } = useData();
  const [sortBy, setSortBy] = useState('custom');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const visibleProjects = currentRole === 'client' ? projects.slice(0, 1) : projects;

  const sorted = [...visibleProjects].sort((a, b) => {
    if (sortBy === 'progress-asc') return pctWork(a) - pctWork(b);
    if (sortBy === 'progress-desc') return pctWork(b) - pctWork(a);
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const handlePhotoChange = (projectId, dataUrl) => {
    updateProject(projectId, { photoUrl: dataUrl });
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...sorted];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);

    // Update sort_order for all affected projects
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sortOrder !== i + 1) {
        await updateProject(reordered[i].id, { sortOrder: i + 1 });
      }
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const cycleSortBy = () => {
    if (sortBy === 'custom') setSortBy('progress-asc');
    else if (sortBy === 'progress-asc') setSortBy('progress-desc');
    else setSortBy('custom');
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
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {sorted.map((p, i) => (
            <div
              key={p.id}
              draggable={sortBy === 'custom'}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              style={{ cursor: sortBy === 'custom' ? 'grab' : 'default' }}
            >
              <ProjectCard
                project={p}
                selected={false}
                onClick={() => onSelect(p.id)}
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
