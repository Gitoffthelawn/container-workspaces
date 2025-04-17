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

    $: theme = "dark";

    const allWorkspace = {
        name: "All",
        cookieStoreId: undefined,
    };

    function getContainers() {
        browser.runtime.sendMessage({ action: "getContainers" }).then((response) => {
            if (response) {
                containers = response.containers;
                currentWorkspace = response.currentWorkspace;
                containerTabs = response.containerTabs;
            } else {
                console.error("Failed to get response for 'getContainers' message");
            }
        });
    }

    onMount(() => {
        getContainers();
        browser.storage.local.get("currentTheme").then((data) => {
            if (data.currentTheme == "auto") {
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    theme = "dark";
                } else {
                    theme = "light";
                }
            } else if (data.currentTheme) {
                theme = data.currentTheme;
            }
        });
    });
</script>

<main data-theme={theme}>
    <div>
        <WorkspaceItem
            container={allWorkspace}
            active={currentWorkspace == allWorkspace.cookieStoreId}
            {getContainers}
            tabCount={totalTabs}
        />
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
