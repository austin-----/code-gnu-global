import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

export default class GlobalDefinitionProvider extends AbstractProvider implements vscode.DefinitionProvider {
	public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location> {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
		var self = this;
		return this._global.run(["--encode-path", "' '", "-xa", word])
		.then(function(output){
			console.log(output);
			var currentFile = document.fileName;
			console.log(currentFile);
			var filePath = "";
			var line = 0;
			var found = false;
			try {
				output.toString().split(/\r?\n/)
				.forEach(function(value, index, array){
					var result = self._global.parseLine(value);
					if (result == null)return;
					
					console.log(result.path);
					if (!found || result.path == currentFile) {
						filePath = result.path;
						line = result.line;
						found = true;
					}
				});
			}
			catch (ex){
				console.error("Error: " + ex);
			}
			if (found) {
				return new vscode.Location(vscode.Uri.file(filePath), new vscode.Position(line, 0));
			} else {
				return null;
			}
		});
	}
}