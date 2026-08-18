// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkObsidianMd from "remark-obsidian-md";

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
        {
          label: "DFoundry",
          items: [
            { label: "All Documents", link: "dfoundry" },
            { label: "Features", autogenerate: { directory: 'dfoundry/dist/digital-retail-banking/guidelines/features/' } },
            { label: "Agents", autogenerate: { directory: 'dfoundry/lab/agents/claude/' } },
          ],
        },
        ...(vaultPath
          ? [{ label: "Vault", items: [{ label: "All Notes", link: "vault" }] }]
          : []),
      ],
    }),
  ],
});
