import { fetchHtml } from "./fetch";

/**
 * Normalizes a given URL by removing any trailing non-alphanumeric characters from the pathname and returns the normalized URL.
 *
 * @param {string} url - The URL to be normalized.
 * @return {string} The normalized URL. If the input URL is falsy or cannot be parsed into a URL object, the original URL is returned.
 * If the URL's pathname is '/', the URL's origin is returned.
 */
export const normalizeUrl = (url: string) => {
    //gaurd rail
    if (!url) return '';
    let urlObj: URL;
    try {
        urlObj = new URL(url);
    } catch (error) {
        return url;
    }
    if (urlObj.pathname === '/') return urlObj.origin;

    //grab the char at the end of the url
    const lastChar = urlObj.pathname.charAt(urlObj.pathname.length - 1);
    if (!/[a-zA-Z0-9]/.test(lastChar)) urlObj.pathname = urlObj.pathname.slice(0, -1);
    return urlObj.hostname + urlObj.pathname;
};

/**
 * Retrieves all URLs from an HTML document based on a given base URL.
 *
 * @param {string} htmlBody - The HTML body of the document.
 * @param {string} baseUrl - The base URL to look for URLs in.
 * @return {string[]} An array of URLs found in the HTML document.
 */
export const getUrlsFromHtml = (htmlBody: string, baseUrl: string): string[] => {
    //base url: domain to look for urls in" ex: https://google.com
    //html body: body of the html document
    const urls: string[] = [];
    //create a new jsdom instance
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlBody, 'text/html');

    //get all anchor tags
    const anchors = doc.querySelectorAll('a');

    //enhanced for loop
    for (const anchor of anchors) {
        //check if it equals base url
        const href = anchor.getAttribute('href');
        if (!href) continue;
        let absoluteUrl: string;
        if (href.startsWith('http') || href.startsWith('https')) {
            absoluteUrl = href;
        } else {
            try {
                const urlObj = new URL(baseUrl);
                urlObj.pathname = href.startsWith('/') ? href : `${urlObj.pathname}${href}`;
                absoluteUrl = urlObj.href;
            } catch (error) {
                console.warn('Invalid URL:', href);
                continue;
            }
        }
        urls.push(absoluteUrl);

    }
    return urls;
}

/**
 * Recursively crawls a website starting from the given currentUrl, up to the specified baseUrl.
 *
 * @param {string} currentUrl - The URL to start crawling from.
 * @param {string} baseUrl - The base URL of the website to crawl.
 * @param {Set<string>} visted - A set of visited URLs to prevent infinite loops.
 * @return {Promise<void>} - A Promise that resolves when the crawl is complete.
 */
export const recursiveCrawl = async (currentUrl: string, baseUrl: string, visted: Set<string>) => {
    if (visted.has(currentUrl) || !currentUrl.startsWith(baseUrl)) return;

    visted.add(currentUrl);

    const html = await fetchHtml(currentUrl);
    const newUrls = getUrlsFromHtml(html, baseUrl);

    for (const url of newUrls) {
        await recursiveCrawl(url, baseUrl, visted);
    }

}

/**
 * Performs a depth-first crawl of a website starting from the given start URL.
 *
 * @param {string} startUrl - The URL to start crawling from.
 * @param {string} baseUrl - The base URL of the website to crawl.
 * @param {number} [maxConcurrency=10] - The maximum number of URLs to fetch concurrently.
 * @return {Promise<Set<string>>} A promise that resolves to a set of visited URLs.
 */
// export const queueCrawl = async (startUrl: string, baseUrl: string, maxConcurrency = 10) => {
//     const visited = new Set<string>();
//     const queue: string[] = [startUrl];
//     const cache = new Map<string, string>();

//     while (queue.length > 0) {
//         const urls = queue.splice(0, maxConcurrency);

//         const htmlBodies = await Promise.all(
//             urls.map(async (url) => {
//                 if (cache.has(url)) {
//                     return cache.get(url);
//                 }
//                 const html = await fetchHtml(url);
//                 cache.set(url, html);
//                 return html;
//             })
//         );

//         const newUrlsArray = await Promise.all(
//             htmlBodies.map((html, index) => {
//                 if (!html) return [];
//                 return getUrlsFromHtml(html, urls[index]);
//             })
//         );

//         for (const newUrls of newUrlsArray) {
//             for (const url of newUrls) {
//                 if (!visited.has(url) && url.startsWith(baseUrl)) {
//                     visited.add(url);
//                     queue.push(url);
//                 }
//             }
//         }
//     }

//     return visited;
// }