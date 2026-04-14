import React from 'react';

const TAB_LIST = [
  { id: 'projects', label: 'Projects' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'team', label: 'Team' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'factory', label: 'Factory' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
];

export default function Tabs({ activeTab, onTabChange }) {
  return (
    <div className="tabs">
      {TAB_LIST.map(tab => (
        <button
          key={tab.id}
          className={`tab${activeTab === tab.id ? ' active' : ''}`}
          data-tab={tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
