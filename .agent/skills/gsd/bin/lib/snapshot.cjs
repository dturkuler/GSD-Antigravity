'use strict';
const fs = require('fs');
const path = require('path');

function createSnapshot(cwd, stateData, meta = {}) {
  const snapshotsDir = path.join(cwd, '.planning', 'snapshots');
  fs.mkdirSync(snapshotsDir, { recursive: true });

  const timestamp = meta.timestamp || new Date().toISOString();
  // sanitize timestamp: 2026-05-03T14:30:00.000Z -> 2026-05-03T14-30-00
  const filenameTimestamp = timestamp.replace(/:/g, '-').split('.')[0]; 
  const filename = `state-${filenameTimestamp}.json`;
  const filePath = path.join(snapshotsDir, filename);

  const envelope = {
    snapshot_version: '1.0',
    timestamp: timestamp,
    trigger: meta.trigger || 'manual',
    phase: meta.phase || null,
    state: stateData
  };

  fs.writeFileSync(filePath, JSON.stringify(envelope, null, 2), 'utf-8');

  // Prune
  let maxCount = 20;
  try {
    const configPath = path.join(cwd, '.planning', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.snapshots && typeof config.snapshots.maxCount === 'number') {
        maxCount = config.snapshots.maxCount;
      }
    }
  } catch { /* ignore config errors */ }

  try {
    const files = fs.readdirSync(snapshotsDir)
      .filter(f => f.startsWith('state-') && f.endsWith('.json'))
      .sort(); // Lexicographical sort is chronological for ISO dates
    if (files.length > maxCount) {
      const toDelete = files.slice(0, files.length - maxCount);
      for (const f of toDelete) {
        fs.unlinkSync(path.join(snapshotsDir, f));
      }
    }
  } catch { /* ignore pruning errors */ }

  return { path: filePath, timestamp };
}

function loadSnapshots(cwd, limit = 10) {
  const snapshotsDir = path.join(cwd, '.planning', 'snapshots');
  if (!fs.existsSync(snapshotsDir)) return [];

  let files;
  try {
    files = fs.readdirSync(snapshotsDir)
      .filter(f => f.startsWith('state-') && f.endsWith('.json'))
      .sort()
      .reverse(); // Newest first
  } catch {
    return [];
  }

  if (limit) files = files.slice(0, limit);

  const snapshots = [];
  for (const f of files) {
    try {
      const filePath = path.join(snapshotsDir, f);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      snapshots.push({
        path: filePath,
        timestamp: data.timestamp,
        data: data
      });
    } catch {
      // skip malformed
    }
  }
  return snapshots;
}

function diffSnapshots(older, newer) {
  const changes = [];
  const added = [];
  const removed = [];

  const oState = older?.state || older || {};
  const nState = newer?.state || newer || {};

  const scalarFields = [
    'current_phase', 'current_phase_name', 'total_phases',
    'current_plan', 'total_plans_in_phase', 'status',
    'progress_percent', 'last_activity', 'last_activity_desc', 'paused_at'
  ];

  for (const field of scalarFields) {
    const oVal = oState[field] !== undefined ? oState[field] : null;
    const nVal = nState[field] !== undefined ? nState[field] : null;

    if (oVal !== nVal) {
      if (oVal === null && nVal !== null) {
        added.push(field);
      } else if (oVal !== null && nVal === null) {
        removed.push(field);
      } else {
        changes.push({ field, from: oVal, to: nVal });
      }
    }
  }

  const arrayFields = ['decisions', 'blockers'];
  for (const field of arrayFields) {
    const oArr = Array.isArray(oState[field]) ? oState[field] : [];
    const nArr = Array.isArray(nState[field]) ? nState[field] : [];
    if (oArr.length !== nArr.length) {
      changes.push({ field: `${field}.length`, from: oArr.length, to: nArr.length });
    }
  }
  
  const allKeys = new Set([...Object.keys(oState), ...Object.keys(nState)]);
  for(const key of allKeys) {
      if (scalarFields.includes(key) || arrayFields.includes(key)) continue;
      const oVal = oState[key] !== undefined ? oState[key] : null;
      const nVal = nState[key] !== undefined ? nState[key] : null;
      if (oVal !== nVal) {
        if (oVal === null && nVal !== null) {
          added.push(key);
        } else if (oVal !== null && nVal === null) {
          removed.push(key);
        } else if (typeof oVal !== 'object' && typeof nVal !== 'object') {
          changes.push({ field: key, from: oVal, to: nVal });
        }
      }
  }

  return { changes, added, removed };
}

function renderDiffSummary(diff) {
  if (!diff || (diff.changes.length === 0 && diff.added.length === 0 && diff.removed.length === 0)) {
    return 'No changes detected.';
  }

  const lines = [];
  
  if (diff.changes.length > 0) {
    lines.push('| Field | Before | After |');
    lines.push('|-------|--------|-------|');
    for (const change of diff.changes) {
      lines.push(`| ${change.field} | ${change.from} | ${change.to} |`);
    }
  }

  if (diff.added.length > 0) {
    for (const field of diff.added) {
      lines.push(`**Added:** ${field}`);
    }
  }

  if (diff.removed.length > 0) {
    for (const field of diff.removed) {
      lines.push(`**Removed:** ${field}`);
    }
  }

  return lines.join('\n');
}

module.exports = { createSnapshot, loadSnapshots, diffSnapshots, renderDiffSummary };
