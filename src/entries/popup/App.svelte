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
                console.log(JSON.stringify(workspaces));
            } else {
                console.error("Failed to get response for 'getWorkspaces' message");
            }
        });
    }

    function switchWorkspace(workspace: string) {
        browser.runtime.sendMessage({ action: "switchWorkspace", name: workspace }).then(() => {});
        getWorkspaces();
    }

    function createWorkspace() {
        showForm = false;
        browser.runtime
            .sendMessage({ action: "createWorkspace", name: newWorkspaceName })
            .then(() => {});
        getWorkspaces();
    }

    onMount(getWorkspaces);
</script>

<main>
    <div id="workspaces">
        {#if currentWorkspace}
            {#key currentWorkspace}
                {#each Object.entries(workspaces) as [workspace, _]}
                    <WorkspaceItem
                        {workspace}
                        {switchWorkspace}
                        active={currentWorkspace === workspace}
                    />
                    {#if workspace === "default"}
                        <hr />
                    {/if}
                {/each}
            {/key}
        {/if}
    </div>
    <div id="new-workspace-container">
        {#if !showForm}
            <button
                on:click={() => {
                    showForm = true;
                }}
                id="new-workspace"
                class="btn">New Workspace</button
            >
        {:else}
            <div id="create-workspace-form">
                <input
                    type="text"
                    id="new-workspace-name"
                    placeholder="New Workspace"
                    bind:value={newWorkspaceName}
                />
                <button on:click={createWorkspace} id="create-workspace" class="btn">Create</button>
                <button on:click={() => (showForm = false)} id="cancel-create-workspace" class="btn"
                    >Cancel</button
                >
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
