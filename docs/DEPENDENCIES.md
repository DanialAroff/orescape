# Dependencies

Everything in `package.json`'s `dependencies` except `astro` and `@astrojs/starlight` (the framework itself), with what each one is actually doing in this codebase.

### `gray-matter` (^4.0.3)

Used in [`src/lib/vault-loader.ts`](../src/lib/vault-loader.ts) to split a vault note's YAML frontmatter from its Markdown body. Wrapped in a `try/catch` there on purpose: Obsidian notes commonly use a bare `---` as a thematic break rather than frontmatter, and real vaults will have notes where that leading `---` isn't valid YAML. When parsing fails, the whole file is treated as plain body instead of aborting the build.

### `remark-obsidian-md` (^1.1.0)

Registered in `astro.config.mjs` under `markdown.remarkPlugins`. Runs as part of the site's Markdown pipeline and transforms Obsidian-flavored syntax into standard HTML:

- `[[wikilinks]]` → resolved links
- `![[embeds]]` → images/notes
- `> [!callout]` blocks → styled callout boxes
- `==highlights==` → `<mark>`
- frontmatter → an optional rendered "properties" panel

This is what lets vault notes exported straight from Obsidian render correctly instead of showing raw `[[...]]` syntax.

### `sharp` (^0.34.2)

Not imported anywhere in our source. It's the image processing library Astro's built-in asset pipeline (`astro:assets`) uses under the hood to resize/transcode images (e.g. `src/assets/houston.webp`) at build time. Astro picks it up automatically as long as it's installed.
