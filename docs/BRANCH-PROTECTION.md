# Branch Protection Setup

## Required Configuration for `develop` branch

### Steps

1. Go to **Settings → Branches → Add branch protection rule**
2. Branch name pattern: `develop`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add required status checks:
   - `Node 18.x on ubuntu-latest`
   - `Node 20.x on ubuntu-latest`
   - `Node 22.x on ubuntu-latest`
   - `Node 18.x on windows-latest`
   - `Node 20.x on windows-latest`
   - `Node 22.x on windows-latest`
5. Save changes

### Verification

After enabling, any PR to `develop` will show required checks.
A PR cannot merge if any test, lint, or format check fails.

### Notes

- The CI workflow name is "CI" (defined in `.github/workflows/ci.yml`)
- Status check names follow the pattern: `Node {version} on {os}`
- Windows checks ensure cross-platform compatibility

---

## Automated Release Setup

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Purpose | How to get |
|--------|---------|------------|
| `NPM_TOKEN` | Authenticate `npm publish` | Run `npm token create` locally, copy the token |

> Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions — no configuration needed.

### How to Release

**Automated (recommended):**
1. Bump version in `package.json`
2. Commit: `git commit -am "chore: release vX.Y.Z"`
3. Tag: `git tag vX.Y.Z`
4. Push: `git push && git push --tags`
5. GitHub Actions automatically: validates → publishes to npm → creates GitHub Release

**Manual (alternative):**
```powershell
.agent/skills/release-manager/scripts/release.ps1 -version "X.Y.Z"
```

### Verification

After pushing a tag, check:
- **Actions tab** → "Release" workflow should show green
- **npm** → `npm info gsd-antigravity-kit` shows new version
- **GitHub Releases** → New release with auto-generated notes
