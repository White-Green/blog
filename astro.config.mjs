// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://blog.white-green.net',
    integrations: [mdx(), sitemap(), react()],
    markdown: {
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
        }),
    },
    vite: {
        build: {
            rollupOptions: {
                external: ['satori', 'sharp', '@resvg/resvg-js']
            }
        }
    }
});
