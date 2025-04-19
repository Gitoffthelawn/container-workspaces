import browser from "webextension-polyfill";
import { App } from "./App";

let app = new App();
app.loadFromStorage();
app.createContextMenu();

browser.contextMenus.onClicked.addListener((info) => {
	if (info.menuItemId.toString().startsWith("switch-to-")) {
		let cookieStoreId = info.menuItemId.toString().replace("switch-to-", "");
		if (cookieStoreId == "all") {
			app.switchWorkspace(undefined);
		} else {
			app.switchWorkspace(cookieStoreId);
		}
	}

	if (info.menuItemId.toString().startsWith("move-to-")) {
		let cookieStoreId = info.menuItemId.toString().replace("move-to-", "");
		app.moveSelectedTabsToWorkspace(cookieStoreId);
	}

	app.createContextMenu();
});

browser.tabs.onHighlighted.addListener(() => {
	app.createContextMenu();
});

browser.runtime.onMessage.addListener(async (message) => {
	switch (message.action) {
		case "switchWorkspace": {
			app.switchWorkspace(message.name);
			break;
		}

		case "getContainers": {
			const defaultContainer: browser.ContextualIdentities.ContextualIdentity =
				{
					name: "Default",
					cookieStoreId: "firefox-default",
				};

			let containers = await browser.contextualIdentities.query({});
			containers.unshift(defaultContainer);
			const tabs = await browser.tabs.query({});
			const containerTabs: Record<string, number> = {};
			containers.forEach((c) => {
				const tabCount = tabs.filter(
					(t) => t.cookieStoreId == c.cookieStoreId,
				).length;
				containerTabs[c.name] = tabCount;
			});

			return await Promise.resolve({
				containers,
				currentWorkspace: app.currentWorkspace,
				containerTabs,
			});
		}
	}
	return Promise.resolve();
});

browser.tabs.onCreated.addListener((tab) => {
	if (app.currentWorkspace && tab.cookieStoreId != app.currentWorkspace) {
		if (tab.id && tab.title == "New Tab") {
			browser.tabs.create({
				cookieStoreId: app.currentWorkspace,
			});
			browser.tabs.remove(tab.id);
		}
	}
	app.updateTabs();
});

browser.tabs.onRemoved.addListener(() => {
	if (app.currentWorkspace) {
		browser.tabs.query({ cookieStoreId: app.currentWorkspace }).then((tabs) => {
			if (tabs.length == 0) {
				app.currentWorkspace = "firefox-default";
				app.updateTabs();
			}
		});
	}
});
