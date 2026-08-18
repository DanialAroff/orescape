// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkObsidianMd from "remark-obsidian-md";
import { vaultSidebar } from "./src/lib/vault-sidebar";

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
    remarkPlugins: vaultPath
      ? [[remarkObsidianMd, { root: vaultPath, urlPrefix: "/vault" }]]
      : [],
  },
  integrations: [
    starlight({
      title: "orescape",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
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
