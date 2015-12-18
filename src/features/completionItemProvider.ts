import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalCompletionItemProvider extends AbstractProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.CompletionItem[]> {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
		return this._global.run(['-c', word])
		.then(function(output){
			console.log(output);
			var bucket = new Array<vscode.CompletionItem>();
			output.toString().split(/\r?\n/)
			.forEach(function(value, index, array){
				bucket.push(new vscode.CompletionItem(value));
			});
			return bucket;
		});
	}
}