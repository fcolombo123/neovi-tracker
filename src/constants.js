// ─── ROLES & PERMISSIONS ─────────────────────────────────────────────────────
export const ROLES = {
  pm:       {label:'PM',          desc:'Full access — all projects, all data',       color:'var(--accent-dark)'},
  partner:  {label:'Partner',     desc:'All projects and phases — no financials',     color:'#5A8C5E'},
  client:   {label:'Client',      desc:'Own project only — with payment schedule',    color:'#378ADD'},
  viewonly: {label:'View only',   desc:'All projects — read only, no financials',     color:'#BA7517'},
};

// ─── PARTNERS ───────────────────────────────────────────────────────────────
export const PARTNERS = {
  'Neovi PM':       {company:'Neovi',      email:'pm@neovi.com'},
  'Spacial':        {company:'Spacial',    email:'dan@spacial.com'},
  'Spacial/Permit': {company:'Spacial',    email:'barbara@spacial.com'},
  'Greenberg':      {company:'Greenberg',  email:'maor@greenberg.com'},
  'ACE':            {company:'ACE',        email:'ace@acengineers.com'},
  'Vault Studio':   {company:'Vault Studio',email:'vault@vaultstudio.com'},
  'Neovi Eng':      {company:'Neovi',      email:'amit@neovi.com'},
  'Neovi Fab':      {company:'Neovi',      email:'francesca@neovi.com'},
  'Neovi Found':    {company:'Neovi',      email:'kyle@neovi.com'},
  'Neovi Assembly': {company:'Neovi',      email:'didier@neovi.com'},
  'Greenberg+Neovi':{company:'Greenberg + Neovi',email:'maor@greenberg.com'},
};

// ─── SCHEDULING DEFAULTS ─────────────────────────────────────────────────────
export const PHASE_DURATIONS = {
  'Project Kick Off':     14,
  'Schematic Design':     30,
  'Design Development':   45,
  'Municipal Permitting': 60,
  'Construction':          0, // handled by tracks
};

export const TRACK_DURATIONS = {
  'demo':           7,
  'site-prep':     14,
  'fabrication':   30,
  'foundation':    30,
  'panel-assembly':14,
  'dry-in':         7,
  'rough-in':      14,
  'finishing':     45,
  'turnover':      21,
};

// ─── PHASE DOCUMENT SLOTS ───────────────────────────────────────────────────
export const PHASE_DOC_SLOTS = {
  'Project Kick Off': [
    {id:'spacial-contract',  label:'Spacial contract',          required:true},
    {id:'ace-contract',      label:'ACE contract',              required:true},
    {id:'greenberg-contract',label:'Greenberg contract',        required:true},
    {id:'project-brief',     label:'Project brief',             required:false},
  ],
  'Schematic Design': [
    {id:'ifc-model',         label:'IFC model',                 required:true},
    {id:'site-survey',       label:'Site survey',               required:true},
    {id:'geotech-report',    label:'Geotech report',            required:true},
    {id:'civil-schematic',   label:'Civil schematic',           required:true},
    {id:'cabinetry-layout',  label:'Cabinetry layout',          required:false},
  ],
  'Design Development': [
    {id:'state-set',         label:'State set (ICC/NTA stamped)',required:true},
    {id:'structural-package',label:'Structural package — ACE',  required:true},
    {id:'mep-plans',         label:'MEP plans',                 required:true},
    {id:'title-24',          label:'Title 24 / energy compliance',required:true},
    {id:'site-logistics',    label:'Site logistics plan',       required:true},
  ],
  'Municipal Permitting': [
    {id:'municipal-set',     label:'Municipal permit package',  required:true},
    {id:'plan-check-comments',label:'Plan check comments',      required:false},
    {id:'plan-check-response',label:'Plan check response',      required:false},
    {id:'building-permit',   label:'Building permit — issued',  required:true},
    {id:'grading-permit',    label:'Grading permit — issued',   required:true},
    {id:'utility-permits',   label:'Utility permits — issued',  required:false},
    {id:'encroachment-permit',label:'Encroachment permit',      required:false},
  ],
  'Construction': [
    {id:'factory-qc',        label:'Factory QC photos',         required:false},
    {id:'insp-helical',      label:'Inspection — helical piles',required:true},
    {id:'insp-foundation',   label:'Inspection — foundation',   required:true},
    {id:'insp-framing',      label:'Inspection — framing',      required:true},
    {id:'insp-roughin',      label:'Inspection — rough-in',     required:true},
    {id:'insp-final',        label:'Inspection — final',        required:true},
    {id:'punch-list',        label:'Punch list',                required:false},
    {id:'co',                label:'Certificate of Occupancy',  required:true},
    {id:'site-photos',       label:'Site photos',               required:false},
  ],
};

// ─── PROJECT DOCUMENT BUCKETS ───────────────────────────────────────────────
export const PROJECT_DOC_BUCKETS = [
  {id:'contracts',      label:'Contracts',      icon:'📋'},
  {id:'correspondence', label:'Correspondence', icon:'✉️'},
  {id:'photos',         label:'Photos',         icon:'📷'},
  {id:'extras',         label:'Extra files',    icon:'📎'},
];

// ─── PROJECT COLORS ─────────────────────────────────────────────────────────
export const PROJECT_COLORS = ['#C4A882','#5A8C5E','#378ADD','#C47A72','#BA7517','#7A5A9E'];
