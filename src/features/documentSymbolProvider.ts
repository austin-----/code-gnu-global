import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalDocumentSymbolProvider extends AbstractProvider implements vscode.DocumentSymbolProvider {	
	public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
		var self = this;
		return this._global.run(['--encode-path', ' ', '-f', this._global.pathcyg(document.fileName)], this._options)
		.then(function(output){
			console.log(output);
			var bucket = new Array<vscode.SymbolInformation>();
			try {
				if (output != null) {
					output.toString().split(/\r?\n/)
					.forEach(function(value, index, array){
						var result = self._global.parseLine(value);
						if (result == null)return;
						bucket.push(new vscode.SymbolInformation(result.tag, result.kind, new vscode.Range(new vscode.Position(result.line, 0), new vscode.Position(result.line, 0))));
					});
				}
			}
			catch (ex){
				console.error("Error: " + ex);
			}
			return bucket;
		});
	}
}
