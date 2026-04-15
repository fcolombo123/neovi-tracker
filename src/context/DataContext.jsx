import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import seedProjects from '../seedData';
import { getPhase1, getPhase2, getPhase3, getPhase4, getPhase5Groups, getPhase5Gates } from '../playbook';

const DataContext = createContext(null);

// ─── CASE CONVERSION HELPERS ───────────────────────────────────────────────

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

/** Convert all keys of an object from snake_case to camelCase */
function toCamelObj(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelObj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[snakeToCamel(k)] = toCamelObj(v);
  }
  return out;
}

/** Convert all keys of an object from camelCase to snake_case */
function toSnakeObj(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeObj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[camelToSnake(k)] = v; // don't recurse values for updates — they are flat
  }
  return out;
}

// ─── DATA SHAPING ──────────────────────────────────────────────────────────

/**
 * Shape raw Supabase rows into the app's nested data structure:
 *   project -> phases[] -> tasks[] / gateChecklist[]
 *
 * Phase 5 tasks that belong to task_groups are structured into the tasks array
 * with isGroup:true for now (parallelTracks mapping is deferred).
 */
function shapeProjects(projects, phases, tasks, taskGroups, gateItems) {
  // Index phases by project_id
  const phasesByProject = {};
  for (const ph of phases) {
    const pid = ph.projectId;
    if (!phasesByProject[pid]) phasesByProject[pid] = [];
    phasesByProject[pid].push(ph);
  }

  // Index task groups by phase_id
  const groupsByPhase = {};
  for (const tg of taskGroups) {
    const phId = tg.phaseId;
    if (!groupsByPhase[phId]) groupsByPhase[phId] = [];
    groupsByPhase[phId].push({ ...tg, isGroup: true, tasks: [] });
  }

  // Index tasks by phase_id and task_group_id
  const standaloneByPhase = {};
  const tasksByGroup = {};
  for (const t of tasks) {
    if (t.groupId) {
      if (!tasksByGroup[t.groupId]) tasksByGroup[t.groupId] = [];
      tasksByGroup[t.groupId].push(t);
    } else {
      const phId = t.phaseId;
      if (!standaloneByPhase[phId]) standaloneByPhase[phId] = [];
      standaloneByPhase[phId].push(t);
    }
  }

  // Fill group tasks
  for (const groups of Object.values(groupsByPhase)) {
    for (const g of groups) {
      g.tasks = (tasksByGroup[g.id] || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
  }

  // Index gate items by phase_id
  const gatesByPhase = {};
  for (const gi of gateItems) {
    const phId = gi.phaseId;
    if (!gatesByPhase[phId]) gatesByPhase[phId] = [];
    gatesByPhase[phId].push(gi);
  }

  return projects.map((proj) => {
    const projPhases = (phasesByProject[proj.id] || [])
      .sort((a, b) => (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0));

    const shapedPhases = projPhases.map((ph) => {
      // Merge standalone tasks and groups, sorted by sortOrder
      const standalone = (standaloneByPhase[ph.id] || []);
      const groups = (groupsByPhase[ph.id] || []);
      const combined = [...standalone, ...groups]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      const gateChecklist = (gatesByPhase[ph.id] || [])
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((gi) => ({ ...gi, item: gi.item || gi.name }));

      // Build parallelTracks for Phase 5 (Construction)
      let parallelTracks = undefined;
      if (ph.phaseNumber === 5 && groups.length > 0) {
        const trackMap = { siteTrack: [], factoryTrack: [], assemblyTrack: [] };
        for (const g of groups) {
          const track = g.trackName || g.track;
          if (track && trackMap[track]) {
            trackMap[track].push(g);
          }
        }
        // Only set parallelTracks if we actually have track-assigned groups
        const hasTracked = Object.values(trackMap).some((arr) => arr.length > 0);
        if (hasTracked) parallelTracks = trackMap;
      }

      return {
        ...ph,
        tasks: combined,
        gateChecklist,
        ...(parallelTracks ? { parallelTracks } : {}),
      };
    });

    return {
      ...proj,
      phases: shapedPhases,
    };
  });
}

// ─── PROVIDER ──────────────────────────────────────────────────────────────

export function DataProvider({ children, user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useSeedMode, setUseSeedMode] = useState(false);

  const supabaseConfigured =
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

  // ── Fetch all project data from Supabase ───────────────────────────────
  const fetchProjects = useCallback(async () => {
    // No Supabase → always seed mode
    if (!supabaseConfigured) {
      console.info('Supabase not configured — using seed data');
      setProjects(JSON.parse(JSON.stringify(seedProjects)));
      setUseSeedMode(true);
      setLoading(false);
      return;
    }

    // Supabase configured but no user yet → wait for auth
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ensure the Supabase client has the current session before querying
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.info('No active session — waiting for auth');
        setLoading(false);
        return;
      }
      const [projRes, phaseRes, taskRes, groupRes, gateRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('phases').select('*').order('phase_number'),
        supabase.from('tasks').select('*').order('sort_order'),
        supabase.from('task_groups').select('*').order('sort_order'),
        supabase.from('gate_items').select('*').order('sort_order'),
      ]);

      // Check for errors
      for (const res of [projRes, phaseRes, taskRes, groupRes, gateRes]) {
        if (res.error) throw res.error;
      }

      const shaped = shapeProjects(
        (projRes.data || []).map(toCamelObj),
        (phaseRes.data || []).map(toCamelObj),
        (taskRes.data || []).map(toCamelObj),
        (groupRes.data || []).map(toCamelObj),
        (gateRes.data || []).map(toCamelObj),
      );

      setProjects(shaped);
      setUseSeedMode(false);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || String(err));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [supabaseConfigured, user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ── Mutation helpers ───────────────────────────────────────────────────

  async function createTask(data) {
    const snakeData = toSnakeObj(data);
    const { error: err } = await supabase
      .from('tasks')
      .insert(snakeData);
    if (err) throw err;
    await fetchProjects();
  }

  async function updateTask(taskId, updates) {
    const snakeUpdates = toSnakeObj(updates);
    const { error: err } = await supabase
      .from('tasks')
      .update(snakeUpdates)
      .eq('id', taskId);
    if (err) throw err;
    await fetchProjects();
  }

  async function updatePhase(phaseId, updates) {
    const snakeUpdates = toSnakeObj(updates);
    const { error: err } = await supabase
      .from('phases')
      .update(snakeUpdates)
      .eq('id', phaseId);
    if (err) throw err;
    await fetchProjects();
  }

  async function updateProject(projectId, updates) {
    const snakeUpdates = toSnakeObj(updates);
    const { error: err } = await supabase
      .from('projects')
      .update(snakeUpdates)
      .eq('id', projectId);
    if (err) throw err;
    await fetchProjects();
  }

  async function updateGateItem(gateItemId, updates) {
    const snakeUpdates = toSnakeObj(updates);
    const { error: err } = await supabase
      .from('gate_items')
      .update(snakeUpdates)
      .eq('id', gateItemId);
    if (err) throw err;
    await fetchProjects();
  }

  async function createProject(data) {
    const snakeData = toSnakeObj(data);
    const { data: newProj, error: err } = await supabase
      .from('projects')
      .insert(snakeData)
      .select()
      .single();
    if (err) throw err;

    const projectType = data.type || newProj.type || 'client';
    const ir = data.planningIr || data.planning_ir || 'unknown';

    // Create phases
    const defaultPhases = [
      { phase_number: 1, name: 'Project Kick Off', owner: 'Neovi PM' },
      { phase_number: 2, name: 'Schematic Design', owner: 'Spacial' },
      { phase_number: 3, name: 'Design Development', owner: 'Neovi Eng' },
      { phase_number: 4, name: 'Municipal Permitting', owner: 'Spacial/Permit' },
      { phase_number: 5, name: 'Construction', owner: 'Greenberg+Neovi' },
    ];

    const { data: phases, error: phaseErr } = await supabase
      .from('phases')
      .insert(defaultPhases.map(ph => ({ ...ph, project_id: newProj.id, done: false })))
      .select();
    if (phaseErr) throw phaseErr;

    const phaseMap = {};
    for (const ph of phases) phaseMap[ph.phase_number] = ph.id;

    // Get playbook templates
    const ph1 = getPhase1(projectType, ir);
    const ph2 = getPhase2(projectType, ir);
    const ph3 = getPhase3();
    const ph4 = getPhase4();
    const ph5Groups = getPhase5Groups();
    const ph5Gates = getPhase5Gates();

    // Insert tasks for phases 1-4
    const flatTasks = [];
    const templates = [
      { phaseNum: 1, data: ph1 },
      { phaseNum: 2, data: ph2 },
      { phaseNum: 3, data: ph3 },
      { phaseNum: 4, data: ph4 },
    ];
    for (const { phaseNum, data: tmpl } of templates) {
      for (let i = 0; i < tmpl.tasks.length; i++) {
        flatTasks.push({ phase_id: phaseMap[phaseNum], name: tmpl.tasks[i], done: false, sort_order: i + 1 });
      }
    }
    if (flatTasks.length > 0) {
      const { error: tErr } = await supabase.from('tasks').insert(flatTasks);
      if (tErr) console.error('Task insert error:', tErr.message);
    }

    // Insert gate items for phases 1-4
    const gateItems = [];
    for (const { phaseNum, data: tmpl } of templates) {
      for (let i = 0; i < tmpl.gates.length; i++) {
        gateItems.push({ phase_id: phaseMap[phaseNum], item: tmpl.gates[i], done: false, sort_order: i + 1 });
      }
    }

    // Phase 5 gates
    for (let i = 0; i < ph5Gates.length; i++) {
      gateItems.push({ phase_id: phaseMap[5], item: ph5Gates[i], done: false, sort_order: i + 1 });
    }

    if (gateItems.length > 0) {
      const { error: gErr } = await supabase.from('gate_items').insert(gateItems);
      if (gErr) console.error('Gate insert error:', gErr.message);
    }

    // Insert Phase 5 task groups and their tasks
    for (const grp of ph5Groups) {
      const { data: newGroup, error: gErr } = await supabase
        .from('task_groups')
        .insert({ phase_id: phaseMap[5], name: grp.name, sort_order: grp.sort, open: true })
        .select()
        .single();
      if (gErr) { console.error('Group insert error:', gErr.message); continue; }

      const groupTasks = grp.tasks.map((name, i) => ({
        group_id: newGroup.id, name, done: false, sort_order: i + 1,
      }));
      const { error: gtErr } = await supabase.from('tasks').insert(groupTasks);
      if (gtErr) console.error('Group task insert error:', gtErr.message);
    }

    await fetchProjects();
    return toCamelObj(newProj);
  }

  async function deleteProject(projectId) {
    const { error: err } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    if (err) throw err;
    await fetchProjects();
  }

  async function archiveProject(projectId, archived = true) {
    const { error: err } = await supabase
      .from('projects')
      .update({ archived })
      .eq('id', projectId);
    if (err) throw err;
    await fetchProjects();
  }

  const value = {
    projects,
    setProjects,
    loading,
    error,
    useSeedMode,
    fetchProjects,
    createTask,
    updateTask,
    updatePhase,
    updateProject,
    updateGateItem,
    createProject,
    deleteProject,
    archiveProject,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
