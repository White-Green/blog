import satori from 'satori';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface OGImageProps {
    title: string;
    description: string;
    author: string;
    authorName: string;
    authorAvatar: string | null;
    site: string;
}


/**
 * Process avatar URL based on the following rules:
 * - If URL starts with "https://", use it as is
 * - If URL is a data URL (starts with "data:"), use it as is
 * - If URL starts with "/", load the file from the public directory and convert it to a data URL
 * - For any other format, throw an error
 */
const processAvatarUrl = async (avatarUrl: string | null): Promise<string | null> => {
    if (!avatarUrl) return null;

    // If URL starts with "https://", use it as is
    if (avatarUrl.startsWith('https://')) {
        return avatarUrl;
    }

    // If URL is a data URL, use it as is
    if (avatarUrl.startsWith('data:')) {
        return avatarUrl;
    }

    // If URL starts with "/", load the file from the public directory
    if (avatarUrl.startsWith('/')) {
        try {
            // Remove the leading slash and get the file path
            const filePath = path.join(process.cwd(), 'public', avatarUrl.slice(1));

            // Read the file
            const fileData = fs.readFileSync(filePath);

            // Determine MIME type based on file extension
            const ext = path.extname(filePath).toLowerCase();
            let mimeType = 'application/octet-stream'; // Default MIME type

            if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.gif') mimeType = 'image/gif';
            else if (ext === '.svg') mimeType = 'image/svg+xml';
            else if (ext === '.webp') mimeType = 'image/webp';

            // Convert to base64 data URL
            return `data:${mimeType};base64,${fileData.toString('base64')}`;
        } catch (error) {
            console.error(`Error loading avatar image from public directory: ${error}`);
            return null;
        }
    }

    // For any other format, throw an error
    throw new Error(`Invalid avatar URL format: ${avatarUrl}. URL must start with "https://", "data:", or "/"`);
};

export const render = async (props: OGImageProps) => {
    // Get the article data from props
    const {title, authorName, authorAvatar, site} = props;

    // Process the avatar URL
    const processedAvatarUrl = await processAvatarUrl(authorAvatar);

    // Define the JSX for the OG image
    const jsx = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
            padding: '60px',
            fontFamily: 'sans-serif',
            color: 'white',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}>
                <h1 style={{
                    fontSize: '64px',
                    margin: '0',
                    lineHeight: '1.2',
                    fontWeight: 'bold',
                }}>{title}</h1>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '40px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    {processedAvatarUrl ? (
                        <img
                            src={processedAvatarUrl}
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid white',
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: 'white',
                            border: '2px solid white',
                        }}>
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{
                        display: 'flex',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    }}>
                        By {authorName}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    fontSize: '20px',
                    opacity: 0.8,
                }}>
                    {site}
                </div>
            </div>
        </div>
    );

    const svg = await satori(jsx, {
        width: 1200,
        height: 630,
        fonts: [
            // {
            //     name: 'sans-serif',
            //     data: await fetch(
            //         'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff'
            //     ).then((res) => res.arrayBuffer()),
            //     weight: 400,
            //     style: 'normal',
            // },
            // {
            //     name: 'sans-serif',
            //     data: await fetch(
            //         'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff'
            //     ).then((res) => res.arrayBuffer()),
            //     weight: 700,
            //     style: 'normal',
            // },
            {
                name: 'sans-serif',
                data: await fetch(
                    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff'
                ).then((res) => res.arrayBuffer()),
                weight: 400,
                style: 'normal',
            },
            {
                name: 'sans-serif',
                data: await fetch(
                    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff'
                ).then((res) => res.arrayBuffer()),
                weight: 700,
                style: 'normal',
            },
        ],
        embedFont: true,
    });

    try {
        const image = sharp(Buffer.from(svg));
        const webp = await image.webp().toBuffer();

        return new Response(webp, {
            headers: {
                'content-type': 'image/webp',
                'cache-control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error(`Failed to process image: ${error.message}`);
    }
};
