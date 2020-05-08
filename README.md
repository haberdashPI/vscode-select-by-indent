# Select by Indent

This simple extension adds the command: "Expand Selection by Indentation Level".
It works much like other expand selection commands but uses the indentation
level as the cue to determine where and by how much the selection expands.

There is also a more "python-friendly" variant of the command, which only expands to the top surrounding indent, rather than both top and bottom: "Expand Selection by Indentation Level (top only)".

Future plans include the ability to move to the start or end of a given
indentation level.

There are currently no default keybindings for the command. You can add new
keybindings by running the `Preferences: Open Keyboard Shortcuts` command
(⌘K ⌘S on mac, or ^K, ^S on windows or linux).

![screen capture of extension at work](screencap.gif)