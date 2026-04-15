import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TeamView() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', role: '', notes: '' });

  const fetchMembers = async () => {
    const { data } = await supabase.from('team_members').select('*').order('company').order('name');
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const resetForm = () => setForm({ name: '', email: '', phone: '', company: '', role: '', notes: '' });

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await supabase.from('team_members').insert({ ...form, name: form.name.trim() });
    resetForm();
    setAdding(false);
    fetchMembers();
  };

  const handleEdit = async () => {
    if (!form.name.trim() || !editing) return;
    await supabase.from('team_members').update({ ...form }).eq('id', editing);
    resetForm();
    setEditing(null);
    fetchMembers();
  };

  const handleDelete = async (id) => {
    await supabase.from('team_members').delete().eq('id', id);
    fetchMembers();
  };

  const startEdit = (m) => {
    setForm({ name: m.name, email: m.email || '', phone: m.phone || '', company: m.company || '', role: m.role || '', notes: m.notes || '' });
    setEditing(m.id);
    setAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setEditing(null);
    setAdding(true);
  };

  // Group by company
  const grouped = {};
  for (const m of members) {
    const co = m.company || 'Other';
    if (!grouped[co]) grouped[co] = [];
    grouped[co].push(m);
  }

  const fieldStyle = {
    width: '100%', padding: '6px 8px', fontSize: '12px',
    border: '0.5px solid var(--border2)', borderRadius: 'var(--r)',
    background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '.05em', color: 'var(--text2)', display: 'block', marginBottom: '2px',
  };

  const renderForm = (onSubmit, submitLabel) => (
    <div style={{
      background: 'var(--bg)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--rl)', padding: '14px', marginBottom: '12px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div><label style={labelStyle}>Name *</label><input style={fieldStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><label style={labelStyle}>Email</label><input style={fieldStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><label style={labelStyle}>Company</label><input style={fieldStyle} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
        <div><label style={labelStyle}>Role</label><input style={fieldStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
        <div><label style={labelStyle}>Phone</label><input style={fieldStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label style={labelStyle}>Notes</label><input style={fieldStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="btn btn-primary" onClick={onSubmit}>{submitLabel}</button>
        <button className="btn" onClick={() => { setAdding(false); setEditing(null); resetForm(); }}>Cancel</button>
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: '20px', color: 'var(--text2)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="sec-lbl" style={{ marginBottom: 0 }}>Team contacts</div>
        {!adding && !editing && (
          <button className="btn btn-primary" onClick={startAdd}>+ Add team member</button>
        )}
      </div>

      {adding && renderForm(handleAdd, 'Add member')}
      {editing && renderForm(handleEdit, 'Save changes')}

      {Object.entries(grouped).map(([company, mems]) => (
        <div key={company} style={{ marginBottom: '14px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, color: 'var(--text2)',
            textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px',
          }}>
            {company}
          </div>
          {mems.map(m => (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--bg)', border: '0.5px solid var(--border)',
                borderRadius: 'var(--r)', padding: '8px 12px', marginBottom: '4px',
              }}
            >
              <div className="avatar">
                {(m.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)' }}>
                  {m.role}{m.email ? ` \u00B7 ${m.email}` : ''}{m.phone ? ` \u00B7 ${m.phone}` : ''}
                </div>
                {m.notes && <div style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '1px' }}>{m.notes}</div>}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: '11px', color: 'var(--accent-dark)', textDecoration: 'none', padding: '2px 6px' }}
                    title="Send email"
                  >
                    Email
                  </a>
                )}
                <button className="btn" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={() => startEdit(m)}>Edit</button>
                <button className="btn" style={{ fontSize: '10px', padding: '2px 6px', color: 'var(--red-text)' }} onClick={() => handleDelete(m.id)}>&#10005;</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
