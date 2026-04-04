#!/usr/bin/env pwsh

# GSD-Antigravity Zero-Manual Release Orchestrator
# Fully automates versioning, doc sync, archiving, and multi-channel distribution.

param (
    [string]$version,             # Specify version manually (e.g. 1.0.1)
    [switch]$dryRun,              # Perform a dry run (no commits/tags/pushes)
    [switch]$skipSync,            # Skip the gsd-converter step
    [switch]$noPush,              # Build archive but don't push to git/github/npm
    [switch]$skipNpm              # Skip NPM publication
)

$ErrorActionPreference = "Stop"

# --- Helper Functions ---

function Get-GitCommits {
    Write-Host "📜 Fetching commits since last tag..." -ForegroundColor Gray
    try {
        $lastTag = git describe --tags --abbrev=0 2>$null
        if ($null -eq $lastTag) {
            $commits = git log --oneline
        } else {
            $commits = git log "$lastTag..HEAD" --oneline
        }
    } catch {
        $commits = @()
    }
    
    $groups = @{
        "Added" = [System.Collections.Generic.List[string]]::new()
        "Changed" = [System.Collections.Generic.List[string]]::new()
        "Fixed" = [System.Collections.Generic.List[string]]::new()
        "Other" = [System.Collections.Generic.List[string]]::new()
    }

    foreach ($line in $commits) {
        $msg = ($line -split ' ', 2)[1]
        if ($msg -match "^feat:|^add:|^added:") { $groups["Added"].Add("- $msg") }
        elseif ($msg -match "^fix:|^fixed:|^patch:") { $groups["Fixed"].Add("- $msg") }
        elseif ($msg -match "^chore:|^changed:|^refactor:|^perf:") { $groups["Changed"].Add("- $msg") }
        else { $groups["Other"].Add("- $msg") }
    }
    return $groups
}

function Update-Changelog($version, $groups) {
    Write-Host "📝 Updating CHANGELOG.md..." -ForegroundColor Yellow
    $date = Get-Date -Format "yyyy-MM-dd"
    $newEntry = @("## [$version] - $date", "")
    
    foreach ($cat in @("Added", "Changed", "Fixed", "Other")) {
        if ($groups[$cat].Count -gt 0) {
            $newEntry += "### $cat"
            $newEntry += $groups[$cat]
            $newEntry += ""
        }
    }

    if (Test-Path "CHANGELOG.md") {
        $content = Get-Content "CHANGELOG.md"
        # Find the first H2 header or insert at line 8
        $insertIndex = 7 # Default position after title/intro
        $newContent = $content[0..$insertIndex] + $newEntry + $content[($insertIndex + 1)..($content.Length - 1)]
        $newContent | Set-Content "CHANGELOG.md" -Encoding utf8
    }
}

function Update-Knowledgebase($version, $groups) {
    if ($groups["Fixed"].Count -gt 0 -and (Test-Path "docs/DEV_KNOWLEDGEBASE.md")) {
        Write-Host "📘 Updating docs/DEV_KNOWLEDGEBASE.md..." -ForegroundColor Yellow
        $kbEntry = @("", "## [$version] - $(Get-Date -Format 'yyyy-MM-dd')", "")
        foreach ($fix in $groups["Fixed"]) {
            $kbEntry += "### $fix"
            $kbEntry += "- **Context**: Automated Release Update"
            $kbEntry += "- **Issue**: Detected fix in commit history."
            $kbEntry += "- **Technical Fix**: Applied as described in commit."
            $kbEntry += ""
        }
        $kbEntry | Add-Content "docs/DEV_KNOWLEDGEBASE.md" -Encoding utf8
    }
}

function Update-ReadmeBadge($newVer) {
    if (Test-Path "README.md") {
        Write-Host "🏷️ Updating README.md version badges..." -ForegroundColor Yellow
        $content = Get-Content "README.md" -Raw
        $content = $content -replace "gsd-v[0-9.]+", "gsd-v$newVer"
        $content | Set-Content "README.md" -Encoding utf8
    }
}

# --- Main Logic ---

# 1. Project Root Check
$projectRoot = Get-Location
Write-Host "🚀 Starting GSD-Antigravity Zero-Manual Release Orchestrator..." -ForegroundColor Cyan

# 2. Check Prerequisites
Write-Host "🔍 Checking prerequisites..."
if (!(Test-Path "package.json")) { Write-Error "package.json not found." }

$ghPath = ".\.agent\skills\release-manager\bin\gh.exe"
if (!(Test-Path $ghPath)) { $ghPath = "gh" }

# 3. Phase 0: GSD Sync
if (-not $skipSync) {
    Write-Host "🔄 Phase 0: Syncing GSD Components..." -ForegroundColor Yellow
    py .agent/skills/gsd-converter/scripts/convert.py gsd
}

# 4. Phase 1: Versioning
$package = Get-Content package.json | ConvertFrom-Json
$currentVersion = $package.version

if ($version) { $newVersion = $version } 
else {
    $parts = $currentVersion.Split('.')
    $parts[2] = [int]$parts[2] + 1
    $newVersion = $parts -join '.'
}

Write-Host "📈 New Version: $newVersion" -ForegroundColor Green

# 5. Phase 2: Automation (Commits & Docs)
$groups = Get-GitCommits

if (-not $dryRun) {
    $package.version = $newVersion
    $package | ConvertTo-Json -Depth 10 | Set-Content package.json
    Update-Changelog $newVersion $groups
    Update-Knowledgebase $newVersion $groups
    Update-ReadmeBadge $newVersion
} else {
    Write-Host "🧪 Dry-Run: Skipping file updates. Proposed Entries:" -ForegroundColor Gray
    Write-Host "--- Proposed Changelog Preview ---" -ForegroundColor Cyan
    Write-Host "## [$newVersion] - $(Get-Date -Format 'yyyy-MM-dd')"
    foreach ($cat in $groups.Keys) {
        if ($groups[$cat].Count -gt 0) {
            Write-Host "### $cat" -ForegroundColor DarkCyan
            foreach ($item in $groups[$cat]) { Write-Host "  $item" }
        }
    }
    Write-Host "-----------------------------------"
}

# 6. Phase 3: Archive
Write-Host "📦 Phase 3: Archiving..." -ForegroundColor Yellow
$packageName = $package.name
$archiveName = "$packageName_v$newVersion.zip"
$excludes = @("node_modules", ".git", "__tobedeleted", "*.zip", ".antigravity", ".planning", "*.bak", "gh.exe", ".agent/skills/release-manager/bin/gh.exe")
$files = Get-ChildItem -Path . -Exclude $excludes

if (-not $dryRun) {
    if (Test-Path $archiveName) { Remove-Item $archiveName -Force }
    Compress-Archive -Path $files -DestinationPath $archiveName -Force
}

# 7. Phase 4: Git + GitHub
if (-not $dryRun -and -not $noPush) {
    Write-Host "🚀 Phase 4: Git Execution..." -ForegroundColor Cyan
    git add .
    git commit -m "chore: release v$newVersion"
    git tag "v$newVersion"
    git push && git push --tags
    
    Write-Host "🌐 Phase 5: GitHub Release..." -ForegroundColor Cyan
    $env:GODEBUG = "http2client=0"
    & $ghPath release create "v$newVersion" $archiveName --generate-notes
    
    if (-not $skipNpm) {
        Write-Host "📦 Phase 6: NPM publication..." -ForegroundColor Cyan
        npm publish
    }
} else {
    Write-Host "⚠️ Phase 4, 5, 6 Skipped (Dry-Run or --noPush)" -ForegroundColor Gray
}

Write-Host "✨ Release $newVersion complete! Zero manual steps detected." -ForegroundColor Green
