import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalDocumentSymbolProvider extends AbstractProvider implements vscode.DocumentSymbolProvider {	
	public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
		var self = this;
		return this._global.run(['--encode-path', '" "', '-f', '"' + document.fileName + '"'])
		.then(function(output){
			console.log(output);
			var bucket: vscode.SymbolInformation[] = new Array<vscode.SymbolInformation>();
			try {
				output.toString().split(/\r?\n/)
				.forEach(function(value, index, array){
					var result = self._global.parseLine(value);
					if (result == null)return;
					var kind = vscode.SymbolKind.Function;
					switch (result.info) {
						case 'class':
							kind = vscode.SymbolKind.Class;
							break;
						case 'struct':
							kind = vscode.SymbolKind.Class;
							break;
						case 'enum':
							kind = vscode.SymbolKind.Enum;
							break;
					}
					bucket.push(new vscode.SymbolInformation(result.tag, kind, new vscode.Range(new vscode.Position(result.line, 0), new vscode.Position(result.line, 0))));
				});
			}
			catch (ex){
				console.error("Error: " + ex);
			}
			return bucket;
		});
	}
}