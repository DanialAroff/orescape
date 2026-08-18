// @ts-check
import path from "node:path";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkObsidianMd from "remark-obsidian-md";
import { vaultSidebar } from "./src/lib/vault-sidebar";

function normalizePath(p) {
  const resolved = path.resolve(p);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

// remark-obsidian-md's transforms (wikilinks, callouts, highlights, and a
// rendered frontmatter "properties" panel) only make sense for vault notes.
// Registering it bare in markdown.remarkPlugins would run it on every
// Markdown/MDX file site-wide - including Starlight's own pages, where its
// frontmatter panel dumps title/description/hero as a stray box on the
// page (this broke index.mdx). Only run it on files under the vault.
function remarkObsidianForVault(vaultPath) {
  const vaultRoot = normalizePath(vaultPath);
  const transform = remarkObsidianMd({ root: vaultPath, urlPrefix: "/vault" });
  return (tree, file) => {
    if (!file.path || !normalizePath(file.path).startsWith(vaultRoot)) return;
    return transform(tree, file);
  };
}

// astro.config.mjs and content.config.ts run before Vite's .env loading
// kicks in, so process.env won't have .env values yet unless we load it
// ourselves.
try {
  process.loadEnvFile();
} catch {
  // no .env file - that's fine, OBSIDIAN_VAULT_PATH is optional
}

// Same env var as src/content.config.ts's `vault` collection - point it at
// any Obsidian vault (or folder within one) to publish its notes.
const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: vaultPath ? [() => remarkObsidianForVault(vaultPath)] : [],
  },
  integrations: [
    starlight({
      title: "orescape",
      logo: {
        src: "./src/assets/orescape.svg",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/DanialAroff/orescape",
        },
      ],
      sidebar: [
        ...(vaultPath
          ? [
              {
                label: "My Vault",
                items: [
                  { label: "All Notes", link: "vault" },
                  ...vaultSidebar(vaultPath),
                ],
              },
            ]
          : []),
      ],
    }),
  ],
  vite: {
    server: {
      watch: {
        ignored: ['!D:/My Drive/Obsidian/Personal and Study']
      }
    }
  }
});
