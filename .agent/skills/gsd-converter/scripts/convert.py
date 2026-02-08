import os
import re
import shutil
import sys
import argparse
import subprocess
from datetime import datetime

def setup_args():
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
            shell=True
        )
        print("  ✅ GSD installed successfully to .claude/")
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
        ('get-shit-done/bin', 'bin')
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

def refactor_content(target_base):
    print("🔧 Refactoring file contents and paths...")
    
    replacements = [
        (r'@\./\.claude/commands/gsd/', '@references/commands/'),
        (r'@\./\.claude/get-shit-done/references/', '@references/docs/'),
        (r'@\./\.claude/get-shit-done/workflows/', '@references/workflows/'),
        (r'@\./\.claude/get-shit-done/templates/', '@assets/templates/'),
        (r'@\./\.claude/agents/', '@references/agents/'),
        (r'\./\.claude/agents/', 'references/agents/'),
        (r'\./\.claude/get-shit-done/templates/', 'assets/templates/'),
        (r'\./\.claude/get-shit-done/workflows/', 'references/workflows/'),
        (r'\./\.claude/get-shit-done/bin/', '.agent/skills/gsd/bin/'),
        (r'\bClaude Code\b', 'Antigravity'),
        (r'\bClaude\b', 'Antigravity'),
        (r'\bclaude\b', 'antigravity'),
        (r'\bCLAUDE\b', 'ANTIGRAVITY'),
    ]
    
    for root, dirs, files in os.walk(target_base):
        for file in files:
            if file.endswith('.md') or file.endswith('.json'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, replacement in replacements:
                    new_content = re.sub(pattern, replacement, new_content)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

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

def create_skill_md(target_base, skill_name):
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
    create_skill_md(target_base, skill_name)
    
    print(f"\n✨ Skill '{skill_name}' is ready at {target_base}")
    print(f"📊 GSD Version: {old_version} -> {new_version}")

if __name__ == '__main__':
    main()
