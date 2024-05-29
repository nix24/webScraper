import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) return new Response("URL is required", { status: 400 });

    try {
        const response = await fetch(targetUrl);
        const text = await response.text();

        return new Response(text);
    } catch (error) {
        return new Response("Failed to fetch URL", { status: 500 });
    }
};