import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import TaskItem from './TaskItem.jsx';

export default function TaskList({ project, phase, phaseIndex, canEdit }) {
  const { setProjects, useSeedMode } = useData();
  const [addingTask, setAddingTask] = useState(null); // null | 'phase' | groupIndex
  const [newTaskName, setNewTaskName] = useState('');
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (gi) => {
    setOpenGroups(prev => ({ ...prev, [gi]: !prev[gi] }));
  };

  const commitAddTask = (targetGroupIndex) => {
    if (!newTaskName.trim()) { setAddingTask(null); return; }
    if (useSeedMode) {
      setProjects(prev => {
        const next = JSON.parse(JSON.stringify(prev));
        const p = next.find(x => x.id === project.id);
        if (!p) return prev;
        const ph = p.phases[phaseIndex];
        const newTask = {
          id: 't_' + Date.now(),
          name: newTaskName.trim(),
          done: false,
          critical: false,
          note: '',
          dueDate: null,
          completedDate: null,
        };
        if (targetGroupIndex !== undefined && targetGroupIndex !== null && ph.tasks[targetGroupIndex]?.isGroup) {
          ph.tasks[targetGroupIndex].tasks.push(newTask);
        } else {
          ph.tasks.push(newTask);
        }
        return next;
      });
    }
    setNewTaskName('');
    setAddingTask(null);
  };

  const handleKeyDown = (e, targetGroupIndex) => {
    if (e.key === 'Enter') commitAddTask(targetGroupIndex);
    if (e.key === 'Escape') { setAddingTask(null); setNewTaskName(''); }
  };

  return (
    <div>
      {(phase.tasks || []).map((item, i) => {
        if (item.isGroup) {
          const group = item;
          const gOpen = openGroups[i] !== undefined ? openGroups[i] : (group.open !== false);
          const groupDone = (group.tasks || []).filter(t => t.done).length;
          const groupTotal = (group.tasks || []).length;
          return (
            <div className="tgroup" key={group.id || i}>
              <div className="tgroup-hdr" onClick={() => toggleGroup(i)}>
                <span className={`tgroup-chev${gOpen ? ' open' : ''}`}>&#9654;</span>
                <span className="tgroup-name">{group.name}</span>
                <span className="tgroup-count">{groupDone}/{groupTotal}</span>
              </div>
              {gOpen && (
                <div className="tgroup-body">
                  {(group.tasks || []).map((t, ti) => (
                    <TaskItem
                      key={t.id || ti}
                      task={t}
                      project={project}
                      phaseIndex={phaseIndex}
                      groupIndex={i}
                      taskIndex={ti}
                      canEdit={canEdit}
                    />
                  ))}
                  {canEdit && addingTask === i && (
                    <div className="add-task-row">
                      <input
                        className="add-task-inp"
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        onKeyDown={e => handleKeyDown(e, i)}
                        placeholder="Task name..."
                        autoFocus
                      />
                      <button className="btn" style={{ fontSize: '10px' }} onClick={() => commitAddTask(i)}>Add</button>
                      <button className="btn" style={{ fontSize: '10px' }} onClick={() => setAddingTask(null)}>&#10005;</button>
                    </div>
                  )}
                  {canEdit && addingTask !== i && (
                    <div style={{ padding: '3px 8px' }}>
                      <button className="btn" style={{ fontSize: '10px' }} onClick={() => { setAddingTask(i); setNewTaskName(''); }}>+ Task</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        // Standalone task
        return (
          <TaskItem
            key={item.id || i}
            task={item}
            project={project}
            phaseIndex={phaseIndex}
            taskIndex={i}
            canEdit={canEdit}
          />
        );
      })}

      {canEdit && (
        <div style={{ padding: '4px 12px 4px 28px' }}>
          {addingTask === 'phase' ? (
            <div className="add-task-row" style={{ padding: 0 }}>
              <input
                className="add-task-inp"
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onKeyDown={e => handleKeyDown(e, undefined)}
                placeholder="Task name..."
                autoFocus
              />
              <button className="btn" style={{ fontSize: '10px' }} onClick={() => commitAddTask(undefined)}>Add</button>
              <button className="btn" style={{ fontSize: '10px' }} onClick={() => setAddingTask(null)}>&#10005;</button>
            </div>
          ) : (
            <button className="btn" style={{ fontSize: '10px' }} onClick={() => { setAddingTask('phase'); setNewTaskName(''); }}>+ Add task</button>
          )}
        </div>
      )}
    </div>
  );
}
