import satori from 'satori';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import type {CollectionEntry} from "astro:content";

interface OGImageProps {
    /** 記事タイトル（必須） */
    title: string;
    /** 記事の説明（省略可） */
    description?: string;
    /** 著者名（省略可） */
    author?: string;
    /** 今後利用する可能性がある場合に備えて定義しておく */
    heroImage?: string;
}


export const render = async (props:OGImageProps) => {
    // Get the article data from props
    const {title, description, author} = props;

    // Define the JSX for the OG image
    const jsx = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
            padding: '40px',
            fontFamily: 'sans-serif',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1>{title}</h1>
                <p>{description || ''}</p>
                {author ? <p>By {author}</p> : null}
            </div>
            <div>example.com
            </div>
        </div>
    );

    // Generate SVG using satori
    const svg = await satori(jsx, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'sans-serif',
                data: await fetch(
                    'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff'
                ).then((res) => res.arrayBuffer()),
                weight: 400,
                style: 'normal',
            },
            {
                name: 'sans-serif',
                data: await fetch(
                    'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff'
                ).then((res) => res.arrayBuffer()),
                weight: 700,
                style: 'normal',
            },
        ],
    });

    // Convert to Sharp image and resize if needed
    const image = sharp(svg);
    const webp = await image.webp().toBuffer();

    return new Response(webp, {
        headers: {
            'content-type': 'image/webp',
            'cache-control': 'public, max-age=31536000, immutable',
        },
    });
};
