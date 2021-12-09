# Focus changer

Change focus between windows in all directions using your keyboard. The extension will first try to find a suitable window within the same monitor. If there is none, it will try to find one on the next monitor in that direction (in a multi-monitor setup).

## Default shortcuts:

```
<Super>+h = Focus left
<Super>+j = Focus down
<Super>+k = Focus up
<Super>+l = Focus right
```

They can all be changed in the extension preferences.

## Installation

### Recommended:

Use the [GNOME Shell Extensions](https://extensions.gnome.org/extension/4627/focus-changer) website to
install and enable the latest version.

### Manual:

1.  Clone the repo:

```
git clone https://github.com/martinhjartmyr/gnome-shell-extension-focus-changer.git $HOME/.local/share/gnome-shell/extensions/focus-changer@heartmire
```

2. Restart GNOME, `ALT-F2` and run `r` to restart.

3. Enable the extension:

```
gnome-extensions enable focus-changer@heartmire
```

