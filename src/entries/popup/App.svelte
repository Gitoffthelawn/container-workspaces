<script lang="ts">
    import browser from "webextension-polyfill";
    import { onMount } from "svelte";
    import WorkspaceItem from "./WorkspaceItem.svelte";

    let containers: browser.ContextualIdentities.ContextualIdentity[];
    let containerTabs: Record<string, number>;
    $: containers = [];
    $: currentWorkspace = "";
    $: containerTabs = {};
    $: totalTabs = Object.values(containerTabs).reduce((a, v) => a + v, 0);

    const allWorkspace = {
        name: "All",
        cookieStoreId: null,
        icon: "all",
        iconUrl: "/container-icons/browser.svg",
    };

    function getContainers() {
        browser.windows.getCurrent().then((currentWindow) => {
            browser.runtime
                .sendMessage({ action: "getContainers", windowId: currentWindow.id })
                .then((response) => {
                    if (response) {
                        containers = response.containers;
                        currentWorkspace = response.currentWorkspace;
                        containerTabs = response.containerTabs;
                    } else {
                        console.error("Failed to get response for 'getContainers' message");
                    }
                });
        });
    }

    onMount(() => {
        getContainers();

        browser.storage.local.get("currentTheme").then((data) => {
            let theme = "auto";

            if (data.currentTheme == "auto") {
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    theme = "dark";
                } else {
                    theme = "light";
                }
            } else if (data.currentTheme) {
                theme = data.currentTheme;
            }

            document.body.setAttribute("data-theme", theme);
        });
    });
</script>

<main>
    <div>
        {#each containers as container}
            <WorkspaceItem
                {container}
                active={currentWorkspace == container.cookieStoreId}
                {getContainers}
                tabCount={containerTabs[container.name]}
            />
        {/each}
    </div>
</main>

<style>
    @import "./styles.css";

    main {
        min-width: 20rem;
        font-family: sans-serif;
        font-size: 0.9rem;
        padding: 0.25rem;
    }
</style>
