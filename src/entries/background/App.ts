import browser from "webextension-polyfill";

export class App {
	currentWorkspace: string;

	constructor() {
		this.currentWorkspace = "firefox-default";
	}

	// Loads the workspace states from browser storage
	loadFromStorage() {
		browser.storage.local.get(["currentWorkspace"]).then((data) => {
			if (data.currentWorkspace) {
				this.currentWorkspace = data.currentWorkspace;
			}

			this.updateTabs();
		});
	}

	// Initialize tabs to ensure all are assigned to a workspace
	// initializeTabs() {
	//     browser.tabs.query({}).then((tabs) => {
	//         tabs.forEach((tab) => {
	//             let isInWorkspace = false;
	//             for (let ws in this.workspaces) {
	//                 if (tab.id !== undefined) {
	//                     if (this.workspaces[ws].contains(tab.id)) {
	//                         isInWorkspace = true;
	//                         break;
	//                     }
	//                 }
	//             }
	//
	//             if (!isInWorkspace && tab.id !== undefined) {
	//                 this.workspaces.default.push(tab.id);
	//             }
	//         });
	//
	//         this.saveWorkspaces();
	//         this.updateTabs();
	//     });
	// }

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

	// moveSelectedTabsToWorkspace(workspace: string) {
	//     browser.tabs
	//         .query({
	//             highlighted: true,
	//             currentWindow: true,
	//         })
	//         .then((tabs) => {
	//             // If tab is the active tab, activate the previously active tab
	//             getActiveTabId().then((activeTabId) => {
	//                 for (let tab of tabs) {
	//                     if (tab.id !== undefined) {
	//                         if (activeTabId === tab.id) {
	//                             let previousTab = this.workspaces[this.currentWorkspace].get(1);
	//
	//                             // If there is no previous tab, create a new one in the current workspace
	//                             if (!previousTab) {
	//                                 browser.tabs.create({ active: true }).then((newTab) => {
	//                                     previousTab = newTab.id!;
	//                                 });
	//                             }
	//
	//                             browser.tabs.update(previousTab, { active: true });
	//                         }
	//
	//                         this.workspaces[workspace].push(tab.id);
	//                         this.workspaces[this.currentWorkspace].remove(tab.id);
	//
	//                         this.saveWorkspaces();
	//                         this.updateTabs();
	//                     }
	//                 }
	//             });
	//         });
	// }

	// Create context menu for moving tabs to workspaces
	// createContextMenu() {
	// 	// Clear existing context menus
	// 	browser.contextMenus.removeAll();
	//
	// 	browser.contextMenus.create({
	// 		id: "move-to-workspace",
	// 		title: "Move to workspace...",
	// 		contexts: ["tab"],
	// 	});
	//
	// 	for (let workspace in this.workspaces) {
	// 		browser.contextMenus.create({
	// 			id: `move-to-${workspace}`,
	// 			parentId: "move-to-workspace",
	// 			title: workspace,
	// 			contexts: ["tab"],
	// 		});
	// 	}
	//
	// 	browser.contextMenus.create({
	// 		id: "separator",
	// 		parentId: "move-to-workspace",
	// 		type: "separator",
	// 		contexts: ["tab"],
	// 	});
	//
	// 	browser.contextMenus.create({
	// 		id: "create-workspace-with-tabs",
	// 		parentId: "move-to-workspace",
	// 		title: "Create Workspace with Selected Tabs",
	// 		contexts: ["tab"],
	// 	});
	// }
}

async function getActiveTabId(): Promise<number> {
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	let activeTabId = 0;
	if (tabs.length > 0 && tabs[0].id !== undefined) {
		activeTabId = tabs[0].id;
	}
	return activeTabId;
}
