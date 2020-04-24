// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('vscode-move-by-indent.select', () => {
        let editor = vscode.window.activeTextEditor();
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor));
        }
    });

    context.subscriptions.push(disposable);
}

function expandByIndent(editor: vscode.TextEditor){
    return function(sel: vscode.Selection){
        // TODO: plan, check if the outer indent is selected
        // (line above and (possibly below) one indent out)
        // and select just those lines, otherweise
        // select all lines above and below with the same
        // indent (if they exist) or, one indent out
        let doc = editor.document;
        let lines = getLines(doc,sel);
        let indents = lines.map(findIndent,lines);
        let minIndent = indents.reduce(Math.min)
        let unselectedOuter = indents.length > 2 &&
            indents[0] === indents[indents.length-1] &&
            indents[0] === minIndent && indents[0] !== indents[1] &&
            indents[indents.length-1] !== indents[indents.length-2]

        if(outerSelected)

    }

// this method is called when your extension is deactivated
export function deactivate() {}
