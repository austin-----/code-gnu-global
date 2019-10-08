// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Global} from './global';
import CompletionItemProvider from './features/completionItemProvider'
import DefinitionProvider from './features/definitionProvider'
import DocumentSymbolProvider from './features/documentSymbolProvider'
import ReferenceProvider from './features/referenceProvider'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-gnu-global" is now active!'); 

    var configuration = vscode.workspace.getConfiguration('codegnuglobal');
    var executable = configuration.get<string>('executable', 'global');
    var cygbase;
    if (process.platform === 'win32') {
        cygbase = configuration.get<string | undefined | null>('cygbase');
        if (cygbase == undefined) {
            var guess = executable.match(/^(.*?)(?:[/\\]usr)?[/\\]bin[/\\]global(?:.exe)?$/i)
            cygbase = guess ? guess[1] : undefined
        }
    }
    const global = new Global(executable, cygbase);
    const filter = [ { scheme: 'file', language: 'c' }, { scheme: 'file', language: 'cpp' } ];
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(filter, new CompletionItemProvider(global), '.', '>'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(filter, new DefinitionProvider(global)));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(filter, new DocumentSymbolProvider(global)));
    context.subscriptions.push(vscode.languages.registerReferenceProvider(filter, new ReferenceProvider(global)));
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(d => global.updateTags()));
}
