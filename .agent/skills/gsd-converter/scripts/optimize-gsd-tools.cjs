#!/usr/bin/env node

/**
 * optimize-gsd-tools.cjs — Post-processing optimizer for gsd-tools.cjs
 *
 * Applied after gsd-converter copies the vanilla gsd-tools.cjs from .claude/.
 * Handles the updated 1.20+ modular architecture (bin/gsd-tools.cjs + bin/lib/*.cjs).
 * Applies DRY helpers, 2-space indentation, LF line endings, and condensed header.
 *
 * Usage: node optimize-gsd-tools.cjs <path-to-bin>
 */

const fs = require('fs');
const path = require('path');

const binDir = process.argv[2];
if (!binDir) {
    console.error('Usage: node optimize-gsd-tools.cjs <path-to-bin-dir>');
    process.exit(1);
}

if (!fs.existsSync(binDir)) {
    console.error(`Directory not found: ${binDir}`);
    process.exit(1);
}

// ──────────────────────────────────────────────────────────────────────────────
// Utility: Format a single file (LF + 2-space indent)
// ──────────────────────────────────────────────────────────────────────────────
function formatFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Step 1: Normalize line endings to LF
    content = content.replace(/\r\n/g, '\n');

    // Step 2: Convert 4-space indentation to 2-space
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
    fs.writeFileSync(filePath, content, 'utf-8');
    return content;
}

// ──────────────────────────────────────────────────────────────────────────────
// Process all .cjs files in bin and bin/lib/
// ──────────────────────────────────────────────────────────────────────────────
const allCjsFiles = [];

function findCjs(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            findCjs(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.cjs')) {
            allCjsFiles.push(path.join(dir, entry.name));
        }
    }
}

findCjs(binDir);

for (const file of allCjsFiles) {
    formatFile(file);
}

console.log(`  ✅ Formatted ${allCjsFiles.length} .cjs files across bin/ and lib/`);

// ──────────────────────────────────────────────────────────────────────────────
// Step 3: Condense the header comment in gsd-tools.cjs
// ──────────────────────────────────────────────────────────────────────────────
const gsdToolsPath = path.join(binDir, 'gsd-tools.cjs');
if (fs.existsSync(gsdToolsPath)) {
    let gsdContent = fs.readFileSync(gsdToolsPath, 'utf-8');

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

    const headerRegex = /\/\*\*[\s\S]*?\*\/\s*(?=\nconst fs = require)/;
    if (headerRegex.test(gsdContent)) {
        gsdContent = gsdContent.replace(headerRegex, CONDENSED_HEADER + '\n');
        console.log('  ✅ Header condensed in gsd-tools.cjs');
    }

    // Step 7: Update init router to pass includes to functions in gsd-tools.cjs
    if (!gsdContent.includes('parseIncludeFlag(args)')) {
        const initCasePattern = /case 'init': \{\n(\s+)const workflow = args\[1\];/;
        const initMatch = gsdContent.match(initCasePattern);
        if (initMatch) {
            gsdContent = gsdContent.replace(initCasePattern,
                `case 'init': {\n${initMatch[1]}const workflow = args[1];\n${initMatch[1]}const includes = parseIncludeFlag(args);`);
            console.log('  ✅ Added parseIncludeFlag(args) to init router');
        }

        // Also inject parseIncludeFlag import if it doesn't exist
        if (!gsdContent.includes('parseIncludeFlag')) {
            const importPoint = gsdContent.indexOf('const {');
            if (importPoint !== -1) {
                gsdContent = gsdContent.slice(0, importPoint) + "const { parseIncludeFlag } = require('./lib/core.cjs');\n" + gsdContent.slice(importPoint);
            }
        }
    }

    const INIT_CALL_PATTERNS = [
        { from: 'init.cmdInitExecutePhase(cwd, args[2], raw)', to: 'init.cmdInitExecutePhase(cwd, args[2], includes, raw)' },
        { from: 'init.cmdInitPlanPhase(cwd, args[2], raw)', to: 'init.cmdInitPlanPhase(cwd, args[2], includes, raw)' },
        { from: 'init.cmdInitProgress(cwd, raw)', to: 'init.cmdInitProgress(cwd, includes, raw)' },
    ];

    for (const { from, to } of INIT_CALL_PATTERNS) {
        if (gsdContent.includes(from) && !gsdContent.includes(to)) {
            gsdContent = gsdContent.replace(from, to);
            console.log(`  ✅ Updated router call: ${from.split('(')[0]}`);
        }
    }

    fs.writeFileSync(gsdToolsPath, gsdContent, 'utf-8');
}


// ──────────────────────────────────────────────────────────────────────────────
// Step 4: Inject DRY helper functions into lib/core.cjs
// ──────────────────────────────────────────────────────────────────────────────
const corePath = path.join(binDir, 'lib', 'core.cjs');
if (fs.existsSync(corePath)) {
    let coreContent = fs.readFileSync(corePath, 'utf-8');

    const HELPERS_BLOCK = `
function parseIncludeFlag(args) {
  const includeIndex = args.indexOf('--include');
  if (includeIndex === -1) return new Set();
  const includeValue = args[includeIndex + 1];
  if (!includeValue) return new Set();
  return new Set(includeValue.split(',').map(s => s.trim()));
}

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

    if (!coreContent.includes('function discoverPhaseArtifacts')) {
        const safeReadFilePos = coreContent.indexOf('function safeReadFile(');
        if (safeReadFilePos !== -1) {
            coreContent = coreContent.slice(0, safeReadFilePos) + HELPERS_BLOCK + '\n\n' + coreContent.slice(safeReadFilePos);
            console.log('  ✅ Injected DRY helpers into core.cjs');

            // Expose them in module.exports
            const moduleExportPos = coreContent.indexOf('module.exports = {');
            if (moduleExportPos !== -1) {
                const insertExports = `  parseIncludeFlag,\n  discoverPhaseArtifacts,\n  applyIncludes,\n  buildPhaseBase,\n`;
                coreContent = coreContent.slice(0, moduleExportPos + 19) + insertExports + coreContent.slice(moduleExportPos + 19);
            }
        }
    }
    fs.writeFileSync(corePath, coreContent, 'utf-8');
}


// ──────────────────────────────────────────────────────────────────────────────
// Step 5: Refactor lib/init.cjs to use helpers
// ──────────────────────────────────────────────────────────────────────────────
const initPath = path.join(binDir, 'lib', 'init.cjs');
if (fs.existsSync(initPath)) {
    let initContent = fs.readFileSync(initPath, 'utf-8');

    // Add imports from core if needed
    if (!initContent.includes('buildPhaseBase')) {
        const importPattern = /const \{[^}]+\} = require\('\.\/core\.cjs'\);/;
        initContent = initContent.replace(importPattern, (match) => {
            return match.replace('} = require', ', buildPhaseBase, applyIncludes } = require');
        });
    }

    const PHASE_INFO_BLOCK = /(?:\/\/ Phase info\n\s+)?phase_found: !!phaseInfo,\n\s+phase_dir: phaseInfo\?\.directory \|\| null,\n\s+phase_number: phaseInfo\?\.phase_number \|\| null,\n\s+phase_name: phaseInfo\?\.phase_name \|\| null,\n\s+phase_slug: phaseInfo\?\.phase_slug \|\| null,/g;

    const phaseInfoReplacements = initContent.match(PHASE_INFO_BLOCK);
    if (phaseInfoReplacements && phaseInfoReplacements.length > 0) {
        initContent = initContent.replace(PHASE_INFO_BLOCK, '...buildPhaseBase(phaseInfo),');
        console.log(`  ✅ Replaced ${phaseInfoReplacements.length} phase info block(s) with ...buildPhaseBase() in init.cjs`);
    }

    const INIT_FUNCTIONS_WITH_INCLUDES = [
        { name: 'cmdInitExecutePhase', call: 'applyIncludes(result, includes, cwd, result.phase_dir);' },
        { name: 'cmdInitPlanPhase', call: 'applyIncludes(result, includes, cwd, result.phase_dir);' },
        { name: 'cmdInitProgress', call: 'applyIncludes(result, includes, cwd, result.current_phase?.directory);' },
    ];

    for (const { name, call } of INIT_FUNCTIONS_WITH_INCLUDES) {
        const funcStart = initContent.indexOf(`function ${name}(`);
        if (funcStart === -1) continue;

        const searchFrom = funcStart;
        const outputStr = 'output(result, raw)';
        const outputPos = initContent.indexOf(outputStr, searchFrom);
        if (outputPos === -1) continue;

        const between = initContent.slice(funcStart, outputPos);
        if (between.includes('applyIncludes')) continue;

        const lineStart = initContent.lastIndexOf('\n', outputPos) + 1;
        const outputLine = initContent.slice(lineStart, outputPos + outputStr.length);
        const indent = outputLine.match(/^(\s*)/)?.[1] || '  ';
        const insertion = `${indent}${call}\n`;
        initContent = initContent.slice(0, lineStart) + insertion + initContent.slice(lineStart);
        console.log(`  ✅ Injected ${call.split('(')[0]}() in ${name} within init.cjs`);
    }

    const SIGNATURE_PATTERNS = [
        { from: 'function cmdInitExecutePhase(cwd, phase, raw)', to: 'function cmdInitExecutePhase(cwd, phase, includes, raw)' },
        { from: 'function cmdInitPlanPhase(cwd, phase, raw)', to: 'function cmdInitPlanPhase(cwd, phase, includes, raw)' },
        { from: 'function cmdInitProgress(cwd, raw)', to: 'function cmdInitProgress(cwd, includes, raw)' },
    ];

    for (const { from, to } of SIGNATURE_PATTERNS) {
        if (initContent.includes(from)) {
            initContent = initContent.replace(from, to);
            console.log(`  ✅ Updated init.cjs signature: ${from.split('(')[0].replace('function ', '')}`);
        }
    }

    fs.writeFileSync(initPath, initContent, 'utf-8');
}

console.log('  ✅ GSD Tools optimization complete');
