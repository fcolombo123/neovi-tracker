import { PHASE_DURATIONS, TRACK_DURATIONS } from './constants.js';
import { addDays } from './utils.js';

// ─── PHASE TEMPLATES ────────────────────────────────────────────────────────
export function getPhaseTemplate(projectType, planningIR) {
  const isClient = projectType === 'client';
  return [
    {
      id:1, name:'Project Kick Off', owner:'Neovi PM',
      tasks: isClient ? [
        'Client engagement — initial intake & scope discussion',
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
      gateChecklist: isClient ? [
        {item:'Spacial contract executed', done:false},
        {item:'ACE contract executed (Neovi)', done:false},
        {item:'Greenberg contract executed', done:false},
        {item:'Site consultants contracted', done:false},
        {item:'Floor plan ~90% complete', done:false},
        {item:'Kick off meeting held', done:false},
      ] : [
        {item:'Spacial contract executed', done:false},
        {item:'ACE contract executed (Neovi)', done:false},
        {item:'Greenberg contract executed', done:false},
        {item:'Site consultants contracted', done:false},
        {item:'Project brief distributed to core team', done:false},
        {item:'Spacial floor plan delivery date committed', done:false},
        {item:'Kick off meeting held', done:false},
      ],
      note:'', done:false, open:false,
    },
    {
      id:2, name:'Schematic Design', owner:'Spacial',
      tasks: [
        'Spacial develops floor plan & elevations',
        'Neovi PM reviews first draft (prefab compatibility)',
        'Vault Studio adds casework dimensions and locations',
        'Revision rounds — all parties aligned',
        ...(planningIR === 'yes' ? [
          'Pre-application design review (Spacial + Neovi page turn)',
          'Planning IR — formal application submitted (Spacial manages)',
        ] : []),
        'Structural upgrade assessment (Neovi prices; via Greenberg)',
        'Spacial assembles full schematic package (IFC model, survey, geotech, civil, cabinetry)',
        ...(isClient ? [
          'Client design lock acknowledgement signed',
          'Greenberg contract signed by client',
          'Client formal sign-off',
        ] : [
          'Formal sign-off: Neovi',
        ]),
      ],
      gateChecklist: [
        {item:'IFC model (floor plan + elevations) received', done:false},
        {item:'Cabinetry locations and dimensions set in IFC', done:false},
        {item:'Site survey complete', done:false},
        {item:'Geotechnical report received', done:false},
        {item:'Civil schematic with utility locations received', done:false},
        {item:'Planning approval received', done:false},
        ...(isClient ? [
          {item:'Structural upgrade pricing agreed and documented', done:false},
          {item:'Client design lock acknowledgement signed', done:false},
          {item:'Client formal sign-off', done:false},
        ] : []),
        {item:'Neovi formal sign-off', done:false},
      ],
      note:'', done:false, open:false,
    },
    {
      id:3, name:'Design Development', owner:'Neovi Eng',
      tasks: [
        'IFC model import & verification (prefab compatibility check)',
        'Structural engineering — ACE (full structural + foundation package stamped)',
        'Helical pile manufacturer provides foundation calculations',
        'Panel layout — preliminary schedule (parallel)',
        'Title 24 / HERS energy compliance (parallel)',
        'MEP integration & de-confliction (HVAC, electrical, plumbing vs structure)',
        'Full drawing set assembled (architectural, structural, MEP, Title 24, fire)',
        'Design review — Spacial (code compliance & municipal risk check)',
        'ICC/NTA review — revise & resubmit as needed',
        'Site logistics plan — crane, access, encroachment (parallel with ICC/NTA)',
        'Site logistics plan distributed to Spacial, Greenberg, and Neovi',
        'ICC/NTA approval & stamp received',
      ],
      gateChecklist: [
        {item:'IFC model verified and accepted by Neovi team', done:false},
        {item:'Structural and foundation package stamped by ACE', done:false},
        {item:'MEP plans complete and de-conflicted', done:false},
        {item:'Final panelization schedule confirmed', done:false},
        {item:'Title 24 / energy compliance certified', done:false},
        {item:'Fire protection plan complete', done:false},
        {item:'Full drawing set assembled', done:false},
        {item:'Spacial design review complete — no outstanding code issues', done:false},
        {item:'Site logistics plan complete and distributed', done:false},
        {item:'ICC/NTA approval and stamp received', done:false},
      ],
      note:'', done:false, open:false,
    },
    {
      id:4, name:'Municipal Permitting', owner:'Spacial/Permit',
      tasks: [
        'Permit package assembled by Spacial (ICC/NTA set, civil, landscape, geotech, arborist)',
        'Demolition plan and site plan included',
        'Special inspector application (helical piles)',
        'Building permit application submitted (Neovi designer of record)',
        'Grading permit application submitted',
        'Utility permit applications submitted',
        'Encroachment permit application submitted',
        'City plan check review',
        'Plan check comments responded to and resolved (Neovi & Spacial co-lead)',
        'Building permit issued',
        'Grading permit issued',
        'Utility permits issued',
        'Greenberg mobilization scheduled',
        'Factory fabrication scheduled',
      ],
      gateChecklist: [
        {item:'Full permit package assembled by Spacial', done:false},
        {item:'Building permit application submitted', done:false},
        {item:'Grading permit application submitted', done:false},
        {item:'Utility permit applications submitted', done:false},
        {item:'All plan check comments responded to and resolved', done:false},
        {item:'Building permit issued', done:false},
        {item:'Grading permit issued', done:false},
        {item:'Utility permits issued', done:false},
        {item:'Greenberg mobilization scheduled', done:false},
        {item:'Factory fabrication scheduled', done:false},
      ],
      note:'', done:false, open:false,
    },
    {
      id:5, name:'Construction', owner:'Greenberg+Neovi',
      // Phase 5 uses parallel tracks — see parallelTracks field
      tasks: [], // tasks live in tracks
      parallelTracks: {
        siteTrack: [
          {
            id:'demo', name:'Demolition', owner:'Greenberg', ownerEmail:'maor@greenberg.com',
            tasks:[
              {name:'Grading permit confirmed in hand', done:false},
              {name:'Greenberg mobilizes to site', done:false},
              {name:'Demolition complete', done:false},
              {name:'City demolition inspection passed', done:false},
            ], done:false, open:false
          },
          {
            id:'site-prep', name:'Site preparation', owner:'Greenberg', ownerEmail:'maor@greenberg.com',
            tasks:[
              {name:'Grading and drainage complete', done:false},
              {name:'Underground utilities installed', done:false},
              {name:'Hardscape base preparation complete', done:false},
              {name:'Erosion control and drainage in place', done:false},
              {name:'City / Public Works inspections passed', done:false},
            ], done:false, open:false
          },
          {
            id:'foundation', name:'Foundation', owner:'Neovi Found', ownerEmail:'kyle@neovi.com',
            tasks:[
              {name:'Helical pile layout complete', done:false},
              {name:'Helical pile installation — special inspector on site', done:false},
              {name:'Pile head bracket attachments complete', done:false},
              {name:'HSS beam installation (bolting) complete', done:false},
              {name:'Neovi internal QC inspection passed', done:false},
              {name:'City foundation inspection passed', done:false},
            ], done:false, open:false,
            inspections:[{name:'Helical pile installation',inspector:'Special inspector',status:'pending'},{name:'Foundation complete',inspector:'City',status:'pending'}]
          },
        ],
        factoryTrack: [
          {
            id:'fabrication', name:'Fabrication', owner:'Neovi Fab', ownerEmail:'francesca@neovi.com',
            tasks:[
              {name:'Factory production slot scheduled', done:false},
              {name:'Panel fabrication started', done:false},
              {name:'ICC/NTA factory inspection during production', done:false},
              {name:'Solid surface wall panels produced', done:false},
              {name:'MEP fully integrated into wall panels', done:false},
              {name:'Integrated MEP pressure test passed', done:false},
              {name:'Stretch ceiling membrane fabricated', done:false},
              {name:'Windows pre-installed in panels', done:false},
              {name:'QC inspection — panels, solid surface, MEP', done:false},
              {name:'Panels ready for delivery (timed with foundation)', done:false},
            ], done:false, open:false,
            inspections:[{name:'Factory fabrication',inspector:'ICC/NTA',status:'pending'}]
          },
        ],
        assemblyTrack: [
          {
            id:'panel-assembly', name:'Panel assembly', owner:'Neovi Assembly', ownerEmail:'didier@neovi.com',
            tasks:[
              {name:'Panels and materials delivered to site', done:false},
              {name:'Crane and crew mobilized', done:false},
              {name:'Floor cassettes installed', done:false},
              {name:'Interior and exterior wall panels set and plumbed', done:false},
              {name:'Roof truss cassettes installed', done:false},
              {name:'5" insulated roofing panels installed', done:false},
              {name:'Greenberg site coordination complete', done:false},
              {name:'City framing inspection passed', done:false},
            ], done:false, open:false,
            inspections:[{name:'Framing complete',inspector:'City',status:'pending'}]
          },
          {
            id:'dry-in', name:'Exterior dry-in', owner:'Neovi Assembly', ownerEmail:'didier@neovi.com',
            tasks:[
              {name:'Fiber cement cladding on exposed truss ends installed', done:false},
              {name:'Spray-foam on interior of fiber cement panels applied', done:false},
            ], done:false, open:false
          },
          {
            id:'rough-in', name:'Rough-in & panel connections', owner:'Neovi Assembly', ownerEmail:'didier@neovi.com',
            tasks:[
              {name:'120V circuits connected to main breaker panel (MC cable home runs)', done:false},
              {name:'Hot/cold PEX piping connected to main water supply', done:false},
              {name:'24VDC low voltage run to all devices and switches', done:false},
              {name:'Recessed and pendant lighting installed', done:false},
              {name:'Rockwool soundproofing installed where indicated', done:false},
              {name:'HVAC systems installed', done:false},
              {name:'Hot water heater installed', done:false},
              {name:'Digital home panel installed (control system brain)', done:false},
              {name:'Utility connections scheduled with utility companies', done:false},
              {name:'City rough-in inspections passed', done:false},
            ], done:false, open:false,
            inspections:[{name:'Rough-in complete',inspector:'City',status:'pending'}]
          },
          {
            id:'finishing', name:'Finishing', owner:'Greenberg+Neovi', ownerEmail:'maor@greenberg.com',
            tasks:[
              // Neovi scope
              {name:'[Neovi] Solid surface seams sanded and finished', done:false},
              {name:'[Neovi] Window sills, returns, end caps installed', done:false},
              {name:'[Neovi] Stretch ceiling tracks and perimeter profiles installed', done:false},
              {name:'[Neovi] LED perimeter lighting and diffuser covers installed', done:false},
              {name:'[Neovi] Stretch ceiling membrane installed', done:false},
              {name:'[Neovi] SPC/engineered wood flooring installed', done:false},
              {name:'[Neovi] Standard cabinetry, vanities, countertops installed', done:false},
              {name:'[Neovi] Bathrooms: toilets, shower tower, shower niches, pans', done:false},
              {name:'[Neovi] Smart home buttons, touch panels, sensors installed', done:false},
              {name:'[Neovi] Interior/exterior doors, baseboards, appliances', done:false},
              {name:'[Neovi] Exterior cladding, soffits, trim, lighting, mailbox', done:false},
              {name:'[Neovi] Solar panels, Tesla Powerwall, EV charging installed', done:false},
              // Greenberg scope
              {name:'[Greenberg] Custom flooring (hardwood/tile) installed', done:false},
              {name:'[Greenberg] Custom cabinetry and countertops installed', done:false},
              {name:'[Greenberg] Wall finishes (stone, wallpaper, paint, stucco)', done:false},
              {name:'[Greenberg] Non-standard exterior scope complete', done:false},
              {name:'[Greenberg] Shower glass, skylights, gutters installed', done:false},
              {name:'[Greenberg] Final cleaning complete', done:false},
            ], done:false, open:false
          },
          {
            id:'turnover', name:'Turnover', owner:'Greenberg+Neovi', ownerEmail:'maor@greenberg.com',
            tasks:[
              {name:'Neovi substantial completion achieved', done:false},
              {name:'Greenberg leads client walkthrough', done:false},
              {name:'Punch list issued', done:false},
              {name:'Punch list items resolved', done:false},
              {name:'Smart home orientation delivered by Neovi tech specialist', done:false},
              {name:'Warranty documentation delivered to client', done:false},
              {name:'Operations and maintenance manuals delivered', done:false},
              {name:'Keys, access codes, and devices transferred', done:false},
              {name:'Post-occupancy support period documented in contract', done:false},
              {name:'Certificate of Occupancy issued', done:false},
            ], done:false, open:false,
            inspections:[{name:'Final inspection',inspector:'City',status:'pending'}]
          },
        ]
      },
      gateChecklist: [
        {item:'Neovi substantial completion achieved', done:false},
        {item:'Greenberg client walkthrough complete', done:false},
        {item:'Punch list items resolved', done:false},
        {item:'Smart home orientation delivered', done:false},
        {item:'Warranty documentation delivered', done:false},
        {item:'Operations and maintenance manuals delivered', done:false},
        {item:'Keys, access codes, and devices transferred', done:false},
        {item:'Post-occupancy support period documented in contract', done:false},
        {item:'Certificate of Occupancy issued', done:false},
      ],
      note:'', done:false, open:false,
    }
  ];
}

// ─── SEED DATA ──────────────────────────────────────────────────────────────
export function makeProject(id, name, address, type, tier, contractValue, activePhasIdx, planningIR, overduePhaseName) {
  const phases = getPhaseTemplate(type, planningIR);
  phases.forEach((ph, i) => {
    if (i < activePhasIdx) {
      ph.done = true;
      ph.tasks = ph.tasks.map(t => typeof t === 'string' ? {name:t,done:true} : {...t,done:true});
      ph.gateChecklist = ph.gateChecklist.map(g => ({...g,done:true}));
      if (ph.parallelTracks) {
        Object.values(ph.parallelTracks).flat().forEach(tr => {
          tr.done = true;
          tr.tasks = tr.tasks.map(t => ({...t,done:true}));
        });
      }
    } else if (i === activePhasIdx) {
      ph.tasks = ph.tasks.map(t => typeof t === 'string' ? {name:t,done:false} : t);
    } else {
      ph.tasks = ph.tasks.map(t => typeof t === 'string' ? {name:t,done:false} : t);
    }
  });
  if (overduePhaseName) {
    const ph = phases.find(p => p.name === overduePhaseName);
    if (ph) ph.overdue = true;
  }

  // ── Build schedule from a project start date using cumulative durations ──
  // Work backwards from today to set a realistic project start
  const today = '2026-04-10';
  let cumDays = 0;
  const phaseDurList = ['Project Kick Off','Schematic Design','Design Development','Municipal Permitting'].map(n => PHASE_DURATIONS[n]);
  // sum durations of phases before active one
  for (let i = 0; i < activePhasIdx && i < phaseDurList.length; i++) cumDays += phaseDurList[i];
  const projectStart = addDays(today, -cumDays - 5); // started cumDays ago + small buffer

  let cursor = projectStart;
  phases.forEach((ph, i) => {
    ph.startDate = cursor;
    const dur = PHASE_DURATIONS[ph.name] || 30;
    const endDate = addDays(cursor, dur);
    if (ph.done) {
      ph.dueDate = endDate;
      ph.completedDate = addDays(cursor, Math.round(dur * 0.9)); // completed slightly before due
      ph.tasks = ph.tasks.map((t,ti) => ({
        ...t, done:true,
        dueDate: addDays(cursor, Math.round(dur * (ti+1) / ph.tasks.length)),
        completedDate: addDays(cursor, Math.round(dur * (ti+0.8) / ph.tasks.length))
      }));
      cursor = ph.completedDate;
    } else if (ph.overdue) {
      ph.dueDate = addDays(cursor, Math.round(dur * 0.7)); // due date already passed
      // Auto-schedule tasks sequentially
      ph.tasks.forEach((t,ti) => {
        if (!t.dueDate) t.dueDate = addDays(ph.startDate, Math.round(dur * (ti+1) / ph.tasks.length));
      });
      cursor = addDays(ph.dueDate, dur);
    } else {
      ph.dueDate = endDate;
      // Auto-schedule tasks sequentially from phase start
      ph.tasks.forEach((t,ti) => {
        if (!t.dueDate) t.dueDate = addDays(ph.startDate, Math.round(dur * (ti+1) / ph.tasks.length));
      });
      cursor = endDate;
    }
    // Phase 5 tracks get start/due dates
    if (ph.parallelTracks) {
      let trackCursor = ph.startDate;
      ['siteTrack','factoryTrack'].forEach(tk => {
        ph.parallelTracks[tk]?.forEach(tr => {
          tr.startDate = trackCursor;
          const trDur = TRACK_DURATIONS[tr.id]||14;
          tr.dueDate = addDays(trackCursor, trDur);
          if (tr.done) {
            tr.completedDate = addDays(trackCursor, Math.round(trDur*0.9));
            tr.tasks = tr.tasks.map((t,ti)=>({...t,done:true,completedDate:addDays(trackCursor,Math.round(trDur*(ti+0.8)/tr.tasks.length)),dueDate:addDays(trackCursor,Math.round(trDur*(ti+1)/tr.tasks.length))}));
          } else {
            tr.tasks.forEach((t,ti)=>{if(!t.dueDate)t.dueDate=addDays(trackCursor,Math.round(trDur*(ti+1)/tr.tasks.length));});
          }
        });
      });
      // Assembly track runs sequentially after parallel tracks
      let asmCursor = addDays(ph.startDate, Math.max(...['siteTrack','factoryTrack'].map(tk=>
        (ph.parallelTracks[tk]||[]).reduce((s,tr)=>s+(TRACK_DURATIONS[tr.id]||14),0)
      )));
      ph.parallelTracks.assemblyTrack?.forEach(tr => {
        tr.startDate = asmCursor;
        const trDur = TRACK_DURATIONS[tr.id]||14;
        tr.dueDate = addDays(asmCursor, trDur);
        if (tr.done) {
          tr.completedDate = addDays(asmCursor, Math.round(trDur*0.9));
          tr.tasks = tr.tasks.map((t,ti)=>({...t,done:true,completedDate:addDays(asmCursor,Math.round(trDur*(ti+0.8)/tr.tasks.length)),dueDate:addDays(asmCursor,Math.round(trDur*(ti+1)/tr.tasks.length))}));
        } else {
          tr.tasks.forEach((t,ti)=>{if(!t.dueDate)t.dueDate=addDays(asmCursor,Math.round(trDur*(ti+1)/tr.tasks.length));});
        }
        asmCursor = addDays(asmCursor, trDur);
      });
    }
  });
  return {id, name, address, type, tier: type==='client'?tier:'', contractValue, planningIR, phases, status: activePhasIdx >= 5 ? 'complete' : activePhasIdx > 0 ? 'active' : 'planning'};
}

// ─── INITIAL PROJECTS ───────────────────────────────────────────────────────
const projects = [
  // Santa Rita — stuck at Municipal Permitting (phase index 3), 18 days overdue
  makeProject(1,'Santa Rita','1482 Elmwood Dr, San Jose CA','client','gold',4850000,3,'no','Municipal Permitting'),
  // Meadow — stuck at Design Development (phase index 2), 12 days overdue
  makeProject(2,'Meadow','334 Maple St, Fremont CA','client','silver',3200000,2,'yes','Design Development'),
  // Franklin — stuck at Municipal Permitting (phase index 3), 9 days overdue
  makeProject(3,'Franklin','780 Industrial Way, Hayward CA','spec','',7800000,3,'no','Municipal Permitting'),
  // Fernando — stuck at Project Kick Off (phase index 0), 22 days overdue
  makeProject(4,'Fernando','92 Hilltop Ct, Oakland CA','client','platinum',5400000,0,'unknown','Project Kick Off'),
  // Upland — in Schematic Design, on track
  makeProject(5,'Upland','215 Upland Ave, San Leandro CA','spec','',3800000,1,'unknown',null),
  // Colorado — just kicked off, on track
  makeProject(6,'Colorado','503 Colorado Blvd, Union City CA','spec','',6200000,0,'unknown',null),
];

// Seed draw statuses matching real pipeline positions
projects[1].drawStatus = {contract:'paid', planning:'paid', preprod:'upcoming', foundation:'upcoming', panel:'upcoming', substantial:'upcoming'};
projects[3].drawStatus = {contract:'triggered', planning:'upcoming', preprod:'upcoming', foundation:'upcoming', panel:'upcoming', substantial:'upcoming'};
projects[5].drawStatus = {contract:'paid', planning:'upcoming', preprod:'upcoming', foundation:'upcoming', panel:'upcoming', substantial:'upcoming'};

// ─── SEED DEMO FILES ────────────────────────────────────────────────────────
export function seedDemoFiles() {
  function f(name, size, date){return{name,size,uploadedAt:date,driveUrl:'https://drive.google.com'};}
  if (projects[0]) {
    // Santa Rita — Phase 1 contracts
    projects[0].phases[0].namedFiles = {
      'spacial-contract': f('Spacial Design Contract.pdf',520000,'2025-11-02'),
      'greenberg-contract': f('Greenberg Contract — Executed.pdf',480000,'2025-11-02'),
      'ace-contract': f('ACE Structural Contract.pdf',310000,'2025-11-03'),
    };
    // Phase 2 schematic
    projects[0].phases[1].namedFiles = {
      'ifc-model': f('IFC Model v3 — Spacial.ifc',8500000,'2025-12-10'),
      'site-survey': f('Site Survey — Santa Rita.pdf',2200000,'2025-11-19'),
      'geotech-report': f('Geotech Report — Santa Rita.pdf',1800000,'2025-11-19'),
      'civil-schematic': f('Civil Schematic.pdf',940000,'2025-12-01'),
    };
    // Phase 3 design dev
    projects[0].phases[2].namedFiles = {
      'state-set': f('ICC-NTA Stamped Drawings v2.pdf',4200000,'2025-12-08'),
      'structural-package': f('ACE Structural Package.pdf',3100000,'2025-12-08'),
      'mep-plans': f('MEP Plans — Coordinated.pdf',2800000,'2025-12-05'),
    };
    // Phase 4 permitting
    projects[0].phases[3].namedFiles = {
      'municipal-set': f('Permit Package — Full Set.pdf',12000000,'2026-01-13'),
      'plan-check-comments': f('Plan Check Comments Round 1.pdf',420000,'2026-01-28'),
      'plan-check-response': f('Plan Check Response Round 1.pdf',680000,'2026-02-05'),
    };
    // Project-level files
    projects[0].projectFiles = {
      contracts: [f('Owner-Contractor Agreement.pdf',890000,'2025-11-01')],
      photos: [f('Site Photos — Pre-demo.jpg',4500000,'2025-11-15'),f('Foundation Progress.jpg',3200000,'2026-03-20')],
    };
  }
  if (projects[2]) {
    projects[2].phases[0].namedFiles = {
      'spacial-contract': f('Spacial Contract — Franklin.pdf',520000,'2025-09-05'),
      'greenberg-contract': f('Greenberg Contract — Franklin.pdf',480000,'2025-09-05'),
      'ace-contract': f('ACE Contract — Franklin.pdf',310000,'2025-09-06'),
    };
    projects[2].phases[2].namedFiles = {
      'state-set': f('ICC-NTA Stamped Set — Franklin.pdf',5800000,'2025-11-28'),
      'structural-package': f('ACE Structural — Franklin.pdf',4100000,'2025-11-28'),
    };
  }
}

// Run seed on import
seedDemoFiles();

export default projects;
