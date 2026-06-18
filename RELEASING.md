# Releasing

`@a2ra/core` and `@a2ra/cli` are published to npm with
[Changesets](https://github.com/changesets/changesets). The project is currently in **pre-release
mode** under the `preview` dist-tag, so published versions look like `0.1.0-preview.N` and a plain
`npm install @a2ra/core` will **not** pick them up — consumers opt in with `@a2ra/core@preview`.

## One-time setup

Add an npm **automation** access token as the `NPM_TOKEN` repository secret
(GitHub → Settings → Secrets and variables → Actions). The token must belong to a member of the
`a2ra` npm org with publish rights. The release workflow uses it to authenticate `pnpm publish`.

## Day-to-day flow

1. Make your change in a feature branch.
2. Record the release intent:

   ```bash
   pnpm changeset
   ```

   Pick the affected packages and a bump type (patch/minor/major), and write a one-line summary.
   Commit the generated file in `.changeset/`.
3. Open a PR and merge it to `main`.

On every push to `main` the **Release** workflow runs the Changesets action:

- If unreleased changesets exist, it opens (or updates) a **"chore(release): version packages"** PR
  that applies the version bumps and updates each `CHANGELOG.md`.
- When that version PR is merged, the workflow builds and runs `changeset publish`, which publishes
  the bumped packages to npm under the `preview` dist-tag.

## Leaving pre-release

When the API is ready for a stable line:

```bash
pnpm changeset pre exit
pnpm changeset version   # produces stable versions, e.g. 0.1.0
```

Commit the result; the next merge to `main` publishes the stable versions under `latest`. Remember to
remove the `"tag": "preview"` entry from each package's `publishConfig` at that point.
