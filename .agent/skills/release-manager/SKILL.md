---
name: release-manager
description: Orchestrate the transition from "ready" to "released" for GSD-Antigravity. Manage version numbers in package.json, update changelogs, build release artifacts, and trigger Git/NPM releases. Triggers on keywords like 'release', 'tagging', 'versioning', 'changelog update', and intents like 'perform a release' or 'prepare v1.0.1'.
---

# Release Manager (GSD-Antigravity)

Comprehensive guide for managing the software release lifecycle for **gsd-antigravity-kit**, ensuring data integrity, documentation synchronization, and a zero-mistake Git tagging and NPM publishing process.

## 🛑 Manual Trigger Only
**CRITICAL**: This skill must **NOT** be executed automatically after feature implementation. It is a manual process to be initiated **ONLY** when the user explicitly requests a "Release", "New Version", or "Distribution".

1.  Implement features/fixes as requested.
2.  **WAIT** for an explicit instruction to "Release" or "Tag" before starting Phase 1.

## Purpose
To provide a deterministic, multi-phase procedure for transitioning the codebase from a "ready" state to a "tagged and released" state on GitHub and NPM.

## Prerequisites
- **GitHub CLI (`gh`)**: 
    - Check for local install: `.agent\skills\release-manager\bin\gh.exe`
    - Check for global install: `gh`
- **Authenticated**: Must be logged in (`.\.agent\bin\gh.exe auth login` or `gh auth login`).
- **NPM**: Must be logged in to publish (`npm whoami`).

## 🚀 Release Workflow

### Phase 0: Readiness Check (CRITICAL)
Before starting a release, ensure the following:
1.  **Git Cleanliness**: Ensure `git status` is clean (no uncommitted changes except release prep).
2.  **GSD Sync**: Run the converter to ensure `.agent/skills/gsd` is up-to-date with the latest `gsd-tools` discovery logic.
    ```powershell
    py .agent/skills/gsd-converter/scripts/convert.py gsd
    ```
3.  **Dynamic Documentation Check**: Verify `\.agent\skills\gsd\references\commands\gsd-tools.md` contains the expected command list.
4.  **Tests**: Run `npm test` if tests are defined.
5.  **Auth Check (GitHub)**:
    ```powershell
    $ghPath = ".\.agent\skills\release-manager\bin\gh.exe"
    if (-not (Test-Path $ghPath)) { $ghPath = "gh" }
    & $ghPath auth status
    ```
6.  **Auth Check (NPM)**:
    ```powershell
    npm whoami
    ```

### Phase 1: Strategic Versioning (Auto-Increment)
Determine the next version number. If not provided by the user, **default to PATCH** (e.g., 1.0.0 -> 1.0.1).

**Command**:
```powershell
# Bump version in package.json without creating a git tag yet
npm version patch --no-git-tag-version
```

### Phase 2: Documentation Synchronization (MANDATORY)
**STOP**: You must ensure the release is fully documented before proceeding to GitHub.
1.  **Changelog**: Ensure `CHANGELOG.md` is updated with all features, fixes, and the correct version number.
2.  **Knowledgebase (KB)**: Update `docs/DEV_KNOWLEDGEBASE.md` using the **Knowledgebase Update Protocol**:
    *   **Input**: Read `CHANGELOG.md` and `git log` for "Fixed" items.
    *   **Analysis**: For each fix, identify **Context**, **Issue**, **Root Cause**, and **Technical Fix**.
    *   **Output**: Append details under the version header in `docs/DEV_KNOWLEDGEBASE.md`.
3.  **README**: Update `README.md` if any instructions or version badges need changing.
4.  **Verification**: Do not run Git commits or `gh release` until these files are saved and verified.

### Phase 3: Archive & Package
Create the release artifact for GitHub (Source Zip):
1.  **Get Version**:
    ```powershell
    $package = Get-Content package.json | ConvertFrom-Json
    $ver = $package.version
    ```
2.  **Archive**: Zip the repository content. We exclude local project data (`.planning`, `.antigravity`, `__tobedeleted`) and temporary Git files to keep the release clean.
    ```powershell
    $packageName = $package.name
    Compress-Archive -Path . -DestinationPath "$packageName`_v$ver.zip" -Force -Exclude "node_modules", ".git", "__tobedeleted", "*.zip", ".antigravity", ".planning", "*.bak"
    ```

### Phase 4: Release Execution
1.  **Commit**: Commit the version bump and doc updates: `git commit -am "chore: release v$ver"`
2.  **Tag**: Create a git tag: `git tag "v$ver"`
3.  **Push**: Push commits and tags: `git push && git push --tags`

### Phase 5: GitHub Release (Automatic upload)
Automatically create the release and upload the archive zip file.

**Fix for Upload Issues**:
We disable HTTP/2 (`$env:GODEBUG="http2client=0"`) to prevent "request body larger than specified content length" errors.

**Command**:
```powershell
$ghPath = ".\.agent\skills\release-manager\bin\gh.exe"
if (-not (Test-Path $ghPath)) { $ghPath = "gh" }
$package = Get-Content package.json | ConvertFrom-Json
$ver = $package.version
$packageName = $package.name

$env:GODEBUG="http2client=0"
& $ghPath release create "v$ver" "$packageName`_v$ver.zip" --generate-notes
```

### Phase 6: NPM Publication
If the project is a package, publish it to the NPM registry to enable `npx` usage.

**Command**:
```powershell
# For public packages
npm publish

# OR for scoped packages (e.g., @user/package)
# npm publish --access public
```

**Verification**:
```powershell
npm info gsd-antigravity-kit version
```

### Phase 7: Release Cleanup
Remove old ZIP files from the project root.
```powershell
$package = Get-Content package.json | ConvertFrom-Json
$packageName = $package.name
Get-ChildItem "$packageName`_v*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 2 | Remove-Item -Force
```

## 🛠️ Interactive Checklist
- [ ] **Phase 0: Readiness Check**
    - [ ] Git Cleanliness
    - [ ] GSD Sync (`convert.py gsd`)
    - [ ] Verify `gsd-tools.md` is dynamic/updated
    - [ ] `npm test` (if applicable)
    - [ ] `gh auth status`
    - [ ] `npm whoami`
- [ ] **Phase 1: Strategic Versioning**
    - [ ] `npm version patch --no-git-tag-version`
- [ ] **Phase 2: Documentation Synchronization**
    - [ ] Update `CHANGELOG.md`
    - [ ] Update `docs/DEV_KNOWLEDGEBASE.md` (Root Cause Analysis for fixes)
    - [ ] Update `README.md`
- [ ] **Phase 3: Archive & Package**
    - [ ] Create ZIP archive: `gsd-antigravity-kit_v1.0.X.zip`
- [ ] **Phase 4: Release Execution**
    - [ ] Git Commit & Tag
    - [ ] Git Push
- [ ] **Phase 5: GitHub Release**
    - [ ] `gh release create ...` (with `GODEBUG=http2client=0`)
- [ ] **Phase 6: NPM publication**
    - [ ] `npm publish`
- [ ] **Phase 7: Release Cleanup**
    - [ ] Remove old local ZIPs

## 🔍 Troubleshooting

| Issue | Potential Cause | Fix |
| :--- | :--- | :--- |
| **`gh` command not found** | GitHub CLI missing. | Ensure `.agent\skills\release-manager\bin\gh.exe` exists or `gh` is in PATH. |
| **Auth Error (GitHub)** | Token expired or not logged in. | Run `gh auth login`. |
| **Auth Error (NPM)** | Not logged in. | Run `npm login`. |
| **Upload Error (HTTP/2)** | `request body larger...` | Ensure `$env:GODEBUG="http2client=0"` is set. |
| **NPM Name Conflict** | Package name taken. | Update `name` in `package.json`. |
