---
name: gsd:set-profile
description: Switch model profile for GSD agents (quality/balanced/budget/inherit)
argument-hint: <profile (quality|balanced|budget|inherit)>
model: haiku
allowed-tools:
  - Bash
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---

Show the following output to the user verbatim, with no extra commentary:

!`gsd-sdk query config-set-model-profile $ARGUMENTS --raw`
