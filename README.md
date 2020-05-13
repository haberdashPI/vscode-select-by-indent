# Select by Indent

This extension adds the command: "Expand Selection by Indentation Level" and
several variants thereof. It works much like other expand selection commands but
uses the indentation level as the cue to determine where and by how much the
selection expands.

![screen capture of extension at work](screencap.gif)

Each version of the command differs in how the selection expands in reference to
indentation level. The commands are:

- `Expand Selection by Indentation Level (inner only)` -- Expand the selection so
  that all lines with the same or greater amount of indentation than the
  currently selected lines.
- `Expand Selection by Indentation level (outer only)` -- Expand the selection so
  that all lines at the same or greater amount of indentation than the currently
  selected lines; then include the lines just above and below this
  (the outer lines).
- `Expand Selection by Indentation level (outer top only)` -- Expand the selection
  so that all lines at the same or greater amount of indentation than the
  currently selected lines are selected; then include the line just above this
  (the top outer line).
- `Expand Selection by Indentation level` -- Alternate expanding by
   the inner-only and the outer-only rules, described above.
- `Expand Selection by Indentation level (top only)` -- Alternate expanding by
  the inner-only and the outer-top-only rules, described above.

There are currently no default keybindings. You can add new keybindings by
running the `Preferences: Open Keyboard Shortcuts` command (⌘K ⌘S on mac, or ^K,
^S on windows or linux).
