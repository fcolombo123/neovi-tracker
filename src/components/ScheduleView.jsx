import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext.jsx';
import { fmtDate } from '../utils.js';

const PHASE_COLORS = {
  Engineering: '#378ADD',
  Permitting: '#BA7517',
  Fabrication: '#7A5A9E',
  Foundation: '#5A8C5E',
  'Panel Assembly': '#C4A882',
  Finishing: '#C47A72',
};

const PHASES_ORDER = ['Engineering', 'Permitting', 'Fabrication', 'Foundation', 'Panel Assembly', 'Finishing'];

export default function ScheduleView() {
  const { projects } = useData();
  const [syncData, setSyncData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('sheet_sync').select('*').order('project_name');
      setSyncData(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'var(--text2)' }}>Loading...</div>;

  // Build schedule entries per project
  const schedules = syncData.map(s => {
    const phases = [];
    const addPhase = (name, start, end, pct) => {
      if (!start) return;
      const pctNum = pct ? Math.round(parseFloat(pct) * 100) : 0;
      phases.push({ name, start: new Date(start), end: end ? new Date(end) : new Date(start), pct: pctNum });
    };
    // Pre-construction from sheet status
    if (s.engineering_pct) {
      const engPct = Math.round(parseFloat(s.engineering_pct) * 100);
      // Use schedule column dates if available, otherwise skip
    }
    addPhase('Fabrication', s.fabrication_start, s.fabrication_end, s.fabrication_pct);
    addPhase('Foundation', s.foundation_start, s.foundation_end, s.foundation_pct);
    addPhase('Panel Assembly', s.panel_assembly_start, s.panel_assembly_end, s.panel_assembly_pct);
    addPhase('Finishing', s.finishing_start, s.finishing_end, s.finishing_pct);
    return { name: s.project_name, phases };
  }).filter(s => s.phases.length > 0);

  if (schedules.length === 0) {
    return <div style={{ padding: '20px', color: 'var(--text2)', textAlign: 'center' }}>No schedule data available</div>;
  }

  // Calculate date range across all projects
  const allDates = schedules.flatMap(s => s.phases.flatMap(p => [p.start, p.end]));
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));

  // Add padding
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);

  const totalDays = Math.ceil((maxDate - minDate) / 86400000);
  const dayWidth = Math.max(4, Math.min(12, 900 / totalDays));
  const chartWidth = totalDays * dayWidth;

  const toX = (date) => {
    const days = Math.ceil((date - minDate) / 86400000);
    return days * dayWidth;
  };

  // Generate month labels
  const months = [];
  const cursor = new Date(minDate);
  cursor.setDate(1);
  while (cursor <= maxDate) {
    months.push({ label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), x: toX(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Today line
  const today = new Date();
  const todayX = toX(today);
  const showToday = today >= minDate && today <= maxDate;

  const rowHeight = 24;
  const headerHeight = 28;
  const projectGap = 12;
  const labelWidth = 140;

  // Calculate total height
  let totalHeight = headerHeight;
  schedules.forEach(s => {
    totalHeight += 22; // project label
    totalHeight += s.phases.length * rowHeight;
    totalHeight += projectGap;
  });

  return (
    <div>
      <div className="sec-lbl" style={{ marginBottom: '12px' }}>Construction Schedule</div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {PHASES_ORDER.map(name => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: PHASE_COLORS[name] }}></div>
            <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{name}</span>
          </div>
        ))}
        {showToday && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '2px', background: 'var(--red)' }}></div>
            <span style={{ fontSize: '10px', color: 'var(--text2)' }}>Today</span>
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 'var(--rl)',
        overflow: 'auto', padding: '12px',
      }}>
        <div style={{ display: 'flex', minWidth: labelWidth + chartWidth }}>
          {/* Labels column */}
          <div style={{ width: labelWidth, flexShrink: 0 }}>
            <div style={{ height: headerHeight }}></div>
            {schedules.map((s, si) => (
              <div key={si}>
                <div style={{ height: 22, display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                  {s.name}
                </div>
                {s.phases.map((p, pi) => (
                  <div key={pi} style={{
                    height: rowHeight, display: 'flex', alignItems: 'center',
                    fontSize: '10px', color: 'var(--text2)', paddingLeft: '8px',
                  }}>
                    {p.name}
                  </div>
                ))}
                <div style={{ height: projectGap }}></div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width={chartWidth} height={totalHeight} style={{ display: 'block' }}>
              {/* Month grid lines and labels */}
              {months.map((m, i) => (
                <g key={i}>
                  <line x1={m.x} y1={0} x2={m.x} y2={totalHeight} stroke="var(--border)" strokeWidth="0.5" />
                  <text x={m.x + 4} y={16} fontSize="9" fill="var(--text3)">{m.label}</text>
                </g>
              ))}

              {/* Today line */}
              {showToday && (
                <line x1={todayX} y1={0} x2={todayX} y2={totalHeight}
                  stroke="var(--red)" strokeWidth="1.5" strokeDasharray="4,3" />
              )}

              {/* Bars */}
              {(() => {
                let y = headerHeight;
                return schedules.map((s, si) => {
                  const projectY = y;
                  y += 22; // project header
                  const bars = s.phases.map((p, pi) => {
                    const barY = y;
                    y += rowHeight;
                    const x = toX(p.start);
                    const width = Math.max(4, toX(p.end) - x);
                    const color = PHASE_COLORS[p.name] || 'var(--accent)';
                    const isDone = p.pct === 100;

                    return (
                      <g key={`${si}-${pi}`}>
                        {/* Background bar */}
                        <rect x={x} y={barY + 4} width={width} height={rowHeight - 8}
                          rx="3" fill={color} opacity="0.2" />
                        {/* Progress fill */}
                        <rect x={x} y={barY + 4} width={width * p.pct / 100} height={rowHeight - 8}
                          rx="3" fill={color} opacity={isDone ? 0.8 : 0.6} />
                        {/* Percentage label */}
                        {width > 30 && (
                          <text x={x + 4} y={barY + rowHeight / 2 + 3} fontSize="8" fill="#fff" fontWeight="600">
                            {p.pct}%
                          </text>
                        )}
                      </g>
                    );
                  });
                  y += projectGap;
                  return bars;
                });
              })()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
