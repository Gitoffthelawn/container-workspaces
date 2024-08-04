import browser from "webextension-polyfill";
import { App } from "./App";

let app = new App();
app.loadFromStorage();
app.initializeTabs();
app.updateTabs();
app.createContextMenu();

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId.toString().startsWith("move-to-")) {
        let workspace = info.menuItemId.toString().replace("move-to-", "");
        app.moveSelectedTabsToWorkspace(workspace);
    }

    if (info.menuItemId === "create-workspace-with-tabs") {
        browser.tabs.query({ active: true }).then((tabs) => {
            if (tabs[0] && tabs[0].id) {
                browser.tabs
                    .sendMessage(tabs[0].id, { action: "getNewWorkspaceName" })
                    .then((response) => {
                        if (response.workspace) {
                            browser.windows.getLastFocused().then((window) => {
                                if (window.id) {
                                    browser.windows
                                        .update(window.id, { focused: true })
                                        .then(() => {
                                            app.createWorkspace(response.workspace);
                                            app.moveSelectedTabsToWorkspace(response.workspace);
                                        });
                                }
                            });
                        }
                    })
                    .catch(() => {
                        console.error("Unable to create dialog in currently focused tab.");
                    });
            }
        });
        // browser.windows.create({
        //   type: "detached_panel",
        //   url: browser.runtime.getURL("src/entries/panel/index.html"),
        //   width: 200,
        //   height: 150,
        // });
    }
});

browser.runtime.onMessage.addListener((message) => {
    switch (message.action) {
        case "createWorkspace": {
            app.createWorkspace(message.name);
            break;
        }
        case "createWorkspaceWithTabs": {
            browser.windows.getLastFocused().then((window) => {
                if (window.id) {
                    browser.windows.update(window.id, { focused: true }).then(() => {
                        app.createWorkspace(message.name);
                        app.moveSelectedTabsToWorkspace(message.name);
                    });
                }
            });
            break;
        }
        case "switchWorkspace": {
            app.switchWorkspace(message.name);
            break;
        }
        case "renameWorkspace": {
            app.renameWorkspace(message.oldName, message.newName);
            break;
        }
        case "deleteWorkspace": {
            app.deleteWorkspace(message.name);
            break;
        }
        case "getWorkspaces": {
            const message = {
                workspaces: app.workspaces,
                currentWorkspace: app.currentWorkspace,
            };
            return Promise.resolve(message);
        }
    }
    return Promise.resolve();
});

// Listen for tab creation events
browser.tabs.onCreated.addListener((tab) => {
    // Assign the new tab to the current active workspace
    if (tab.id !== undefined) {
        app.workspaces[app.currentWorkspace].push(tab.id);
    }
    app.saveWorkspaces();
    app.updateTabs();
});

// Listen for tab removal events
browser.tabs.onRemoved.addListener((tabId, _) => {
    // Remove the tab from all workspaces
    for (let ws in app.workspaces) {
        app.workspaces[ws].remove(tabId);
    }

    app.saveWorkspaces();
    app.updateTabs();
});

// Listen for tab activation events
browser.tabs.onActivated.addListener((activeInfo) => {
    app.workspaces[app.currentWorkspace].unshift(activeInfo.tabId);

    app.saveWorkspaces();
});

// Initially update tabs to reflect the current workspace
app.updateTabs();
