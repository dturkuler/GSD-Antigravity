import os
import re
import shutil
import sys
import argparse
import subprocess
import json
from datetime import datetime

def load_manifest():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(script_dir, '..', 'assets', 'migration-manifest.json')
    if not os.path.exists(manifest_path):
        print(f"  ❌ Manifest not found at {manifest_path}")
        sys.exit(1)
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return json.load(f)

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

def discover_commands(source_gsd_tools_path):
    """Dynamic discovery of commands and subcommands from gsd-tools.cjs header."""
    commands = {}
    
    if not os.path.exists(source_gsd_tools_path):
        print(f"  ⚠️ gsd-tools.cjs not found at {source_gsd_tools_path}, using fallback.")
        return commands

    try:
        with open(source_gsd_tools_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract JSDoc style header
        header_match = re.search(r'/\*\*(.*?)\*/', content, re.DOTALL)
        if not header_match:
            return commands

        lines = header_match.group(1).split('\n')
        current_cmd = None
        
        # Section titles to identify top-level commands (ends with colon)
        SECTION_PATTERN = re.compile(r'^\s*\*?\s+([A-Z][a-zA-Z\s/]+):\s*$')

        for line in lines:
            line = line.strip()
            if not line: continue
            if line.startswith('*'): line = line[1:].strip()
            if not line: continue

            # Detect sections (Atomic Commands, Phase Operations, etc.)
            section_match = SECTION_PATTERN.match(line)
            if section_match:
                continue

            # Robust split: Find the first word(s) before a large gap of spaces (3+)
            # Example: "state load                         Load project config"
            parts = re.split(r'\s{3,}', line)
            if len(parts) >= 2:
                call_part = parts[0].strip()
                desc = parts[1].strip()
                
                # Split the call part into command and potentially subcommand
                call_words = call_part.split()
                if not call_words: continue
                
                name = call_words[0]
                if len(call_words) > 1:
                    sub = call_words[1]
                    if name not in commands:
                        commands[name] = {"description": f"{name.capitalize()} operations.", "subcommands": {}}
                    if "subcommands" not in commands[name]:
                        commands[name]["subcommands"] = {}
                    commands[name]["subcommands"][sub] = desc
                else:
                    if name not in commands:
                        commands[name] = {"description": desc}
                    else:
                        commands[name]["description"] = desc

    except Exception as e:
        print(f"  ⚠️ Error during dynamic command discovery: {e}")
        
    return commands

def get_command_category(cmd_name):
    """Categorize GSD commands based on their primary function."""
    atomic = ['add-todo', 'check-todos', 'note', 'ship', 'cleanup', 'undo', 'help', 'do', 'stats', 'thread', 'session-report', 'join-discord']
    phase = ['plan-phase', 'execute-phase', 'research-phase', 'validate-phase', 'discuss-phase', 'remove-phase', 'insert-phase', 'add-phase', 'list-phase-assumptions', 'secure-phase', 'ui-phase', 'ui-review', 'add-tests', 'workstreams']
    milestone = ['new-milestone', 'complete-milestone', 'audit-milestone', 'milestone-summary', 'plan-milestone-gaps', 'review-backlog', 'add-backlog', 'plant-seed']
    project = ['new-project', 'new-workspace', 'list-workspaces', 'remove-workspace', 'map-codebase', 'scan', 'intel', 'analyze-dependencies', 'explore', 'import']
    system = ['gsd-tools', 'health', 'settings', 'profile-user', 'set-profile', 'update', 'pause-work', 'resume-work', 'reapply-patches', 'debug', 'forensics', 'manager', 'autonomous', 'fast', 'quick', 'code-review', 'code-review-fix', 'review', 'docs-update', 'pr-branch']
    
    if cmd_name in atomic: return 'atomic'
    if cmd_name in phase: return 'phase'
    if cmd_name in milestone: return 'milestone'
    if cmd_name in project: return 'project'
    if cmd_name in system: return 'system'
    return 'misc'

def inject_metadata(file_path, version):
    """Inject GSD version and migration date into markdown frontmatter."""
    if not file_path.endswith('.md'): return
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse frontmatter
        match = re.match(r'^(---\s*\n)(.*?\n)(---)', content, re.DOTALL)
        if match:
            start, mid, end = match.groups()
            # Check if already injected
            if 'gsd-source-version' in mid: return
            
            new_meta = f"gsd-source-version: {version}\nmigration-date: {datetime.now().strftime('%Y-%m-%d')}\n"
            new_content = start + mid + new_meta + end + content[match.end():]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
    except Exception as e:
        print(f"  ⚠️ Failed to inject metadata to {file_path}: {e}")

def migrate_files(source_base, target_base, manifest):
    print(f"🚀 Starting migration from {source_base} to {target_base}...")
    
    # Define mappings (source_rel, target_rel) from manifest
    mappings = [(m['source'], m['target']) for m in manifest['mappings']]
    
    for src_rel, tgt_rel in mappings:
        src_path = os.path.join(source_base, src_rel)
        tgt_path = os.path.join(target_base, tgt_rel)
        
        if os.path.exists(src_path):
            print(f"  📁 Migrating {src_rel} -> {tgt_rel}")
            if not os.path.exists(tgt_path):
                os.makedirs(tgt_path, exist_ok=True)
            
            for item in os.listdir(src_path):
                s = os.path.join(src_path, item)
                
                # Special handling for command categorization
                if src_rel == 'commands/gsd/':
                    cmd_name = item[:-3] if item.endswith('.md') else item
                    category = get_command_category(cmd_name)
                    cat_path = os.path.join(tgt_path, category)
                    os.makedirs(cat_path, exist_ok=True)
                    d = os.path.join(cat_path, item)
                else:
                    d = os.path.join(tgt_path, item)

                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
        else:
            print(f"  ⚠️ Source not found: {src_path}")

    # Recursive Skill Migration (new in 1.32.0)
    skills_src = os.path.join(source_base, 'skills')
    commands_tgt = os.path.join(target_base, 'references/commands')
    if os.path.exists(skills_src):
        print(f"  📁 Migrating modular skills -> references/commands/modular")
        modular_tgt = os.path.join(commands_tgt, 'modular')
        os.makedirs(modular_tgt, exist_ok=True)
        for skill_dir in os.listdir(skills_src):
            s_full = os.path.join(skills_src, skill_dir)
            if os.path.isdir(s_full):
                skill_md = os.path.join(s_full, 'SKILL.md')
                if os.path.exists(skill_md):
                    target_name = skill_dir + '.md'
                    shutil.copy2(skill_md, os.path.join(modular_tgt, target_name))

    # Migrate internal documentation (mapping.md)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    mapping_src = os.path.abspath(os.path.join(script_dir, '..', 'references', 'mapping.md'))
    mapping_tgt = os.path.join(target_base, 'references', 'mapping.md')
    if os.path.exists(mapping_src):
        print(f"  📝 Migrating internal mapping.md")
        os.makedirs(os.path.dirname(mapping_tgt), exist_ok=True)
        shutil.copy2(mapping_src, mapping_tgt)

def refactor_content(target_base, version, manifest):
    print("🔧 Refactoring file contents and paths...")
    
    # Load rebranding rules from manifest
    rebranding_rules = manifest.get('rebranding', {}).get('replacements', [])
    replacements = []
    for rule in rebranding_rules:
        replacements.append((re.compile(rule['pattern']), rule['replacement']))
    
    # Standard GSD replacements (preserved)
    standard_replacements = [
        # Skill-relative internal references
        (re.compile(r'@.*?\.claude/commands/gsd/'), '@references/commands/'),
        (re.compile(r'@.*?\.claude/get-shit-done/references/'), '@references/docs/'),
        (re.compile(r'@.*?\.claude/get-shit-done/workflows/'), '@references/workflows/'),
        (re.compile(r'@.*?\.claude/get-shit-done/contexts/'), '@references/agents/profiles/'),
        (re.compile(r'@.*?\.claude/get-shit-done/templates/'), '@assets/templates/'),
        (re.compile(r'@.*?\.claude/agents/'), '@references/agents/'),
        (re.compile(r'@.*?\.claude/hooks/'), '@bin/hooks/'),

        # Local filesystem paths
        (re.compile(r'\.?/?.*?\.claude/agents/'), 'references/agents/'),
        (re.compile(r'\.?/?.*?\.claude/get-shit-done/templates/'), 'assets/templates/'),
        (re.compile(r'\.?/?.*?\.claude/get-shit-done/workflows/'), 'references/workflows/'),
        (re.compile(r'\.?/?.*?\.claude/get-shit-done/contexts/'), 'references/agents/profiles/'),
        (re.compile(r'\.?/?.*?\.claude/get-shit-done/bin/'), '.agent/skills/gsd/bin/'),
        (re.compile(r'\.?/?.*?\.claude/hooks/'), '.agent/skills/gsd/bin/hooks/'),
    ]
    
    # Rebranding aliases to prevent double rebrands breaking things
    # These are handled by the manifest now, but we keep some specific ones if needed
    
    exact_replacements = [
        ("@~/.claude/commands/gsd/", "@references/commands/"),
        ("@$HOME/.claude/commands/gsd/", "@references/commands/"),
        ("@~/.claude/get-shit-done/references/", "@references/docs/"),
        ("@$HOME/.claude/get-shit-done/references/", "@references/docs/"),
        ("@~/.claude/get-shit-done/workflows/", "@references/workflows/"),
        ("@$HOME/.claude/get-shit-done/workflows/", "@references/workflows/"),
        ("@~/.claude/get-shit-done/contexts/", "@references/agents/profiles/"),
        ("@$HOME/.claude/get-shit-done/contexts/", "@references/agents/profiles/"),
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
    
    # Pass 1: Content processing
    for root, dirs, files in os.walk(target_base):
        for file in files:
            file_path = os.path.join(root, file)
            # Process content
            if file.endswith(('.md', '.json', '.js', '.cjs')):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for exact, repl in exact_replacements:
                        new_content = new_content.replace(exact, repl)

                    for pattern, replacement in standard_replacements:
                        new_content = pattern.sub(replacement, new_content)

                    for pattern, replacement in replacements:
                        new_content = pattern.sub(replacement, new_content)
                    
                    # Pass 2: Categorized path resolution for commands
                    # We need to find @references/commands/cmd.md and fix it
                    def fix_cmd_path(match):
                        p = match.group(1)
                        cmd_filename = os.path.basename(p)
                        cmd_name = cmd_filename[:-3] if cmd_filename.endswith('.md') else cmd_filename
                        category = get_command_category(cmd_name)
                        # Special case for modular or injected
                        if 'modular' in p: category = 'modular'
                        if cmd_name == 'gsd-tools': category = 'system'
                        return f"@references/commands/{category}/{cmd_filename}"

                    new_content = re.sub(r'@references/commands/([^/\s]+?\.md)', fix_cmd_path, new_content)
                    
                    if new_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"  ⚠️ Error processing {file_path}: {e}")
    
    # Metadata Injection
    for root, dirs, files in os.walk(target_base):
        for file in files:
            file_path = os.path.join(root, file)
            if file.endswith('.md') and 'commands' in root:
                inject_metadata(file_path, version)

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
                    # Format section headers as bold (section titles in 1.32.0 ends with :)
                    if re.match(r'^[A-Z][a-zA-Z\s]+:$', line):
                        extracted.append(f"\n#### {line}")
                    elif re.match(r'^\s*([a-zA-Z0-9_-]+)\s+', line):
                        # Indent command lines
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
        for root, dirs, files in os.walk(commands_dir):
            for f in sorted(files):
                if f.endswith('.md'):
                    cmd_name = f[:-3] # remove .md
                    file_path = os.path.join(root, f)
                    description = ""
                    try:
                        with open(file_path, 'r', encoding='utf-8') as cf:
                            text = cf.read()
                            # Parse frontmatter description
                            match = re.search(r'---[\s\S]*?description:\s*["\']?(.*?)["\']?\n[\s\S]*?---', text)
                            if match:
                                description = match.group(1).strip()
                    except Exception as e:
                        print(f"  ⚠️ Error parsing {f}: {e}")
                    
                    commands.append({'name': cmd_name, 'description': description})
    
    # Sort into categories for SKILL.md
    categorized = {}
    for cmd in commands:
        cat = get_command_category(cmd['name'])
        # If it's in a different folder than its category, we should still respect it
        # but for GSD commands we use the categorizer
        if cat not in categorized: categorized[cat] = []
        categorized[cat].append(cmd)
    
    return categorized

def create_skill_md(target_base, skill_name, version):
    skill_md_path = os.path.join(target_base, 'SKILL.md')
    
    # Locate the template file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, '..', 'assets', 'gsd_skill_template.md')
    
    categorized_commands = scan_commands(target_base)
    
    # Flatten for triggers
    all_commands = []
    for cat in categorized_commands:
        all_commands.extend(categorized_commands[cat])
    
    # Format for triggers: - `gsd:command`
    command_triggers_str = "\n".join([f"- `gsd:{cmd['name']}`" for cmd in sorted(all_commands, key=lambda x: x['name'])])
    
    # Format for detailed list: categorized bold command name with link
    commands_list_str = ""
    for cat in sorted(categorized_commands.keys()):
        commands_list_str += f"\n### {cat.capitalize()} Commands\n"
        for cmd in categorized_commands[cat]:
            commands_list_str += f"- **[`gsd:{cmd['name']}`](references/commands/{cat}/{cmd['name']}.md)**: {cmd['description']}\n"

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
        
        # Use .replace() instead of .format() to avoid issues with literal braces in the template
        content = template_content.replace('{skill_name}', skill_name) \
                                   .replace('{version}', version) \
                                   .replace('{title_name}', title_name) \
                                   .replace('{date}', date_str) \
                                   .replace('{command_triggers}', command_triggers_str) \
                                   .replace('{commands_list}', commands_list_str)

    with open(skill_md_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  ✅ Created SKILL.md from template with updated commands")

def run_regression_tests(target_base):
    """Run Phase 2 regression tests on the generated skill."""
    print("🧪 Running regression tests...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_script = os.path.join(script_dir, 'regression_test.py')
    
    if not os.path.exists(test_script):
        # Create it if it doesn't exist (self-bootstrapping for this turn)
        with open(test_script, 'w', encoding='utf-8') as f:
            f.write("""import os, re, sys
def test_skill(base):
    print(f"  Checking {base}...")
    errors = []
    # 1. Check categorized paths
    cmd_dir = os.path.join(base, 'references', 'commands')
    if not os.path.exists(cmd_dir): return ["Commands dir missing"]
    
    for root, dirs, files in os.walk(cmd_dir):
        for f in files:
            if f.endswith('.md'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Check metadata
                    if 'gsd-source-version' not in content:
                        errors.append(f"Missing metadata in {f}")
                    # Check internal inclusions
                    inclusions = re.findall(r"@references/commands/([^/]+?\\\\.md)", content)
                    if inclusions:
                        # Find where they should be
                        cmd_name = inclusions[0][:-3]
                        category = get_command_category(cmd_name)
                        errors.append(f"Broken inclusive path in {f}: {inclusions[0]}. Should be {category}/{inclusions[0]}")
    return errors

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.'
    errs = test_skill(target)
    if errs:
        for e in errs: print(f"  ❌ {e}")
        sys.exit(1)
    print("  ✅ Regression tests passed.")
""")

    try:
        result = subprocess.run(
            [sys.executable, test_script, target_base],
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Regression tests failed!")
        print(e.stdout)
        print(e.stderr)
        return False
    return True

def discover_source_structure(source_base):
    """Scan .claude for directories and identify unmapped ones."""
    print("🔍 Discovering source structure...")
    mappings = [
        'commands/gsd/',
        'get-shit-done/references/',
        'get-shit-done/workflows/',
        'get-shit-done/contexts/',
        'agents/',
        'get-shit-done/templates/',
        'get-shit-done/bin/',
        'hooks/',
        'skills/'
    ]
    
    # Directories we expect to see as parents but aren't mapped directly
    allowed_parents = ['', 'commands', 'get-shit-done']
    
    unmapped = []
    for root, dirs, files in os.walk(source_base):
        rel_root = os.path.relpath(root, source_base).replace('\\', '/')
        if rel_root == '.': rel_root = ''
        
        if rel_root not in allowed_parents and not any(rel_root.startswith(m.strip('/')) for m in mappings):
            # This dir itself might be unmapped
            if rel_root + '/' not in mappings:
                unmapped.append(rel_root)
        
        # Check subdirs of current root
        for d in dirs:
            full_rel = os.path.join(rel_root, d).replace('\\', '/') + '/'
            if full_rel not in mappings and os.path.dirname(full_rel.strip('/')) in allowed_parents:
                unmapped.append(full_rel)
    
    # Deduplicate and filter out parents
    unmapped = sorted(list(set([u for u in unmapped if u.strip('/') not in allowed_parents])))
    
    if unmapped:
        print(f"  ⚠️ Found unmapped directories in source: {', '.join(unmapped)}")
    else:
        print("  ✅ All recognized source directories are mapped.")
    return unmapped

def audit_spec(manifest):
    """Verify code mappings against internal mapping.md documentation."""
    print("📋 Auditing code against spec (mapping.md)...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    mapping_md_path = os.path.abspath(os.path.join(script_dir, '..', 'references', 'mapping.md'))
    
    if not os.path.exists(mapping_md_path):
        print("  ⚠️ mapping.md not found, skipping spec audit.")
        return True

    try:
        with open(mapping_md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Simple extraction of | .claude/path | ... |
        spec_paths = re.findall(r'\|\s*`\.claude/(.*?)`\s*\|', content)
        code_paths = [m['source'] for m in manifest['mappings']]
        
        mismatches = []
        for sp in spec_paths:
            if sp not in code_paths:
                mismatches.append(f"Spec path '{sp}' missing in code")
        for cp in code_paths:
            if cp not in spec_paths:
                mismatches.append(f"Code path '{cp}' missing in spec")
        
        if mismatches:
            print("  ❌ Spec Audit Failed:")
            for m in mismatches:
                print(f"    - {m}")
            return False
        
        print("  ✅ Code mappings are in sync with mapping.md.")
        return True
    except Exception as e:
        print(f"  ⚠️ Error during spec audit: {e}")
        return False

def verify_migration(target_base):
    """Pre-flight check for the migrated skill."""
    print("🛡️ Verifying migrated skill integrity...")
    checks = [
        (os.path.join(target_base, 'bin', 'gsd-tools.cjs'), "GSD Tools CLI"),
        (os.path.join(target_base, 'bin', 'help-manifest.json'), "Help Manifest"),
        (os.path.join(target_base, 'references', 'commands'), "Commands Directory"),
        (os.path.join(target_base, 'references', 'agents', 'profiles'), "Context Profiles"),
        (os.path.join(target_base, 'references', 'agents'), "Agents Directory"),
        (os.path.join(target_base, 'SKILL.md'), "Skill Specification")
    ]
    
    failures = []
    for path, label in checks:
        if not os.path.exists(path):
            failures.append(f"Missing {label}: {path}")
            
    # Check if commands dir is empty
    cmd_dir = os.path.join(target_base, 'references', 'commands')
    if os.path.exists(cmd_dir) and not os.listdir(cmd_dir):
        failures.append("Commands directory is empty - migration likely failed to copy core prompts.")
        
    if failures:
        print("  ❌ Verification Failed:")
        for f in failures:
            print(f"    - {f}")
        return False
    
    print("  ✅ Skill integrity verified.")
    return True

def sync_mapping_docs(target_base, manifest):
    """Regenerate mapping.md from manifest to ensure documentation is always in sync."""
    print("📝 Syncing mapping.md documentation from manifest...")
    
    docs_to_sync = [
        os.path.join(target_base, 'references', 'mapping.md')
    ]
    
    # Also sync the converter's own reference if it exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    internal_mapping = os.path.abspath(os.path.join(script_dir, '..', 'references', 'mapping.md'))
    if os.path.exists(internal_mapping):
        docs_to_sync.append(internal_mapping)
    
    content = [
        "# Path Mapping Reference",
        "",
        "When converting from a standard GSD installation to an Antigravity Skill, paths are refactored to ensure the skill is self-contained and portable.",
        "",
        "## Directory Mapping",
        "",
        "| Source GSD Path | Target Skill Path | Purpose |",
        "|-----------------|-------------------|---------|"
    ]
    
    for m in manifest['mappings']:
        content.append(f"| `.claude/{m['source']}` | `{m['target']}` | {m['purpose']} |")
    
    content.extend([
        "",
        "## Project Context",
        "References to `@.planning/` are **preserved**, as these refer to the active project's local planning directory, not the skill's own resources.",
        "",
        "---",
        f"*Generated by gsd-converter on {datetime.now().strftime('%Y-%m-%d')}*"
    ])
    
    markdown = "\n".join(content)
    
    for path in docs_to_sync:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"  ✅ {os.path.basename(os.path.dirname(os.path.dirname(path)))} mapping.md updated.")

def main():
    args = setup_args()
    manifest = load_manifest()
    
    # Enforce 'gsd' as the skill name
    skill_name = 'gsd'
    target_base = os.path.abspath(os.path.join(args.path, skill_name))
    source_base = args.source

    # 1. Audit Spec
    audit_spec(manifest)

    # 2. Discover Structure
    unmapped_dirs = discover_source_structure(source_base)

    print(f"\n🧹 Cleaning up existing skill folder: {target_base}")
    if os.path.exists(target_base):
        # Retry logic for Windows directory locking issues
        import time
        max_retries = 3
        for i in range(max_retries):
            try:
                shutil.rmtree(target_base)
                break
            except Exception:
                if i == max_retries - 1: raise
                time.sleep(1)
    
    # 0. Capture old version
    old_version = get_gsd_version(source_base)
    
    # 1. Run the fresh GSD installation
    run_gsd_install()
    
    # 1.1 Capture new version
    new_version = get_gsd_version(source_base)
    
    # 2. Re-create the skill directory
    os.makedirs(target_base, exist_ok=True)
    
    # 3. Perform migration and refactoring
    migrate_files(source_base, target_base, manifest)
    
    refactor_content(target_base, new_version, manifest)
    sync_mapping_docs(target_base, manifest)
    optimize_gsd_tools(target_base)

    # 4. Inject Dynamic Help Manifest
    gsd_tools_source = os.path.join(source_base, 'get-shit-done/bin/gsd-tools.cjs')
    discovered_help = discover_commands(gsd_tools_source)
    
    # Dynamic gsd-tools help extraction for markdown
    gsd_tools_help_markdown = extract_gsd_tools_help(target_base)

    final_manifest = {
        "version": new_version,
        "commands": discovered_help,
        "tools_usage": gsd_tools_help_markdown
    }
    
    manifest_path = os.path.join(target_base, 'bin', 'help-manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(final_manifest, f, indent=2)
    print("  ✅ Generated help-manifest.json dynamically from source")

    # 5. Inject custom assets
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Write VERSION file to skill root
    with open(os.path.join(target_base, 'VERSION'), 'w', encoding='utf-8') as f:
        f.write(new_version)
    
    custom_assets = [(a['name'], a['target_rel']) for a in manifest.get('injected_assets', [])]
    for asset_name, target_rel in custom_assets:
        asset_path = os.path.join(script_dir, '..', 'assets', asset_name)
        target_path = os.path.join(target_base, target_rel)
        if os.path.exists(asset_path):
            print(f"  🛠️ Injecting custom asset: {asset_name}")
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            if asset_name == 'gsd-tools.md':
                with open(asset_path, 'r', encoding='utf-8') as f:
                    template = f.read()
                with open(target_path, 'w', encoding='utf-8') as f:
                    f.write(template.replace('{gsd_tools_help}', gsd_tools_help_markdown))
            else:
                shutil.copy2(asset_path, target_path)

    create_skill_md(target_base, skill_name, new_version)
    
    # 6. Final Verification
    verify_migration(target_base)

    # 7. Regression Testing
    run_regression_tests(target_base)

    # 8. Generate Report
    report_path = os.path.join(target_base, 'migration_report.md')
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# GSD Migration Report\n\n")
        f.write(f"- **Timestamp**: {datetime.now().isoformat()}\n")
        f.write(f"- **Version**: {old_version} -> {new_version}\n")
        f.write(f"- **Skill Name**: {skill_name}\n")
        if unmapped_dirs:
            f.write(f"\n### ⚠️ Unmapped Source Directories\n")
            for d in unmapped_dirs:
                f.write(f"- {d}\n")
        else:
            f.write(f"\n✅ All recognized source directories were successfully mapped and migrated.\n")
    
    print(f"\n{'='*40}")
    print(f"✨ Dynamic Skill '{skill_name}' is ready at {target_base}")
    print(f"📊 GSD Version: {old_version} -> {new_version}\n")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
