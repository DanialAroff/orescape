import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { pathToFileURL } from "node:url";
import { withAutoTitle } from "./lib/auto-title-loader";

// Point this at any Obsidian vault (or a folder within one) to publish its
// notes under /vault. Unset by default so the collection is just empty
// until someone opts in. glob() needs a file:// URL for absolute paths
// outside the project root.
const vaultPath = process.env.OBSIDIAN_VAULT_PATH
  ? pathToFileURL(process.env.OBSIDIAN_VAULT_PATH).href
  : undefined;

export const collections = {
  docs: defineCollection({
    loader: withAutoTitle(
      glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
    ),
    schema: docsSchema(),
  }),
  vault: defineCollection({
    loader: vaultPath
      ? withAutoTitle(glob({ pattern: "**/*.md", base: vaultPath }))
      : async () => [],
    schema: docsSchema(),
  }),
};
