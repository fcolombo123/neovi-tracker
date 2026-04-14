import React from 'react';
import { ROLES } from '../constants.js';

export default function Header({ currentRole, canEdit, darkMode, onToggleDarkMode, onNewProject, user, onSignOut }) {
  return (
    <div className="header">
      <div>
        <div className="eyebrow">Neovi</div>
        <h1>Project tracker</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg2)', border: '0.5px solid var(--border2)', borderRadius: 'var(--r)', padding: '5px 10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>Viewing as</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: ROLES[currentRole]?.color }}>
            {ROLES[currentRole]?.label}
          </span>
        </div>
        <div
          className={`toggle-track${darkMode ? ' on' : ''}`}
          onClick={onToggleDarkMode}
          title="Toggle dark mode"
          style={{ cursor: 'pointer' }}
        >
          <div className="toggle-thumb"></div>
        </div>
        {canEdit && (
          <button className="btn-add" onClick={onNewProject}>
            + New project
          </button>
        )}
        {user && (
          <button
            className="btn"
            onClick={onSignOut}
            style={{ fontSize: '11px' }}
            title={user.email}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
