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
    let disposable = vscode.commands.registerCommand('vscode-select-by-indent.select', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-top-only', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{toponly: true}));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-inner', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{inner: true}));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-outer', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{outer: true}));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-outer-down', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{outer: true, moveDown: true}));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-outer-top-only', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{outer: true, toponly: true}));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('vscode-select-by-indent.select-outer-down-top-only', () => {
        let editor = vscode.window.activeTextEditor;
        if(editor){
            editor.selections = editor.selections.map(expandByIndent(editor,{outer: true, toponly: true, moveDown: true}));
        }
    });
    context.subscriptions.push(disposable);
}

function lineRange(doc: vscode.TextDocument, from: number,to: number){
    return to === doc.lineCount-1 ?
        new Range(new Position(from,0), doc.lineAt(to).range.end) :
        new Range(new Position(from,0), new Position(to+1,0))
}

function findIndents(doc: vscode.TextDocument, text: string){
    text = text.replace(/(\r|\r\n|\n)$/,'')
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

function findNextIndent(doc: vscode.TextDocument, line: number, indent: number,
    advance: number): [number, number]{

    let at = line+advance
    let nextIndent = findIndent(doc,doc.getText(lineRange(doc, at, at)))
    while(at > 0 && at < doc.lineCount-1 &&
          (nextIndent === undefined || nextIndent >= indent)){
        at = at + advance
        nextIndent = findIndent(doc,doc.getText(lineRange(doc, at, at)))
    }
    if(nextIndent === undefined){
        return [indent, at]
    }else{
        return [nextIndent, at]
    }
}

interface IOptions {
    toponly?: boolean,
    inner?: boolean,
    outer?: boolean
    moveDown?: boolean
}

function includeOuter(doc: vscode.TextDocument,
    before: number, atBefore: number,
    after: number, atAfter: number, options: IOptions){

    // add the outer surrounding indents
    if(before !== after){
        if(before > after){
            atAfter--;
        }else if(after > before && !options?.toponly){
            atBefore++;
        }
    }

    if(options?.toponly){ atAfter--; }
    else{
        // only include the lower line if it isn't separated by
        // whitespace
        let str = doc.getText(lineRange(doc,atAfter-1,atAfter-1))
        let lastIndent = findIndent(doc,str)
        if(lastIndent === undefined){
            atAfter--;
        }
    }

    return [before, atBefore, after, atAfter]
}

function expandByIndent(editor: vscode.TextEditor, options: IOptions | undefined = {}){
    return function(sel: vscode.Selection){
        let doc = editor.document;

        let from = sel.start.line;
        let to = sel.end.line;
        if(sel.start.line === sel.end.line && options.moveDown){
            to = from += 1;
        }
        if(sel.end.character === 0 && sel.end.line > sel.start.line) to--

        let lines = doc.getText(lineRange(doc,from,to));
        let indents = findIndents(doc,lines);
        let minIndent = indents.reduce(minUndef)
        if(minIndent === undefined){
            let [minIndentBefore, atMinBefore] = findNextIndent(doc,from,Number.POSITIVE_INFINITY,-1);
            let [minIndentAfter, atMinAfter] = findNextIndent(doc,to,Number.POSITIVE_INFINITY,1);
            if(!Number.isFinite(minIndentBefore) && !Number.isFinite(minIndentAfter)){
                minIndent = undefined
            }else if(!Number.isFinite(minIndentBefore)){
                minIndent = minIndentAfter
            }else if(!Number.isFinite(minIndentAfter)){
                minIndent = minIndentBefore
            }else if(minIndentBefore < minIndentAfter){
                minIndent = minIndentAfter
            }else{
                minIndent = minIndentBefore
            }
        }

        if(minIndent !== undefined){
            let [before, atBefore] = findNextIndent(doc,from,minIndent,-1);
            let [after, atAfter] = findNextIndent(doc,to,minIndent,1);

            let range = lineRange(doc,
                before < minIndent ? atBefore+1 : atBefore,
                after < minIndent ? atAfter-1 : atAfter
            );

            let proposed = new vscode.Selection(range.start, range.end);

            // expand to outer lines, if the selection is unchanged or
            // if the outer lines should always be included
            if(options?.outer || (proposed.isEqual(sel) && !options?.inner)){
                // add the outer surrounding indents
                if(before !== after){
                    if(before > after){
                        atAfter--;
                    }else if(after > before && !options?.toponly){
                        atBefore++;
                    }
                }

                if(options?.toponly){ atAfter--; }
                else{
                    // only include the lower line if it isn't separated by
                    // whitespace
                    let str = doc.getText(lineRange(doc,atAfter-1,atAfter-1));
                    let lastIndent = findIndent(doc,str);
                    if(lastIndent === undefined){
                        atAfter--;
                    }
                }


                let range = lineRange(doc,atBefore,atAfter);
                return new vscode.Selection(range.start, range.end);
            }

            if(proposed.isEqual(sel)){
                // repeaat the search outwards, to another indentation level
                minIndent = Math.max(before,after);
                [before, atBefore] = findNextIndent(doc,atBefore+1,minIndent,-1);
                [after, atAfter] = findNextIndent(doc,atAfter-1,minIndent,1);

                let range = lineRange(doc,
                    before < minIndent ? atBefore+1 : atBefore,
                    after < minIndent ? atAfter-1 : atAfter
                );
                return new vscode.Selection(range.start, range.end);
            }else{
                return proposed;
            }

            return proposed;
        }
        return sel;
    }
}
// this method is called when your extension is deactivated
export function deactivate() {}
