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
        if (!match) {
            // Rebranding deep pass on non-indented lines
            return line.replace(/\bClaude Code\b/g, 'Antigravity')
                       .replace(/\bClaude\b/g, 'Antigravity')
                       .replace(/\bclaude\b/g, 'antigravity')
                       .replace(/\bCLAUDE\b/g, 'ANTIGRAVITY');
        };
        const spaces = match[1].length;
        const indentLevel = Math.floor(spaces / 4);
        const remainder = spaces % 4;
        let newLine = ' '.repeat(indentLevel * 2 + remainder) + line.trimStart();
        
        // Similarly for indented lines
        return newLine.replace(/\bClaude Code\b/g, 'Antigravity')
                      .replace(/\bClaude\b/g, 'Antigravity')
                      .replace(/\bclaude\b/g, 'antigravity')
                      .replace(/\bCLAUDE\b/g, 'ANTIGRAVITY');
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

console.log(`  ✅ Formatted and rebranded ${allCjsFiles.length} .cjs files across bin/ and lib/`);

// ──────────────────────────────────────────────────────────────────────────────
// Step 3: Condense the header comment in gsd-tools.cjs
// ──────────────────────────────────────────────────────────────────────────────
const gsdToolsPath = path.join(binDir, 'gsd-tools.cjs');
if (fs.existsSync(gsdToolsPath)) {
    let gsdContent = fs.readFileSync(gsdToolsPath, 'utf-8');

    const CONDENSED_HEADER = `/**
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
            const indent = initMatch[1];
            gsdContent = gsdContent.replace(initCasePattern,
                `case 'init': {\n${indent}const workflow = args[1];\n${indent}const includes = parseIncludeFlag(args);`);
            
            // Generic injection into all init calls within the switch
            // Matches calls like init.cmdInitSomething(cwd, args[2], raw)
            const initCallRegex = /init\.cmdInit[a-zA-Z]+\(([^)]+)\)/g;
            gsdContent = gsdContent.replace(initCallRegex, (match, argsList) => {
              if (argsList.includes('includes')) return match;
              if (argsList.includes('raw')) {
                return match.replace('raw', 'includes, raw');
              }
              return match.replace(')', ', includes)');
            });
            
            console.log('  ✅ Added parseIncludeFlag(args) and injected into all init calls');
        }

        // Also inject parseIncludeFlag import if it doesn't exist
        if (!gsdContent.includes('parseIncludeFlag } = require')) {
            if (gsdContent.includes("const { error } = require('./lib/core.cjs');")) {
                gsdContent = gsdContent.replace(
                    "const { error } = require('./lib/core.cjs');",
                    "const { error, parseIncludeFlag } = require('./lib/core.cjs');"
                );
            } else {
                const importPoint = gsdContent.indexOf('const {');
                if (importPoint !== -1) {
                    gsdContent = gsdContent.slice(0, importPoint) + "const { parseIncludeFlag } = require('./lib/core.cjs');\n" + gsdContent.slice(importPoint);
                }
            }
        }
    }

    // Step 9: Fix bare 'gsd-tools' usage string in error fallback
    if (gsdContent.includes("Usage: gsd-tools <command>")) {
        gsdContent = gsdContent.replace(
            "Usage: gsd-tools <command>",
            "Usage: node .agent/skills/gsd/bin/gsd-tools.cjs <command>"
        );
        console.log('  ✅ Fixed bare gsd-tools usage string in error fallback');
    }

    // Step 10: Inject Help System into gsd-tools.cjs
    if (!gsdContent.includes('const HELP_MANIFEST = require(\'./help-manifest.json\');')) {
        const HELP_SYSTEM_CODE = `const HELP_MANIFEST = require('./help-manifest.json');

function showHelp(cmd, sub) {
  const info = HELP_MANIFEST.commands[cmd];
  if (!info) {
    console.log(\`\\n\${HELP_MANIFEST.tools_usage}\`);
    console.log('\\nAvailable Commands: ' + Object.keys(HELP_MANIFEST.commands).join(', '));
    return;
  }
  console.log(\`\\nCommand: \${cmd}\\nDescription: \${info.description}\`);
  if (sub && info.subcommands?.[sub]) {
    console.log(\`Subcommand: \${sub}\\nUsage: \${info.subcommands[sub]}\`);
  } else if (info.subcommands) {
    console.log('\\nAvailable subcommands:');
    Object.entries(info.subcommands).forEach(([s, d]) => console.log(\`  - \${s.padEnd(15)} : \${d}\`));
  }
}

`;
        if (gsdContent.startsWith('#!')) {
            const firstNewline = gsdContent.indexOf('\n') + 1;
            gsdContent = gsdContent.slice(0, firstNewline) + HELP_SYSTEM_CODE + gsdContent.slice(firstNewline);
        } else {
            gsdContent = HELP_SYSTEM_CODE + gsdContent;
        }
        console.log('  ✅ Injected Help System into gsd-tools.cjs');

        const mainStart = gsdContent.indexOf('async function main() {');
        if (mainStart !== -1) {
            const interceptor = `
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
`;
            const argsSlicePos = gsdContent.indexOf('const args = process.argv.slice(2);', mainStart);
            if (argsSlicePos !== -1) {
                const insertionPoint = gsdContent.indexOf('\n', argsSlicePos) + 1;
                // Also need to find 'raw' definition or move it up
                const rawDefPos = gsdContent.indexOf('const raw = rawIndex !== -1;', mainStart);
                if (rawDefPos !== -1) {
                    const rawInsertionPoint = gsdContent.indexOf('\n', rawDefPos) + 1;
                    gsdContent = gsdContent.slice(0, rawInsertionPoint) + interceptor + gsdContent.slice(rawInsertionPoint);
                } else {
                    // If raw is not found yet, we might need a simpler interceptor or move raw up
                    gsdContent = gsdContent.slice(0, insertionPoint) + "  const raw = args.includes('--raw');" + interceptor + gsdContent.slice(insertionPoint);
                }
            }
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

    // Generic injection of applyIncludes into all cmdInit functions
    // Find every function cmdInitX(...) { ... }
    const initFuncRegex = /function (cmdInit[a-zA-Z0-9]+)\(([^)]+)\)\s*\{/g;
    initContent = initContent.replace(initFuncRegex, (match, name, argsList) => {
      // Add 'includes' to signature if not present
      if (argsList.includes('includes')) return match;
      if (argsList.includes('raw')) {
        return match.replace('raw', 'includes, raw');
      }
      return match.replace(')', ', includes)');
    });
    console.log('  ✅ Updated all cmdInit* function signatures in init.cjs');

    // Inject applyIncludes before output(result, raw)
    const outputRegex = /output\(result, raw\);/g;
    initContent = initContent.replace(outputRegex, (match) => {
      // Find the context (phase_dir or current_phase?.directory)
      // We'll use a heuristic: if we are in cmdInitProgress use current_phase, else use phase_dir
      return `applyIncludes(result, includes, cwd, result.phase_dir || result.current_phase?.directory);\n    ${match}`;
    });
    console.log('  ✅ Injected applyIncludes() before output in all init results');

    fs.writeFileSync(initPath, initContent, 'utf-8');
}

console.log('  ✅ GSD Tools optimization complete');
