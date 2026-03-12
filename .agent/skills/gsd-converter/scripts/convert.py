import os
import re
import shutil
import sys
import argparse
import subprocess
import json
from datetime import datetime

def setup_args():
    # Force UTF-8 for Windows terminals
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    parser = argparse.ArgumentParser(description='Convert GSD to Antigravity Skill format.')
    parser.add_argument('skill_name', nargs='?', default='gsd', help='Name of the target skill (default: gsd)')
    parser.add_argument('--path', default='.agent/skills', help='Base path for skills directory')
    parser.add_argument('--source', default='.claude', help='Source .claude directory')
    return parser.parse_args()

def get_gsd_version(source_base):
    version_path = os.path.join(source_base, 'get-shit-done', 'VERSION')
    if os.path.exists(version_path):
        try:
            with open(version_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception:
            return "unknown"
    return "not installed"

def run_gsd_install():
    print("📥 Running fresh GSD installation via npx...")
    try:
        # We use shell=True because npx is often a shell script/cmd on Windows
        result = subprocess.run(
            ["npx", "-y", "get-shit-done-cc", "--claude", "--local", "--force-statusline"],
            check=True,
            capture_output=True,
            text=True,
            shell=True,
            encoding='utf-8'
        )
        print("\n  ✅ GSD installed successfully to .claude/")
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Failed to run npx installation: {e}")
        print(f"  Output: {e.output}")
        sys.exit(1)

def migrate_files(source_base, target_base):
    print(f"🚀 Starting migration from {source_base} to {target_base}...")
    
    # Define mappings (source_rel, target_rel)
    mappings = [
        ('commands/gsd', 'references/commands'),
        ('get-shit-done/references', 'references/docs'),
        ('get-shit-done/workflows', 'references/workflows'),
        ('agents', 'references/agents'),
        ('get-shit-done/templates', 'assets/templates'),
        ('get-shit-done/bin', 'bin'),
        ('hooks', 'bin/hooks')
    ]
    
    for src_rel, tgt_rel in mappings:
        src_path = os.path.join(source_base, src_rel)
        tgt_path = os.path.join(target_base, tgt_rel)
        
        if os.path.exists(src_path):
            print(f"  📁 Migrating {src_rel} -> {tgt_rel}")
            if not os.path.exists(tgt_path):
                os.makedirs(tgt_path, exist_ok=True)
            
            for item in os.listdir(src_path):
                s = os.path.join(src_path, item)
                d = os.path.join(tgt_path, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
        else:
            print(f"  ⚠️ Source not found: {src_path}")

    # Migrate internal documentation (mapping.md)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    mapping_src = os.path.abspath(os.path.join(script_dir, '..', 'references', 'mapping.md'))
    mapping_tgt = os.path.join(target_base, 'references', 'mapping.md')
    if os.path.exists(mapping_src):
        print(f"  📝 Migrating internal mapping.md")
        os.makedirs(os.path.dirname(mapping_tgt), exist_ok=True)
        shutil.copy2(mapping_src, mapping_tgt)

def refactor_content(target_base):
    print("🔧 Refactoring file contents and paths...")
    
    replacements = [
        (r'@\.?/?\.claude/commands/gsd/', '@references/commands/'),
        (r'@\.?/?\.claude/get-shit-done/references/', '@references/docs/'),
        (r'@\.?/?\.claude/get-shit-done/workflows/', '@references/workflows/'),
        (r'@\.?/?\.claude/get-shit-done/templates/', '@assets/templates/'),
        (r'@\.?/?\.claude/agents/', '@references/agents/'),
        (r'\.?/?\.claude/agents/', 'references/agents/'),
        (r'\.?/?\.claude/get-shit-done/templates/', 'assets/templates/'),
        (r'\.?/?\.claude/get-shit-done/workflows/', 'references/workflows/'),
        (r'\.?/?\.claude/get-shit-done/bin/', '.agent/skills/gsd/bin/'),
        (r'\.?/?\.claude/hooks/', '.agent/skills/gsd/bin/hooks/'),
        (r'@\.?/?\.claude/hooks/', '@bin/hooks/'),
        (r'\bClaude Code\b', 'Antigravity'),
        (r'\bClaude\b', 'Antigravity'),
        (r'\bclaude\b', 'antigravity'),
        (r'\bCLAUDE\b', 'ANTIGRAVITY'),
    ]
    
    exact_replacements = [
        ("@~/.claude/commands/gsd/", "@references/commands/"),
        ("@$HOME/.claude/commands/gsd/", "@references/commands/"),
        ("@~/.claude/get-shit-done/references/", "@references/docs/"),
        ("@$HOME/.claude/get-shit-done/references/", "@references/docs/"),
        ("@~/.claude/get-shit-done/workflows/", "@references/workflows/"),
        ("@$HOME/.claude/get-shit-done/workflows/", "@references/workflows/"),
        ("@~/.claude/get-shit-done/templates/", "@assets/templates/"),
        ("@$HOME/.claude/get-shit-done/templates/", "@assets/templates/"),
        ("@~/.claude/agents/", "@references/agents/"),
        ("@$HOME/.claude/agents/", "@references/agents/"),
        ("~/.claude/get-shit-done", ".agent/skills/gsd"),
        ("$HOME/.claude/get-shit-done", ".agent/skills/gsd"),
        ("~/.claude/agents", "references/agents"),
        ("$HOME/.claude/agents", "references/agents"),
        ("path.join(homeDir, '.claude', 'todos')", "path.join(homeDir, '.gemini', 'antigravity', 'todos')"),
        ("path.join(homeDir, '.claude', 'cache'", "path.join(homeDir, '.gemini', 'antigravity', 'cache'"),
        ("path.join(cwd, '.claude', 'get-shit-done'", "path.join(cwd, '.agent', 'skills', 'gsd'"),
        ("path.join(homeDir, '.claude', 'get-shit-done'", "path.join(homeDir, '.gemini', 'antigravity', 'skills', 'gsd'")
    ]
    
    for root, dirs, files in os.walk(target_base):
        for file in files:
            file_path = os.path.join(root, file)
            # Process content
            if file.endswith(('.md', '.json', '.js', '.cjs')):
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for exact, repl in exact_replacements:
                    new_content = new_content.replace(exact, repl)

                for pattern, replacement in replacements:
                    new_content = re.sub(pattern, replacement, new_content)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
    
    # Cleanup .bak files
    for root, dirs, files in os.walk(target_base):
        for file in files:
            if file.endswith('.md.bak'):
                os.remove(os.path.join(root, file))

def optimize_gsd_tools(target_base):
    """Post-process gsd-tools.cjs with DRY helpers, 2-space indent, and condensed header."""
    gsd_tools_path = os.path.join(target_base, 'bin', 'gsd-tools.cjs')
    if not os.path.exists(gsd_tools_path):
        print("  ⚠️ gsd-tools.cjs not found in bin/, skipping optimization")
        return
    
    print("🔧 Optimizing gsd-tools.cjs...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    optimizer_path = os.path.join(script_dir, 'optimize-gsd-tools.cjs')
    
    if not os.path.exists(optimizer_path):
        print(f"  ⚠️ Optimizer script not found at {optimizer_path}")
        return
    
    bin_dir = os.path.dirname(gsd_tools_path)
    try:
        result = subprocess.run(
            ["node", optimizer_path, bin_dir],
            check=True,
            capture_output=True,
            text=True,
            shell=True,
            encoding='utf-8'
        )
        # Combine stdout and stderr if any, avoiding async-like interleaving issues
        full_output = result.stdout + (result.stderr if hasattr(result, 'stderr') else '')
        print("\n" + full_output.strip() + "\n")
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Optimizer failed: {e}")
        print(f"  Output: {e.stdout}")
        print(f"  Errors: {e.stderr}")

def extract_gsd_tools_help(target_base):
    """Extract usage comments from gsd-tools.cjs for dynamic documentation."""
    gsd_tools_path = os.path.join(target_base, 'bin', 'gsd-tools.cjs')
    if not os.path.exists(gsd_tools_path):
        return "Help information not available."
    
    try:
        with open(gsd_tools_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Match the first JSDoc style comment block found (Atomic Commands through ...)
        # This matches the block starting with /** and ending with */
        match = re.search(r'/\*\*(.*?)\*/', content, re.DOTALL)
        if match:
            lines = match.group(1).split('\n')
            extracted = []
            for line in lines:
                line = line.strip()
                if line.startswith('*'):
                    line = line[1:].strip()
                # Exclude the title and purpose lines at the top
                if any(x in line for x in ['GSD Tools', 'Replaces repetitive', 'Centralizes:', 'Usage:']):
                    continue
                if line:
                    # Format section headers as bold (starts with capital, ends with colon)
                    if re.match(r'^[A-Z].*:$', line):
                        extracted.append(f"\n#### {line}")
                    elif line.startswith('['):
                        # Indent option lines
                        extracted.append(f"  {line}")
                    else:
                        extracted.append(line)
            return "\n".join(extracted).strip()
    except Exception as e:
        print(f"  ⚠️ Failed to extract gsd-tools help: {e}")
    return "Help information could not be parsed."

def scan_commands(target_base):
    commands_dir = os.path.join(target_base, 'references', 'commands')
    commands = []
    if os.path.exists(commands_dir):
        for f in sorted(os.listdir(commands_dir)):
            if f.endswith('.md'):
                cmd_name = f[:-3] # remove .md
                file_path = os.path.join(commands_dir, f)
                description = ""
                try:
                    with open(file_path, 'r', encoding='utf-8') as cf:
                        lines = cf.readlines()
                        # Simple frontmatter parsing
                        if lines and lines[0].strip() == '---':
                            for line in lines[1:]:
                                if line.strip() == '---':
                                    break
                                if line.strip().startswith('description:'):
                                    description = line.split(':', 1)[1].strip().strip('"').strip("'")
                                    break
                except Exception as e:
                    print(f"  ⚠️ Error parsing {f}: {e}")
                
                commands.append({'name': cmd_name, 'description': description})
    return commands

def create_skill_md(target_base, skill_name, version):
    skill_md_path = os.path.join(target_base, 'SKILL.md')
    
    # We deliberately overwrite SKILL.md to ensure the command list is always up to date
    # on every run of the converter.

    # Locate the template file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, '..', 'assets', 'gsd_skill_template.md')
    
    commands = scan_commands(target_base)
    
    # Format for triggers: - `gsd:command`
    command_triggers_str = "\n".join([f"- `gsd:{cmd['name']}`" for cmd in commands])
    
    # Format for detailed list: bold command name with link, then description
    # Example: - **[gsd:new-project](references/commands/new-project.md)**: Initialize a new project...
    commands_list_str = "\n".join([
        f"- **[`gsd:{cmd['name']}`](references/commands/{cmd['name']}.md)**: {cmd['description']}" 
        for cmd in commands
    ])

    if not os.path.exists(template_path):
        print(f"  ⚠️ Template not found at {template_path}. Using fallback.")
        content = f"""---
name: {skill_name}
version: {version}
description: "Antigravity GSD (Get Stuff Done) - Fallback."
---
# {skill_name}
Template missing.
"""
    else:
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
            
        title_name = skill_name.upper()
        date_str = datetime.now().strftime('%Y-%m-%d')
        
        try:
            content = template_content.format(
                skill_name=skill_name,
                version=version,
                title_name=title_name,
                date=date_str,
                command_triggers=command_triggers_str,
                commands_list=commands_list_str
            )
        except KeyError as e:
            print(f"  ⚠️ Error formatting template: {e}")
            print("  Check if template contains matching keys.")
            content = template_content

    with open(skill_md_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  ✅ Created SKILL.md from template with updated commands")

def main():
    args = setup_args()
    
    # Enforce 'gsd' as the skill name
    skill_name = 'gsd'
    target_base = os.path.abspath(os.path.join(args.path, skill_name))
    
    print(f"🧹 Cleaning up existing skill folder: {target_base}")
    if os.path.exists(target_base):
        shutil.rmtree(target_base)
    
    # 0. Capture old version
    old_version = get_gsd_version(args.source)
    
    # 1. Run the fresh GSD installation
    run_gsd_install()
    
    # 1.1 Capture new version
    new_version = get_gsd_version(args.source)
    
    # 2. Re-create the skill directory
    os.makedirs(target_base, exist_ok=True)
    
    # 3. Perform migration and refactoring
    migrate_files(args.source, target_base)
    
    refactor_content(target_base)
    optimize_gsd_tools(target_base)

    # 4. Inject Antigravity-specific command definitions
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Dynamic gsd-tools help extraction
    gsd_tools_help = extract_gsd_tools_help(target_base)

    # Generate help-manifest.json
    commands = scan_commands(target_base)
    
    internal_help = {
        "state": {
            "description": "Manage and query project state memory.",
            "subcommands": {
                "json": "Output full state as raw JSON.",
                "update": "Update a state key. usage: state update <key> <value>",
                "get": "Retrieve a specific state value. usage: state get <key>",
                "patch": "Apply multiple state changes via flags.",
                "advance-plan": "Advance to the next plan in the current phase.",
                "record-metric": "Record execution metrics (duration, files, tasks).",
                "update-progress": "Sync STATE.md progress with ROADMAP.md status.",
                "add-decision": "Record a design decision with rationale.",
                "add-blocker": "Record a new blocking issue.",
                "resolve-blocker": "Mark a blocker as resolved.",
                "record-session": "Record session continuity metadata."
            }
        },
        "roadmap": {
            "description": "Manage and analyze project roadmap and phases.",
            "subcommands": {
                "get-phase": "Retrieve details for a specific phase number.",
                "analyze": "Analyze roadmap completion and next steps.",
                "update-plan-progress": "Update completion status for a plan in ROADMAP.md."
            }
        },
        "find-phase": {
            "description": "Search for a phase directory by number or name. usage: find-phase <query>"
        },
        "resolve-model": {
            "description": "Resolve the optimal AI model for a specific agent type. usage: resolve-model <agent-type>"
        },
        "commit": {
            "description": "Create a standardized GSD commit. usage: commit [message] --files [file1...]",
            "subcommands": {
                "--amend": "Amend the last commit instead of creating a new one."
            }
        },
        "verify-summary": {
            "description": "Verify that a SUMMARY.md matches the corresponding PLAN.md. usage: verify-summary <path>"
        },
        "generate-slug": {
            "description": "Convert a string into a URL-friendly slug. usage: generate-slug <text>"
        },
        "current-timestamp": {
            "description": "Output the current timestamp in various formats. usage: current-timestamp [format]"
        },
        "list-todos": {
            "description": "List all pending todos in the project. usage: list-todos [area]"
        },
        "verify-path-exists": {
            "description": "Check if a specific path exists within the project. usage: verify-path-exists <path>"
        },
        "history-digest": {
            "description": "Generate a concise digest of recent project activity."
        },
        "progress": {
            "description": "Calculate and render project completion percentage.",
            "subcommands": {
                "json": "Output progress as raw JSON.",
                "render": "Output a pretty-formatted progress bar (default)."
            }
        },
        "todo": {
            "description": "Atomic operations on a single todo file.",
            "subcommands": {
                "complete": "Mark a todo as done. usage: todo complete <path>"
            }
        },
        "scaffold": {
            "description": "Scaffold new project structures or phase directories. usage: scaffold <type> --name <name>",
            "subcommands": {
                "phase": "Initialize a new phase structure."
            }
        },
        "phase-plan-index": {
            "description": "Sync and re-index plans within a phase directory."
        },
        "state-snapshot": {
            "description": "Create a persistent snapshot of the current project state."
        },
        "summary-extract": {
            "description": "Extract specific fields from a SUMMARY.md file. usage: summary-extract <path> --fields <f1,f2>"
        },
        "websearch": {
            "description": "Perform a low-latency web search for technical info. usage: websearch <query>"
        },
        "phase": {
            "description": "Atomic phase operations in the roadmap.",
            "subcommands": {
                "next-decimal": "Calculate the next available decimal phase for insertion.",
                "add": "Add a new phase at the end of the milestone.",
                "insert": "Insert a new decimal phase at a specific position.",
                "remove": "Remove a phase and re-number subsequent phases.",
                "complete": "Mark a phase as 100% complete in ROADMAP.md."
            }
        },
        "verify": {
            "description": "Run verification and consistency checks.",
            "subcommands": {
                "plan-structure": "Validate PLAN.md formatting and required sections.",
                "phase-completeness": "Verify that all plans in a phase have summaries.",
                "references": "Check for broken internal or artifact references.",
                "commits": "Verify that git commits match planned work.",
                "artifacts": "Confirm existence of required phase artifacts.",
                "key-links": "Validate critical links and external references.",
                "consistency": "Ensure ROADMAP.md, STATE.md and REQUIREMENTS.md are in sync.",
                "health": "Check directory structure and general project health."
            }
        },
        "template": {
            "description": "Manage and fill GSD artifact templates.",
            "subcommands": {
                "select": "Suggest the best template for a specific task.",
                "fill": "Generate artifact content from a template with variables."
            }
        },
        "frontmatter": {
            "description": "Query or modify Markdown frontmatter.",
            "subcommands": {
                "get": "Retrieve a value from frontmatter. usage: frontmatter get <file> --field <key>",
                "set": "Update a frontmatter field. usage: frontmatter set <file> --field <key> --value <val>",
                "merge": "Merge a JSON object into file frontmatter.",
                "validate": "Validate frontmatter against a specific schema."
            }
        },
        "init": {
            "description": "Initialize specialized GSD workflows.",
            "subcommands": {
                "execute-phase": "Init execution state for a phase.",
                "plan-phase": "Init planning state for a phase.",
                "new-project": "Init a fresh project structure.",
                "new-milestone": "Init a new milestone cycle.",
                "quick": "Init a quick-task context.",
                "resume": "Restore context from a paused session.",
                "verify-work": "Init UAT/verification workflow.",
                "map-codebase": "Init parallel codebase mapping.",
                "progress": "Calculate current project progress metrics."
            }
        }
    }

    help_manifest = {
        "version": new_version,
        "commands": {cmd['name']: {"description": cmd['description']} for cmd in commands},
        "tools_usage": gsd_tools_help
    }
    
    # Merge internal help
    for cmd, data in internal_help.items():
        if cmd in help_manifest["commands"]:
            help_manifest["commands"][cmd].update(data)
        else:
            help_manifest["commands"][cmd] = data

    manifest_path = os.path.join(target_base, 'bin', 'help-manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(help_manifest, f, indent=2)
    print("  ✅ Generated help-manifest.json")

    custom_assets = [
        ('gsd-tools.md', 'references/commands/gsd-tools.md'),
    ]
    for asset_name, target_rel in custom_assets:
        asset_path = os.path.join(script_dir, '..', 'assets', asset_name)
        target_path = os.path.join(target_base, target_rel)
        if os.path.exists(asset_path):
            print(f"  🛠️ Injecting custom asset: {asset_name}")
            if asset_name == 'gsd-tools.md':
                with open(asset_path, 'r', encoding='utf-8') as f:
                    template = f.read()
                with open(target_path, 'w', encoding='utf-8') as f:
                    f.write(template.replace('{gsd_tools_help}', gsd_tools_help))
            else:
                shutil.copy2(asset_path, target_path)

    create_skill_md(target_base, skill_name, new_version)
    
    print(f"\n{"-"*40}")
    print(f"✨ Skill '{skill_name}' is ready at {target_base}")
    print(f"📊 GSD Version: {old_version} -> {new_version}\n")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
