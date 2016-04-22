import * as vscode from 'vscode';
import AbstractProvider from './abstractProvider';

function toCompletionItemKind(kind: vscode.SymbolKind): vscode.CompletionItemKind {
    if (kind == vscode.SymbolKind.Variable) {
        return vscode.CompletionItemKind.Variable;
    } else if (kind == vscode.SymbolKind.Function) {
        return vscode.CompletionItemKind.Function;
    } else if (kind == vscode.SymbolKind.Class) {
        return vscode.CompletionItemKind.Class;
    } else if (kind == vscode.SymbolKind.Enum) {
        return vscode.CompletionItemKind.Enum;
    } else {
        return vscode.CompletionItemKind.Variable;
    }
}

export default class GlobalCompletionItemProvider extends AbstractProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Thenable<vscode.CompletionItem[]> {
		console.log(position);
		var word = document.getText(document.getWordRangeAtPosition(position)).split(/\r?\n/)[0];
        var self = this;
		return this._global.run(['-x', '"^' + word + '.*"'])
		.then(function(output){
			console.log(output);
			var bucket = new Array<vscode.CompletionItem>();
            if (output != null) {
                output.toString().split(/\r?\n/)
			    .forEach(function(value, index, array){
                    var result = self._global.parseLine(value);
                    if (result == null)return;
                    var item = new vscode.CompletionItem(result.tag);
                    item.detail = result.info;
                    item.kind = toCompletionItemKind(result.kind);
                    bucket.push(item);
			    });
            }
			return bucket;
		});
	}
}