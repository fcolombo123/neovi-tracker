-- Seed 6 demo projects
insert into projects (id, name, address, type, tier, planning_ir, status) values
  ('a1000000-0000-0000-0000-000000000001', 'Santa Rita', '1482 Elmwood Dr, San Jose CA', 'client', 'gold', 'yes', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Meadow', '3201 Meadow Ln, Hayward CA', 'client', 'silver', 'no', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'Franklin', '890 Franklin Ave, Santa Clara CA', 'spec', '', 'yes', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'Fernando', '2155 San Fernando Rd, Sunnyvale CA', 'client', 'platinum', 'unknown', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'Upland', '470 Upland Rd, Redwood City CA', 'spec', '', 'no', 'planning'),
  ('a1000000-0000-0000-0000-000000000006', 'Colorado', '1100 Colorado Ave, Palo Alto CA', 'spec', '', 'unknown', 'planning');

-- Phases for Santa Rita (project 1)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0001-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, 'Project Kick Off', 'Neovi PM', true, false, '2025-10-01', '2025-10-14', '2025-10-12'),
  ('b1000000-0000-0000-0001-000000000002', 'a1000000-0000-0000-0000-000000000001', 2, 'Schematic Design', 'Spacial', true, false, '2025-10-15', '2025-11-14', '2025-11-10'),
  ('b1000000-0000-0000-0001-000000000003', 'a1000000-0000-0000-0000-000000000001', 3, 'Design Development', 'Neovi Eng', true, false, '2025-11-15', '2025-12-29', '2025-12-20'),
  ('b1000000-0000-0000-0001-000000000004', 'a1000000-0000-0000-0000-000000000001', 4, 'Municipal Permitting', 'Spacial/Permit', false, true, '2026-01-02', '2026-03-02', null),
  ('b1000000-0000-0000-0001-000000000005', 'a1000000-0000-0000-0000-000000000001', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Phases for Meadow (project 2)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0002-000000000001', 'a1000000-0000-0000-0000-000000000002', 1, 'Project Kick Off', 'Neovi PM', true, false, '2025-11-01', '2025-11-14', '2025-11-12'),
  ('b1000000-0000-0000-0002-000000000002', 'a1000000-0000-0000-0000-000000000002', 2, 'Schematic Design', 'Spacial', true, false, '2025-11-15', '2025-12-14', '2025-12-10'),
  ('b1000000-0000-0000-0002-000000000003', 'a1000000-0000-0000-0000-000000000002', 3, 'Design Development', 'Neovi Eng', false, true, '2025-12-15', '2026-01-28', null),
  ('b1000000-0000-0000-0002-000000000004', 'a1000000-0000-0000-0000-000000000002', 4, 'Municipal Permitting', 'Spacial/Permit', false, false, null, null, null),
  ('b1000000-0000-0000-0002-000000000005', 'a1000000-0000-0000-0000-000000000002', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Phases for Franklin (project 3)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0003-000000000001', 'a1000000-0000-0000-0000-000000000003', 1, 'Project Kick Off', 'Neovi PM', true, false, '2025-09-01', '2025-09-14', '2025-09-12'),
  ('b1000000-0000-0000-0003-000000000002', 'a1000000-0000-0000-0000-000000000003', 2, 'Schematic Design', 'Spacial', true, false, '2025-09-15', '2025-10-14', '2025-10-10'),
  ('b1000000-0000-0000-0003-000000000003', 'a1000000-0000-0000-0000-000000000003', 3, 'Design Development', 'Neovi Eng', true, false, '2025-10-15', '2025-11-28', '2025-11-25'),
  ('b1000000-0000-0000-0003-000000000004', 'a1000000-0000-0000-0000-000000000003', 4, 'Municipal Permitting', 'Spacial/Permit', false, true, '2025-12-01', '2026-01-29', null),
  ('b1000000-0000-0000-0003-000000000005', 'a1000000-0000-0000-0000-000000000003', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Phases for Fernando (project 4)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0004-000000000001', 'a1000000-0000-0000-0000-000000000004', 1, 'Project Kick Off', 'Neovi PM', false, true, '2025-12-01', '2025-12-14', null),
  ('b1000000-0000-0000-0004-000000000002', 'a1000000-0000-0000-0000-000000000004', 2, 'Schematic Design', 'Spacial', false, false, null, null, null),
  ('b1000000-0000-0000-0004-000000000003', 'a1000000-0000-0000-0000-000000000004', 3, 'Design Development', 'Neovi Eng', false, false, null, null, null),
  ('b1000000-0000-0000-0004-000000000004', 'a1000000-0000-0000-0000-000000000004', 4, 'Municipal Permitting', 'Spacial/Permit', false, false, null, null, null),
  ('b1000000-0000-0000-0004-000000000005', 'a1000000-0000-0000-0000-000000000004', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Phases for Upland (project 5)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0005-000000000001', 'a1000000-0000-0000-0000-000000000005', 1, 'Project Kick Off', 'Neovi PM', true, false, '2026-01-15', '2026-01-28', '2026-01-26'),
  ('b1000000-0000-0000-0005-000000000002', 'a1000000-0000-0000-0000-000000000005', 2, 'Schematic Design', 'Spacial', false, false, '2026-01-29', '2026-02-27', null),
  ('b1000000-0000-0000-0005-000000000003', 'a1000000-0000-0000-0000-000000000005', 3, 'Design Development', 'Neovi Eng', false, false, null, null, null),
  ('b1000000-0000-0000-0005-000000000004', 'a1000000-0000-0000-0000-000000000005', 4, 'Municipal Permitting', 'Spacial/Permit', false, false, null, null, null),
  ('b1000000-0000-0000-0005-000000000005', 'a1000000-0000-0000-0000-000000000005', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Phases for Colorado (project 6)
insert into phases (id, project_id, phase_number, name, owner, done, overdue, start_date, due_date, completed_date) values
  ('b1000000-0000-0000-0006-000000000001', 'a1000000-0000-0000-0000-000000000006', 1, 'Project Kick Off', 'Neovi PM', false, false, '2026-03-01', '2026-03-14', null),
  ('b1000000-0000-0000-0006-000000000002', 'a1000000-0000-0000-0000-000000000006', 2, 'Schematic Design', 'Spacial', false, false, null, null, null),
  ('b1000000-0000-0000-0006-000000000003', 'a1000000-0000-0000-0000-000000000006', 3, 'Design Development', 'Neovi Eng', false, false, null, null, null),
  ('b1000000-0000-0000-0006-000000000004', 'a1000000-0000-0000-0000-000000000006', 4, 'Municipal Permitting', 'Spacial/Permit', false, false, null, null, null),
  ('b1000000-0000-0000-0006-000000000005', 'a1000000-0000-0000-0000-000000000006', 5, 'Construction', 'Greenberg+Neovi', false, false, null, null, null);

-- Sample tasks for Santa Rita Phase 1 (done)
insert into tasks (phase_id, name, done, sort_order) values
  ('b1000000-0000-0000-0001-000000000001', 'Client engagement — initial intake & scope discussion', true, 1),
  ('b1000000-0000-0000-0001-000000000001', 'Spacial design contract executed', true, 2),
  ('b1000000-0000-0000-0001-000000000001', 'Client selects tier package (Silver / Gold / Platinum)', true, 3),
  ('b1000000-0000-0000-0001-000000000001', 'Client contract executed — scope, fee, allowances', true, 4),
  ('b1000000-0000-0000-0001-000000000001', 'ACE contract executed (Neovi pays)', true, 5),
  ('b1000000-0000-0000-0001-000000000001', 'Greenberg contract executed', true, 6),
  ('b1000000-0000-0000-0001-000000000001', 'Site consultants contracted', true, 7),
  ('b1000000-0000-0000-0001-000000000001', 'Kick off meeting held', true, 8);

-- Sample tasks for Santa Rita Phase 4 (active, overdue)
insert into tasks (phase_id, name, done, critical, sort_order) values
  ('b1000000-0000-0000-0001-000000000004', 'Submit full permit package to city', true, false, 1),
  ('b1000000-0000-0000-0001-000000000004', 'Plan check comments received', true, false, 2),
  ('b1000000-0000-0000-0001-000000000004', 'Plan check response submitted', true, false, 3),
  ('b1000000-0000-0000-0001-000000000004', 'Building permit issued', false, true, 4),
  ('b1000000-0000-0000-0001-000000000004', 'Grading permit issued', false, true, 5),
  ('b1000000-0000-0000-0001-000000000004', 'Utility permits issued', false, false, 6),
  ('b1000000-0000-0000-0001-000000000004', 'Encroachment permit (if needed)', false, false, 7);

-- Gate items for Santa Rita Phase 1
insert into gate_items (phase_id, item, done, sort_order) values
  ('b1000000-0000-0000-0001-000000000001', 'Spacial contract executed', true, 1),
  ('b1000000-0000-0000-0001-000000000001', 'ACE contract executed (Neovi)', true, 2),
  ('b1000000-0000-0000-0001-000000000001', 'Greenberg contract executed', true, 3),
  ('b1000000-0000-0000-0001-000000000001', 'Site consultants contracted', true, 4),
  ('b1000000-0000-0000-0001-000000000001', 'Floor plan ~90% complete', true, 5),
  ('b1000000-0000-0000-0001-000000000001', 'Kick off meeting held', true, 6);

-- Gate items for Santa Rita Phase 4
insert into gate_items (phase_id, item, done, sort_order) values
  ('b1000000-0000-0000-0001-000000000004', 'Full permit package submitted', true, 1),
  ('b1000000-0000-0000-0001-000000000004', 'Plan check comments addressed', true, 2),
  ('b1000000-0000-0000-0001-000000000004', 'Building permit issued', false, 3),
  ('b1000000-0000-0000-0001-000000000004', 'Grading permit issued', false, 4),
  ('b1000000-0000-0000-0001-000000000004', 'All utility permits issued', false, 5);
