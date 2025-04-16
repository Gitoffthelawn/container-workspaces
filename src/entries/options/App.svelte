<script lang="ts">
    import PageContent from "~/lib/PageContent.svelte";
</script>

<main>
    <PageContent>Options</PageContent>
    <h3 data-i18n-message-id="theme"></h3>

    <p>
        <label class="keyboard-shortcut">
            <span data-i18n-message-id="chooseTheme"></span>
            <select id="changeTheme" name="changeTheme">
                <option value="auto" selected data-i18n-message-id="themeAuto"> </option>
                <option value="light" data-i18n-message-id="themeLight"> </option>
                <option value="dark" data-i18n-message-id="themeDark"> </option>
            </select>
        </label>
    </p>
</main>

<style>
    main {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
