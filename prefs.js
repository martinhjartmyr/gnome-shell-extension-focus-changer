'use strict';

import Gdk from "gi://Gdk";
import Gtk from 'gi://Gtk';
import Adw from "gi://Adw";

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class FocusChangerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();
        window.set_default_size(650, 400);

        const page = Adw.PreferencesPage.new();
        page.set_title(("Focus changer"));
        page.set_name("focus-changer-preferences");

        const group = Adw.PreferencesGroup.new();
        group.set_title(("Shortcuts"));
        group.set_name("shortcuts_group");
        page.add(group);

        let schemas = [
            {
                id: "focus-up",
                title: "Focus up",
            },
            {
                id: "focus-down",
                title: "Focus down",
            },
            {
                id: "focus-left",
                title: "Focus left",
            },
            {
                id: "focus-right",
                title: "Focus right",
            },
        ]

        schemas.forEach(schema => {
            const row = new Adw.ActionRow({
                title: schema.title,
                // subtitle: ("Shortcut to focus on the window above"),
            });

            const shortcutLabel = new Gtk.ShortcutLabel({
                disabled_text: ("Select a shortcut"),
                accelerator: window._settings.get_strv(schema.id)[0],
                valign: Gtk.Align.CENTER,
                halign: Gtk.Align.CENTER,
            });

            window._settings.connect(`changed::${schema.id}`, () => {
                shortcutLabel.set_accelerator(
                    window._settings.get_strv(schema.id)[0]
                );
            });

            row.connect("activated", () => {
                const ctl = new Gtk.EventControllerKey();

                const content = new Adw.StatusPage({
                    title: schema.title,
                    description: (`Press the shortcut for this action`),
                    icon_name: "preferences-desktop-keyboard-shortcuts-symbolic",
                });

                const editor = new Adw.Window({
                    modal: true,
                    transient_for: page.get_root(),
                    hide_on_close: true,
                    width_request: 320,
                    height_request: 240,
                    resizable: false,
                    content,
                });

                editor.add_controller(ctl);
                ctl.connect("key-pressed", (_, keyval, keycode, state) => {
                    let mask = state & Gtk.accelerator_get_default_mod_mask();
                    mask &= ~Gdk.ModifierType.LOCK_MASK;

                    if (
                        !mask &&
                        (keyval === Gdk.KEY_Escape || keyval === Gdk.KEY_BackSpace)
                    ) {
                        editor.close();
                        return Gdk.EVENT_STOP;
                    }

                    if (
                        !isValidBinding$1(mask, keycode, keyval) ||
                        !isValidAccel$1(mask, keyval)
                    ) {
                        return Gdk.EVENT_STOP;
                    }

                    window._settings.set_strv(schema.id, [
                        Gtk.accelerator_name_with_keycode(
                            null,
                            keyval,
                            keycode,
                            mask
                        ),
                    ]);

                    editor.destroy();
                    return Gdk.EVENT_STOP;
                });

                editor.present();
            });

            row.add_suffix(shortcutLabel);
            row.activatable_widget = shortcutLabel;
            group.add(row);
        });

        window.add(page);
    };
};

const keyvalIsForbidden$1 = (keyval) => {
    return [
        Gdk.KEY_Home,
        Gdk.KEY_Page_Up,
        Gdk.KEY_Page_Down,
        Gdk.KEY_End,
        Gdk.KEY_Tab,
        Gdk.KEY_KP_Enter,
        Gdk.KEY_Return,
        Gdk.KEY_Mode_switch,
        Gdk.KEY_Space,
    ].includes(keyval);
};

const isValidAccel$1 = (mask, keyval) => {
    return (
        Gtk.accelerator_valid(keyval, mask) ||
        (keyval === Gdk.KEY_Tab && mask !== 0)
    );
};

const isValidBinding$1 = (mask, keycode, keyval) => {
    return (
        mask !== 0 &&
        keycode !== 0 &&
        mask & ~(Gdk.ModifierType.SHIFT_MASK) &&
        !(keyvalIsForbidden$1(keyval))
    );
};
