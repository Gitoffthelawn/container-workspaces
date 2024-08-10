<script lang="ts">
    import browser from "webextension-polyfill";
    import Edit from "./svg/Edit.svelte";
    import Close from "./svg/Close.svelte";
    import Accept from "./svg/Accept.svelte";

    export let workspace: string;
    export let active: boolean;
    export let getWorkspaces: () => void;

    let showForm = false;
    let newWorkspaceName = workspace;

    function switchWorkspace() {
        browser.runtime.sendMessage({ action: "switchWorkspace", name: workspace }).then(() => {
            getWorkspaces();
        });
    }

    function deleteWorkspace() {
        browser.runtime.sendMessage({ action: "deleteWorkspace", name: workspace }).then(() => {
            getWorkspaces();
        });
    }

    function renameWorkspace() {
        browser.runtime
            .sendMessage({
                action: "renameWorkspace",
                oldName: workspace,
                newName: newWorkspaceName,
            })
            .then(() => {
                getWorkspaces();
                showForm = false;
            });
    }

    function focus(el: HTMLElement) {
        el.focus();
    }

    function handle_keyup(event: KeyboardEvent) {
        switch (event.key) {
            case "Enter": {
                if (showForm) {
                    renameWorkspace();
                }
            }
            case "Escape": {
                showForm = false;
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }
</script>

<svelte:window on:keyup={handle_keyup} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={switchWorkspace} class="workspace flex-centered {active ? 'active' : ''}">
    {#if !showForm}
        <span class="flex-grow">
            {workspace}
        </span>
        {#if workspace !== "default"}
            <button
                on:click|stopPropagation={() => (showForm = true)}
                class="icon-btn show-on-hover"
            >
                <Edit />
            </button>

            <button on:click|stopPropagation={deleteWorkspace} class="icon-btn show-on-hover">
                <Close />
            </button>
        {/if}
    {:else}
        <input type="text" bind:value={newWorkspaceName} class="flex-grow" use:focus />

        <button type="submit" on:click|stopPropagation={renameWorkspace} class="icon-btn">
            <Accept />
        </button>

        <button on:click|stopPropagation={() => (showForm = false)} class="icon-btn">
            <Close />
        </button>
    {/if}
</div>

<style>
    @import "./styles.css";

    .flex-centered {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .workspace {
        position: relative;
        padding: 0.5rem;
        margin: 0.25rem;
        border-radius: 0.25rem;
        cursor: default;
    }

    .workspace:hover {
        background-color: var(--bg-light);
    }

    .show-on-hover {
        opacity: 0;
    }

    .workspace:hover > .show-on-hover {
        opacity: 100%;
    }

    .workspace.active {
        background-color: var(--blue);
    }

    .flex-grow {
        flex-grow: 1;
    }

    .icon-btn {
        border: 0;
        background-color: transparent;
        border-radius: 0.25rem;
        padding: 0.25rem;
        aspect-ratio: 1;
    }

    .icon-btn:hover {
        background-color: var(--bg);
    }
</style>
