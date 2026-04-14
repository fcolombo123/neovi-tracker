-- Named file slots (required/optional docs per phase)
create table phase_files (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  slot_id text not null,
  slot_label text not null,
  required boolean default false,
  drive_file_id text,
  drive_url text,
  file_name text,
  file_size bigint,
  uploaded_at timestamptz,
  uploaded_by uuid references auth.users(id)
);

-- Extra files (catch-all per phase)
create table phase_extra_files (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid references phases(id) on delete cascade,
  drive_file_id text,
  drive_url text,
  file_name text not null,
  file_size bigint,
  uploaded_at timestamptz default now(),
  uploaded_by uuid references auth.users(id)
);

-- Project-level file buckets
create table project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  bucket text check (bucket in ('contracts', 'correspondence', 'photos', 'extras')) not null,
  drive_file_id text,
  drive_url text,
  file_name text not null,
  file_size bigint,
  uploaded_at timestamptz default now(),
  uploaded_by uuid references auth.users(id)
);
