-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('pm', 'partner', 'client', 'viewonly')) default 'viewonly',
  company text,
  email text,
  created_at timestamptz default now()
);

-- Create profile automatically on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Enable RLS on all tables
alter table projects enable row level security;
alter table phases enable row level security;
alter table tasks enable row level security;
alter table task_groups enable row level security;
alter table gate_items enable row level security;
alter table phase_files enable row level security;
alter table phase_extra_files enable row level security;
alter table project_files enable row level security;
alter table notification_rules enable row level security;
alter table reminder_log enable row level security;
alter table profiles enable row level security;

-- PM can do everything on projects
create policy "pm_all" on projects
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );

-- Read access for partners and viewonly
create policy "read_all" on projects
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Phases: same pattern
create policy "pm_all_phases" on phases
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_phases" on phases
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Tasks
create policy "pm_all_tasks" on tasks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_tasks" on tasks
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Task groups
create policy "pm_all_task_groups" on task_groups
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_task_groups" on task_groups
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Gate items
create policy "pm_all_gate_items" on gate_items
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_gate_items" on gate_items
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Phase files
create policy "pm_all_phase_files" on phase_files
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_phase_files" on phase_files
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Phase extra files
create policy "pm_all_phase_extra_files" on phase_extra_files
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_phase_extra_files" on phase_extra_files
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Project files
create policy "pm_all_project_files" on project_files
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_project_files" on project_files
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Notification rules: readable by all authenticated
create policy "read_notification_rules" on notification_rules
  for select using (auth.uid() is not null);
create policy "pm_all_notification_rules" on notification_rules
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );

-- Reminder log
create policy "pm_all_reminder_log" on reminder_log
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'pm')
  );
create policy "read_all_reminder_log" on reminder_log
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('partner', 'viewonly', 'pm'))
  );

-- Profiles: users can read all profiles, update own
create policy "read_all_profiles" on profiles
  for select using (auth.uid() is not null);
create policy "update_own_profile" on profiles
  for update using (id = auth.uid());
