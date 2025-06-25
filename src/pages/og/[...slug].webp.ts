import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {render} from "./_render_ogp.tsx";

// Generate static paths for all articles
export async function getStaticPaths() {
    const articles = await getCollection('articles');
    return articles.map(article => ({
        params: {slug: article.id},
        props: {
            title: article.data.title,
            description: article.data.description,
            author: article.data.author,
            heroImage: article.data.heroImage
        },
    }));
}

export const GET: APIRoute = async ({props}) => {
    return render(props);
};
