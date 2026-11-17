# Contributing

Guidelines for Group 17 team members working on this repository.

## Workflow

1. **Open or claim an issue** describing the work.
2. **Create a branch** from the latest `main`:
   ```sh
   git checkout main
   git pull
   git checkout -b feature/short-description
   ```
   Prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `refactor/`.
3. **Commit in small, focused steps** (see below).
4. **Push your branch** and open a pull request into `main`.
5. **Get at least one teammate's review** before merging.
6. **Squash-merge or merge** through GitHub, then delete the branch.

## Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org) style:

```
feat: add year filter to timeline
fix: correct citation link on document page
docs: update setup instructions
chore: bump dependencies
```

Write in the imperative mood ("add", not "added") and keep the first line under ~72 characters.

## Before opening a PR

```sh
npm run lint
npm run build
bun test          # if you have Bun installed
```

CI runs the tests and build automatically on every pull request. (Lint isn't enforced in CI yet
because existing code still has formatting errors; run `npm run format` on files you touch.)

## Code style

- Formatting is handled by Prettier (`npm run format`). See `.prettierrc`.
- Put all data access in `src/lib/api.ts`; components shouldn't fetch data directly.
- Don't edit `src/routeTree.gen.ts` by hand; it is generated.
- Follow the routing conventions in `src/routes/README.md`.

## Working with Lovable

This repo is two-way synced with Lovable:

- Changes made in the Lovable editor are committed straight to `main`. **Pull before you branch.**
- Anything merged into `main` shows up in Lovable.
- **Never force-push, rebase, or amend commits that are already on `main`.** Doing so rewrites
  Lovable's history and can lose project work.

## Secrets

Never commit `.env` files, API keys, or credentials. Add new variables to `.env.example` with a
placeholder value and document them in the README.
