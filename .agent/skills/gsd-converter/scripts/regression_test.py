import os, re, sys
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
                    inclusions = re.findall(r"@references/commands/([^/]+?\\.md)", content)
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
