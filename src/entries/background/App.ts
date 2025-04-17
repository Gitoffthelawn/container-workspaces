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
		browser.tabs.query({}).then((tabs) => {
			tabs.forEach((t) => {
				if (t.id) {
					if (!this.currentWorkspace) {
						browser.tabs.show(t.id);
						return;
					}

					if (t.cookieStoreId === this.currentWorkspace) {
						browser.tabs.show(t.id);
					} else {
						browser.tabs.hide(t.id);
					}
				}
			});
		});
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
					const mostRecentTab = tabs.reduce((mostRecent, current) => {
						if (!current.lastAccessed || !mostRecent.lastAccessed) {
							return mostRecent;
						}
						if (!mostRecent || current.lastAccessed > mostRecent.lastAccessed) {
							return current;
						}
						return mostRecent;
					}, tabs[0]);

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
	}

	openTabInCurrentWorkspace(tab: browser.Tabs.Tab) {
		browser.tabs
			.update(tab.id, {
				active: true,
			})
			.then(() => {
				this.updateTabs();
			});
	}
}
