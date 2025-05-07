import browser from "webextension-polyfill";
import { App } from "./App";

let app = new App();
app.loadFromStorage();
app.updateWindows();
app.createContextMenu();

browser.contextMenus.onClicked.addListener((info) => {
	browser.windows.getCurrent().then((currentWindow) => {
		if (!currentWindow.id) {
			return;
		}

		const menuItem = info.menuItemId.toString();

		if (menuItem.startsWith("switch-to-")) {
			let cookieStoreId = menuItem.replace("switch-to-", "");
			if (cookieStoreId == "all") {
				app.switchWindowWorkspace(currentWindow.id, null);
			} else {
				app.switchWindowWorkspace(currentWindow.id, cookieStoreId);
			}
		}

		if (menuItem.startsWith("move-to-")) {
			let cookieStoreId = menuItem.replace("move-to-", "");
			app.moveSelectedTabsToWorkspace(cookieStoreId);
		}

		app.createContextMenu();
	});
});

browser.tabs.onHighlighted.addListener(() => {
	app.createContextMenu();
});

browser.runtime.onMessage.addListener(async (message) => {
	switch (message.action) {
		case "switchWorkspace": {
			app.switchWindowWorkspace(message.windowId, message.workspace);
			break;
		}

		case "getContainers": {
			const allWorkspace: browser.ContextualIdentities.ContextualIdentity = {
				name: "All",
				cookieStoreId: null,
				icon: "all",
				iconUrl: "/container-icons/browser.svg",
			};

			const defaultContainer: browser.ContextualIdentities.ContextualIdentity =
				{
					name: "Default",
					cookieStoreId: "firefox-default",
					icon: "default",
					iconUrl: "/container-icons/default.svg",
					color: "gray",
					colorCode: "888888",
				};

			let containers = await browser.contextualIdentities.query({});
			containers.unshift(defaultContainer);
			containers.unshift(allWorkspace);

			const tabs = await browser.tabs.query({ windowId: message.windowId });
			const containerTabs: Record<string, number> = {};
			containers.forEach((c) => {
				const tabCount = tabs.filter(
					(t) => t.cookieStoreId == c.cookieStoreId || c.name == "All",
				).length;
				containerTabs[c.name] = tabCount;
			});

			return await Promise.resolve({
				containers,
				currentWorkspace: app.windowWorkspaces.get(message.windowId),
				containerTabs,
			});
		}

		case "newWindowWithWorkspace": {
			browser.windows
				.create({
					cookieStoreId: message.workspace,
				})
				.then((window) => {
					if (window.id) {
						app.windowWorkspaces.set(window.id, message.workspace);
					}
				});
		}
	}
	return Promise.resolve();
});

browser.tabs.onCreated.addListener((tab) => {
	if (!tab.windowId) {
		return;
	}

	const currentWorkspace = app.windowWorkspaces.get(tab.windowId);

	if (currentWorkspace && tab.cookieStoreId != currentWorkspace) {
		if (tab.id && tab.title == "New Tab") {
			browser.tabs.create({
				cookieStoreId: currentWorkspace,
				windowId: tab.windowId,
			});
			browser.tabs.remove(tab.id);
		}
	}

	app.updateWindowTabs(tab.windowId);
});

browser.tabs.onRemoved.addListener((_, removeInfo) => {
	const currentWorkspace = app.windowWorkspaces.get(removeInfo.windowId);

	if (currentWorkspace) {
		browser.tabs.query({ cookieStoreId: currentWorkspace }).then((tabs) => {
			if (tabs.length == 0) {
				app.windowWorkspaces.set(removeInfo.windowId, "firefox-default");
				app.updateWindowTabs(removeInfo.windowId);
			}
		});
	}
});

browser.windows.onCreated.addListener(() => {
	app.updateWindows();
});

browser.windows.onRemoved.addListener(() => {
	app.updateWindows();
});

browser.windows.onFocusChanged.addListener(() => {
	app.createContextMenu();
});
