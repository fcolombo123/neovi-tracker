import React from 'react';
import { ROLES } from '../constants.js';

export default function SettingsView({ currentRole, onRoleChange, darkMode, onDarkModeChange }) {
  return (
    <div style={{ maxWidth: '500px' }}>
      <div className="detail" style={{ marginBottom: '12px' }}>
        <div className="sec-lbl">Appearance</div>
        <div className="toggle-row">
          <span style={{ fontSize: '13px' }}>Dark mode</span>
          <div
            className={`toggle-track${darkMode ? ' on' : ''}`}
            onClick={() => onDarkModeChange(!darkMode)}
            style={{ cursor: 'pointer' }}
          >
            <div className="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <div className="detail">
        <div className="sec-lbl">Role</div>
        {Object.entries(ROLES).map(([key, role]) => (
          <div
            key={key}
            className={`role-pill${currentRole === key ? ' active' : ''}`}
            onClick={() => onRoleChange(key)}
          >
            <div>
              <div className="role-name" style={{ color: role.color }}>{role.label}</div>
              <div className="role-desc">{role.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
