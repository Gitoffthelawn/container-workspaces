<script lang="ts">
    import browser from "webextension-polyfill";
    import { onMount } from "svelte";
    import WorkspaceItem from "./WorkspaceItem.svelte";

    let newWorkspaceName: string;
    let showForm = false;

    let containers: browser.ContextualIdentities.ContextualIdentity[];
    $: containers = [];
    $: currentWorkspace = "";

    function getContainers() {
        browser.runtime.sendMessage({ action: "getContainers" }).then((response) => {
            if (response) {
                containers = response.containers;

                currentWorkspace = response.currentWorkspace;
            } else {
                console.error("Failed to get response for 'getContainers' message");
            }
        });
    }

    function createWorkspace() {
        showForm = false;
        browser.runtime
            .sendMessage({ action: "createWorkspace", name: newWorkspaceName })
            .then(() => {});
        getContainers();
        newWorkspaceName = "";
    }

    function focus(el: HTMLElement) {
        el.focus();
    }

    onMount(getContainers);
</script>

<main>
    <div>currentWorkspace: {currentWorkspace}</div>
    <div>
        {#each containers as container}
            <WorkspaceItem
                {container}
                active={currentWorkspace == container.cookieStoreId}
                {getContainers}
            />
        {/each}
    </div>

    <div>
        {#if !showForm}
            <button
                on:click={() => {
                    showForm = true;
                }}
                class="btn">New Workspace</button
            >
        {:else}
            <div>
                <input
                    type="text"
                    placeholder="New Workspace"
                    bind:value={newWorkspaceName}
                    use:focus
                />
                <button on:click={createWorkspace} class="btn">Create</button>
                <button on:click={() => (showForm = false)} class="btn">Cancel</button>
            </div>
        {/if}
    </div>
</main>

<style>
    @import "./styles.css";

    main {
        min-width: 20rem;
        font-family: sans-serif;
        font-size: 0.9rem;
        background-color: var(--bg);
        color: white;
        padding: 0.25rem;
    }
</style>
