export const fetchHtml = async (url: string) => {
    if (!url) {
        return "Url is requireed";
    }
    const proxyUrl = `/api/urls?url=${url}`;
    const response = await fetch(proxyUrl);
    console.log("fetching", url);
    if (!response.ok) {
        return new Error(`could not fetch ${url}, status: ${response.status}: ${response.statusText}`);
    }
    //if response is empty, throw error
    const text = await response.text();
    if (!text) throw new Error(`could not fetch ${url}, response is empty`);
    return text;
}