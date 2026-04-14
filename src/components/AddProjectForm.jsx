import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { makeProject } from '../seedData.js';

export default function AddProjectForm({ onClose }) {
  const { projects, setProjects, createProject, useSeedMode } = useData();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('client');
  const [tier, setTier] = useState('silver');
  const [planningIR, setPlanningIR] = useState('unknown');

  const handleSubmit = () => {
    if (!name.trim()) { alert('Project name required'); return; }
    if (useSeedMode) {
      const id = projects.length + 1;
      const newProject = makeProject(id, name.trim(), address || 'Address TBD', type, tier, 0, 0, planningIR, null);
      setProjects(prev => [...prev, newProject]);
    } else {
      createProject({ name: name.trim(), address: address || 'Address TBD', type, tier, planningIr: planningIR });
    }
    // Reset
    setName('');
    setAddress('');
    setType('client');
    setTier('silver');
    setPlanningIR('unknown');
    onClose();
  };

  return (
    <div className="add-form open" id="add-form">
      <div style={{ padding: '18px', background: 'var(--bg)', borderRadius: 'var(--rl)', border: '0.5px solid var(--border)', marginBottom: '14px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>New project</div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Project name *</label>
          <input
            id="n-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', fontSize: '13px',
              border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
              background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit'
            }}
            placeholder="e.g. Santa Rita"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Address</label>
          <input
            id="n-addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', fontSize: '13px',
              border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
              background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit'
            }}
            placeholder="123 Main St, City CA"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Type</label>
            <select
              id="n-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', fontSize: '13px',
                border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
                background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit'
              }}
            >
              <option value="client">Client Build</option>
              <option value="spec">Spec Build</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Tier</label>
            <select
              id="n-tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', fontSize: '13px',
                border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
                background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit'
              }}
            >
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Planning IR</label>
          <select
            id="n-ir"
            value={planningIR}
            onChange={(e) => setPlanningIR(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', fontSize: '13px',
              border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
              background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit'
            }}
          >
            <option value="unknown">TBD</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleSubmit}>Create project</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
