import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';
import { GlobalLine } from '../global';

export default class GlobalDefinitionProvider extends AbstractProvider implements vscode.DefinitionProvider {
	public async provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
		var self = this;
		try {
			const output = await this._global.run(['--encode-path', ' ', '-xa', word]);
			console.log(output);
			try {
				var bucket = new Array<GlobalLine>();
				if (output != null) {
					output.toString().split(/\r?\n/)
						.forEach(function (value, index, array) {
							var result = self._global.parseLine(value);
							if (result == null)
								return null;
							console.log(result.path);
							bucket.push(result);
						});
				}
				if (bucket.length == 0) {
					return null;
				}
				return bucket.map((value, index, array) =>
					new vscode.Location(vscode.Uri.file(value.path), new vscode.Position(value.line, 0))
				);
			}
			catch (ex) {
				console.error("Error: " + ex);
			}
			return null;
		}
		catch (e) {
			return null;
		}
	}
}
