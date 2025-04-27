import browser from "webextension-polyfill";

export class App {
	currentWorkspace: string | undefined;

	constructor() {
		this.currentWorkspace = undefined;
	}

	// Loads the workspace states from browser storage
	loadFromStorage() {
		browser.storage.local.get(["currentWorkspace"]).then((data) => {
			this.currentWorkspace = data.currentWorkspace;

			this.updateTabs();
		});
	}

	saveWorkspaces() {
		browser.storage.local.set({
			currentWorkspace: this.currentWorkspace,
		});
	}

	updateTabs() {
		let hideTabs: number[] = [];
		let showTabs: number[] = [];

		browser.tabs.query({}).then((tabs) => {
			tabs.forEach((t) => {
				if (t.id) {
					if (!this.currentWorkspace) {
						showTabs.push(t.id);
						return;
					}

					if (t.cookieStoreId === this.currentWorkspace) {
						showTabs.push(t.id);
					} else {
						hideTabs.push(t.id);
					}
				}
			});
		});

		browser.tabs.show(showTabs);
		browser.tabs.hide(hideTabs);
	}

	getMostRecentTab(tabs: browser.Tabs.Tab[]): browser.Tabs.Tab {
		return tabs.reduce((mostRecent, current) => {
			if (!current.lastAccessed || !mostRecent.lastAccessed) {
				return mostRecent;
			}
			if (!mostRecent || current.lastAccessed > mostRecent.lastAccessed) {
				return current;
			}
			return mostRecent;
		}, tabs[0]);
	}

	switchWorkspace(cookieStoreId: string | undefined) {
		// Handle selecting an active tab when switching workspaces
		browser.tabs.query({ active: true }).then((activeTabs) => {
			browser.tabs.query({ cookieStoreId: cookieStoreId }).then((tabs) => {
				// No need to select a tab when unsetting a workspace or if the current active tab is already in the newly selected workspace
				if (
					!cookieStoreId ||
					(activeTabs.length > 0 &&
						activeTabs[0].cookieStoreId == cookieStoreId)
				) {
					this.updateTabs();
					return;
				}

				if (tabs.length > 0) {
					const mostRecentTab = this.getMostRecentTab(tabs);

					browser.tabs
						.update(mostRecentTab.id, {
							active: true,
						})
						.then(() => {
							this.updateTabs();
						});
				} else {
					browser.tabs.create({ cookieStoreId });
					this.updateTabs();
				}
			});
		});

		this.currentWorkspace = cookieStoreId;
		this.saveWorkspaces();
		this.createContextMenu();
	}

	moveSelectedTabsToWorkspace(cookieStoreId: string | undefined) {
		browser.tabs.query({ highlighted: true }).then((selectedTabs) => {
			selectedTabs.forEach((tab) => {
				browser.tabs.create({
					url: tab.url,
					cookieStoreId: cookieStoreId,
				});
			});

			browser.tabs
				.query({ cookieStoreId: this.currentWorkspace })
				.then((containerTabs) => {
					const remainingTabs = containerTabs.filter(
						(tab) => !selectedTabs.map((t) => t.id).includes(tab.id),
					);
					const mostRecentTab = this.getMostRecentTab(remainingTabs);
					browser.tabs.update(mostRecentTab.id, { active: true });

					browser.tabs.remove(selectedTabs.map((t) => t.id || 0));
					this.updateTabs();
				});
		});
	}

	createContextMenu() {
		browser.contextualIdentities.query({}).then((contextIds) => {
			browser.tabs.query({ highlighted: true }).then((selectedTabs) => {
				// Clear existing context menus
				browser.contextMenus.removeAll();

				browser.contextMenus.create({
					id: "switch-to-workspace",
					title: "Switch to workspace",
					contexts: ["tab", "page"],
				});

				browser.contextMenus.create({
					id: `switch-to-all`,
					parentId: "switch-to-workspace",
					title: "All",
					contexts: ["tab", "page"],
				});

				if (this.currentWorkspace != "firefox-default") {
					browser.contextMenus.create({
						id: `switch-to-firefox-default`,
						parentId: "switch-to-workspace",
						title: "Default",
						contexts: ["tab", "page"],
					});
				}
				for (const contextId of contextIds) {
					if (contextId.cookieStoreId == this.currentWorkspace) {
						continue;
					}

					browser.contextMenus.create({
						id: `switch-to-${contextId.cookieStoreId}`,
						parentId: "switch-to-workspace",
						title: contextId.name,
						contexts: ["tab", "page"],
					});
				}

				browser.contextMenus.create({
					id: "move-to-workspace",
					title:
						selectedTabs.length > 1
							? "Move tabs to workspace"
							: "Move tab to workspace",
					contexts: ["tab"],
				});

				if (this.currentWorkspace) {
					browser.contextMenus.create({
						id: `move-to-firefox-default`,
						parentId: "move-to-workspace",
						title: "Default",
						contexts: ["tab", "page"],
					});
				}

				for (const contextId of contextIds) {
					if (contextId.cookieStoreId == this.currentWorkspace) {
						continue;
					}

					if (this.currentWorkspace != contextId.cookieStoreId) {
						browser.contextMenus.create({
							id: `move-to-${contextId.cookieStoreId}`,
							parentId: "move-to-workspace",
							title: contextId.name,
							contexts: ["tab"],
						});
					}
				}
			});
		});
	}
}
