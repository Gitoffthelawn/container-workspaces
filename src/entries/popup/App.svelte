<script lang="ts">
    import browser from "webextension-polyfill";
    import type { Workspace } from "../background/Workspace";
    import { onMount } from "svelte";
    import WorkspaceItem from "./WorkspaceItem.svelte";

    let newWorkspaceName: string;
    let showForm = false;

    let workspaces: Record<string, Workspace>;
    let currentWorkspace: string;

    function getWorkspaces() {
        browser.runtime.sendMessage({ action: "getWorkspaces" }).then((response) => {
            if (response) {
                workspaces = response.workspaces;
                currentWorkspace = response.currentWorkspace;
            } else {
                console.error("Failed to get response for 'getWorkspaces' message");
            }
        });
    }

    function createWorkspace() {
        showForm = false;
        browser.runtime
            .sendMessage({ action: "createWorkspace", name: newWorkspaceName })
            .then(() => {});
        getWorkspaces();
        newWorkspaceName = "";
    }

    function focus(el: HTMLElement) {
        el.focus();
    }

    onMount(getWorkspaces);
</script>

<main>
    <div>
        {#if currentWorkspace}
            {#key currentWorkspace}
                {#each Object.entries(workspaces) as [workspace, _]}
                    <WorkspaceItem
                        {workspace}
                        {getWorkspaces}
                        active={currentWorkspace === workspace}
                    />
                    {#if workspace === "default"}
                        <hr />
                    {/if}
                {/each}
            {/key}
        {/if}
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
