import browser from "webextension-polyfill";
import { Workspace } from "./Workspace";

export class App {
    workspaces: { [key: string]: Workspace };
    currentWorkspace: string;

    constructor() {
        this.workspaces = { default: new Workspace() };
        this.currentWorkspace = "default";
    }

    // Loads the workspace states from browser storage
    loadFromStorage() {
        browser.storage.local.get(["workspaces", "currentWorkspace"]).then((data) => {
            if (data.workspaces) {
                for (let ws in data.workspaces) {
                    this.workspaces[ws] = new Workspace(data.workspaces[ws].items);
                }
            }
            if (data.currentWorkspace) {
                this.currentWorkspace = data.currentWorkspace;
            }
        });
    }

    // Initialize tabs to ensure all are assigned to a workspace
    initializeTabs() {
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((tab) => {
                let isInWorkspace = false;
                for (let ws in this.workspaces) {
                    if (tab.id !== undefined) {
                        if (this.workspaces[ws].contains(tab.id)) {
                            isInWorkspace = true;
                            break;
                        }
                    }
                }

                if (!isInWorkspace && tab.id !== undefined) {
                    this.workspaces.default.push(tab.id);
                }
            });

            this.saveWorkspaces();
            this.updateTabs();
        });
    }

    saveWorkspaces() {
        browser.storage.local.set({
            workspaces: this.workspaces,
            currentWorkspace: this.currentWorkspace,
        });
    }

    updateTabs() {
        for (let ws in this.workspaces) {
            this.workspaces[ws].getItems().forEach((tabId) => {
                browser.tabs
                    .get(tabId)
                    .then((_) => {
                        if (ws === this.currentWorkspace) {
                            browser.tabs.show(tabId);
                        } else {
                            browser.tabs.hide(tabId);
                        }
                    })
                    .catch(() => {});
            });
        }
    }

    createWorkspace(name: string) {
        if (!this.workspaces[name]) {
            this.workspaces[name] = new Workspace();

            this.saveWorkspaces();
            this.createContextMenu();
        }
    }

    renameWorkspace(oldName: string, newName: string) {
        if (this.workspaces[oldName] && oldName !== newName) {
            const ws = this.workspaces[oldName];
            delete this.workspaces[oldName];
            this.workspaces[newName] = ws;

            if (this.currentWorkspace == oldName) {
                this.currentWorkspace = newName;
            }

            this.saveWorkspaces();
            this.updateTabs();
            this.createContextMenu();
        }
    }

    switchWorkspace(workspace: string) {
        if (this.workspaces[workspace]) {
            this.currentWorkspace = workspace;

            const nextActiveTab = this.workspaces[workspace].first();
            if (nextActiveTab) {
                browser.tabs
                    .update(nextActiveTab, {
                        active: true,
                    })
                    .then(() => {
                        this.updateTabs();
                    });
            } else {
                browser.tabs.create({ active: true }).then((newTab) => {
                    this.workspaces[workspace].push(newTab.id!);
                });
                this.updateTabs();
            }

            this.saveWorkspaces();
        }
    }

    moveSelectedTabsToWorkspace(workspace: string) {
        browser.tabs
            .query({
                highlighted: true,
                currentWindow: true,
            })
            .then((tabs) => {
                // If tab is the active tab, activate the previously active tab
                getActiveTabId().then((activeTabId) => {
                    for (let tab of tabs) {
                        if (tab.id !== undefined) {
                            if (activeTabId === tab.id) {
                                let previousTab = this.workspaces[this.currentWorkspace].get(1);

                                // If there is no previous tab, create a new one in the current workspace
                                if (!previousTab) {
                                    browser.tabs.create({ active: true }).then((newTab) => {
                                        previousTab = newTab.id!;
                                    });
                                }

                                browser.tabs.update(previousTab, { active: true });
                            }

                            this.workspaces[workspace].push(tab.id);
                            this.workspaces[this.currentWorkspace].remove(tab.id);

                            this.saveWorkspaces();
                            this.updateTabs();
                        }
                    }
                });
            });
    }

    deleteWorkspace(name: string) {
        if (this.workspaces[name]) {
            this.workspaces[name].getItems().forEach((tabId) => {
                browser.tabs.remove(tabId);
            });
            delete this.workspaces[name];

            if (this.currentWorkspace == name) {
                this.currentWorkspace = "default";
            }

            this.saveWorkspaces();
            this.updateTabs();
            this.createContextMenu();
        }
    }

    // Create context menu for moving tabs to workspaces
    createContextMenu() {
        // Clear existing context menus
        browser.contextMenus.removeAll();

        browser.contextMenus.create({
            id: "move-to-workspace",
            title: "Move to workspace...",
            contexts: ["tab"],
        });

        for (let workspace in this.workspaces) {
            browser.contextMenus.create({
                id: `move-to-${workspace}`,
                parentId: "move-to-workspace",
                title: workspace,
                contexts: ["tab"],
            });
        }

        browser.contextMenus.create({
            id: "separator",
            parentId: "move-to-workspace",
            type: "separator",
            contexts: ["tab"],
        });

        browser.contextMenus.create({
            id: "create-workspace-with-tabs",
            parentId: "move-to-workspace",
            title: "Create Workspace with Selected Tabs",
            contexts: ["tab"],
        });
    }
}

async function getActiveTabId(): Promise<number> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let activeTabId = 0;
    if (tabs.length > 0 && tabs[0].id !== undefined) {
        activeTabId = tabs[0].id;
    }
    return activeTabId;
}
