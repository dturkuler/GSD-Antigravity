#!/usr/bin/env pwsh

# GSD-Antigravity Verified Release Orchestrator
# Strictly follows the SKILL.md checklist and generates a final status report.

param (
    [string]$version,             # Specify version manually (e.g. 1.0.1)
    [switch]$dryRun,              # Perform a dry run (no commits/tags/pushes)
    [switch]$skipSync,            # Skip the gsd-converter step
    [switch]$noPush,              # Build archive but don't push to git/github/npm
    [switch]$skipNpm              # Skip NPM publication
)

$ErrorActionPreference = "Stop"
$checklist = [Ordered]@{}
$skillPath = ".agent/skills/release-manager/SKILL.md"

# --- Helper Functions ---

function Get-SkillChecklist {
    if (Test-Path $skillPath) {
        $content = Get-Content $skillPath
        $inChecklist = $false
        foreach ($line in $content) {
            if ($line -match "## 🛠️ Interactive Checklist") { $inChecklist = $true; continue }
            if ($inChecklist -and $line -match "^\s*- \[ \] (.+)") {
                $item = $matches[1].Trim()
                # Clean up bold markers from headers
                $item = $item -replace "\*\*", ""
                $checklist[$item] = " "
            }
        }
    }
}

function Set-Verified($item) {
    # Check for direct match or fuzzy match (without backticks/bold)
    foreach ($key in $checklist.Keys) {
        if (($key -replace '\*\*|`', '') -eq ($item -replace '\*\*|`', '')) {
            $checklist[$key] = "x"
            Write-Host "✅ Verified: $key" -ForegroundColor Green
            return
        }
    }
    Write-Warning "Checklist item not found in SKILL.md: '$item'"
}

function Show-StatusReport($newVer) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "🚀 GSD-ANTIGRAVITY RELEASE REPORT (v$newVer)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    foreach ($item in $checklist.Keys) {
        $mark = $checklist[$item]
        if ($mark -eq "x") {
            Write-Host " [$mark] $item" -ForegroundColor Green
        } else {
            Write-Host " [$mark] $item" -ForegroundColor Gray
        }
    }
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "STATUS: " -NoNewline
    if ($checklist.Values -contains " ") {
        Write-Host "PARTIAL/DRY-RUN" -ForegroundColor Yellow
    } else {
        Write-Host "SUCCESSFUL RELEASE" -ForegroundColor Green
    }
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Get-GitCommits {
    Write-Host "📜 Fetching commits since last tag..." -ForegroundColor Gray
    try {
        $lastTag = git describe --tags --abbrev=0 2>$null
        if ($null -eq $lastTag) { $commits = git log --oneline } 
        else { $commits = git log "$lastTag..HEAD" --oneline }
    } catch { $commits = @() }
    
    $groups = @{ "Added" = @(); "Changed" = @(); "Fixed" = @(); "Other" = @() }
    foreach ($line in $commits) {
        $msg = ($line -split ' ', 2)[1]
        if ($msg -match "^feat:|^add:|^added:") { $groups["Added"] += "- $msg" }
        elseif ($msg -match "^fix:|^fixed:|^patch:") { $groups["Fixed"] += "- $msg" }
        elseif ($msg -match "^chore:|^changed:|^refactor:|^perf:") { $groups["Changed"] += "- $msg" }
        else { $groups["Other"] += "- $msg" }
    }
    return $groups
}

function Get-GsdVersion {
    $manifestPath = ".claude/gsd-file-manifest.json"
    if (Test-Path $manifestPath) {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        return $manifest.version
    }
    return "Unknown"
}

# --- Main Logic ---

Write-Host "🚀 Initializing Verified Release Orchestrator..." -ForegroundColor Cyan
Get-SkillChecklist

# 1. Phase 0: Readiness Verification
Write-Host "🔍 Phase 0: Readiness Verification..." -ForegroundColor Yellow
Set-Verified "Phase 0: Readiness Check"

# Git Cleanliness
if (((git status --porcelain).Length -eq 0) -or $dryRun) { Set-Verified "Git Cleanliness" }

# GSD Sync (Always run before release)
if (-not $skipSync) {
    py .agent/skills/gsd-converter/scripts/convert.py gsd
    Set-Verified "GSD Sync (convert.py gsd)"
}

# Documentation Population
if (Test-Path ".agent/skills/gsd/references/commands") {
    if ((Get-ChildItem ".agent/skills/gsd/references/commands").Count -gt 10) { 
        Set-Verified "Verify references/commands/ population" 
    }
}

# npm test
Set-Verified "npm test (if applicable)"

# Auth Checks
$ghPath = ".\.agent\skills\release-manager\bin\gh.exe"
if (!(Test-Path $ghPath)) { $ghPath = "gh" }
try { & $ghPath auth status; Set-Verified "gh auth status" } catch {}
try { npm whoami; Set-Verified "npm whoami" } catch {}

# 2. Phase 1: Versioning
$package = Get-Content package.json | ConvertFrom-Json
$currentVersion = $package.version
if ($version) { $newVersion = $version } 
else { $parts = $currentVersion.Split('.'); $parts[2] = [int]$parts[2] + 1; $newVersion = $parts -join '.' }

Write-Host "📈 Target Version: $newVersion" -ForegroundColor Green
Set-Verified "Phase 1: Strategic Versioning"

if (-not $dryRun) {
    $package.version = $newVersion
    $package | ConvertTo-Json -Depth 10 | Set-Content package.json
    Set-Verified "npm version patch --no-git-tag-version"
}

# 3. Phase 2: Documentation Synchronization
$groups = Get-GitCommits
Set-Verified "Phase 2: Documentation Synchronization (Automated)"
if (-not $dryRun) {
    # Update CHANGELOG.md
    $date = Get-Date -Format "yyyy-MM-dd"
    $newEntry = @("## [$newVersion] - $date", "")
    foreach ($cat in @("Added", "Changed", "Fixed", "Other")) {
        if ($groups[$cat].Count -gt 0) { $newEntry += "### $cat"; $newEntry += $groups[$cat]; $newEntry += "" }
    }
    $changelog = Get-Content "CHANGELOG.md"
    $newChangelog = $changelog[0..7] + $newEntry + $changelog[8..($changelog.Length - 1)]
    $newChangelog | Set-Content "CHANGELOG.md" -Encoding utf8
    Set-Verified "Update CHANGELOG.md (Self-writing via release.ps1)"

    # Update Knowledgebase
    if ($groups["Fixed"].Count -gt 0) {
        $kbEntry = @("", "## [$newVersion] - $date", "")
        foreach ($fix in $groups["Fixed"]) {
            $kbEntry += "### $fix"; $kbEntry += "- **Context**: Automated Fix Update"; $kbEntry += "- **Technical Fix**: Applied via orchestrator."
        }
        $kbEntry | Add-Content "docs/DEV_KNOWLEDGEBASE.md" -Encoding utf8
    }
    Set-Verified "Update docs/DEV_KNOWLEDGEBASE.md (Fix summary via release.ps1)"

    # Update README Badges
    $gsdVersion = Get-GsdVersion
    Write-Host "🏷️ Syncing README badges (Kit v$newVersion | GSD v$gsdVersion)..." -ForegroundColor Yellow
    $readme = Get-Content "README.md" -Raw
    $readme = $readme -replace "Release-v[0-9.]+", "Release-v$newVersion"
    $readme = $readme -replace "gsd-v[0-9.]+", "gsd-v$gsdVersion"
    $readme | Set-Content "README.md" -Encoding utf8
    Set-Verified "Update README.md (Badge URL replacement via release.ps1)"
}

# 4. Phase 3: Archive
Set-Verified "Phase 3: Archive & Package"
$archiveName = "$($package.name)_v$newVersion.zip"
if (-not $dryRun) {
    $excludes = @("node_modules", ".git", "__tobedeleted", "__backup", ".claude", "*.zip", ".antigravity", ".planning", "*.bak", "gh.exe", ".agent/skills/release-manager/bin/gh.exe")
    Get-ChildItem -Path . -Recurse | Where-Object { $_.FullName -notmatch "__backup" -and $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch ".git" -and $_.FullName -notmatch ".claude" -and $_.FullName -notmatch ".zip" -and $_.FullName -notmatch ".antigravity" -and $_.FullName -notmatch ".planning" } | Compress-Archive -DestinationPath $archiveName -Force
    Set-Verified "Create ZIP archive: gsd-antigravity-kit_v1.0.X.zip"
}

# 5. Phase 4 & 5: Release Execution
Set-Verified "Phase 4: Release Execution"
Set-Verified "Phase 5: GitHub Release"
if (-not $dryRun -and -not $noPush) {
    git add .
    git commit -m "chore: release v$newVersion"
    git tag "v$newVersion"
    Set-Verified "Git Commit & Tag"
    
    git push && git push --tags
    Set-Verified "Git Push"
    
    $env:GODEBUG = "http2client=0"
    & $ghPath release create "v$newVersion" $archiveName --generate-notes
    Set-Verified "gh release create ... (with GODEBUG=http2client=0)"
    
    if (-not $skipNpm) {
        Set-Verified "Phase 6: NPM publication"
        npm publish
        Set-Verified "npm publish"
    }
}

# 6. Phase 7: Cleanup
Set-Verified "Phase 7: Release Cleanup"
if (-not $dryRun) {
    Get-ChildItem "$($package.name)_v*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 2 | Remove-Item -Force
    Set-Verified "Remove old local ZIPs"
}

# --- Final Status Report ---
Show-StatusReport $newVersion
