var exec = require('child-process-promise').exec;
import * as vscode from 'vscode';

function execute(command: string): Promise<Buffer> {
    return exec(command, {
		cwd: vscode.workspace.rootPath	
	})
	.then(function (result): Buffer {
		return result.stdout;
	}).fail(function (error) {
		console.error("Error: " + error);
	}).progress(function (childProcess) {
		console.log("Command: " + command + " running...");
	});
};

export class Global {
	exec: string;
	
	run(params: string[]): Promise<Buffer> {
		return execute(this.exec + ' ' + params.join(' '));
	}
	
	parseLine(content: string): any {
		try {
			if (content == null || content == "") return null;

			var values = content.split(/ +/);
			var tag = values[0];
			var line = parseInt(values[1]) - 1;
			var path = values[2].replace("%20", " ");
			var info = values[3];

			return { "tag": tag, "line": line, "path": path, "info": info };
		} catch (ex) {
			console.error("Error: " + ex);
		}
		return null;
	}
	
	constructor(exec:string) {
		this.exec = exec;
	}
}