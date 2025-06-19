import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
	// Load Markdown and MDX files in the `articles/` directory.
	loader: glob({ base: './articles', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.string().datetime({ offset: true }),
		updatedDate: z.string().datetime({ offset: true }).optional(),
		heroImage: z.string().optional(),
		author: z.string(),
	}),
});

const users = defineCollection({
	// Load YAML files in the `users/` directory.
	loader: glob({ base: './users', pattern: '**/*.yml' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		name: z.string(),
		bio: z.string(),
		avatar: z.string().optional(),
		website: z.string().url().optional(),
		twitter: z.string().optional(),
		github: z.string().optional(),
	}),
});

export const collections = { articles, users };
