# Change Log

## 0.3.0
- **feature**: Selecty by Indent now works in vscode.dev

## 0.2.1
- **cleanup**: fix downstream vulnerabilities, cleanup build process

## 0.2.0
- **feature**: new commands to select 'outer' indentation when cursor is on
  one of said outer indentation lines.

## 0.1.2

- fix downstream vulnerabilities

## 0.1.1

- small revisions to README.

## 0.1.0

- fixed bug when selecting single-line indent region
- added large variety of options for how indentation is used to expand the
  selection (inner only outer only and top only variations).

## 0.0.3

- added explicit "top-only" version of command; this ensures proper selection
in a python style indentation layout (note that the original command already
does this properly if there is a space after each indent block)

## 0.0.2

- more friendly selection behavior: don't expand lower line if line above it is
whitespace (ala python)

## 0.0.1

- Initial release