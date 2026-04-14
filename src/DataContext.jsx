import React, { createContext, useContext, useState, useCallback } from 'react';
import initialProjects from './seedData.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);

  const updateProjects = useCallback((updater) => {
    setProjects(prev => {
      const next = typeof updater === 'function' ? updater([...prev]) : updater;
      return [...next];
    });
  }, []);

  const updateTask = useCallback((projectId, phaseIndex, taskRef, updates) => {
    setProjects(prev => {
      const next = prev.map(p => {
        if (p.id !== projectId) return p;
        const newP = { ...p, phases: p.phases.map((ph, pi) => {
          if (pi !== phaseIndex) return ph;
          const newPh = { ...ph, tasks: [...ph.tasks] };
          // Resolve task ref
          if (typeof taskRef === 'string' && taskRef.startsWith('g')) {
            const [, gi, ti] = taskRef.match(/g(\d+)_(\d+)/);
            const group = { ...newPh.tasks[+gi], tasks: [...newPh.tasks[+gi].tasks] };
            group.tasks[+ti] = { ...group.tasks[+ti], ...updates };
            newPh.tasks[+gi] = group;
          } else {
            newPh.tasks[+taskRef] = { ...newPh.tasks[+taskRef], ...updates };
          }
          return newPh;
        })};
        return newP;
      });
      return next;
    });
  }, []);

  const updatePhase = useCallback((projectId, phaseIndex, updates) => {
    setProjects(prev => {
      return prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph, pi) => {
            if (pi !== phaseIndex) return ph;
            return { ...ph, ...updates };
          })
        };
      });
    });
  }, []);

  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev => {
      return prev.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, ...updates };
      });
    });
  }, []);

  const createProject = useCallback((projectData) => {
    setProjects(prev => [...prev, projectData]);
  }, []);

  const updateGateItem = useCallback((projectId, phaseIndex, gateIndex, updates) => {
    setProjects(prev => {
      return prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: p.phases.map((ph, pi) => {
            if (pi !== phaseIndex) return ph;
            return {
              ...ph,
              gateChecklist: ph.gateChecklist.map((g, gi) => {
                if (gi !== gateIndex) return g;
                return { ...g, ...updates };
              })
            };
          })
        };
      });
    });
  }, []);

  const value = {
    projects,
    loading,
    setProjects,
    updateProjects,
    updateTask,
    updatePhase,
    updateProject,
    createProject,
    updateGateItem,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export default DataContext;
