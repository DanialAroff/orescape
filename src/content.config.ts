import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';
import { pathToFileURL } from 'node:url';

const dfoundryBase = pathToFileURL('C:/Danial/AI/Code Test Generation/DFoundry/dist/digital-retail-banking').href;

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),

	dfoundry: defineCollection({
		loader: glob({ pattern: '**/*.md', base: dfoundryBase })
	})
};
