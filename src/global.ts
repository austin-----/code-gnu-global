import { ExecFileOptionsWithOtherEncoding, ChildProcess, execFileSync, ExecException, ExecFileOptions } from 'child_process';
var execFile = require("child-process-promise").execFile as ((
    command: string,
    args: ReadonlyArray<string> | null | undefined,
    options: ExecFileOptionsWithOtherEncoding
) => ChildProcessPromise<ExecResult>);
import * as iconv from 'iconv-lite';
import * as vscode from 'vscode';

interface ExecResult {
    stdout: string | Buffer,
    stderr: string | Buffer
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

function execute(
    command: string,
    args: string[],
    options?: ExecFileOptions
): Promise<string | Buffer> {
    var configuration = vscode.workspace.getConfiguration('codegnuglobal');
    var encoding = configuration.get<string>('encoding');
    var output = 'utf8';
    if (encoding != null && encoding != "") {
        output = 'buffer';
    }
    return execFile(command, args, {
        ...options,
        cwd: vscode.workspace.rootPath,
        encoding: output,
        maxBuffer: 10*1024*1024
    }).then(function(result): string {
        if (encoding != null && encoding != "") {
            var decoded = iconv.decode(result.stdout as Buffer, encoding);
            return decoded;
        }
        return result.stdout as string;
    }).catch(function(e: ExecException | null) {
        console.error(`${e}\n${e!.code && e!.code+''}`);
        return '';
    }).progress(function() {
        console.log("Command: " + [command].concat(args.map(s => `'${s}'`)).join(' ') + " running...");
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
    cygbase?: string;
    cygdrive?: string;
    cygdriveexp?: RegExp;

    updateInProgress?: boolean;
    queueUpdate?: [boolean, boolean];

    run(params: string[], options?: ExecFileOptions): Promise<string | Buffer> {
        // FIXME: On Win32 Cygwin/MSYS, uv's escape is not entirely correct
        // as they use a cmdline parsing (build_argv) different from MS CRT
        return execute(this.exec, params, options);
    }

    updateTags(isCpp: boolean) {
        var configuration = vscode.workspace.getConfiguration('codegnuglobal');
        var shouldupdate = configuration.get<boolean>('autoupdate', true);
        if (shouldupdate) {
            if (this.updateInProgress)
            {
                this.queueUpdate = [true, isCpp];
            }
            else
            {
                this.updateInProgress = true;
                var self = this;
                const options = isCpp
                    ? { env: { ...process.env, GTAGSFORCECPP: 'vscode_true' } }
                    : undefined;
                this.run(['-u'], options).then(() => {
                    self.updateTagsFinish();
                }).catch(() => {
                    self.updateTagsFinish();
                });
            }
        }
    }

    updateTagsFinish() {
        this.updateInProgress = false;
        if (this.queueUpdate && this.queueUpdate[0]) {
                this.queueUpdate[0] = false;
                this.updateTags(this.queueUpdate[1]);
        }
    }

    parseLine(content: string): GlobalLine | null {
        try {
            if (content == null || content == "") return null;

            var values = content.split(/ +/);
            var tag = values.shift()!;
            var line = parseInt(values.shift()!) - 1;
            var path = this.cygpath(values.shift()!.replace("%20", " "));
            var info = values.join(' ');

            return { "tag": tag, "line": line, "path": path, "info": info, "kind": this.parseKind(info) };
        } catch (ex) {
            console.error(ex);
        }
        return null;
    }

    /** Convert Cygwin/MSYS paths to absolute Windows paths
     *  (any slash direction)
     *
     * Cygwin X:\\...: /cygdrive/x/...
     * MSYS2  X:\\...: /x/...
     * Other: cygbase + path
     *
     */
    cygpath(path: string): string {
        // Allow surpression by ''
        if (!(this.cygbase && path.startsWith('/')))
            return path;

        const drive = this.cygdriveexp!.exec(path)
        if (drive) {
            return `${drive[1]}:/${drive[2]}`
        } else {
            // resolve relative to cygbase
            return `${this.cygpath}/${path}`
        }
    }

    /**
     * On Windows and under Cygwin/MSYS, convert the input absolute path
     * to the
     */
    pathcyg(path: string): string {
        if (this.cygdrive === undefined)
            return path;

        let absolute;
        if (absolute = /^([a-z]):[/\\](.*)/.exec(path))
            return `${this.cygdrive}/${absolute[1]}/${absolute[2].replace(/\\/g, '/')}`
        else
            return `path.replace(/\\/g, '/')}`
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

    constructor(exec: string, cygbase: string | undefined) {
        console.log(exec, cygbase)
        this.exec = exec;
        this.cygbase = cygbase;
        if (cygbase) {
            try {
                // readlink /proc/cygdrive keeps dying, but this one looks strong...
                this.cygdrive = execFileSync(`${cygbase}\\usr\\bin\\cygpath.exe`, ['-u', 'c:\\'], { encoding: 'utf8' }).replace(/\/c\/\n$/, "");
                if (this.cygdrive == '/') this.cygdrive = '';
                this.cygdriveexp = new RegExp(`^(?:/proc/cygdrive|${this.cygdrive})/([a-z])/(.*)`)
            } catch (e) {
                console.error(`${e}\n${e.stdout}\n${e.status}`);
                this.cygdrive = '';
                this.cygdriveexp = new RegExp(`^(?:/proc/cygdrive|/cygdrive|)/([a-z])/(.*)`)
            }
        }
    }
}
