import { ExecOptions, ChildProcess } from 'child_process';
var exec = require('child-process-promise').exec as
    ((command: string, options: { encoding: string } & ExecOptions) => ChildProcessPromise<ExecResult>);
import * as iconv from 'iconv-lite';
import * as vscode from 'vscode';

interface ExecResult {
    stdout: Buffer,
    stderr: Buffer
}

/**
 * Interface derived from lib.es5.d.ts
 *
 * Copyright (c) Microsoft Foundation under Apache License 2.0.
 */
interface ChildProcessPromise<T> extends Promise<T> {
    childProcess: ChildProcess
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): ChildProcessPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): ChildProcessPromise<T | TResult>;
    progress: (arg0: (arg0: ChildProcess) => any) => ChildProcessPromise<T>
}

function execute(command: string): Promise<string | Buffer> {
    var configuration = vscode.workspace.getConfiguration('codegnuglobal');
    var encoding = configuration.get<string>('encoding');
    var output = 'utf8';
    if (encoding != null && encoding != "") {
        output = 'binary';
    }
    return exec(command, {
        cwd: vscode.workspace.rootPath,
        encoding: output,
        maxBuffer: 10*1024*1024
    }).then(function(result): string | Buffer {
        if (encoding != null && encoding != "") {
            var decoded = iconv.decode(result.stdout, encoding);
            return decoded;
        }
        return result.stdout;
    }).catch(function(error: Error | null) {
        console.error("Error: " + error); return '';
    }).progress(function() {
        console.log("Command: " + command + " running...");
    });
};

export interface GlobalLine {
    tag: string,
    line: number,
    path: string,
    info: string,
    kind: vscode.SymbolKind
}

export class Global {
    exec: string;

    updateInProgress?: boolean;
    queueUpdate?: boolean;

    run(params: string[]): Promise<string | Buffer> {
        return execute(this.exec + ' ' + params.join(' '));
    }

    updateTags() {
        var configuration = vscode.workspace.getConfiguration('codegnuglobal');
        var shouldupdate = configuration.get<boolean>('autoupdate', true);
        if (shouldupdate) {
            if (this.updateInProgress)
            {
                this.queueUpdate = true;
            }
            else
            {
                this.updateInProgress = true;
                var self = this;
                this.run(['-u']).then(() => {
                    self.updateTagsFinish();
                }).catch(() => {
                    self.updateTagsFinish();
                });
            }
        }
    }

    updateTagsFinish() {
        this.updateInProgress = false;
        if (this.queueUpdate) {
                this.queueUpdate = false;
                this.updateTags();
        }
    }

    parseLine(content: string): GlobalLine | null {
        try {
            if (content == null || content == "") return null;

            var values = content.split(/ +/);
            var tag = values.shift()!;
            var line = parseInt(values.shift()!) - 1;
            var path = values.shift()!.replace("%20", " ");
            var info = values.join(' ');

            return { "tag": tag, "line": line, "path": path, "info": info, "kind": this.parseKind(info) };
        } catch (ex) {
            console.error("Error: " + ex);
        }
        return null;
    }

    private parseKind(info: string): vscode.SymbolKind {
        var kind = vscode.SymbolKind.Variable;

        if (info.startsWith('class ')) {
            kind = vscode.SymbolKind.Class;
        } else if (info.startsWith('struct ')) {
            kind = vscode.SymbolKind.Class;
        } else if (info.startsWith('enum ')) {
            kind = vscode.SymbolKind.Enum;
        } else if (info.indexOf('(') != -1) {
            kind = vscode.SymbolKind.Function;
        }
        return kind;
    }

    constructor(exec: string) {
        this.exec = exec;
    }
}
