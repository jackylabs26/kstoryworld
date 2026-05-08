# Commit Message SOP

## Purpose

Cloudflare Pages deploys for KStoryWorld must not depend on raw non-ASCII Git commit metadata. A deploy failure on May 8, 2026 showed that Pages deployment creation can reject commit messages with `Invalid commit message, it must be a valid UTF-8 string. [code: 8000111]` even when the Git commit itself is otherwise usable.

## Required policy

- Commits that will merge to `main` must use ASCII-only commit subjects and bodies.
- The deploy workflow sends an explicit ASCII-only `--commit-message` to Wrangler, but authors should still keep merge commits ASCII-safe so preflight checks stay green.
- When writing Korean context, move that detail into the PR description, issue comment, or docs instead of the Git commit message.

## Enforcement

- CI deploy gate: `.github/workflows/deploy.yml`
- Local/manual gate: `scripts/pre-deploy-check.sh`
- Validator: `scripts/validate-commit-message.sh`

## Standard flow

1. Work from the assigned Paperclip workspace or the correct repository worktree.
2. Confirm the target branch before editing or committing.
3. Run `scripts/validate-commit-message.sh HEAD` before pushing if the branch will merge to `main`.
4. If the validator fails, rewrite the commit message in ASCII before merge.

## Examples

- Good: `JAC-2137: fix Cloudflare Pages deploy commit metadata`
- Good: `JAC-2125: tighten StoryCard category typing`
- Bad: `JAC-2131: KO title·meta 재작성 34건`
- Bad: `JAC-2128 + JAC-2133: content title/meta guidelines (5+1 patterns + new categories)`
