<script lang="ts">
    import Edit from "./svg/Edit.svelte";
    import Close from "./svg/Close.svelte";

    export let workspace: string;
    export let active: boolean;
    export let switchWorkspace: (workspace: string) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    on:click={() => switchWorkspace(workspace)}
    class="workspace flex-centered {active ? 'active' : ''}"
>
    <span class="workspace-name">
        {workspace}
    </span>
    <button
        on:click|stopPropagation={() => {
            console.log("click");
        }}
        class="icon-btn"
    >
        <Edit />
    </button>
    <button
        on:click|stopPropagation={() => {
            console.log("click");
        }}
        class="icon-btn"
    >
        <Close />
    </button>
</div>

<style>
    @import "./styles.css";

    .flex-centered {
        display: flex;
        align-items: center;
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

    .workspace.active {
        background-color: var(--bg-blue);
    }

    .workspace-name {
        flex-grow: 1;
    }

    .icon-btn {
        fill: white;
        stroke: white;
        color: white;
        border: solid 1px transparent;
        background-color: transparent;
    }

    .icon-btn:hover {
        /* background-color: var(--bg-dark2); */
        border-radius: 0.25rem;
        border: solid 1px var(--bg-light);
    }
</style>
