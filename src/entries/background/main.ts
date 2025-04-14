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
			const c = await browser.contextualIdentities.query({});
			return await Promise.resolve({
				containers: c,
				currentWorkspace: app.currentWorkspace,
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
