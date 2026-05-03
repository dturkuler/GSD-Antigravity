# Performance Benchmarks

This document tracks the performance metrics for the GSD-Antigravity CLI across versions to prevent regressions.

## Regression Thresholds

- **Warning**: +15% over baseline
- **Failure (CI Gate)**: +25% over baseline

## Baselines

### v2.1.0 (Baseline Reference)
- **Startup Time**: ~120ms (measured via `hyperfine 'gsd-tools --help'`)
- **Memory Usage**: ~45MB RSS
- **Token Count (Core)**: ~15,000 tokens

### v2.2.0 (Phase 1 Target)
- **Startup Time**: TBD
- **Memory Usage**: TBD
- **Token Count (Core)**: TBD

## How to Measure

1. **Startup Time**:
   ```bash
   hyperfine --warmup 3 'node .agent/skills/gsd/bin/gsd-tools.cjs --help'
   ```
2. **Memory Usage**:
   Tracked via Node's `process.memoryUsage()` on CLI exit.
