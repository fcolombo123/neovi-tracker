const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://rizxemjwrmzxjaxsmlls.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenhlbWp3cm16eGpheHNtbGxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE4Mzk2OCwiZXhwIjoyMDkxNzU5OTY4fQ.Px3YSlD5-AeeKZZIrG7qiEm8B6g5wPgj0aJC5yWdCq8'
);

async function seed() {
  // ── Projects ──────────────────────────────────────────────────────
  const projectDefs = [
    { name: 'Santa Rita', address: '1482 Elmwood Dr, San Jose CA', type: 'client', tier: 'gold', planning_ir: 'yes', status: 'active' },
    { name: 'Meadow', address: '3201 Meadow Ln, Hayward CA', type: 'client', tier: 'silver', planning_ir: 'no', status: 'active' },
    { name: 'Franklin', address: '890 Franklin Ave, Santa Clara CA', type: 'spec', tier: '', planning_ir: 'yes', status: 'active' },
    { name: 'Fernando', address: '2155 San Fernando Rd, Sunnyvale CA', type: 'client', tier: 'platinum', planning_ir: 'unknown', status: 'active' },
    { name: 'Upland', address: '470 Upland Rd, Redwood City CA', type: 'spec', tier: '', planning_ir: 'no', status: 'planning' },
    { name: 'Colorado', address: '1100 Colorado Ave, Palo Alto CA', type: 'spec', tier: '', planning_ir: 'unknown', status: 'planning' },
  ];

  console.log('Inserting projects...');
  const { data: projects, error: pErr } = await sb.from('projects').insert(projectDefs).select();
  if (pErr) throw new Error('projects insert failed: ' + pErr.message);
  console.log(`  ✓ ${projects.length} projects inserted`);

  // Build a lookup: name -> project row
  const pMap = {};
  for (const p of projects) pMap[p.name] = p;

  // ── Phase definitions ─────────────────────────────────────────────
  const phaseDefs = [
    { phase_number: 1, name: 'Project Kick Off', owner: 'Neovi PM' },
    { phase_number: 2, name: 'Schematic Design', owner: 'Spacial' },
    { phase_number: 3, name: 'Design Development', owner: 'Neovi Eng' },
    { phase_number: 4, name: 'Municipal Permitting', owner: 'Spacial/Permit' },
    { phase_number: 5, name: 'Construction', owner: 'Greenberg+Neovi' },
  ];

  const phaseRows = [];
  for (const proj of projects) {
    for (const pd of phaseDefs) {
      phaseRows.push({ project_id: proj.id, ...pd, done: false, overdue: false });
    }
  }

  console.log('Inserting phases...');
  const { data: phases, error: phErr } = await sb.from('phases').insert(phaseRows).select();
  if (phErr) throw new Error('phases insert failed: ' + phErr.message);
  console.log(`  ✓ ${phases.length} phases inserted`);

  // Build lookup: projectId+phaseNumber -> phase row
  const phaseMap = {};
  for (const ph of phases) {
    phaseMap[`${ph.project_id}_${ph.phase_number}`] = ph;
  }

  // Helper to get phase id
  function phId(projName, phaseNum) {
    return phaseMap[`${pMap[projName].id}_${phaseNum}`].id;
  }

  // ── Task Group definitions (Phase 5) ──────────────────────────────
  const groupDefs = [
    { name: 'Demolition', sort_order: 1 },
    { name: 'Site Preparation', sort_order: 2 },
    { name: 'Fabrication', sort_order: 3 },
    { name: 'Foundation', sort_order: 4 },
    { name: 'Panel Assembly', sort_order: 5 },
    { name: 'Dry-In', sort_order: 6 },
    { name: 'Rough-In & Panel Connections', sort_order: 7 },
    { name: 'Finishing — Neovi', sort_order: 8 },
    { name: 'Finishing — Greenberg', sort_order: 9 },
    { name: 'Turnover', sort_order: 10 },
  ];

  const groupRows = [];
  for (const proj of projects) {
    const phase5 = phaseMap[`${proj.id}_5`];
    for (const gd of groupDefs) {
      groupRows.push({ phase_id: phase5.id, name: gd.name, open: true, sort_order: gd.sort_order });
    }
  }

  console.log('Inserting task_groups...');
  const { data: groups, error: gErr } = await sb.from('task_groups').insert(groupRows).select();
  if (gErr) throw new Error('task_groups insert failed: ' + gErr.message);
  console.log(`  ✓ ${groups.length} task_groups inserted`);

  // Build lookup: phaseId + groupName -> group row
  const groupMap = {};
  for (const g of groups) {
    groupMap[`${g.phase_id}_${g.name}`] = g;
  }

  function grpId(projName, groupName) {
    const phase5 = phaseMap[`${pMap[projName].id}_5`];
    return groupMap[`${phase5.id}_${groupName}`].id;
  }

  // ── Task definitions per phase ────────────────────────────────────

  // Phase 1 tasks
  const p1ClientTasks = [
    'Client engages Greenberg Construction',
    'Spacial design contract executed (client contracts directly)',
    'Client selects tier package (Silver / Gold / Platinum)',
    'Client contract executed — scope, fee, allowances',
    'ACE contract executed (Neovi pays)',
    'Greenberg contract executed',
    'Site consultants contracted (survey, arborist, geotech, civil)',
    'Kick off meeting held',
  ];

  const p1SpecTasks = [
    'Lot acquired; project LLC established',
    'Neovi PM assembles project brief (size, stories, zoning, schedule, budget)',
    'Spacial contract executed (LLC contracts; Neovi manages)',
    'ACE contract executed (Neovi pays)',
    'Kick off meeting: Neovi + Spacial + Greenberg — brief presented',
    'Spacial commits to floor plan delivery date',
    'Greenberg contract executed',
    'Site consultants contracted (geotech, civil, survey, arborist, landscape arch)',
  ];

  // Phase 2 tasks
  function getP2Tasks(proj) {
    const isClient = proj.type === 'client';
    const hasIR = proj.planning_ir === 'yes';

    if (isClient) {
      const tasks = [
        'Spacial develops floor plan & elevations',
        'Neovi PM reviews first draft (~90% complete)',
        'Vault Studio adds casework dimensions and locations',
        'Revision rounds — all parties aligned',
      ];
      if (hasIR) {
        tasks.push('Pre-application design review (Spacial + Neovi page turn)');
        tasks.push('Planning IR — formal application submitted (Spacial manages)');
      }
      tasks.push(
        'Structural upgrade assessment (Neovi prices; via Greenberg)',
        'Spacial assembles full schematic package (IFC model, survey, geotech, civil, cabinetry)',
        'Client design lock acknowledgement signed',
        'Client formal sign-off',
      );
      return tasks;
    } else {
      // spec
      const tasks = [
        'Spacial develops floor plan & elevations',
        'Neovi PM reviews first draft',
        'Vault Studio adds casework dimensions and locations for target market',
        'Revision rounds — all parties aligned',
      ];
      if (hasIR) {
        tasks.push('Pre-application design review (Spacial + Neovi page turn)');
        tasks.push('Planning IR — formal application submitted (Spacial manages)');
      }
      tasks.push(
        'Spacial assembles full schematic package (IFC model, survey, geotech, civil, cabinetry)',
        'Neovi formal sign-off',
      );
      return tasks;
    }
  }

  // Phase 3 tasks (same for all)
  const p3Tasks = [
    'Import and verify IFC model',
    'Structural and foundation design (ACE)',
    'Helical pile manufacturer provides foundation calculations',
    'MEP integration and de-confliction',
    'Final panelization schedule confirmed',
    'Title 24 / energy compliance certification',
    'Fire protection plan complete',
    'Full drawing set assembled',
    'Spacial design review — no outstanding code issues',
    'Site logistics plan developed and distributed',
    'ICC/NTA submission',
    'ICC/NTA comments addressed',
    'ICC/NTA approval and stamp received',
  ];

  // Phase 4 tasks (same for all)
  const p4Tasks = [
    'Full permit package assembled by Spacial',
    'Building permit application submitted',
    'Other applications submitted (Encroachment, Grading, Public Works, Fire)',
    'Plan check comments received',
    'Plan check comments responded to and resolved',
    'Building permit issued',
    'Grading permit issued',
    'Utility permits issued',
    'Greenberg mobilization scheduled',
    'Factory fabrication scheduled',
  ];

  // Phase 5 tasks by group (same for all)
  const p5GroupTasks = {
    'Demolition': [
      'Grading permit in hand',
      'Greenberg mobilizes',
      'City inspections as required',
    ],
    'Site Preparation': [
      'Grading and drainage',
      'Underground utilities',
      'Hardscape base preparation',
      'Erosion control and drainage',
      'City and Public Works inspections at required milestones',
    ],
    'Fabrication': [
      'Panel fabrication scheduled into factory production',
      'ICC/NTA factory inspections during fabrication',
      'Panels complete — framed, insulated, clad, waterproofed, wired, plumbed, windows installed',
      'Fabrication complete — all wall panels, floor cassettes, roof truss cassettes, roofing panels',
    ],
    'Foundation': [
      'Helical pile layout and installation',
      'Pile head bracket attachments',
      'HSS beam installation (bolting)',
      'Special inspector present for helical pile installation',
      'Neovi internal QC inspection',
      'City foundation inspection',
    ],
    'Panel Assembly': [
      'Floor cassettes installed',
      'Interior and exterior panelized walls installed',
      'Roof truss cassettes installed',
      '5" insulated roofing panels installed',
      'Greenberg site coordination during assembly',
      'City framing inspection',
    ],
    'Dry-In': [
      'Install fiber cement cladding on exposed truss ends',
      'Apply spray-foam on interior of fiber cement panels',
    ],
    'Rough-In & Panel Connections': [
      'Connect in-wall 120V circuits to main breaker panel via MC cable',
      'Connect hot/cold PEX piping to main water supply',
      'Run 24VDC low voltage to all required devices and switches',
      'Install recessed and pendant lighting',
      'Install rockwool soundproofing where indicated',
      'Install HVAC systems',
      'Install hot water heater',
      'Install digital home panel (control system brain)',
      'Utility connections and meters',
      'City rough-in inspections',
    ],
    'Finishing — Neovi': [
      'Solid surface finishing (seams, window sills, returns, end caps, caulk)',
      'Stretch ceiling (perimeter profiles, LED lighting, tension installation)',
      'Flooring (SPC or engineered wood — floating installation)',
      'Standard cabinetry, vanities, and countertops',
      'Bathrooms (toilets, shower tower, niches, pans, accessories)',
      'Smart home (digital buttons, touch panels, sensors, home panel)',
      'Interior doors, baseboards, appliances, garage door, lighting',
      'Exterior (fiber cement cladding, foundation skirt, dig barrier, trim, soffits)',
      'Energy & EV (solar panels, Tesla Powerwall, EV charging)',
    ],
    'Finishing — Greenberg': [
      'Flooring (glued/nailed hardwood, tile)',
      'Custom cabinetry, vanities, countertops',
      'Bathrooms (traditional shower, tile pans, automated shades)',
      'Wall finishes (stone, wallpaper, paint, exterior paint and stucco)',
      'Exterior (non-standard cladding, deck, outdoor cabinetry, fencing)',
      'Final cleaning',
      'Subcontractor work (shower glass, skylights, gutters/fascia/downspouts)',
    ],
    'Turnover': [
      'Greenberg client walkthrough complete',
      'Punch list items resolved',
      'Smart home orientation delivered by Neovi technology specialist',
      'Warranty documentation delivered',
      'Operations and maintenance manuals delivered',
      'Keys, access codes, and devices transferred',
      'Post-occupancy support period documented',
      'Certificate of Occupancy issued',
    ],
  };

  // Build all task rows
  const allTaskRows = [];

  for (const proj of projects) {
    const isClient = proj.type === 'client';

    // Phase 1
    const p1list = isClient ? p1ClientTasks : p1SpecTasks;
    p1list.forEach((name, i) => {
      allTaskRows.push({ phase_id: phId(proj.name, 1), group_id: null, name, done: false, critical: false, sort_order: i + 1 });
    });

    // Phase 2
    const p2list = getP2Tasks(proj);
    p2list.forEach((name, i) => {
      allTaskRows.push({ phase_id: phId(proj.name, 2), group_id: null, name, done: false, critical: false, sort_order: i + 1 });
    });

    // Phase 3
    p3Tasks.forEach((name, i) => {
      allTaskRows.push({ phase_id: phId(proj.name, 3), group_id: null, name, done: false, critical: false, sort_order: i + 1 });
    });

    // Phase 4
    p4Tasks.forEach((name, i) => {
      allTaskRows.push({ phase_id: phId(proj.name, 4), group_id: null, name, done: false, critical: false, sort_order: i + 1 });
    });

    // Phase 5 — tasks go under groups, not phase directly
    for (const [groupName, taskNames] of Object.entries(p5GroupTasks)) {
      const gid = grpId(proj.name, groupName);
      taskNames.forEach((name, i) => {
        allTaskRows.push({ phase_id: null, group_id: gid, name, done: false, critical: false, sort_order: i + 1 });
      });
    }
  }

  // Insert tasks in batches (Supabase has row limits)
  console.log(`Inserting ${allTaskRows.length} tasks...`);
  const BATCH = 500;
  let totalInserted = 0;
  for (let i = 0; i < allTaskRows.length; i += BATCH) {
    const batch = allTaskRows.slice(i, i + BATCH);
    const { data, error } = await sb.from('tasks').insert(batch).select('id');
    if (error) throw new Error(`tasks insert failed at batch ${i}: ${error.message}`);
    totalInserted += data.length;
  }
  console.log(`  ✓ ${totalInserted} tasks inserted`);

  // ── Gate Items ────────────────────────────────────────────────────

  // Phase 1 gate items
  const p1ClientGates = [
    'Spacial contract executed',
    'Kick off meeting held',
    'Greenberg contract executed',
    'Site consultants contracted',
  ];

  const p1SpecGates = [
    'Spacial contract executed',
    'Project brief distributed to core team',
    'Spacial floor plan delivery date committed',
    'Kick off meeting held',
    'Greenberg contract executed',
    'Site consultants contracted',
  ];

  // Phase 2 gate items
  const p2ClientGates = [
    'IFC model (floor plan + elevations) received',
    'Cabinetry locations and dimensions set in IFC',
    'Site survey complete',
    'Geotechnical report received',
    'Civil schematic with utility locations received',
    'Planning approval received (if required)',
    'Structural upgrade pricing agreed and documented',
    'Client design lock acknowledgement signed',
    'Client formal sign-off',
    'Neovi formal sign-off',
  ];

  const p2SpecGates = [
    'IFC model (floor plan + elevations) received',
    'Cabinetry locations and dimensions set in IFC',
    'Site survey complete',
    'Geotechnical report received',
    'Civil schematic with utility locations received',
    'Planning approval received (if required)',
    'Neovi formal sign-off',
  ];

  // Phase 3 gate items (same for all)
  const p3Gates = [
    'IFC model verified and accepted by Neovi team',
    'Structural and foundation package stamped by ACE',
    'MEP plans complete and de-conflicted',
    'Final panelization schedule confirmed',
    'Title 24 / energy compliance certified',
    'Fire protection plan complete',
    'Full drawing set assembled',
    'Spacial design review complete — no outstanding code issues',
    'Site logistics plan complete and distributed to Spacial, Greenberg, and Neovi',
    'ICC/NTA approval and stamp received',
  ];

  // Phase 4 gate items (same for all)
  const p4Gates = [
    'Full permit package assembled by Spacial',
    'Building permit application submitted',
    'Other applications submitted (Encroachment, Grading, Public Works, Fire, etc)',
    'All plan check comments responded to and resolved',
    'Building permit issued',
    'Grading permit issued',
    'Utility permits issued',
    'Greenberg mobilization scheduled',
    'Factory fabrication scheduled',
  ];

  // Phase 5 gate items (same for all)
  const p5Gates = [
    'Neovi substantial completion achieved',
    'Greenberg client walkthrough complete',
    'Punch list items resolved',
    'Smart home orientation delivered by Neovi technology specialist',
    'Warranty documentation delivered',
    'Operations and maintenance manuals delivered',
    'Keys, access codes, and devices transferred',
    'Post-occupancy support period documented in contract',
    'Certificate of Occupancy issued',
  ];

  const allGateRows = [];

  for (const proj of projects) {
    const isClient = proj.type === 'client';

    // Phase 1
    const g1 = isClient ? p1ClientGates : p1SpecGates;
    g1.forEach((item, i) => {
      allGateRows.push({ phase_id: phId(proj.name, 1), item, done: false, sort_order: i + 1 });
    });

    // Phase 2
    const g2 = isClient ? p2ClientGates : p2SpecGates;
    g2.forEach((item, i) => {
      allGateRows.push({ phase_id: phId(proj.name, 2), item, done: false, sort_order: i + 1 });
    });

    // Phase 3
    p3Gates.forEach((item, i) => {
      allGateRows.push({ phase_id: phId(proj.name, 3), item, done: false, sort_order: i + 1 });
    });

    // Phase 4
    p4Gates.forEach((item, i) => {
      allGateRows.push({ phase_id: phId(proj.name, 4), item, done: false, sort_order: i + 1 });
    });

    // Phase 5
    p5Gates.forEach((item, i) => {
      allGateRows.push({ phase_id: phId(proj.name, 5), item, done: false, sort_order: i + 1 });
    });
  }

  console.log(`Inserting ${allGateRows.length} gate_items...`);
  for (let i = 0; i < allGateRows.length; i += BATCH) {
    const batch = allGateRows.slice(i, i + BATCH);
    const { data, error } = await sb.from('gate_items').insert(batch).select('id');
    if (error) throw new Error(`gate_items insert failed at batch ${i}: ${error.message}`);
  }
  console.log(`  ✓ ${allGateRows.length} gate_items inserted`);

  console.log('\n=== Seed complete ===');
  console.log(`  Projects:    ${projects.length}`);
  console.log(`  Phases:      ${phases.length}`);
  console.log(`  Task Groups: ${groups.length}`);
  console.log(`  Tasks:       ${totalInserted}`);
  console.log(`  Gate Items:  ${allGateRows.length}`);
}

seed().catch(err => {
  console.error('SEED FAILED:', err);
  process.exit(1);
});
