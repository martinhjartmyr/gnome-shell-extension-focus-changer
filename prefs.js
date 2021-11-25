'use strict';

const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const ExtensionUtils = imports.misc.extensionUtils;

const COLUMN_ID = 0;
const COLUMN_DESC = 1;
const COLUMN_KEY = 2;
const COLUMN_MODS = 3;

// eslint-disable-next-line no-unused-vars
function init() {
}

// eslint-disable-next-line no-unused-vars
function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.focus-changer');

    const prefsWidget = new Gtk.Grid({
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20,
        row_spacing: 20,
    });

    const keybindingLabel  = new Gtk.Label({
        label: 'Keyboard shortcuts',
        hexpand: true,
        halign: Gtk.Align.START,
    });
    prefsWidget.attach(keybindingLabel, 0, 0, 1, 1);


    // Setup the store
    let store = new Gtk.ListStore();
    store.set_column_types(
        [GObject.TYPE_STRING, // COLUMN_ID
            GObject.TYPE_STRING, // COLUMN_DESC
            GObject.TYPE_INT,    // COLUMN_KEY
            GObject.TYPE_INT]);  // COLUMN_MODS

    addKeybinding(store, settings, 'focus-up', 'Focus up');
    addKeybinding(store, settings, 'focus-down', 'Focus down');
    addKeybinding(store, settings, 'focus-left', 'Focus left');
    addKeybinding(store, settings, 'focus-right', 'Focus right');

    let treeView = new Gtk.TreeView();
    treeView.model = store;
    treeView.headers_visible = false;

    // Desc text
    let  renderer, column;
    renderer = new Gtk.CellRendererText();
    column = new Gtk.TreeViewColumn();
    column.expand = true;
    column.pack_start(renderer, true);
    column.add_attribute(renderer, 'text', COLUMN_DESC);
    treeView.append_column(column);

    // Key binding
    renderer = new Gtk.CellRendererAccel();
    renderer.accel_mode = Gtk.CellRendererAccelMode.GTK;
    renderer.editable = true;
    column = new Gtk.TreeViewColumn();
    column.pack_end(renderer, false);
    column.add_attribute(renderer, 'accel-key', COLUMN_KEY);
    column.add_attribute(renderer, 'accel-mods', COLUMN_MODS);
    treeView.append_column(column);
    prefsWidget.attach(treeView, 0, 1, 2, 1);


    // Events
    renderer.connect('accel-edited',
        (_, path, key, mods, __) => {
            let [ok, iter] = store.get_iter_from_string(path);
            if (!ok)
                return;

            store.set(iter, [COLUMN_KEY, COLUMN_MODS], [key, mods]);

            let id = store.get_value(iter, COLUMN_ID);
            let accelString = Gtk.accelerator_name(key, mods);
            settings.set_strv(id, [accelString]);
        });

    renderer.connect('accel-cleared',
        (_, path) => {
            let [ok, iter] = store.get_iter_from_string(path);
            if (!ok)
                return;

            store.set(iter, [COLUMN_KEY, COLUMN_MODS], [0, 0]);

            let id = store.get_value(iter, COLUMN_ID);
            settings.set_strv(id, []);
        });

    return prefsWidget;
}


function addKeybinding(model, settings, id, description) {
    // Get the current accelerator.
    let accelerator = settings.get_strv(id)[0];
    let key, mods;
    if (accelerator === null)
        [key, mods] = [0, 0];
    else
        [, key, mods] = Gtk.accelerator_parse(settings.get_strv(id)[0]);

    let row = model.insert(100);
    model.set(row,
        [COLUMN_ID, COLUMN_DESC, COLUMN_KEY, COLUMN_MODS],
        [id,        description,        key,        mods]);
}
