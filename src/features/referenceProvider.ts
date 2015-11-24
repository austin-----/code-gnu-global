import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalReferenceProvider extends AbstractProvider implements vscode.ReferenceProvider {
	public provideReferences(document: vscode.TextDocument, position: vscode.Position, options: { includeDeclaration: boolean;}, token: vscode.CancellationToken): Promise<vscode.Location[]> {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
		var self = this;
		return this._global.run(['--encode-path', "' '", '-rax', word])
			.then(function(output) {
				console.log(output);
				var bucket = new Array<vscode.Location>();
				try {
					output.toString().split(/\r?\n/)
						.forEach(function(value, index, array) {
							var result = self._global.parseLine(value);
							if (result == null) return;

							bucket.push(new vscode.Location(vscode.Uri.file(result.path), new vscode.Range(new vscode.Position(result.line, 0), new vscode.Position(result.line, 0))));
						});
				}
				catch (ex) {
					console.error("Error: " + ex);
				}
				return bucket;
			});
	}
}