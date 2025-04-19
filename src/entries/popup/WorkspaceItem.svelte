<script lang="ts">
    import browser from "webextension-polyfill";

    export let container: browser.ContextualIdentities.ContextualIdentity;
    export let active: boolean;
    export let tabCount: number;
    export let getContainers: () => void;

    function switchWorkspace() {
        browser.runtime
            .sendMessage({ action: "switchWorkspace", name: container.cookieStoreId })
            .then(() => {
                getContainers();
            });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={switchWorkspace} class="workspace flex-centered {active ? 'active' : ''}">
    {#if container.iconUrl}
        <img
            src={container.iconUrl}
            alt={container.icon}
            style="fill: {container.colorCode}"
            class="workspace-icon icon-{container.color}"
        />
    {/if}
    <span class="flex-grow">
        {container.name}
    </span>
    <span>{tabCount}</span>
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
        background-color: var(--button-bg-hover-color-secondary);
    }

    .workspace.active {
        background-color: var(--button-bg-color-primary);
        color: var(--button-text-color-primary);
    }

    .workspace.active:hover {
        background-color: var(--button-bg-hover-color-primary);
    }

    .flex-grow {
        flex-grow: 1;
    }

    .workspace-icon {
        height: 18px;
        margin-right: 5px;
    }

    /* These filters were generated with isotropic.co/tool/hex-color-to-css-filter/ */
    .icon-blue {
        filter: invert(63%) sepia(28%) saturate(4110%) hue-rotate(178deg) brightness(99%)
            contrast(104%);
    }

    .icon-turquoise {
        filter: invert(49%) sepia(80%) saturate(1231%) hue-rotate(129deg) brightness(99%)
            contrast(101%);
    }

    .icon-green {
        filter: invert(59%) sepia(18%) saturate(2959%) hue-rotate(55deg) brightness(101%)
            contrast(106%);
    }

    .icon-yellow {
        filter: invert(65%) sepia(94%) saturate(456%) hue-rotate(360deg) brightness(104%)
            contrast(106%);
    }

    .icon-orange {
        filter: invert(59%) sepia(89%) saturate(1273%) hue-rotate(359deg) brightness(101%)
            contrast(106%);
    }

    .icon-red {
        filter: invert(66%) sepia(78%) saturate(4761%) hue-rotate(335deg) brightness(100%)
            contrast(102%);
    }

    .icon-pink {
        filter: invert(47%) sepia(28%) saturate(4016%) hue-rotate(286deg) brightness(100%)
            contrast(106%);
    }

    .icon-purple {
        filter: invert(38%) sepia(80%) saturate(947%) hue-rotate(242deg) brightness(94%)
            contrast(104%);
    }

    .icon-white {
        filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(281deg) brightness(109%)
            contrast(102%);
    }
</style>
