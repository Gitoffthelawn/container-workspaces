<script lang="ts">
    import browser from "webextension-polyfill";
    import Edit from "./svg/Edit.svelte";

    export let container: browser.ContextualIdentities.ContextualIdentity;
    export let active: boolean;
    export let getContainers: () => void;

    let showForm = false;

    function switchWorkspace() {
        let name = active ? "firefox-default" : container.cookieStoreId;
        browser.runtime.sendMessage({ action: "switchWorkspace", name: name }).then(() => {
            getContainers();
        });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={switchWorkspace} class="workspace flex-centered {active ? 'active' : ''}">
    <img
        src={container.iconUrl}
        alt={container.icon}
        style="fill: {container.colorCode}"
        class="workspace-icon"
    />
    <span class="flex-grow">
        {container.name}
    </span>
    <button on:click|stopPropagation={() => (showForm = true)} class="icon-btn show-on-hover">
        <Edit />
    </button>
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

    .workspace-icon {
        height: 24px;
    }
</style>
