// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
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
      ],
    }),
  ],
});
