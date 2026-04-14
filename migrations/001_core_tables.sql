-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  type text check (type in ('client', 'spec')) not null,
  tier text check (tier in ('silver', 'gold', 'platinum', '')),
  planning_ir text check (planning_ir in ('yes', 'no', 'unknown')) default 'unknown',
  notes text,
  photo_url text,
  status text check (status in ('planning', 'active', 'complete')) default 'planning',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Task groups (must be created before tasks due to FK reference)
create table task_groups (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid,  -- FK added after phases table
  name text not null,
  open boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Phases (5 per project)
create table phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  phase_number int not null check (phase_number between 1 and 5),
  name text not null,
  owner text,
  done boolean default false,
  overdue boolean default false,
  due_date date,
  completed_date date,
  start_date date,
  note text,
  created_at timestamptz default now(),
  unique(project_id, phase_number)
);

-- Now add FK from task_groups to phases
alter table task_groups
  add constraint task_groups_phase_id_fkey
  foreign key (phase_id) references phases(id) on delete cascade;

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  group_id uuid references task_groups(id) on delete cascade,
  name text not null,
  done boolean default false,
  critical boolean default false,
  note text,
  due_date date,
  completed_date date,
  start_date date,
  depends_on uuid references tasks(id),
  sort_order int default 0,
  created_at timestamptz default now(),
  check (
    (phase_id is not null and group_id is null) or
    (phase_id is null and group_id is not null)
  )
);

-- Gate checklist items
create table gate_items (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  item text not null,
  done boolean default false,
  completed_date date,
  sort_order int default 0
);
