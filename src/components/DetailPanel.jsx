import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import PhaseBlock from './PhaseBlock.jsx';
import { pctWork } from '../queries.js';

export default function DetailPanel({ projectId, canEdit, onBack, isDrilldown }) {
  const { projects } = useData();
  const p = projects.find(x => x.id === projectId);
  const [expandAll, setExpandAll] = useState(false);

  if (!p) return <div className="detail" style={{ color: 'var(--text2)', padding: '20px', textAlign: 'center' }}>Select a project</div>;

  return (
    <div id={isDrilldown ? 'project-drilldown' : 'detail-panel'}>
      {isDrilldown && (
        <div className="drilldown-header">
          <button className="back-btn" onClick={onBack}>&#8592; Back to list</button>
        </div>
      )}
      <div className="detail">
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{p.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px' }}>
            {p.type === 'client' ? 'Client Build' : 'Spec Build'}
            {p.tier ? ` \u00B7 ${p.tier}` : ''} &middot; {p.address}
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {p.planningIR === 'yes' && <span className="badge b-info">Planning IR required</span>}
            {p.planningIR === 'no' && <span className="badge b-gray">No Planning IR</span>}
            {p.planningIR === 'unknown' && <span className="badge b-warn">Planning IR: TBD</span>}
          </div>
        </div>
        <div className="mini-metrics">
          <div className="mm">
            <div className="lbl">Work complete</div>
            <div className="val">{pctWork(p)}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div className="sec-lbl" style={{ marginBottom: 0 }}>Phases</div>
          <button className="btn" style={{ fontSize: '11px' }} onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {p.phases.map((ph, pi) => (
          <PhaseBlock
            key={ph.id || pi}
            project={p}
            phase={ph}
            phaseIndex={pi}
            canEdit={canEdit}
            forceOpen={expandAll}
          />
        ))}
      </div>
    </div>
  );
}
