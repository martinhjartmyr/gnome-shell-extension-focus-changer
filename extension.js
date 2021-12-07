'use strict';

const { Shell, Meta } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SCHEMA_FOCUS_UP = 'focus-up';
const SCHEMA_FOCUS_DOWN = 'focus-down';
const SCHEMA_FOCUS_RIGHT = 'focus-right';
const SCHEMA_FOCUS_LEFT = 'focus-left';

class FocusChanger {
    constructor() {
        this._workspaceManager = global.workspace_manager;
        this._keyFocusUpId = null;
        this._keyFocusDownId = null;
        this._keyFocusRightId = null;
        this._keyFocusLeftId = null;
        this._activeWindow = null;
    }

    changeFocus(id) {
    // log('focus-changer', id);
        const { activeWindow, activeRect } = this._getActiveWindow();
        if (!activeWindow) {
            this._activeWindow = null;
            return;
        }

        this._activeWindow = activeWindow;
        const bestCandidate = this._getBestCandidate(id, activeWindow.get_monitor(), activeRect);
        if (bestCandidate)
            bestCandidate.activate(global.get_current_time());
    }

    _getMonitorByDirection(id, activeMonitorId) {
        const numberOfMonitors = this._activeWindow.get_display().get_n_monitors();

        let activeMonitor = null;
        const monitors = [];
        for (let i = 0; i < numberOfMonitors; i++) {
            if (i === activeMonitorId)
                activeMonitor = this._activeWindow.get_display().get_monitor_geometry(i);
            else
                monitors.push({ id: i, rect: this._activeWindow.get_display().get_monitor_geometry(i) });
        }

        if (!activeMonitor || !monitors.length)
            return null;

        let bestMonitorCandidate = null;
        switch (id) {
        case SCHEMA_FOCUS_UP:
            for (let m of monitors) {
                if (m.rect.y < activeMonitor.y) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.x - m.rect.x) <
              Math.abs(activeMonitor.x - bestMonitorCandidate.rect.x)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_FOCUS_DOWN:
            for (let m of monitors) {
                if (m.rect.y > activeMonitor.y) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.x - m.rect.x) <
              Math.abs(activeMonitor.x - bestMonitorCandidate.rect.x)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_FOCUS_RIGHT:
            for (let m of monitors) {
                if (m.rect.x > activeMonitor.x) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.y - m.rect.y) <
              Math.abs(activeMonitor.y - bestMonitorCandidate.rect.y)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        case SCHEMA_FOCUS_LEFT:
            for (let m of monitors) {
                if (m.rect.x < activeMonitor.x) {
                    if (!bestMonitorCandidate)
                        bestMonitorCandidate = m;
                    else if (
                        Math.abs(activeMonitor.y - m.rect.y) <
              Math.abs(activeMonitor.y - bestMonitorCandidate.rect.y)
                    )
                        bestMonitorCandidate = m;
                }
            }
            break;
        }

        if (bestMonitorCandidate)
            return bestMonitorCandidate.id;

        return null;
    }

    _getBestCandidate(id, monitor, activeRect) {
        const windows = this._getAllWindows(monitor);
        const { x, y } = activeRect;
        let bestCandidate = null;
        switch (id) {
        case SCHEMA_FOCUS_UP:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.y < y) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.x === bestRect.x && rect.y > bestRect.y)
                            bestCandidate = w;
                        else if (
                            rect.x !== bestRect.x &&
                Math.abs(activeRect.x - rect.x) < Math.abs(activeRect.x - bestRect.x)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_FOCUS_DOWN:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.y > y) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.x === bestRect.x && rect.y < bestRect.y)
                            bestCandidate = w;
                        else if (
                            rect.x !== bestRect.x &&
                Math.abs(activeRect.x - rect.x) < Math.abs(activeRect.x - bestRect.x)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_FOCUS_RIGHT:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.x > x) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.y === bestRect.y && rect.x < bestRect.x)
                            bestCandidate = w;
                        else if (
                            rect.y !== bestRect.y &&
                Math.abs(activeRect.y - rect.y) < Math.abs(activeRect.y - bestRect.y)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        case SCHEMA_FOCUS_LEFT:
            windows.forEach(w => {
                const rect = w.get_frame_rect();
                if (rect.x < x) {
                    if (!bestCandidate) {
                        bestCandidate = w;
                    } else {
                        const bestRect = bestCandidate.get_frame_rect();
                        if (rect.y === bestRect.y && rect.x > bestRect.x)
                            bestCandidate = w;
                        else if (
                            rect.y !== bestRect.y &&
                Math.abs(activeRect.y - rect.y) < Math.abs(activeRect.y - bestRect.y)
                        )
                            bestCandidate = w;
                    }
                }
            });
            break;
        }

        if (!bestCandidate) {
            const newMonitor = this._getMonitorByDirection(id, monitor);
            if (newMonitor !== null) {
                return this._getBestCandidate(
                    id,
                    newMonitor,
                    this._activeWindow.get_display().get_monitor_geometry(monitor)
                );
            }
        }

        return bestCandidate;
    }

    _getAllWindows(monitor) {
        const workspace = this._workspaceManager.get_active_workspace();
        const windows = workspace.list_windows();
        return windows.filter(w => w.get_monitor() === monitor && w.is_hidden() === false);
    }

    _getActiveWindow() {
        const workspace = this._workspaceManager.get_active_workspace();
        const windows = workspace.list_windows();

        let focusedWindow = null;
        let focusedWindowRect = null;

        for (let window of windows) {
            if (window.has_focus()) {
                focusedWindow = window;
                focusedWindowRect = window.get_frame_rect();
                break;
            }
        }

        if (focusedWindow)
            return { activeWindow: focusedWindow, activeRect: focusedWindowRect };
        else
            return null;
    }

    _bindShortcut() {
        this._keyFocusUpId = SCHEMA_FOCUS_UP;
        this._keyFocusDownId = SCHEMA_FOCUS_DOWN;
        this._keyFocusRightId = SCHEMA_FOCUS_RIGHT;
        this._keyFocusLeftId = SCHEMA_FOCUS_LEFT;

        Main.wm.addKeybinding(
            this._keyFocusUpId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.changeFocus(this._keyFocusUpId)
        );
        Main.wm.addKeybinding(
            this._keyFocusDownId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.changeFocus(this._keyFocusDownId)
        );
        Main.wm.addKeybinding(
            this._keyFocusRightId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.changeFocus(this._keyFocusRightId)
        );
        Main.wm.addKeybinding(
            this._keyFocusLeftId,
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => this.changeFocus(this._keyFocusLeftId)
        );
    }

    _unbindShortcut() {
        if (this._keyFocusUpId !== null)
            Main.wm.removeKeybinding(this._keyFocusUpId);
        if (this._keyFocusDownId !== null)
            Main.wm.removeKeybinding(this._keyFocusDownId);
        if (this._keyFocusRightId !== null)
            Main.wm.removeKeybinding(this._keyFocusRightId);
        if (this._keyFocusLeftId !== null)
            Main.wm.removeKeybinding(this._keyFocusLeftId);

        this._keyFocusUpId = null;
        this._keyFocusDownId = null;
        this._keyFocusRightId = null;
        this._keyFocusLeftId = null;
    }

    enable() {
        log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.focus-changer');
        this._bindShortcut();
    }

    disable() {
        log(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this._unbindShortcut();
        this._settings = null;
    }
}

// eslint-disable-next-line no-unused-vars
function init() {
    log(`Initializing ${Me.metadata.name} version ${Me.metadata.version}`);
    return new FocusChanger();
}
