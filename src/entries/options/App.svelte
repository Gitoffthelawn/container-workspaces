<script lang="ts">
    import { onMount } from "svelte";
    import browser from "webextension-polyfill";

    $: currentTheme = "auto";

    function selectTheme(e: Event) {
        const newValue = e.currentTarget?.value || "auto";
        browser.storage.local.set({ currentTheme: newValue });
    }

    onMount(() => {
        browser.storage.local.get("currentTheme").then((data) => {
            if (data.currentTheme) {
                currentTheme = data.currentTheme;
            }
        });
    });
</script>

<main>
    <form>
        <h3>Options</h3>
        <div>
            <label class="keyboard-shortcut">
                <span>Theme</span>
                <select
                    id="changeTheme"
                    name="changeTheme"
                    on:change={selectTheme}
                    bind:value={currentTheme}
                >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
        </div>
    </form>
</main>

<style>
    @import "./styles.css";
</style>
