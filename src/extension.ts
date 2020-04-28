// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Range, Position} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('vscode-move-by-indent.select', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor));
        }
    });

    context.subscriptions.push(disposable);
}

function lineRange(doc: vscode.TextDocument, from: number,to: number){
    return doc.lineCount > to ?
        new Range(new Position(from,0), new Position(to+1,0)) :
        new Range(new Position(from,0), doc.lineAt(to).range.end)
}

function findIndents(doc: vscode.TextDocument, text: string){
    let lines = text.split(/[\r\n]+/)

    let tabSizeSetting = vscode.workspace.getConfiguration('editor',doc).
        get<number>('tabSize')
    let tabSize = tabSizeSetting ? tabSizeSetting : 4;
    let tab = '';
    for(let i=0;i<tabSize;i++){
        tab += ' ';
    }

    return lines.map(line => {
        if(line.length === 0 || line.match(/^\s+$/)){
            return undefined
        }else{
            let indent = line.match(/^\s*/)
            if(indent){
                let indentStr = indent[0].replace(/\t/,tab)
                return indentStr.length
            }
            return 0;
        }
    })
}

function findIndent(doc: vscode.TextDocument, text: string){
    let indents = findIndents(doc, text)
    if(indents.length !== 1){
        vscode.window.showErrorMessage("Expected single line")
    }
    return indents[0];
}

function minUndef(x: number | undefined, y: number | undefined){
    if(x === undefined && y === undefined) return undefined
    else if(x === undefined) return y
    else if(y == undefined) return x
    else return Math.min(x,y)
}

function findIndentBefore(doc: vscode.TextDocument,minIndent: number,from: number){
    let at = from-1;
    while(at > 0){
        let indent = findIndent(doc,doc.getText(lineRange(doc,at,at)))
        if(indent !== undefined && indent < minIndent) return at+1
        at--;
    }
    return 0;
}

function findIndentAfter(doc: vscode.TextDocument,minIndent: number,to: number){
    let at = to+1;
    while(at <= doc.lineCount){
        let indent = findIndent(doc,doc.getText(lineRange(doc,at,at)))
        if(indent !== undefined && indent < minIndent) return at-1
        at++;
    }
    return doc.lineCount;
}

function expandByIndent(editor: vscode.TextEditor){
    return function(sel: vscode.Selection){
        let doc = editor.document;

        let from = sel.start.line
        let to = sel.end.line
        let lines = doc.getText(lineRange(doc,from,to));
        let indents = findIndents(doc,lines);
        let minIndent = indents.reduce(minUndef)
        if(minIndent){
            let before = findIndent(doc,doc.getText(lineRange(doc,from-1,from-1)))
            let after = findIndent(doc,doc.getText(lineRange(doc,to+1,to+1)))

            let unselectedOuter = (after ? after < minIndent : true) &&
                (before ? before < minIndent && before === after : false)

            if(unselectedOuter){
                let range = lineRange(doc,from-1,to+1)
                return new vscode.Selection(range.start,range.end)
            }else{
                let start = findIndentBefore(doc,minIndent,from)
                let end = findIndentAfter(doc,minIndent,to)
                let range = lineRange(doc,start,end)
                return new vscode.Selection(range.start,range.end)
            }
        }
        return sel
    }
}
// this method is called when your extension is deactivated
export function deactivate() {}
