import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fmtDate } from '../utils.js';

function ProgressBar({ done, total, label }) {
  const pct = total ? Math.round(100 * done / total) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text2)', width: '100px', flexShrink: 0 }}>{label}</div>
      <div className="prog-bar" style={{ flex: 1, height: '6px' }}>
        <div className="prog-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)' }}></div>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text3)', width: '70px', textAlign: 'right', flexShrink: 0 }}>
        {done}/{total} ({pct}%)
      </div>
    </div>
  );
}

function PhaseSchedule({ label, start, end, pct }) {
  const pctNum = pct ? Math.round(parseFloat(pct) * 100) : 0;
  const isActive = pctNum > 0 && pctNum < 100;
  const isDone = pctNum === 100;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
      borderBottom: '0.5px solid var(--border)',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'var(--green)' : isActive ? 'var(--accent)' : 'var(--bg3)',
        border: isDone ? 'none' : '1px solid var(--border2)',
      }}></div>
      <div style={{ flex: 1, fontSize: '12px', fontWeight: isActive ? 500 : 400 }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>
        {start ? fmtDate(start) : '—'} → {end ? fmtDate(end) : '—'}
      </div>
      <div style={{
        fontSize: '10px', fontWeight: 600, width: '36px', textAlign: 'right',
        color: isDone ? 'var(--green-text)' : isActive ? 'var(--accent-dark)' : 'var(--text3)',
      }}>
        {pctNum}%
      </div>
    </div>
  );
}

function StatusRow({ label, sheetStatus, sheetPct, phases, phaseNames }) {
  // Find matching phase and count tasks
  const phase = phases.find(ph => phaseNames.some(n => ph.name === n));
  const tasks = phase ? (phase.tasks || []).flatMap(t => t.isGroup ? (t.tasks || []) : [t]) : [];
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pctNum = sheetPct ? Math.round(parseFloat(sheetPct) * 100) : 0;
  const isDone = sheetStatus === 'Complete' || sheetStatus === 'Approved' || pctNum === 100;
  const hasMismatch = isDone && total > 0 && done < total;
  const isPartial = !isDone && pctNum > 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
      borderBottom: '0.5px solid var(--border)',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'var(--green)' : isPartial ? 'var(--accent)' : 'var(--bg3)',
        border: isDone ? 'none' : '1px solid var(--border2)',
      }}></div>
      <div style={{ flex: 1, fontSize: '12px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: isDone ? 'var(--green-text)' : isPartial ? 'var(--accent-dark)' : 'var(--text3)', fontWeight: 500 }}>
        {sheetStatus || '—'}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text3)', width: '32px', textAlign: 'right' }}>
        {pctNum}%
      </div>
      {hasMismatch && (
        <span style={{
          fontSize: '9px', background: 'var(--amber-bg)', color: 'var(--amber-text)',
          padding: '1px 5px', borderRadius: '3px', fontWeight: 600, flexShrink: 0,
        }}>
          {total - done} task{total - done > 1 ? 's' : ''} unchecked
        </span>
      )}
    </div>
  );
}

export default function ProductionTracker({ projectName, phases }) {
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      // Match by partial name (spreadsheet uses "898 Santa Rita", app uses "Santa Rita")
      const { data } = await supabase
        .from('sheet_sync')
        .select('*')
        .ilike('project_name', `%${projectName}%`);
      setSyncData(data && data.length > 0 ? data[0] : null);
      setLoading(false);
    }
    if (projectName) fetch();
  }, [projectName]);

  if (loading) return null;
  if (!syncData) return null;

  const s = syncData;
  const notes = typeof s.notes === 'string' ? JSON.parse(s.notes) : (s.notes || []);
  const hasFab = s.fab_floor_req || s.fab_ext_req || s.fab_int_req;
  const hasFound = s.found_piers_req || s.found_beams_req;
  const hasAssy = s.assy_floor_req || s.assy_ext_req || s.assy_int_req || s.assy_truss_req || s.assy_roof_req;

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <div className="sec-lbl" style={{ marginBottom: 0 }}>Production Tracking</div>
        <div style={{ fontSize: '9px', color: 'var(--text3)' }}>
          Synced {fmtDate(s.synced_at)}
        </div>
      </div>

      {/* Spreadsheet Notes */}
      {notes.length > 0 && (
        <div style={{
          background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
          marginBottom: '8px', border: '0.5px solid var(--border)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
            Notes
          </div>
          {notes.map((n, i) => (
            <div key={i} style={{
              display: 'flex', gap: '8px', padding: '4px 0',
              borderBottom: i < notes.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '11px', flex: 1 }}>
                {n.text}
              </div>
              {n.owner && (
                <span style={{ fontSize: '10px', color: 'var(--accent-dark)', fontWeight: 500, flexShrink: 0 }}>
                  {n.owner}
                </span>
              )}
              {n.status && (
                <span style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', flexShrink: 0 }}>
                  {n.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Design & Permitting Status */}
      {(s.floor_plan_status || s.engineering_status || s.state_permitting_status || s.city_permitting_status) && (
        <div style={{
          background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
          marginBottom: '8px', border: '0.5px solid var(--border)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
            Design & Permitting Status
          </div>
          <StatusRow label="Floor Plan" sheetStatus={s.floor_plan_status} sheetPct={s.floor_plan_pct} phases={phases || []} phaseNames={['Schematic Design']} />
          <StatusRow label="Engineering" sheetStatus={s.engineering_status} sheetPct={s.engineering_pct} phases={phases || []} phaseNames={['Design Development']} />
          <StatusRow label="State Permitting (ICC/NTA)" sheetStatus={s.state_permitting_status} sheetPct={s.state_permitting_pct} phases={phases || []} phaseNames={['Design Development']} />
          <StatusRow label="City Permitting" sheetStatus={s.city_permitting_status} sheetPct={s.city_permitting_pct} phases={phases || []} phaseNames={['Municipal Permitting']} />
        </div>
      )}

      {/* Construction Schedule */}
      <div style={{
        background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
        marginBottom: '8px', border: '0.5px solid var(--border)',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
          Construction Schedule
        </div>
        <PhaseSchedule label="Fabrication" start={s.fabrication_start} end={s.fabrication_end} pct={s.fabrication_pct} />
        <PhaseSchedule label="Foundation" start={s.foundation_start} end={s.foundation_end} pct={s.foundation_pct} />
        <PhaseSchedule label="Panel Assembly" start={s.panel_assembly_start} end={s.panel_assembly_end} pct={s.panel_assembly_pct} />
        <PhaseSchedule label="Finishing" start={s.finishing_start} end={s.finishing_end} pct={s.finishing_pct} />
      </div>

      {/* Panel & Component Counts */}
      {(hasFab || hasFound || hasAssy) && (
        <div style={{
          background: 'var(--bg2)', borderRadius: 'var(--r)', padding: '10px 12px',
          marginBottom: '8px', border: '0.5px solid var(--border)',
        }}>
          {hasFab && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>
                Fabrication
              </div>
              {s.fab_floor_req > 0 && <ProgressBar label="Floor Cassettes" done={s.fab_floor_done} total={s.fab_floor_req} />}
              {s.fab_ext_req > 0 && <ProgressBar label="Exterior Walls" done={s.fab_ext_done} total={s.fab_ext_req} />}
              {s.fab_int_req > 0 && <ProgressBar label="Interior Walls" done={s.fab_int_done} total={s.fab_int_req} />}
            </div>
          )}
          {hasFound && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>
                Foundation
              </div>
              {s.found_piers_req > 0 && <ProgressBar label="Piers" done={s.found_piers_done} total={s.found_piers_req} />}
              {s.found_beams_req > 0 && <ProgressBar label="Beams" done={s.found_beams_done} total={s.found_beams_req} />}
            </div>
          )}
          {hasAssy && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '4px' }}>
                Panel Assembly
              </div>
              {s.assy_floor_req > 0 && <ProgressBar label="Floor Cassettes" done={s.assy_floor_done} total={s.assy_floor_req} />}
              {s.assy_ext_req > 0 && <ProgressBar label="Exterior Walls" done={s.assy_ext_done} total={s.assy_ext_req} />}
              {s.assy_int_req > 0 && <ProgressBar label="Interior Walls" done={s.assy_int_done} total={s.assy_int_req} />}
              {s.assy_truss_req > 0 && <ProgressBar label="Roof Trusses" done={s.assy_truss_done} total={s.assy_truss_req} />}
              {s.assy_roof_req > 0 && <ProgressBar label="Roof Panels" done={s.assy_roof_done} total={s.assy_roof_req} />}
            </div>
          )}
        </div>
      )}

      {/* Notes already rendered above */}
    </div>
  );
}
