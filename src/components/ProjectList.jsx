import React from 'react';
import { useData } from '../context/DataContext.jsx';
import ProjectCard from './ProjectCard.jsx';

export default function ProjectList({ currentRole, selectedId, onSelect, onDeselect, onDrilldown, layout }) {
  const { projects, updateProject } = useData();

  const visibleProjects = currentRole === 'client' ? projects.slice(0, 1) : projects;

  const handlePhotoChange = (projectId, dataUrl) => {
    updateProject(projectId, { photoUrl: dataUrl });
  };

  if (layout === 'grid') {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '12px',
      }}>
        {visibleProjects.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            selected={false}
            onClick={() => onSelect(p.id)}
            onDrilldown={onDrilldown}
            onPhotoChange={handlePhotoChange}
          />
        ))}
      </div>
    );
  }

  // List layout (when a project is selected)
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
      {visibleProjects.map(p => (
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
