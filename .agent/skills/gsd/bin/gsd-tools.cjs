#!/usr/bin/env node
const HELP_MANIFEST = require('./help-manifest.json');

function showHelp(cmd, sub) {
  const info = HELP_MANIFEST.commands[cmd];
  if (!info) {
    console.log(`\n${HELP_MANIFEST.tools_usage}`);
    console.log('\nAvailable Commands: ' + Object.keys(HELP_MANIFEST.commands).join(', '));
    return;
  }
  console.log(`\nCommand: ${cmd}\nDescription: ${info.description}`);
  if (sub && info.subcommands?.[sub]) {
    console.log(`Subcommand: ${sub}\nUsage: ${info.subcommands[sub]}`);
  } else if (info.subcommands) {
    console.log('\nAvailable subcommands:');
    Object.entries(info.subcommands).forEach(([s, d]) => console.log(`  - ${s.padEnd(15)} : ${d}`));
  }
}


/**
 * GSD Tools — CLI utility for GSD workflow operations
 * Usage: node .agent/skills/gsd/bin/gsd-tools.cjs <command> [args] [--raw] [--include field1,field2]
 *
 * Commands: state, roadmap, requirements, phase, milestone, todo, workstream,
 *   find-phase, resolve-model, commit, verify, template, init, check-commit,
 *   stats, audit-uat, uat, agent-skills, phases, docs-init, scan-sessions,
 *   extract-messages, profile-sample, write-profile, generate-antigravity-profile,
 *   generate-antigravity-md, history-digest, progress, scaffold, state-snapshot
 *
 * Run with gsd:help <command> for detailed usage.
 */

const fs = require('fs');
const path = require('path');
const core = require('./lib/core.cjs');
const { parseIncludeFlag } = require('./lib/core.cjs');
const { error, findProjectRoot, getActiveWorkstream } = core;
const state = require('./lib/state.cjs');
const phase = require('./lib/phase.cjs');
const roadmap = require('./lib/roadmap.cjs');
const verify = require('./lib/verify.cjs');
const config = require('./lib/config.cjs');
const template = require('./lib/template.cjs');
const milestone = require('./lib/milestone.cjs');
const commands = require('./lib/commands.cjs');
const init = require('./lib/init.cjs');
const frontmatter = require('./lib/frontmatter.cjs');
const profilePipeline = require('./lib/profile-pipeline.cjs');
const profileOutput = require('./lib/profile-output.cjs');
const workstream = require('./lib/workstream.cjs');
const docs = require('./lib/docs.cjs');

// ─── Arg parsing helpers ──────────────────────────────────────────────────────

/**
 * Extract named --flag <value> pairs from an args array.
 * Returns an object mapping flag names to their values (null if absent).
 * Flags listed in `booleanFlags` are treated as boolean (no value consumed).
 *
 * parseNamedArgs(args, 'phase', 'plan')        → { phase: '3', plan: '1' }
 * parseNamedArgs(args, [], ['amend', 'force'])  → { amend: true, force: false }
 */
function parseNamedArgs(args, valueFlags = [], booleanFlags = []) {
  const result = {};
  for (const flag of valueFlags) {
  const idx = args.indexOf(`--${flag}`);
  result[flag] = idx !== -1 && args[idx + 1] !== undefined && !args[idx + 1].startsWith('--')
    ? args[idx + 1]
    : null;
  }
  for (const flag of booleanFlags) {
  result[flag] = args.includes(`--${flag}`);
  }
  return result;
}

/**
 * Collect all tokens after --flag until the next --flag or end of args.
 * Handles multi-word values like --name Foo Bar Version 1.
 * Returns null if the flag is absent.
 */
function parseMultiwordArg(args, flag) {
  const idx = args.indexOf(`--${flag}`);
  if (idx === -1) return null;
  const tokens = [];
  for (let i = idx + 1; i < args.length; i++) {
  if (args[i].startsWith('--')) break;
  tokens.push(args[i]);
  }
  return tokens.length > 0 ? tokens.join(' ') : null;
}

// ─── CLI Router ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Optional cwd override for sandboxed subagents running outside project root.
  let cwd = process.cwd();
  const cwdEqArg = args.find(arg => arg.startsWith('--cwd='));
  const cwdIdx = args.indexOf('--cwd');
  if (cwdEqArg) {
  const value = cwdEqArg.slice('--cwd='.length).trim();
  if (!value) error('Missing value for --cwd');
  args.splice(args.indexOf(cwdEqArg), 1);
  cwd = path.resolve(value);
  } else if (cwdIdx !== -1) {
  const value = args[cwdIdx + 1];
  if (!value || value.startsWith('--')) error('Missing value for --cwd');
  args.splice(cwdIdx, 2);
  cwd = path.resolve(value);
  }

  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
  error(`Invalid --cwd: ${cwd}`);
  }

  // Resolve worktree root: in a linked worktree, .planning/ lives in the main worktree.
  // However, in monorepo worktrees where the subdirectory itself owns .planning/,
  // skip worktree resolution — the CWD is already the correct project root.
  const { resolveWorktreeRoot } = require('./lib/core.cjs');
  if (!fs.existsSync(path.join(cwd, '.planning'))) {
  const worktreeRoot = resolveWorktreeRoot(cwd);
  if (worktreeRoot !== cwd) {
    cwd = worktreeRoot;
  }
  }

  // Optional workstream override for parallel milestone work.
  // Priority: --ws flag > GSD_WORKSTREAM env var > session-scoped pointer > shared legacy pointer > null
  const wsEqArg = args.find(arg => arg.startsWith('--ws='));
  const wsIdx = args.indexOf('--ws');
  let ws = null;
  if (wsEqArg) {
  ws = wsEqArg.slice('--ws='.length).trim();
  if (!ws) error('Missing value for --ws');
  args.splice(args.indexOf(wsEqArg), 1);
  } else if (wsIdx !== -1) {
  ws = args[wsIdx + 1];
  if (!ws || ws.startsWith('--')) error('Missing value for --ws');
  args.splice(wsIdx, 2);
  } else if (process.env.GSD_WORKSTREAM) {
  ws = process.env.GSD_WORKSTREAM.trim();
  } else {
  ws = getActiveWorkstream(cwd);
  }
  // Validate workstream name to prevent path traversal attacks.
  if (ws && !/^[a-zA-Z0-9_-]+$/.test(ws)) {
  error('Invalid workstream name: must be alphanumeric, hyphens, and underscores only');
  }
  // Set env var so all modules (planningDir, planningPaths) auto-resolve workstream paths
  if (ws) {
  process.env.GSD_WORKSTREAM = ws;
  }

  const rawIndex = args.indexOf('--raw');
  const raw = rawIndex !== -1;

  if (args.includes('--help') || args.includes('-h')) {
    const cmd = args[0];
    const sub = args[1];
    if (raw) {
      const { output } = require('./lib/core.cjs');
      output(HELP_MANIFEST, true);
    } else {
      showHelp(cmd, sub);
    }
    process.exit(0);
  }
  if (rawIndex !== -1) args.splice(rawIndex, 1);

  // --pick <name>: extract a single field from JSON output (replaces jq dependency).
  // Supports dot-notation (e.g., --pick workflow.research) and bracket notation
  // for arrays (e.g., --pick directories[-1]).
  const pickIdx = args.indexOf('--pick');
  let pickField = null;
  if (pickIdx !== -1) {
  pickField = args[pickIdx + 1];
  if (!pickField || pickField.startsWith('--')) error('Missing value for --pick');
  args.splice(pickIdx, 2);
  }

  const command = args[0];

  if (!command) {
  error('Usage: node .agent/skills/gsd/bin/gsd-tools.cjs <command> [args] [--raw] [--pick <field>] [--cwd <path>] [--ws <name>]\nCommands: state, resolve-model, find-phase, commit, verify-summary, verify, frontmatter, template, generate-slug, current-timestamp, list-todos, verify-path-exists, config-ensure-section, config-new-project, init, workstream, docs-init');
  }

  // Multi-repo guard: resolve project root for commands that read/write .planning/.
  // Skip for pure-utility commands that don't touch .planning/ to avoid unnecessary
  // filesystem traversal on every invocation.
  const SKIP_ROOT_RESOLUTION = new Set([
  'generate-slug', 'current-timestamp', 'verify-path-exists',
  'verify-summary', 'template', 'frontmatter',
  ]);
  if (!SKIP_ROOT_RESOLUTION.has(command)) {
  cwd = findProjectRoot(cwd);
  }

  // When --pick is active, intercept stdout to extract the requested field.
  if (pickField) {
  const origWriteSync = fs.writeSync;
  const chunks = [];
  fs.writeSync = function (fd, data, ...rest) {
    if (fd === 1) { chunks.push(String(data)); return; }
    return origWriteSync.call(fs, fd, data, ...rest);
  };
  const cleanup = () => {
    fs.writeSync = origWriteSync;
    const captured = chunks.join('');
    let jsonStr = captured;
    if (jsonStr.startsWith('@file:')) {
    jsonStr = fs.readFileSync(jsonStr.slice(6), 'utf-8');
    }
    try {
    const obj = JSON.parse(jsonStr);
    const value = extractField(obj, pickField);
    const result = value === null || value === undefined ? '' : String(value);
    origWriteSync.call(fs, 1, result);
    } catch {
    origWriteSync.call(fs, 1, captured);
    }
  };
  try {
    await runCommand(command, args, cwd, raw);
    cleanup();
  } catch (e) {
    fs.writeSync = origWriteSync;
    throw e;
  }
  return;
  }

  await runCommand(command, args, cwd, raw);
}

/**
 * Extract a field from an object using dot-notation and bracket syntax.
 * Supports: 'field', 'parent.child', 'arr[-1]', 'arr[0]'
 */
function extractField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
  if (current === null || current === undefined) return undefined;
  const bracketMatch = part.match(/^(.+?)\[(-?\d+)]$/);
  if (bracketMatch) {
    const key = bracketMatch[1];
    const index = parseInt(bracketMatch[2], 10);
    current = current[key];
    if (!Array.isArray(current)) return undefined;
    current = index < 0 ? current[current.length + index] : current[index];
  } else {
    current = current[part];
  }
  }
  return current;
}

async function runCommand(command, args, cwd, raw) {
  switch (command) {
  case 'state': {
    const subcommand = args[1];
    if (subcommand === 'json') {
    state.cmdStateJson(cwd, raw);
    } else if (subcommand === 'update') {
    state.cmdStateUpdate(cwd, args[2], args[3]);
    } else if (subcommand === 'get') {
    state.cmdStateGet(cwd, args[2], raw);
    } else if (subcommand === 'patch') {
    const patches = {};
    for (let i = 2; i < args.length; i += 2) {
      const key = args[i].replace(/^--/, '');
      const value = args[i + 1];
      if (key && value !== undefined) {
      patches[key] = value;
      }
    }
    state.cmdStatePatch(cwd, patches, raw);
    } else if (subcommand === 'advance-plan') {
    state.cmdStateAdvancePlan(cwd, raw);
    } else if (subcommand === 'record-metric') {
    const { phase: p, plan, duration, tasks, files } = parseNamedArgs(args, ['phase', 'plan', 'duration', 'tasks', 'files']);
    state.cmdStateRecordMetric(cwd, { phase: p, plan, duration, tasks, files }, raw);
    } else if (subcommand === 'update-progress') {
    state.cmdStateUpdateProgress(cwd, raw);
    } else if (subcommand === 'add-decision') {
    const { phase: p, summary, 'summary-file': summary_file, rationale, 'rationale-file': rationale_file } = parseNamedArgs(args, ['phase', 'summary', 'summary-file', 'rationale', 'rationale-file']);
    state.cmdStateAddDecision(cwd, { phase: p, summary, summary_file, rationale: rationale || '', rationale_file }, raw);
    } else if (subcommand === 'add-blocker') {
    const { text, 'text-file': text_file } = parseNamedArgs(args, ['text', 'text-file']);
    state.cmdStateAddBlocker(cwd, { text, text_file }, raw);
    } else if (subcommand === 'resolve-blocker') {
    state.cmdStateResolveBlocker(cwd, parseNamedArgs(args, ['text']).text, raw);
    } else if (subcommand === 'record-session') {
    const { 'stopped-at': stopped_at, 'resume-file': resume_file } = parseNamedArgs(args, ['stopped-at', 'resume-file']);
    state.cmdStateRecordSession(cwd, { stopped_at, resume_file: resume_file || 'None' }, raw);
    } else if (subcommand === 'begin-phase') {
    const { phase: p, name, plans } = parseNamedArgs(args, ['phase', 'name', 'plans']);
    state.cmdStateBeginPhase(cwd, p, name, plans !== null ? parseInt(plans, 10) : null, raw);
    } else if (subcommand === 'signal-waiting') {
    const { type, question, options, phase: p } = parseNamedArgs(args, ['type', 'question', 'options', 'phase']);
    state.cmdSignalWaiting(cwd, type, question, options, p, raw);
    } else if (subcommand === 'signal-resume') {
    state.cmdSignalResume(cwd, raw);
    } else if (subcommand === 'planned-phase') {
    const { phase: p, name, plans } = parseNamedArgs(args, ['phase', 'name', 'plans']);
    state.cmdStatePlannedPhase(cwd, p, plans !== null ? parseInt(plans, 10) : null, raw);
    } else if (subcommand === 'validate') {
    state.cmdStateValidate(cwd, raw);
    } else if (subcommand === 'sync') {
    const { verify } = parseNamedArgs(args, [], ['verify']);
    state.cmdStateSync(cwd, { verify }, raw);
    } else {
    state.cmdStateLoad(cwd, raw);
    }
    break;
  }

  case 'resolve-model': {
    commands.cmdResolveModel(cwd, args[1], raw);
    break;
  }

  case 'find-phase': {
    phase.cmdFindPhase(cwd, args[1], raw);
    break;
  }

  case 'commit': {
    const amend = args.includes('--amend');
    const noVerify = args.includes('--no-verify');
    const filesIndex = args.indexOf('--files');
    // Collect all positional args between command name and first flag,
    // then join them — handles both quoted ("multi word msg") and
    // unquoted (multi word msg) invocations from different shells
    const endIndex = filesIndex !== -1 ? filesIndex : args.length;
    const messageArgs = args.slice(1, endIndex).filter(a => !a.startsWith('--'));
    const message = messageArgs.join(' ') || undefined;
    const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
    commands.cmdCommit(cwd, message, files, raw, amend, noVerify);
    break;
  }

  case 'check-commit': {
    commands.cmdCheckCommit(cwd, raw);
    break;
  }

  case 'commit-to-subrepo': {
    const message = args[1];
    const filesIndex = args.indexOf('--files');
    const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
    commands.cmdCommitToSubrepo(cwd, message, files, raw);
    break;
  }

  case 'verify-summary': {
    const summaryPath = args[1];
    const countIndex = args.indexOf('--check-count');
    const checkCount = countIndex !== -1 ? parseInt(args[countIndex + 1], 10) : 2;
    verify.cmdVerifySummary(cwd, summaryPath, checkCount, raw);
    break;
  }

  case 'template': {
    const subcommand = args[1];
    if (subcommand === 'select') {
    template.cmdTemplateSelect(cwd, args[2], raw);
    } else if (subcommand === 'fill') {
    const templateType = args[2];
    const { phase, plan, name, type, wave, fields: fieldsRaw } = parseNamedArgs(args, ['phase', 'plan', 'name', 'type', 'wave', 'fields']);
    let fields = {};
    if (fieldsRaw) {
      const { safeJsonParse } = require('./lib/security.cjs');
      const result = safeJsonParse(fieldsRaw, { label: '--fields' });
      if (!result.ok) error(result.error);
      fields = result.value;
    }
    template.cmdTemplateFill(cwd, templateType, {
      phase, plan, name, fields,
      type: type || 'execute',
      wave: wave || '1',
    }, raw);
    } else {
    error('Unknown template subcommand. Available: select, fill');
    }
    break;
  }

  case 'frontmatter': {
    const subcommand = args[1];
    const file = args[2];
    if (subcommand === 'get') {
    frontmatter.cmdFrontmatterGet(cwd, file, parseNamedArgs(args, ['field']).field, raw);
    } else if (subcommand === 'set') {
    const { field, value } = parseNamedArgs(args, ['field', 'value']);
    frontmatter.cmdFrontmatterSet(cwd, file, field, value !== null ? value : undefined, raw);
    } else if (subcommand === 'merge') {
    frontmatter.cmdFrontmatterMerge(cwd, file, parseNamedArgs(args, ['data']).data, raw);
    } else if (subcommand === 'validate') {
    frontmatter.cmdFrontmatterValidate(cwd, file, parseNamedArgs(args, ['schema']).schema, raw);
    } else {
    error('Unknown frontmatter subcommand. Available: get, set, merge, validate');
    }
    break;
  }

  case 'verify': {
    const subcommand = args[1];
    if (subcommand === 'plan-structure') {
    verify.cmdVerifyPlanStructure(cwd, args[2], raw);
    } else if (subcommand === 'phase-completeness') {
    verify.cmdVerifyPhaseCompleteness(cwd, args[2], raw);
    } else if (subcommand === 'references') {
    verify.cmdVerifyReferences(cwd, args[2], raw);
    } else if (subcommand === 'commits') {
    verify.cmdVerifyCommits(cwd, args.slice(2), raw);
    } else if (subcommand === 'artifacts') {
    verify.cmdVerifyArtifacts(cwd, args[2], raw);
    } else if (subcommand === 'key-links') {
    verify.cmdVerifyKeyLinks(cwd, args[2], raw);
    } else if (subcommand === 'schema-drift') {
    const skipFlag = args.includes('--skip');
    verify.cmdVerifySchemaDrift(cwd, args[2], skipFlag, raw);
    } else {
    error('Unknown verify subcommand. Available: plan-structure, phase-completeness, references, commits, artifacts, key-links, schema-drift');
    }
    break;
  }

  case 'generate-slug': {
    commands.cmdGenerateSlug(args[1], raw);
    break;
  }

  case 'current-timestamp': {
    commands.cmdCurrentTimestamp(args[1] || 'full', raw);
    break;
  }

  case 'list-todos': {
    commands.cmdListTodos(cwd, args[1], raw);
    break;
  }

  case 'verify-path-exists': {
    commands.cmdVerifyPathExists(cwd, args[1], raw);
    break;
  }

  case 'config-ensure-section': {
    config.cmdConfigEnsureSection(cwd, raw);
    break;
  }

  case 'config-set': {
    config.cmdConfigSet(cwd, args[1], args[2], raw);
    break;
  }

  case "config-set-model-profile": {
    config.cmdConfigSetModelProfile(cwd, args[1], raw);
    break;
  }

  case 'config-get': {
    config.cmdConfigGet(cwd, args[1], raw);
    break;
  }

  case 'config-new-project': {
    config.cmdConfigNewProject(cwd, args[1], raw);
    break;
  }

  case 'agent-skills': {
    init.cmdAgentSkills(cwd, args[1], raw);
    break;
  }

  case 'history-digest': {
    commands.cmdHistoryDigest(cwd, raw);
    break;
  }

  case 'phases': {
    const subcommand = args[1];
    if (subcommand === 'list') {
    const typeIndex = args.indexOf('--type');
    const phaseIndex = args.indexOf('--phase');
    const options = {
      type: typeIndex !== -1 ? args[typeIndex + 1] : null,
      phase: phaseIndex !== -1 ? args[phaseIndex + 1] : null,
      includeArchived: args.includes('--include-archived'),
    };
    phase.cmdPhasesList(cwd, options, raw);
    } else if (subcommand === 'clear') {
    milestone.cmdPhasesClear(cwd, raw);
    } else {
    error('Unknown phases subcommand. Available: list, clear');
    }
    break;
  }

  case 'roadmap': {
    const subcommand = args[1];
    if (subcommand === 'get-phase') {
    roadmap.cmdRoadmapGetPhase(cwd, args[2], raw);
    } else if (subcommand === 'analyze') {
    roadmap.cmdRoadmapAnalyze(cwd, raw);
    } else if (subcommand === 'update-plan-progress') {
    roadmap.cmdRoadmapUpdatePlanProgress(cwd, args[2], raw);
    } else {
    error('Unknown roadmap subcommand. Available: get-phase, analyze, update-plan-progress');
    }
    break;
  }

  case 'requirements': {
    const subcommand = args[1];
    if (subcommand === 'mark-complete') {
    milestone.cmdRequirementsMarkComplete(cwd, args.slice(2), raw);
    } else {
    error('Unknown requirements subcommand. Available: mark-complete');
    }
    break;
  }

  case 'phase': {
    const subcommand = args[1];
    if (subcommand === 'next-decimal') {
    phase.cmdPhaseNextDecimal(cwd, args[2], raw);
    } else if (subcommand === 'add') {
    const idIdx = args.indexOf('--id');
    let customId = null;
    const descArgs = [];
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--id' && i + 1 < args.length) {
      customId = args[i + 1];
      i++; // skip value
      } else {
      descArgs.push(args[i]);
      }
    }
    phase.cmdPhaseAdd(cwd, descArgs.join(' '), raw, customId);
    } else if (subcommand === 'insert') {
    phase.cmdPhaseInsert(cwd, args[2], args.slice(3).join(' '), raw);
    } else if (subcommand === 'remove') {
    const forceFlag = args.includes('--force');
    phase.cmdPhaseRemove(cwd, args[2], { force: forceFlag }, raw);
    } else if (subcommand === 'complete') {
    phase.cmdPhaseComplete(cwd, args[2], raw);
    } else {
    error('Unknown phase subcommand. Available: next-decimal, add, insert, remove, complete');
    }
    break;
  }

  case 'milestone': {
    const subcommand = args[1];
    if (subcommand === 'complete') {
    const milestoneName = parseMultiwordArg(args, 'name');
    const archivePhases = args.includes('--archive-phases');
    milestone.cmdMilestoneComplete(cwd, args[2], { name: milestoneName, archivePhases }, raw);
    } else {
    error('Unknown milestone subcommand. Available: complete');
    }
    break;
  }

  case 'validate': {
    const subcommand = args[1];
    if (subcommand === 'consistency') {
    verify.cmdValidateConsistency(cwd, raw);
    } else if (subcommand === 'health') {
    const repairFlag = args.includes('--repair');
    verify.cmdValidateHealth(cwd, { repair: repairFlag }, raw);
    } else if (subcommand === 'agents') {
    verify.cmdValidateAgents(cwd, raw);
    } else {
    error('Unknown validate subcommand. Available: consistency, health, agents');
    }
    break;
  }

  case 'progress': {
    const subcommand = args[1] || 'json';
    commands.cmdProgressRender(cwd, subcommand, raw);
    break;
  }

  case 'audit-uat': {
    const uat = require('./lib/uat.cjs');
    uat.cmdAuditUat(cwd, raw);
    break;
  }

  case 'uat': {
    const subcommand = args[1];
    const uat = require('./lib/uat.cjs');
    if (subcommand === 'render-checkpoint') {
    const options = parseNamedArgs(args, ['file']);
    uat.cmdRenderCheckpoint(cwd, options, raw);
    } else {
    error('Unknown uat subcommand. Available: render-checkpoint');
    }
    break;
  }

  case 'stats': {
    const subcommand = args[1] || 'json';
    commands.cmdStats(cwd, subcommand, raw);
    break;
  }

  case 'todo': {
    const subcommand = args[1];
    if (subcommand === 'complete') {
    commands.cmdTodoComplete(cwd, args[2], raw);
    } else if (subcommand === 'match-phase') {
    commands.cmdTodoMatchPhase(cwd, args[2], raw);
    } else {
    error('Unknown todo subcommand. Available: complete, match-phase');
    }
    break;
  }

  case 'scaffold': {
    const scaffoldType = args[1];
    const scaffoldOptions = {
    phase: parseNamedArgs(args, ['phase']).phase,
    name: parseMultiwordArg(args, 'name'),
    };
    commands.cmdScaffold(cwd, scaffoldType, scaffoldOptions, raw);
    break;
  }

  case 'init': {
    const workflow = args[1];
    const includes = parseIncludeFlag(args);
    switch (workflow) {
    case 'execute-phase': {
      const { validate: epValidate } = parseNamedArgs(args, [], ['validate']);
      init.cmdInitExecutePhase(cwd, args[2], includes, raw, { validate: epValidate });
      break;
    }
    case 'plan-phase': {
      const { validate: ppValidate } = parseNamedArgs(args, [], ['validate']);
      init.cmdInitPlanPhase(cwd, args[2], includes, raw, { validate: ppValidate });
      break;
    }
    case 'new-project':
      init.cmdInitNewProject(cwd, includes, raw);
      break;
    case 'new-milestone':
      init.cmdInitNewMilestone(cwd, includes, raw);
      break;
    case 'quick':
      init.cmdInitQuick(cwd, args.slice(2, includes).join(' '), raw);
      break;
    case 'resume':
      init.cmdInitResume(cwd, includes, raw);
      break;
    case 'verify-work':
      init.cmdInitVerifyWork(cwd, args[2], includes, raw);
      break;
    case 'phase-op':
      init.cmdInitPhaseOp(cwd, args[2], includes, raw);
      break;
    case 'todos':
      init.cmdInitTodos(cwd, args[2], includes, raw);
      break;
    case 'milestone-op':
      init.cmdInitMilestoneOp(cwd, includes, raw);
      break;
    case 'map-codebase':
      init.cmdInitMapCodebase(cwd, includes, raw);
      break;
    case 'progress':
      init.cmdInitProgress(cwd, includes, raw);
      break;
    case 'manager':
      init.cmdInitManager(cwd, includes, raw);
      break;
    case 'new-workspace':
      init.cmdInitNewWorkspace(cwd, includes, raw);
      break;
    case 'list-workspaces':
      init.cmdInitListWorkspaces(cwd, includes, raw);
      break;
    case 'remove-workspace':
      init.cmdInitRemoveWorkspace(cwd, args[2], includes, raw);
      break;
    default:
      error(`Unknown init workflow: ${workflow}\nAvailable: execute-phase, plan-phase, new-project, new-milestone, quick, resume, verify-work, phase-op, todos, milestone-op, map-codebase, progress, manager, new-workspace, list-workspaces, remove-workspace`);
    }
    break;
  }

  case 'phase-plan-index': {
    phase.cmdPhasePlanIndex(cwd, args[1], raw);
    break;
  }

  case 'state-snapshot': {
    state.cmdStateSnapshot(cwd, raw);
    break;
  }

  case 'summary-extract': {
    const summaryPath = args[1];
    const fieldsIndex = args.indexOf('--fields');
    const fields = fieldsIndex !== -1 ? args[fieldsIndex + 1].split(',') : null;
    commands.cmdSummaryExtract(cwd, summaryPath, fields, raw);
    break;
  }

  case 'websearch': {
    const query = args[1];
    const limitIdx = args.indexOf('--limit');
    const freshnessIdx = args.indexOf('--freshness');
    await commands.cmdWebsearch(query, {
    limit: limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 10,
    freshness: freshnessIdx !== -1 ? args[freshnessIdx + 1] : null,
    }, raw);
    break;
  }

  // ─── Profiling Pipeline ────────────────────────────────────────────────

  case 'scan-sessions': {
    const pathIdx = args.indexOf('--path');
    const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
    const verboseFlag = args.includes('--verbose');
    const jsonFlag = args.includes('--json');
    await profilePipeline.cmdScanSessions(sessionsPath, { verbose: verboseFlag, json: jsonFlag }, raw);
    break;
  }

  case 'extract-messages': {
    const sessionIdx = args.indexOf('--session');
    const sessionId = sessionIdx !== -1 ? args[sessionIdx + 1] : null;
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null;
    const pathIdx = args.indexOf('--path');
    const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
    const projectArg = args[1];
    if (!projectArg || projectArg.startsWith('--')) {
    error('Usage: gsd-tools extract-messages <project> [--session <id>] [--limit N] [--path <dir>]\nRun scan-sessions first to see available projects.');
    }
    await profilePipeline.cmdExtractMessages(projectArg, { sessionId, limit }, raw, sessionsPath);
    break;
  }

  case 'profile-sample': {
    const pathIdx = args.indexOf('--path');
    const sessionsPath = pathIdx !== -1 ? args[pathIdx + 1] : null;
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 150;
    const maxPerIdx = args.indexOf('--max-per-project');
    const maxPerProject = maxPerIdx !== -1 ? parseInt(args[maxPerIdx + 1], 10) : null;
    const maxCharsIdx = args.indexOf('--max-chars');
    const maxChars = maxCharsIdx !== -1 ? parseInt(args[maxCharsIdx + 1], 10) : 500;
    await profilePipeline.cmdProfileSample(sessionsPath, { limit, maxPerProject, maxChars }, raw);
    break;
  }

  // ─── Profile Output ──────────────────────────────────────────────────

  case 'write-profile': {
    const inputIdx = args.indexOf('--input');
    const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : null;
    if (!inputPath) error('--input <analysis-json-path> is required');
    const outputIdx = args.indexOf('--output');
    const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
    profileOutput.cmdWriteProfile(cwd, { input: inputPath, output: outputPath }, raw);
    break;
  }

  case 'profile-questionnaire': {
    const answersIdx = args.indexOf('--answers');
    const answers = answersIdx !== -1 ? args[answersIdx + 1] : null;
    profileOutput.cmdProfileQuestionnaire({ answers }, raw);
    break;
  }

  case 'generate-dev-preferences': {
    const analysisIdx = args.indexOf('--analysis');
    const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
    const outputIdx = args.indexOf('--output');
    const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
    const stackIdx = args.indexOf('--stack');
    const stack = stackIdx !== -1 ? args[stackIdx + 1] : null;
    profileOutput.cmdGenerateDevPreferences(cwd, { analysis: analysisPath, output: outputPath, stack }, raw);
    break;
  }

  case 'generate-antigravity-profile': {
    const analysisIdx = args.indexOf('--analysis');
    const analysisPath = analysisIdx !== -1 ? args[analysisIdx + 1] : null;
    const outputIdx = args.indexOf('--output');
    const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
    const globalFlag = args.includes('--global');
    profileOutput.cmdGenerateClaudeProfile(cwd, { analysis: analysisPath, output: outputPath, global: globalFlag }, raw);
    break;
  }

  case 'generate-antigravity-md': {
    const outputIdx = args.indexOf('--output');
    const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
    const autoFlag = args.includes('--auto');
    const forceFlag = args.includes('--force');
    profileOutput.cmdGenerateClaudeMd(cwd, { output: outputPath, auto: autoFlag, force: forceFlag }, raw);
    break;
  }

  case 'workstream': {
    const subcommand = args[1];
    if (subcommand === 'create') {
    const migrateNameIdx = args.indexOf('--migrate-name');
    const noMigrate = args.includes('--no-migrate');
    workstream.cmdWorkstreamCreate(cwd, args[2], {
      migrate: !noMigrate,
      migrateName: migrateNameIdx !== -1 ? args[migrateNameIdx + 1] : null,
    }, raw);
    } else if (subcommand === 'list') {
    workstream.cmdWorkstreamList(cwd, raw);
    } else if (subcommand === 'status') {
    workstream.cmdWorkstreamStatus(cwd, args[2], raw);
    } else if (subcommand === 'complete') {
    workstream.cmdWorkstreamComplete(cwd, args[2], {}, raw);
    } else if (subcommand === 'set') {
    workstream.cmdWorkstreamSet(cwd, args[2], raw);
    } else if (subcommand === 'get') {
    workstream.cmdWorkstreamGet(cwd, raw);
    } else if (subcommand === 'progress') {
    workstream.cmdWorkstreamProgress(cwd, raw);
    } else {
    error('Unknown workstream subcommand. Available: create, list, status, complete, set, get, progress');
    }
    break;
  }

  // ─── Documentation ────────────────────────────────────────────────────

  case 'docs-init': {
    docs.cmdDocsInit(cwd, raw);
    break;
  }

  default:
    error(`Unknown command: ${command}`);
  }
}

main();
