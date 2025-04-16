import browser from "webextension-polyfill";
import { App } from "./App";

let app = new App();
app.loadFromStorage();
// app.createContextMenu();

// browser.contextMenus.onClicked.addListener((info) => {
// 	if (info.menuItemId.toString().startsWith("move-to-")) {
// 		let workspace = info.menuItemId.toString().replace("move-to-", "");
// 		app.moveSelectedTabsToWorkspace(workspace);
// 	}
//
// 	if (info.menuItemId === "create-workspace-with-tabs") {
// 		browser.tabs.query({ active: true }).then((tabs) => {
// 			if (tabs[0] && tabs[0].id) {
// 				browser.tabs
// 					.sendMessage(tabs[0].id, { action: "getNewWorkspaceName" })
// 					.then((response) => {
// 						if (response.workspace) {
// 							browser.windows.getLastFocused().then((window) => {
// 								if (window.id) {
// 									browser.windows
// 										.update(window.id, { focused: true })
// 										.then(() => {
// 											app.createWorkspace(response.workspace);
// 											app.moveSelectedTabsToWorkspace(response.workspace);
// 										});
// 								}
// 							});
// 						}
// 					})
// 					.catch(() => {
// 						console.error("Unable to create dialog in currently focused tab.");
// 					});
// 			}
// 		});
// 		// browser.windows.create({
// 		//   type: "detached_panel",
// 		//   url: browser.runtime.getURL("src/entries/panel/index.html"),
// 		//   width: 200,
// 		//   height: 150,
// 		// });
// 	}
// });

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
