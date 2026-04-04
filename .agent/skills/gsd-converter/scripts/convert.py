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

def migrate_files(source_base, target_base):
    print(f"🚀 Starting migration from {source_base} to {target_base}...")
    
    # Define mappings (source_rel, target_rel)
    mappings = [
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

    # Recursive Skill Migration (new in 1.32.0)
    skills_src = os.path.join(source_base, 'skills')
    commands_tgt = os.path.join(target_base, 'references/commands')
    if os.path.exists(skills_src):
        print(f"  📁 Migrating modular skills -> references/commands")
        os.makedirs(commands_tgt, exist_ok=True)
        for skill_dir in os.listdir(skills_src):
            s_full = os.path.join(skills_src, skill_dir)
            if os.path.isdir(s_full):
                skill_md = os.path.join(s_full, 'SKILL.md')
                if os.path.exists(skill_md):
                    # Flatten into references/commands/gsd-name.md
                    # Clean up the name (remove gsd- prefix if present for redundancy, or keep it)
                    target_name = skill_dir + '.md'
                    shutil.copy2(skill_md, os.path.join(commands_tgt, target_name))

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
        # Skill-relative internal references
        (r'@.*?\.claude/commands/gsd/', '@references/commands/'),
        (r'@.*?\.claude/get-shit-done/references/', '@references/docs/'),
        (r'@.*?\.claude/get-shit-done/workflows/', '@references/workflows/'),
        (r'@.*?\.claude/get-shit-done/templates/', '@assets/templates/'),
        (r'@.*?\.claude/agents/', '@references/agents/'),
        (r'@.*?\.claude/hooks/', '@bin/hooks/'),

        # Local filesystem paths
        (r'\.?/?.*?\.claude/agents/', 'references/agents/'),
        (r'\.?/?.*?\.claude/get-shit-done/templates/', 'assets/templates/'),
        (r'\.?/?.*?\.claude/get-shit-done/workflows/', 'references/workflows/'),
        (r'\.?/?.*?\.claude/get-shit-done/bin/', '.agent/skills/gsd/bin/'),
        (r'\.?/?.*?\.claude/hooks/', '.agent/skills/gsd/bin/hooks/'),

        # Rebranding
        (r'\bClaude Code\b', 'Antigravity'),
        (r'\bClaude\b', 'Antigravity'),
        (r'\bclaude\b', 'antigravity'),
        (r'\bCLAUDE\b', 'ANTIGRAVITY'),
        (r'generate-antigravity-profile', 'generate-antigravity-profile'), # Ensure double rebrands don't break
        (r'generate-antigravity-md', 'generate-antigravity-md'),
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
                try:
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
                except Exception as e:
                    print(f"  ⚠️ Error processing {file_path}: {e}")
    
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
        for f in sorted(os.listdir(commands_dir)):
            if f.endswith('.md'):
                cmd_name = f[:-3] # remove .md
                file_path = os.path.join(commands_dir, f)
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
    return commands

def create_skill_md(target_base, skill_name, version):
    skill_md_path = os.path.join(target_base, 'SKILL.md')
    
    # Locate the template file relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, '..', 'assets', 'gsd_skill_template.md')
    
    commands = scan_commands(target_base)
    
    # Format for triggers: - `gsd:command`
    command_triggers_str = "\n".join([f"- `gsd:{cmd['name']}`" for cmd in commands])
    
    # Format for detailed list: bold command name with link, then description
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
            content = template_content

    with open(skill_md_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("  ✅ Created SKILL.md from template with updated commands")

def main():
    args = setup_args()
    
    # Enforce 'gsd' as the skill name
    skill_name = 'gsd'
    target_base = os.path.abspath(os.path.join(args.path, skill_name))
    source_base = args.source

    print(f"🧹 Cleaning up existing skill folder: {target_base}")
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
    migrate_files(source_base, target_base)
    
    refactor_content(target_base)
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
    custom_assets = [
        ('gsd-tools.md', 'references/commands/gsd-tools.md'),
    ]
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
    
    print(f"\n{'='*40}")
    print(f"✨ Dynamic Skill '{skill_name}' is ready at {target_base}")
    print(f"📊 GSD Version: {old_version} -> {new_version}\n")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
