# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CPE-Mapper is a Node.js CLI tool and curated JSON database that maps software package names to their CPEs (Common Platform Enumerations) to improve vulnerability detection in SBOM files. It enriches CycloneDX JSON and SPDX JSON files with CPE mappings sourced from the NVD.

### Commands

```bash
# Install dependencies
npm install

# Run CLI
node src/cli.js apply -i <input.json> -o <output.json>

# Run all tests (Windows)
npm run wtest

# Run all tests (Unix)
npm run test

# Run a single test file
NODE_ENV=test node --test tests/commands/apply.test.js

# Run tests with coverage (Windows)
npm run wtest-cov

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix
```

### Architecture

#### Data Flow

`cli.js` → `commands/apply.js` → `parsers/manager.js` → ecosystem parsers → enriched BOM output

1. CLI parses arguments via `commander` and calls `applyCPEMappings()`
2. The `update` command optionally fetches a fresh `data/cpe-mapper.json` (compared by SHA-256 to avoid redundant downloads)
3. `ParserManager` reads the BOM, detects PURL prefixes (`pkg:maven/`, `pkg:npm/`, etc.) to identify ecosystems, and instantiates the matching parsers
4. Each parser extends `CoreParser`, which handles the lookup-and-replace loop; subclasses only implement instantiation logic
5. Matched CPEs replace the `VERSION_COMPONENT` placeholder in the database template and are written as `cpe` fields (CycloneDX) or `externalRefs` (SPDX)

#### Key Modules

- **`src/cli.js`** — entry point; `apply` and `update` subcommands via `commander`
- **`src/config.js`** — OS-aware config paths (`env-paths`); reads `CUSTOM_DB_*` env vars
- **`src/commands/apply.js`** — orchestrates load → detect → parse → write
- **`src/commands/update.js`** — fetches database with SHA-256 freshness check
- **`src/parsers/manager.js`** — factory: detects ecosystems from PURLs, builds parser list
- **`src/parsers/core-parser.js`** — base class with shared CPE mapping logic
- **`src/parsers/<ecosystem>-parser.js`** — one file per ecosystem (maven, npm, pypi, nuget, cargo, apk, deb)
- **`src/utils/utils-bom.js`** — detects BOM format via `bomFormat` (CycloneDX) or `spdxVersion` (SPDX)
- **`data/cpe-mapper.json`** — the mapping database, keyed by ecosystem (`maven.packages`, `npm.packages`, …)

#### Database Schema

Each entry in `data/cpe-mapper.json`:
```json
{
  "name": "tomcat-embed-core",
  "group": "org.apache.tomcat.embed",
  "cpe": "cpe:2.3:a:apache:tomcat:VERSION_COMPONENT:*:*:*:*:*:*:*",
  "description": "...",
  "evidence": ["https://..."]
}
```

- Maven packages identify by `group:name`; all other ecosystems identify by `name` alone
- `VERSION_COMPONENT` is replaced at runtime with the component's actual version
- CPE mappings target the **core** package of a project to avoid missing CVEs (may produce false positives for sibling packages)

#### Test Structure

Tests mirror `src/` under `tests/` and use Node's built-in `node:test` module. Test fixtures live in `testdata/` with `cyclonedx/` and `spdx/` subdirectories. Integration tests diff generated output against checked-in expected files.

## Behavior

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.