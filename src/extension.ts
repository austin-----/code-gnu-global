// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 
import {Global} from './global';
import CompletionItemProvider from './features/completionItemProvider'
import DefinitionProvider from './features/definitionProvider'
import DocumentSymbolProvider from './features/documentSymbolProvider'
import ReferenceProvider from './features/referenceProvider'

// Node: clang for completion
// clang -cc1 -fsyntax-only -I/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/include -I/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../include/c++/v1 -I/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/../lib/clang/7.0.0/include -I/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.11.sdk/usr/include -I/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.11.sdk/System/Library/Frameworks -code-completion-at main.cpp:26:33 main.cpp

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-gnu-global" is now active!'); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});
	
	context.subscriptions.push(disposable);
	
	const global = new Global("/usr/local/bin/global");
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['cpp', 'c'], new CompletionItemProvider(global), '.', '>'));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider(['cpp', 'c'], new DefinitionProvider(global)));
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(['cpp', 'c'], new DocumentSymbolProvider(global)));
	context.subscriptions.push(vscode.languages.registerReferenceProvider(['cpp', 'c'], new ReferenceProvider(global)));
}