import { glob as globFiles, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import type { Loader } from "astro/loaders";
import { titleFromFilename, titleFromH1 } from "./title";

/**
 * Loads Markdown files from an arbitrary folder (an Obsidian vault, or a
 * subfolder of one). Unlike Astro's built-in glob() loader, a file whose
 * leading `---` block isn't valid YAML (very common in vaults, where `---`
 * is often just a thematic break in the note body, not frontmatter) is
 * logged and treated as a plain body instead of aborting the whole build.
 */
export function vaultLoader({
  base,
  pattern = "**/*.md",
}: {
  base: string;
  pattern?: string;
}): Loader {
  return {
    name: "vault-loader",
    load: async ({ store, parseData, generateDigest, renderMarkdown, logger }) => {
      const seenIds = new Set<string>();

      for await (const file of globFiles(pattern, { cwd: base })) {
        const filePath = path.join(base, file);
        const raw = await readFile(filePath, "utf-8");

        let data: Record<string, unknown> = {};
        let content = raw;
        try {
          ({ data, content } = matter(raw));
        } catch (err) {
          logger.warn(
            `${file}: leading "---" isn't valid frontmatter, treating the whole file as body (${(err as Error).message})`,
          );
        }

        if (!data.title) {
          data = { ...data, title: titleFromH1(content) ?? titleFromFilename(file) };
        }

        // A leading "---" line that gray-matter didn't treat as frontmatter
        // is just a thematic break in the note body (or the remainder of
        // frontmatter whose YAML failed to parse above). Astro's own
        // markdown pipeline re-detects a leading "---" as frontmatter
        // regardless of what gray-matter decided - a leading blank line
        // doesn't stop it, since its regex is `^\s*` before the dashes -
        // so swap it for "***", which renders the same thematic break
        // without being ambiguous with frontmatter syntax.
        content = content.replace(/^﻿?\s*-{3,}[ \t]*\r?\n/, "***\n");

        const id = file.replace(/\.md$/i, "").split(path.sep).join("/");
        seenIds.add(id);

        const parsedData = await parseData({ id, data, filePath });
        const rendered = await renderMarkdown(content, {
          fileURL: pathToFileURL(filePath),
        });
        store.set({
          id,
          data: parsedData,
          body: content,
          filePath,
          digest: generateDigest(raw),
          rendered,
        });
      }

      for (const id of store.keys()) {
        if (!seenIds.has(id)) store.delete(id);
      }
    },
  };
}
