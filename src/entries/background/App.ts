import browser from "webextension-polyfill";

export class App {
	currentWorkspace: string;

	constructor() {
		this.currentWorkspace = "firefox-default";
	}

	// Loads the workspace states from browser storage
	loadFromStorage() {
		browser.storage.local.get(["currentWorkspace"]).then((data) => {
			this.currentWorkspace = data.currentWorkspace || "firefox-default";

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
					if (this.currentWorkspace == "firefox-default") {
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
		if (!cookieStoreId) {
			cookieStoreId = "firefox-default";
		}
		browser.tabs.query({ cookieStoreId: cookieStoreId }).then((tabs) => {
			if (tabs.length > 0) {
				const nextActiveTab = tabs[0].id;
				browser.tabs
					.update(nextActiveTab, {
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
