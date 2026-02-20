#!/usr/bin/env node

/**
 * optimize-gsd-tools.cjs — Post-processing optimizer for gsd-tools.cjs
 *
 * Applied after gsd-converter copies the vanilla gsd-tools.cjs from .claude/.
 * Applies DRY helpers, 2-space indentation, LF line endings, and condensed header.
 *
 * Usage: node optimize-gsd-tools.cjs <path-to-gsd-tools.cjs>
 */

const fs = require('fs');
const path = require('path');

const targetPath = process.argv[2];
if (!targetPath) {
    console.error('Usage: node optimize-gsd-tools.cjs <path-to-gsd-tools.cjs>');
    process.exit(1);
}

if (!fs.existsSync(targetPath)) {
    console.error(`File not found: ${targetPath}`);
    process.exit(1);
}

let content = fs.readFileSync(targetPath, 'utf-8');

// ──────────────────────────────────────────────────────────────────────────────
// Step 1: Normalize line endings to LF
// ──────────────────────────────────────────────────────────────────────────────
content = content.replace(/\r\n/g, '\n');

// ──────────────────────────────────────────────────────────────────────────────
// Step 2: Convert 4-space indentation to 2-space
// ──────────────────────────────────────────────────────────────────────────────
const lines = content.split('\n');
const reformatted = lines.map(line => {
    const match = line.match(/^( +)/);
    if (!match) return line;
    const spaces = match[1].length;
    const indentLevel = Math.floor(spaces / 4);
    const remainder = spaces % 4;
    return ' '.repeat(indentLevel * 2 + remainder) + line.trimStart();
});
content = reformatted.join('\n');

// ──────────────────────────────────────────────────────────────────────────────
// Step 3: Condense the header comment (124 lines → 12 lines)
// ──────────────────────────────────────────────────────────────────────────────
const CONDENSED_HEADER = `/**
 * GSD Tools — CLI utility for GSD workflow operations
 * Usage: node gsd-tools.cjs <command> [args] [--raw] [--include field1,field2]
 *
 * Commands: state, resolve-model, find-phase, commit, verify-summary, generate-slug,
 *   current-timestamp, list-todos, verify-path-exists, config-ensure-section, config-set,
 *   config-get, history-digest, phases, roadmap, requirements, phase, milestone,
 *   validate, progress, todo, scaffold, phase-plan-index, state-snapshot, summary-extract,
 *   websearch, frontmatter, verify, template, init
 *
 * Run with --help for detailed usage of each command.
 */`;

// Match the big JSDoc header block. It starts with /** and ends with */
// just before the first `const fs = require`
const headerRegex = /\/\*\*[\s\S]*?\*\/\s*(?=\nconst fs = require)/;
if (headerRegex.test(content)) {
    content = content.replace(headerRegex, CONDENSED_HEADER + '\n');
    console.log('  ✅ Header condensed');
} else {
    console.log('  ⚠️ Could not locate header comment to condense');
}

// ──────────────────────────────────────────────────────────────────────────────
// Step 4: Inject DRY helper functions after parseIncludeFlag or safeReadFile
// ──────────────────────────────────────────────────────────────────────────────

const HELPERS_BLOCK = `
function discoverPhaseArtifacts(cwd, phaseDir) {
  if (!phaseDir) return {};
  const full = path.join(cwd, phaseDir);
  try {
    const files = fs.readdirSync(full);
    const find = (suffix) => {
      const f = files.find(n => n.endsWith(\`-\${suffix}.md\`) || n === \`\${suffix}.md\`);
      return f ? path.join(phaseDir, f) : null;
    };
    return { context: find('CONTEXT'), research: find('RESEARCH'), verification: find('VERIFICATION'), uat: find('UAT') };
  } catch { return {}; }
}

const INCLUDE_FILES = {
  state: '.planning/STATE.md',
  roadmap: '.planning/ROADMAP.md',
  config: '.planning/config.json',
  project: '.planning/PROJECT.md',
  requirements: '.planning/REQUIREMENTS.md',
};

function applyIncludes(result, includes, cwd, phaseDir) {
  if (!includes || includes.size === 0) return;
  for (const [key, rel] of Object.entries(INCLUDE_FILES)) {
    if (includes.has(key)) result[\`\${key}_content\`] = safeReadFile(path.join(cwd, rel));
  }
  if (phaseDir) {
    const artifacts = discoverPhaseArtifacts(cwd, phaseDir);
    for (const [key, filePath] of Object.entries(artifacts)) {
      if (includes.has(key) && filePath) {
        result[\`\${key}_content\`] = safeReadFile(path.join(cwd, filePath));
      }
    }
  }
}

function buildPhaseBase(phaseInfo) {
  return {
    phase_found: !!phaseInfo,
    phase_dir: phaseInfo?.directory || null,
    phase_number: phaseInfo?.phase_number || null,
    phase_name: phaseInfo?.phase_name || null,
    phase_slug: phaseInfo?.phase_slug || null,
  };
}`;

// Check if helpers already exist (idempotency)
if (content.includes('function discoverPhaseArtifacts')) {
    console.log('  ⏭️  DRY helpers already present, skipping injection');
} else {
    // Inject parseIncludeFlag if missing
    if (!content.includes('function parseIncludeFlag')) {
        const PARSE_INCLUDE = `function parseIncludeFlag(args) {
  const includeIndex = args.indexOf('--include');
  if (includeIndex === -1) return new Set();
  const includeValue = args[includeIndex + 1];
  if (!includeValue) return new Set();
  return new Set(includeValue.split(',').map(s => s.trim()));
}`;
        // Insert before safeReadFile
        const safeReadFilePos = content.indexOf('function safeReadFile(');
        if (safeReadFilePos !== -1) {
            content = content.slice(0, safeReadFilePos) + PARSE_INCLUDE + '\n\n' + HELPERS_BLOCK + '\n\n' + content.slice(safeReadFilePos);
            console.log('  ✅ Injected parseIncludeFlag + DRY helpers');
        } else {
            console.log('  ⚠️ Could not find safeReadFile insertion point');
        }
    } else {
        // parseIncludeFlag exists, inject helpers after it
        const parseIncludeEnd = content.indexOf('\n}\n', content.indexOf('function parseIncludeFlag'));
        if (parseIncludeEnd !== -1) {
            const insertAt = parseIncludeEnd + 3; // after closing }
            content = content.slice(0, insertAt) + HELPERS_BLOCK + '\n' + content.slice(insertAt);
            console.log('  ✅ Injected DRY helpers after parseIncludeFlag');
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Step 5: Refactor cmdInitExecutePhase to use helpers
// ──────────────────────────────────────────────────────────────────────────────

// Replace the 5 manual phase info lines with ...buildPhaseBase(phaseInfo)
// Pattern: phase_found through phase_slug block (with optional // Phase info comment)
const PHASE_INFO_BLOCK = /(?:\/\/ Phase info\n\s+)?phase_found: !!phaseInfo,\n\s+phase_dir: phaseInfo\?\.directory \|\| null,\n\s+phase_number: phaseInfo\?\.phase_number \|\| null,\n\s+phase_name: phaseInfo\?\.phase_name \|\| null,\n\s+phase_slug: phaseInfo\?\.phase_slug \|\| null,/g;

const phaseInfoReplacements = content.match(PHASE_INFO_BLOCK);
if (phaseInfoReplacements && phaseInfoReplacements.length > 0) {
    content = content.replace(PHASE_INFO_BLOCK, '...buildPhaseBase(phaseInfo),');
    console.log(`  ✅ Replaced ${phaseInfoReplacements.length} phase info block(s) with ...buildPhaseBase()`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Step 6: Inject applyIncludes() calls before output() in init functions
// ──────────────────────────────────────────────────────────────────────────────

// For each target function, find its body and inject applyIncludes() before output(result, raw)
const INIT_FUNCTIONS_WITH_INCLUDES = [
    { name: 'cmdInitExecutePhase', call: 'applyIncludes(result, includes, cwd);' },
    { name: 'cmdInitPlanPhase', call: 'applyIncludes(result, includes, cwd, phaseInfo?.directory);' },
    { name: 'cmdInitProgress', call: 'applyIncludes(result, includes, cwd);' },
];

for (const { name, call } of INIT_FUNCTIONS_WITH_INCLUDES) {
    // Skip if already has applyIncludes
    const funcStart = content.indexOf(`function ${name}(`);
    if (funcStart === -1) continue;

    // Find the output(result, raw) call within this function (first one after funcStart)
    const searchFrom = funcStart;
    const outputStr = 'output(result, raw)';
    const outputPos = content.indexOf(outputStr, searchFrom);
    if (outputPos === -1) continue;

    // Check if applyIncludes already exists between funcStart and outputPos
    const between = content.slice(funcStart, outputPos);
    if (between.includes('applyIncludes')) continue;

    // Inject applyIncludes before the output(result, raw) call
    // Detect indent from the output line itself
    const lineStart = content.lastIndexOf('\n', outputPos) + 1;
    const outputLine = content.slice(lineStart, outputPos + outputStr.length);
    const indent = outputLine.match(/^(\s*)/)?.[1] || '  ';
    const insertion = `${indent}${call}\n`;
    content = content.slice(0, lineStart) + insertion + content.slice(lineStart);
    console.log(`  ✅ Injected ${call.split('(')[0]}() in ${name}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Step 7: Update init router to pass includes to functions
// ──────────────────────────────────────────────────────────────────────────────

// Add `const includes = parseIncludeFlag(args);` in the init case if missing
if (!content.includes('parseIncludeFlag(args)')) {
    const initCasePattern = /case 'init': \{\n(\s+)const workflow = args\[1\];/;
    const initMatch = content.match(initCasePattern);
    if (initMatch) {
        content = content.replace(initCasePattern,
            `case 'init': {\n${initMatch[1]}const workflow = args[1];\n${initMatch[1]}const includes = parseIncludeFlag(args);`);
        console.log('  ✅ Added parseIncludeFlag(args) to init router');
    }
}

// Update function calls to pass includes parameter
// cmdInitExecutePhase(cwd, args[2], raw) → cmdInitExecutePhase(cwd, args[2], includes, raw)
const INIT_CALL_PATTERNS = [
    { from: 'cmdInitExecutePhase(cwd, args[2], raw)', to: 'cmdInitExecutePhase(cwd, args[2], includes, raw)' },
    { from: 'cmdInitPlanPhase(cwd, args[2], raw)', to: 'cmdInitPlanPhase(cwd, args[2], includes, raw)' },
    { from: 'cmdInitProgress(cwd, raw)', to: 'cmdInitProgress(cwd, includes, raw)' },
];

for (const { from, to } of INIT_CALL_PATTERNS) {
    if (content.includes(from) && !content.includes(to)) {
        content = content.replace(from, to);
        console.log(`  ✅ Updated call: ${from.split('(')[0]}`);
    }
}

// Update function signatures to accept includes parameter
const SIGNATURE_PATTERNS = [
    { from: 'function cmdInitExecutePhase(cwd, phase, raw)', to: 'function cmdInitExecutePhase(cwd, phase, includes, raw)' },
    { from: 'function cmdInitPlanPhase(cwd, phase, raw)', to: 'function cmdInitPlanPhase(cwd, phase, includes, raw)' },
    { from: 'function cmdInitProgress(cwd, raw)', to: 'function cmdInitProgress(cwd, includes, raw)' },
];

for (const { from, to } of SIGNATURE_PATTERNS) {
    if (content.includes(from)) {
        content = content.replace(from, to);
        console.log(`  ✅ Updated signature: ${from.split('(')[0].replace('function ', '')}`);
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Step 8: Write the optimized file
// ──────────────────────────────────────────────────────────────────────────────

fs.writeFileSync(targetPath, content, 'utf-8');

const stats = fs.statSync(targetPath);
const lineCount = content.split('\n').length;
console.log(`\n  📊 Optimized: ${lineCount} lines, ${(stats.size / 1024).toFixed(1)} KB`);
console.log('  ✅ gsd-tools.cjs optimization complete');
