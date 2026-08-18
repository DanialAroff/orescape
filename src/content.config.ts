import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { withAutoTitle } from "./lib/auto-title-loader";
import { vaultLoader } from "./lib/vault-loader";

// content.config.ts can run before Vite's .env loading kicks in, so load
// it ourselves (see astro.config.mjs for the same guard).
try {
  process.loadEnvFile();
} catch {
  // no .env file - that's fine, OBSIDIAN_VAULT_PATH is optional
}

// Point this at any Obsidian vault (or a folder within one) to publish its
// notes under /vault. Unset by default so the collection is just empty
// until someone opts in.
const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

export const collections = {
  docs: defineCollection({
    loader: withAutoTitle(
      glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
    ),
    schema: docsSchema(),
  }),
  vault: defineCollection({
    loader: vaultPath ? vaultLoader({ base: vaultPath }) : async () => [],
    schema: docsSchema(),
  }),
};
