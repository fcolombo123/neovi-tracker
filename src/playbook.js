// Full playbook templates from Neovi Project Playbook v1.0

export function getPhase1(type, ir) {
  const isClient = type === 'client';
  return {
    tasks: isClient ? [
      'Client engages Greenberg Construction',
      'Spacial design contract executed (client contracts directly)',
      'Client selects tier package (Silver / Gold / Platinum)',
      'Client contract executed — scope, fee, allowances',
      'ACE contract executed (Neovi pays)',
      'Greenberg contract executed',
      'Site consultants contracted (survey, arborist, geotech, civil)',
      'Kick off meeting held',
    ] : [
      'Lot acquired; project LLC established',
      'Neovi PM assembles project brief (size, stories, zoning, schedule, budget)',
      'Spacial contract executed (LLC contracts; Neovi manages)',
      'ACE contract executed (Neovi pays)',
      'Kick off meeting: Neovi + Spacial + Greenberg — brief presented',
      'Spacial commits to floor plan delivery date',
      'Greenberg contract executed',
      'Site consultants contracted (geotech, civil, survey, arborist, landscape arch)',
    ],
    gates: isClient ? [
      'Spacial contract executed',
      'Kick off meeting held',
      'Greenberg contract executed',
      'Site consultants contracted',
    ] : [
      'Spacial contract executed',
      'Project brief distributed to core team',
      'Spacial floor plan delivery date committed',
      'Kick off meeting held',
      'Greenberg contract executed',
      'Site consultants contracted',
    ],
  };
}

export function getPhase2(type, ir) {
  const isClient = type === 'client';
  const irTasks = ir === 'yes' ? [
    'Pre-application design review (Spacial + Neovi page turn)',
    'Planning IR — formal application submitted (Spacial manages)',
    'Planning IR comments received',
    'Planning IR response submitted',
    'Planning IR approval received',
  ] : [];

  const tasks = isClient ? [
    'Spacial develops floor plan & elevations',
    'Neovi PM reviews first draft (~90% complete)',
    'Vault Studio adds casework dimensions and locations',
    'Revision rounds — all parties aligned',
    ...irTasks,
    'Structural upgrade assessment (Neovi prices; via Greenberg)',
    'Spacial assembles full schematic package (IFC model, survey, geotech, civil, cabinetry)',
    'Client design lock acknowledgement signed',
    'Client formal sign-off',
  ] : [
    'Spacial develops floor plan & elevations',
    'Neovi PM reviews first draft',
    'Vault Studio adds casework dimensions and locations for target market',
    'Revision rounds — all parties aligned',
    ...irTasks,
    'Spacial assembles full schematic package (IFC model, survey, geotech, civil, cabinetry)',
    'Neovi formal sign-off',
  ];

  const gates = isClient ? [
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
  ] : [
    'IFC model (floor plan + elevations) received',
    'Cabinetry locations and dimensions set in IFC',
    'Site survey complete',
    'Geotechnical report received',
    'Civil schematic with utility locations received',
    'Planning approval received (if required)',
    'Neovi formal sign-off',
  ];

  return { tasks, gates };
}

export function getPhase3() {
  return {
    tasks: [
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
    ],
    gates: [
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
    ],
  };
}

export function getPhase4() {
  return {
    tasks: [
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
    ],
    gates: [
      'Full permit package assembled by Spacial',
      'Building permit application submitted',
      'Other applications submitted (Encroachment, Grading, Public Works, Fire, etc)',
      'All plan check comments responded to and resolved',
      'Building permit issued',
      'Grading permit issued',
      'Utility permits issued',
      'Greenberg mobilization scheduled',
      'Factory fabrication scheduled',
    ],
  };
}

export function getPhase5Groups() {
  return [
    { name: 'Demolition', sort: 1, tasks: [
      'Greenberg mobilizes to site',
      'Existing structure demolished',
      'Debris hauled and site cleared',
    ]},
    { name: 'Site Preparation', sort: 2, tasks: [
      'Grading and drainage complete',
      'Underground utilities roughed in',
      'Hardscape base prepared',
      'Erosion control installed',
      'City/Public Works site inspections passed',
    ]},
    { name: 'Fabrication', sort: 3, tasks: [
      'Panels scheduled into factory production queue',
      'Wall panels fabricated (framed, insulated, clad, wired, plumbed)',
      'Floor cassettes fabricated',
      'Roof truss cassettes fabricated',
      'Roofing panels fabricated',
      'Windows pre-installed in panels',
      'ICC/NTA factory inspection passed',
      'All panels ready for delivery',
    ]},
    { name: 'Foundation', sort: 4, tasks: [
      'Helical pile layout staked',
      'Helical piles installed',
      'Special inspector sign-off on pile installation',
      'Pile head brackets attached',
      'HSS beams installed and bolted',
      'Neovi internal QC inspection complete',
      'City foundation inspection passed',
    ]},
    { name: 'Panel Assembly', sort: 5, tasks: [
      'Panels delivered to site',
      'Floor cassettes installed',
      'Interior and exterior wall panels set',
      'Roof truss cassettes installed',
      'Roofing panels installed',
      'Greenberg site coordination complete',
      'City framing inspection passed',
    ]},
    { name: 'Dry-In', sort: 6, tasks: [
      'Fiber cement cladding installed on exposed truss ends',
      'Spray-foam applied on interior of fiber cement panels',
      'Building weathertight',
    ]},
    { name: 'Rough-In & Connections', sort: 7, tasks: [
      '120V circuits connected to breaker panel (MC cable)',
      'PEX hot/cold piping connected to main supply',
      '24VDC low voltage run to devices and switches',
      'Recessed and pendant lighting installed',
      'Rockwool soundproofing installed',
      'HVAC systems installed',
      'Hot water heater installed',
      'Digital home panel installed',
      'Utility connections and meters set by utility companies',
      'City rough-in inspection passed',
    ]},
    { name: 'Finishing — Neovi', sort: 8, tasks: [
      'Solid surface finishing (seams, sills, returns, caulk)',
      'Stretch ceiling installed (profiles, LED, tension membrane)',
      'Flooring installed (SPC or engineered wood)',
      'Cabinetry, vanities, and countertops installed',
      'Bathrooms complete (toilets, shower, niches, accessories)',
      'Smart home system installed (buttons, panels, sensors)',
      'Interior doors, baseboards, and appliances installed',
      'Exterior complete (cladding, skirt, trim, soffits, lighting)',
      'Solar, Powerwall, and EV charging installed',
    ]},
    { name: 'Finishing — Greenberg', sort: 9, tasks: [
      'Hardwood/tile flooring installed',
      'Custom cabinetry and countertops installed',
      'Tile showers, backsplashes, and accent walls complete',
      'Wall finishes complete (paint, stucco, accents)',
      'Exterior work complete (deck, fencing, outdoor cabinetry)',
      'Subcontractor work complete (shower glass, gutters, skylights)',
      'Final cleaning',
    ]},
    { name: 'Turnover', sort: 10, tasks: [
      'Greenberg client walkthrough complete',
      'Punch list items resolved',
      'Smart home orientation delivered',
      'Warranty documentation delivered',
      'O&M manuals delivered',
      'Keys, codes, and devices transferred',
      'Certificate of Occupancy issued',
    ]},
  ];
}

export function getPhase5Gates() {
  return [
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
}
