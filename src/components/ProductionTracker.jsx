import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fmtDate } from '../utils.js';
import { draftEmail } from '../lib/ai.js';

function ProgressBar({ done, total, label }) {
  const pct = total ? Math.round(100 * done / total) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text3)', width: '90px', flexShrink: 0 }}>{label}</div>
      <div className="prog-bar" style={{ flex: 1, height: '5px' }}>
        <div className="prog-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)' }}></div>
      </div>
      <div style={{ fontSize: '9px', color: 'var(--text3)', width: '60px', textAlign: 'right', flexShrink: 0 }}>
        {done}/{total} ({pct}%)
      </div>
    </div>
  );
}

function StatusRow({ label, status, pct, dates, mismatchCount, children }) {
  const pctNum = pct ? Math.round(parseFloat(pct) * 100) : 0;
  const isDone = status === 'Complete' || status === 'Approved' || pctNum === 100;
  const isActive = !isDone && pctNum > 0;

  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
          background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--bg3)',
          border: isDone ? 'none' : '1px solid var(--border2)',
        }}></div>
        <div style={{ flex: 1, fontSize: '12px', fontWeight: isActive ? 500 : 400 }}>{label}</div>
        {status && (
          <div style={{ fontSize: '10px', color: isDone ? 'var(--green-text)' : isActive ? 'var(--accent-dark)' : 'var(--text3)', fontWeight: 500 }}>
            {status}
          </div>
        )}
        {dates && (
          <div style={{ fontSize: '9px', color: 'var(--text3)' }}>{dates}</div>
        )}
        <div style={{
          fontSize: '10px', fontWeight: 600, width: '32px', textAlign: 'right',
          color: isDone ? 'var(--green-text)' : isActive ? 'var(--accent-dark)' : 'var(--text3)',
        }}>
          {pctNum}%
        </div>
        {mismatchCount > 0 && (
          <span style={{
            fontSize: '9px', background: 'var(--amber-bg)', color: 'var(--amber-text)',
            padding: '1px 5px', borderRadius: '3px', fontWeight: 600, flexShrink: 0,
          }}>
            {mismatchCount} unchecked
          </span>
        )}
      </div>
      {children && <div style={{ paddingLeft: '16px', paddingBottom: '4px' }}>{children}</div>}
    </div>
  );
}

function getMismatchCount(phases, phaseNames) {
  const phase = (phases || []).find(ph => phaseNames.some(n => ph.name === n));
  if (!phase) return 0;
  const tasks = (phase.tasks || []).flatMap(t => t.isGroup ? (t.tasks || []) : [t]);
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  return total - done;
}

export default function ProductionTracker({ projectName, phases }) {
  const [syncData, setSyncData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftingIdx, setDraftingIdx] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);

  useEffect(() => {
    async function fetch() {
      const [sheetRes, teamRes] = await Promise.all([
        supabase.from('sheet_sync').select('*').ilike('project_name', `%${projectName}%`),
        supabase.from('team_members').select('name, email, initials'),
      ]);
      setTeamMembers(teamRes.data || []);
      const data = sheetRes.data;
      setSyncData(data && data.length > 0 ? data[0] : null);
      setLoading(false);
    }
    if (projectName) fetch();
  }, [projectName]);

  if (loading) return null;
  if (!syncData) return null;

  const s = syncData;
  const notes = typeof s.notes === 'string' ? JSON.parse(s.notes) : (s.notes || []);
  const hasFab = !!(s.fab_floor_req || s.fab_ext_req || s.fab_int_req);
  const hasFound = !!(s.found_piers_req || s.found_beams_req);
  const hasAssy = !!(s.assy_floor_req || s.assy_ext_req || s.assy_int_req || s.assy_truss_req || s.assy_roof_req);

  const fmtRange = (start, end) => {
    if (!start && !end) return null;
    return (start ? fmtDate(start) : '—') + ' → ' + (end ? fmtDate(end) : '—');
  };

  const resolveOwner = (initials) => {
    if (!initials) return null;
    // Handle multiple initials like "BB / DH / KS"
    const parts = initials.split(/\s*\/\s*/);
    return parts.map(init => {
      const member = teamMembers.find(m => m.initials === init.trim());
      return member ? { name: member.name, email: member.email, initials: init.trim() } : { name: init.trim(), email: null, initials: init.trim() };
    });
  };

  const handleDraftEmail = async (note, idx) => {
    setDraftingIdx(idx);
    setEmailDraft(null);
    try {
      const owners = resolveOwner(note.owner);
      const ownerName = owners ? owners.map(o => o.name).join(', ') : 'Team';
      const ownerEmail = owners ? owners.filter(o => o.email).map(o => o.email).join(', ') : '';
      const result = await draftEmail({
        note: note.text,
        owner: ownerName,
        ownerEmail,
        projectName,
        projectType: s.project_type || '',
      });
      setEmailDraft({ ...result, to: ownerEmail, idx });
    } catch (e) {
      console.error('Draft failed:', e);
      setEmailDraft({ subject: 'Error', body: e.message, to: '', idx });
    }
    setDraftingIdx(null);
  };

  // Mismatch counts
  const floorPlanDone = s.floor_plan_status === 'Complete' || s.floor_plan_pct === '1';
  const engDone = s.engineering_status === 'Complete' || s.engineering_pct === '1';
  const stateDone = s.state_permitting_status === 'Approved' || s.state_permitting_pct === '1';
  const cityDone = s.city_permitting_status === 'Approved' || s.city_permitting_pct === '1';

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div className="sec-lbl" style={{ marginBottom: 0 }}>Production Tracking</div>
        <div style={{ fontSize: '9px', color: 'var(--text3)' }}>Synced {fmtDate(s.synced_at)}</div>
      </div>

      {/* Notes */}
      {notes.length > 0 && (
        <div style={{
          background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
          marginBottom: '8px', border: '0.5px solid var(--border)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
            Notes
          </div>
          {notes.map((n, i) => {
            const owners = resolveOwner(n.owner);
            const ownerNames = owners ? owners.map(o => o.name).join(', ') : '';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0',
                borderBottom: i < notes.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: '11px', flex: 1 }}>{n.text}</div>
                {ownerNames && <span style={{ fontSize: '10px', color: 'var(--accent-dark)', fontWeight: 500, flexShrink: 0 }}>{ownerNames}</span>}
                {n.status && <span style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', flexShrink: 0 }}>{n.status}</span>}
                <button
                  className="btn"
                  style={{ fontSize: '9px', padding: '2px 6px', color: 'var(--accent-dark)', flexShrink: 0 }}
                  onClick={() => handleDraftEmail(n, i)}
                  disabled={draftingIdx === i}
                >
                  {draftingIdx === i ? '...' : 'Draft email'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Email Draft Modal */}
      {emailDraft && (
        <div className="modal-backdrop open" onClick={() => setEmailDraft(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Email Draft</h2>
            <div className="mf">
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>To</label>
              <input
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '0.5px solid var(--border2)', borderRadius: 'var(--r)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}
                value={emailDraft.to}
                onChange={e => setEmailDraft({ ...emailDraft, to: e.target.value })}
              />
            </div>
            <div className="mf">
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Subject</label>
              <input
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '0.5px solid var(--border2)', borderRadius: 'var(--r)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit' }}
                value={emailDraft.subject}
                onChange={e => setEmailDraft({ ...emailDraft, subject: e.target.value })}
              />
            </div>
            <div className="mf">
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '3px' }}>Body</label>
              <textarea
                style={{ width: '100%', padding: '7px 10px', fontSize: '13px', border: '0.5px solid var(--border2)', borderRadius: 'var(--r)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', minHeight: '120px', lineHeight: '1.5' }}
                value={emailDraft.body}
                onChange={e => setEmailDraft({ ...emailDraft, body: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEmailDraft(null)}>Close</button>
              <button className="btn" onClick={() => {
                navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`);
              }}>Copy to clipboard</button>
              <a
                href={`mailto:${emailDraft.to}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`}
                className="btn btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center' }}
                onClick={() => setEmailDraft(null)}
              >
                Open in email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Unified Status */}
      <div style={{
        background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
        border: '0.5px solid var(--border)',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
          Project Status
        </div>

        {/* Design & Permitting */}
        <StatusRow label="Floor Plan" status={s.floor_plan_status} pct={s.floor_plan_pct}
          mismatchCount={floorPlanDone ? getMismatchCount(phases, ['Schematic Design']) : 0} />
        <StatusRow label="Engineering" status={s.engineering_status} pct={s.engineering_pct}
          mismatchCount={engDone ? getMismatchCount(phases, ['Design Development']) : 0} />
        <StatusRow label="State Permitting" status={s.state_permitting_status} pct={s.state_permitting_pct}
          mismatchCount={stateDone ? getMismatchCount(phases, ['Design Development']) : 0} />
        <StatusRow label="City Permitting" status={s.city_permitting_status} pct={s.city_permitting_pct}
          mismatchCount={cityDone ? getMismatchCount(phases, ['Municipal Permitting']) : 0} />

        {/* Construction */}
        <StatusRow label="Fabrication" pct={s.fabrication_pct} dates={fmtRange(s.fabrication_start, s.fabrication_end)}>
          {hasFab && <>
            {s.fab_floor_req > 0 && <ProgressBar label="Floor Cassettes" done={s.fab_floor_done} total={s.fab_floor_req} />}
            {s.fab_ext_req > 0 && <ProgressBar label="Exterior Walls" done={s.fab_ext_done} total={s.fab_ext_req} />}
            {s.fab_int_req > 0 && <ProgressBar label="Interior Walls" done={s.fab_int_done} total={s.fab_int_req} />}
          </>}
        </StatusRow>

        <StatusRow label="Foundation" pct={s.foundation_pct} dates={fmtRange(s.foundation_start, s.foundation_end)}>
          {hasFound && <>
            {s.found_piers_req > 0 && <ProgressBar label="Piers" done={s.found_piers_done} total={s.found_piers_req} />}
            {s.found_beams_req > 0 && <ProgressBar label="Beams" done={s.found_beams_done} total={s.found_beams_req} />}
          </>}
        </StatusRow>

        <StatusRow label="Panel Assembly" pct={s.panel_assembly_pct} dates={fmtRange(s.panel_assembly_start, s.panel_assembly_end)}>
          {hasAssy && <>
            {s.assy_floor_req > 0 && <ProgressBar label="Floor Cassettes" done={s.assy_floor_done} total={s.assy_floor_req} />}
            {s.assy_ext_req > 0 && <ProgressBar label="Exterior Walls" done={s.assy_ext_done} total={s.assy_ext_req} />}
            {s.assy_int_req > 0 && <ProgressBar label="Interior Walls" done={s.assy_int_done} total={s.assy_int_req} />}
            {s.assy_truss_req > 0 && <ProgressBar label="Roof Trusses" done={s.assy_truss_done} total={s.assy_truss_req} />}
            {s.assy_roof_req > 0 && <ProgressBar label="Roof Panels" done={s.assy_roof_done} total={s.assy_roof_req} />}
          </>}
        </StatusRow>

        <StatusRow label="Finishing" pct={s.finishing_pct} dates={fmtRange(s.finishing_start, s.finishing_end)} />
      </div>
    </div>
  );
}
