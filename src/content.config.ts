import { defineCollection } from "astro:content";
// import { docsLoader } from "@astrojs/starlight/loaders";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { pathToFileURL } from "node:url";
import { docsSchema } from "@astrojs/starlight/schema";
import path from "node:path";

const dfoundryBase = pathToFileURL(
  "C:/Danial/AI/Code Test Generation/DFoundry/dist/digital-retail-banking",
).href;

const docsLoader = glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' });

const patchedLoader = {
  ...docsLoader,
  load: async (ctx: any) => {
    const orig = ctx.parseData;
    ctx.parseData = async (entry: any) => {
      if (!entry.data?.title) {
        const h1 = entry.body?.match(/^#\s+(.+)$/m)?.[1];
        const fromName = path
          .basename(entry.id, path.extname(entry.id))
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
		entry.data = { ...entry.data, title: h1 ?? fromName }
      }
	  return orig(entry);
    };
	return docsLoader.load(ctx);
  },
};

export const collections = {
  docs: defineCollection({
    loader: patchedLoader,
    schema: docsSchema(),
    // schema: z.object({
    // 	title: z.string().default('DFoundry')
    // })
  }),
};
