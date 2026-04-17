import os
import re
import sys
import io

# Force UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def get_command_category(cmd_name):
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
                try:
                    with open(path, 'r', encoding='utf-8') as file:
                        content = file.read()
                        # Check metadata
                        if 'gsd-source-version' not in content:
                            errors.append(f"Missing metadata in {f}")
                        # Check internal inclusions
                        # The regex in convert.py was r"@references/commands/([^/]+?\\.md)"
                        # but in the Python string it was "@references/commands/([^/]+?\\\\.md)"
                        # Let's use a simpler one.
                        inclusions = re.findall(r"@references/commands/([^/\s]+?\.md)", content)
                        for inc in inclusions:
                            cmd_name = inc[:-3]
                            expected_cat = get_command_category(cmd_name)
                            # Check if the inclusion is @references/commands/category/cmd.md
                            # The test in convert.py seemed to check if it's MISSING the category
                            if not re.search(f"@references/commands/[^/]+/{inc}", content):
                                errors.append(f"Broken inclusive path in {f}: {inc}. Should be {expected_cat}/{inc}")
                except Exception as e:
                    errors.append(f"Error reading {f}: {e}")
    return errors

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.agent/skills/gsd'
    errs = test_skill(target)
    if errs:
        for e in errs: 
            try:
                print(f"  ❌ {e}")
            except:
                print(f"  [ERR] {e}")
        sys.exit(1)
    print("  ✅ Regression tests passed.")
