<script lang="ts">
    import { normalizeUrl, recursiveCrawl } from "../util/crawl";

    // biome-ignore lint/style/useConst: <explanation>
    let url = "";
    let urls: string[] = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    // biome-ignore lint/style/useConst: <explanation>
    let visited = new Set<string>();

    $: paginatedUrls = urls.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    $: totalPages = Math.ceil(urls.length / itemsPerPage);
    $: isLoading = false;

    const crawl = async (baseUrl: string) => {
        visited.clear();
        await recursiveCrawl(baseUrl, baseUrl, visited);
    };

    const handleClick = async (url: string) => {
        isLoading = true;
        const baseUrl = normalizeUrl(url);
        await crawl(baseUrl);
        urls = Array.from(visited);
        currentPage = 1;
        isLoading = false;
    };
</script>

<main class="grid place-items-center m-5">
    <!-- screen wide dim with loading screen centered absolute -->
    {#if isLoading}
        <div class="fixed inset-0 z-10 bg-base-300/65">
            <div class="flex flex-col items-center justify-center h-full">
                <div class="loading loading-ring w-36 opacity-50"></div>

                <div
                    class="z-20 absolute inset-0 flex items-center justify-center"
                >
                    <div class="flex items-center justify-center">
                        <h3
                            class="text-3xl font-semibold text-base-content underline underline-offset-2"
                        >
                            loading urls
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <h1 class="text-4xl">Web Scraper project</h1>
    <h3 class="text-2xl">Extrating URLS from the base link</h3>
    <div class="join p-5">
        <input
            class="input input-md join-item"
            type="text"
            bind:value={url}
            placeholder="Enter a website URL"
        />
        <button
            class="btn btn-square join-item"
            on:click={() => handleClick(url)}>Extract URLs</button
        >
    </div>
    <div class="overflow-x-auto">
        <table class="table table-zebra">
            <thead>
                <tr>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
                {#each paginatedUrls as url}
                    <tr>
                        <td>{url}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="p-3">
            {#each Array(totalPages) as _, i}
                <button
                    class="btn btn-sm btn-circle"
                    on:click={() => (currentPage = i + 1)}>{i + 1}</button
                >
            {/each}
        </div>
    </div>
</main>
