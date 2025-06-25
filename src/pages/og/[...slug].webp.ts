import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {render} from "./_render_ogp.tsx";
import type {APIContext} from 'astro';

// Generate static paths for all articles
export async function getStaticPaths() {
    const articles = await getCollection('articles');
    const users = await getCollection('users');

    return articles.filter(article => article.data.heroImage == undefined)
        .map(article => {
            const authorId = article.data.author;
            const authorData = users.find(user => user.id === authorId)?.data;

            return {
                params: {slug: article.id},
                props: {
                    title: article.data.title,
                    description: article.data.description,
                    author: authorId,
                    authorName: authorData?.name || authorId,
                    authorAvatar: authorData?.avatar || null,
                },
            };
        });
}

export const GET: APIRoute = async ({props, site}: {
    props: {
        title: string,
        description: string,
        author: string,
        authorName: string,
        authorAvatar: string | null,
    };
    site: APIContext['site']
}) => {
    // Ensure site is defined, use a default value if it's not
    const siteUrl = site?.toString() || 'https://example.com';
    return render({site: siteUrl, ...props});
};
