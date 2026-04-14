-- Notification schedule (configurable rules)
create table notification_rules (
  id text primary key,
  label text not null,
  description text,
  days int not null,
  enabled boolean default true,
  is_repeat boolean default false,
  recipients text[] default '{}'
);

-- Insert defaults
insert into notification_rules values
  ('early',  'Early heads-up',       'Heads-up to phase owner',                        7,  true, false, '{"phase_owner"}'),
  ('urgent', 'Urgent reminder',      'Urgent reminder to phase owner + Neovi PM',       1,  true, false, '{"phase_owner","neovi_pm"}'),
  ('overdue','Day overdue',          'Overdue alert + escalation to Neovi PM',          0,  true, false, '{"phase_owner","neovi_pm"}'),
  ('repeat', 'Repeat while overdue', 'Repeat every N days until phase marked complete', 3,  true, true,  '{"phase_owner","neovi_pm"}');

-- Reminder log
create table reminder_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  phase_id uuid references phases(id) on delete cascade,
  rule_id text references notification_rules(id),
  sent_at timestamptz default now(),
  sent_by uuid references auth.users(id),
  recipient_email text
);
