import React from 'react';
import { useData } from '../context/DataContext.jsx';
import ProjectCard from './ProjectCard.jsx';

export default function ProjectList({ currentRole, selectedId, onSelect, onDrilldown }) {
  const { projects, updateProject } = useData();

  const visibleProjects = currentRole === 'client' ? projects.slice(0, 1) : projects;

  const handlePhotoChange = (projectId, dataUrl) => {
    updateProject(projectId, { photoUrl: dataUrl });
  };

  return (
    <div id="project-list">
      {visibleProjects.map(p => (
        <ProjectCard
          key={p.id}
          project={p}
          selected={p.id === selectedId}
          onClick={() => onSelect(p.id)}
          onDrilldown={onDrilldown}
          onPhotoChange={handlePhotoChange}
        />
      ))}
    </div>
  );
}
