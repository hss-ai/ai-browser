# ai-browser — Agent Configuration
# Powered by Trellis (Outcome-Driven Development)

## Canonical Source

This file is the bootstrap, not the full method.

When Trellis is activated, treat these as the authoritative instructions:
- `plugins/trellis/skills/trellis/SKILL.md` in Codex
- `.opencode/trellis/SKILL.md` in OpenCode
- `docs/plan.md`
- `docs/outcomes/`
- `.odd/state.json`

Do not restate the whole methodology here. Read the canonical files and execute them.

## How to Start Trellis

**In Codex:** Type `use Trellis`, `start Trellis`, or `begin Trellis`.
Use `Trellis status` for a state check, `Trellis build` to continue the build flow, and `Trellis debug` to investigate a failing outcome without leaving Trellis.

**In OpenCode:** Type `/trellis`.

When activated, read the Trellis skill, run the startup state check exactly as written, and keep the kickoff concise.

## Session Start Protocol

Every new session begins with an explicit Trellis kickoff.

Do not skip straight to persona naming or build questions.

If this is a new project:
- Display the compact Trellis kickoff from the skill before asking planning questions
- Wait for the user to begin planning, or if they clearly want to begin immediately, execute the `*plan` protocol
- When `*plan` routes to Diana for the first persona, ask for:
  - the system purpose
  - who uses or is affected by it
  - which person has the hardest constraints or highest stakes
- Summarise the product frame in up to 3 bullets before asking for the first persona name

If this is a returning project:
- Display the returning project status message from the skill
- Then continue from the appropriate Trellis stage

Planning default:
- ask one focused question at a time
- keep summaries short
- explain in depth only when the user asks `*why`

## Non-Negotiables

- Use domain language only when describing problems, verification, and outcomes
- Do not build outcomes whose dependencies are not yet verified
- Run the full verification walkthrough before marking an outcome complete
- Commit only after a verified outcome with message `Outcome [N] [name] — verified`
- Never force-push, never skip hooks, never commit `.env` files
- Use `Trellis debug` or `*debug` for defects inside the active outcome flow
- Return to verification from step one after every fix

## Build Context

Before build work, read:
1. `docs/plan.md`
2. `docs/outcomes/` for the active phase
3. `.odd/state.json`

If present and relevant, also read:
4. `docs/architecture.md`
5. `docs/ui/design-system.md`
6. `docs/contract-map.md`

## File Organisation

- `docs/personas/` — persona documents
- `docs/outcomes/` — outcome documents
- `docs/plan.md` — Master Implementation Plan
- `docs/contract-map.md` — contracts and dependency graph
- `docs/architecture.md` — technical architecture
- `docs/ui/design-system.md` — design system
- `docs/ui/` — UI specifications
- `docs/session-brief-[N].md` — build handoff briefs
- `.odd/state.json` — project state
- `src/` — source code
- `tests/` — tests
