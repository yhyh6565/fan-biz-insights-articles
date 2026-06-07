# fan-biz-insights-articles — Claude Instructions

## Session start
At the start of every session, read HANDOFF.md before doing anything else.
After reading, briefly confirm: state the project name, last session date, and what's next (1-2 lines max).

## PRD
Location: blog-plan.md (in parent repo fan-biz-insights-new — not in this repo)
Last reviewed: —

## Stack
Content only — Korean-language markdown articles with frontmatter. No code. Used as a submodule in fan-biz-insights-new.

## QA Criteria
- [ ] All articles have valid frontmatter (title, keywords, categories)
- [ ] Image filenames follow the standardized naming convention

## Project rules
- No feature without a PRD entry first.

## Known issues / Do not repeat
- Scripts folder was removed from git tracking — do not re-add scripts here

## Linear
Project: **fan-biz-insights-articles** (ID: `e62d3812-abe1-44c0-8b2e-6ab50537c5c9`)
When creating any ticket for this repo, always pass `project: "fan-biz-insights-articles"`.

## Wiki type: content

---
<!-- common-rules: v1, 2026-06-07 -->
## Common Rules (auto-synced from Archive/CLAUDE.md)

### Response style
- Korean input → Korean response, English → English. Match the user's language.
- Concise by default. Go deep only when asked.
- Surface tradeoffs. Don't silently pick an interpretation.

### Branch strategy
- **Non-code changes** (docs, HANDOFF, SESSION_LOG, wiki, config, writing) → commit directly to main, no PR needed.
- **Code changes** (scripts, tools) → feature branch. Name = Linear sub-issue ID. Never commit code to main.
- Always confirm with the user before pushing to GitHub.

### Linear ticket ↔ PR structure
- Feature ticket (parent) = planning unit. Sub-issue (child) = implementation unit.
- Always set `project` field when creating tickets.

### Proactive /qa suggestion
When user signals work complete ("이제 됐다", "다 됐어", "기능 완성", "다음으로 넘어가자", "됐고"):
> "[작업명]이 완성된 것 같네요. /qa 돌릴까요?"
Only at unit-of-work completion — not after every small change.

### /eod order
1. Update HANDOFF.md
2. Append to SESSION_LOG.md
3. Update this project's row in `~/Desktop/Archive/my-second-brain/HUB.md`
4. Run wiki-updater agent (type from `## Wiki type:` above)
5. Propose Linear issue status updates
6. Git commit + push (project repo + my-second-brain)
7. Sync any changed config files to my-second-brain/docs/setup-exports/

