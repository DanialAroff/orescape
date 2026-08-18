# orescape

A [Starlight](https://starlight.astro.build) site that publishes an Obsidian vault as a browsable docs site.

Point it at any vault (or a folder within one) and it renders your notes at `/vault`, mirroring the vault's folder structure into a nested sidebar — wikilinks, callouts, highlights, and note properties all render as you'd expect from Obsidian.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `OBSIDIAN_VAULT_PATH` to an absolute path:

   ```
   OBSIDIAN_VAULT_PATH=/path/to/your/vault
   ```

   Leave it unset to run the site without a vault attached — `/vault` is just empty.
3. `npm run dev`

## How the vault is loaded

- **`src/content.config.ts`** defines the `vault` content collection, loaded by `src/lib/vault-loader.ts`.
- **`src/lib/vault-loader.ts`** reads every `.md` file under `OBSIDIAN_VAULT_PATH`. Unlike Astro's built-in loader, a note whose leading `---` isn't valid frontmatter (common in vaults, where `---` is often just a divider) doesn't abort the build — it's logged and treated as plain body instead.
- **`src/lib/vault-sidebar.ts`** mirrors the vault's folder structure into nested Starlight sidebar groups at config time.
- **`src/lib/title.ts`** / **`src/lib/auto-title-loader.ts`** derive a title for any note or doc missing one: frontmatter `title` → first `# H1` → filename.
- **`astro.config.mjs`** registers `remark-obsidian-md` so `[[wikilinks]]`, `![[embeds]]`, `> [!callouts]`, and `==highlights==` render as HTML instead of raw syntax.

See [`docs/DEPENDENCIES.md`](docs/DEPENDENCIES.md) for what each non-framework dependency does.

## Project structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/           # Starlight's own pages (home, 404, ...)
│   ├── lib/                 # vault loader, sidebar builder, title helpers
│   ├── pages/
│   │   └── vault/            # listing + per-note routes for the vault collection
│   └── content.config.ts    # docs + vault collection definitions
├── astro.config.mjs
├── docs/
│   └── DEPENDENCIES.md
├── .env.example
└── package.json
```

Starlight looks for `.md`/`.mdx` files in `src/content/docs/`; each is exposed as a route based on its file name. Vault notes are handled separately, outside that directory (see above).

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`              | Installs dependencies                            |
| `npm run dev`              | Starts local dev server at `localhost:4321`      |
| `npm run build`            | Build the production site to `./dist/`           |
| `npm run preview`          | Preview the build locally, before deploying      |
| `npm run astro ...`        | Run CLI commands like `astro add`, `astro check` |

## Learn more

[Starlight's docs](https://starlight.astro.build/), [Astro's docs](https://docs.astro.build), [remark-obsidian-md](https://www.npmjs.com/package/remark-obsidian-md).
