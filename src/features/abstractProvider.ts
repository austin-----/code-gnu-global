import {Global} from '../global';
import {Disposable} from 'vscode';
import { SrvRecord } from 'dns';
import { CommonOptions } from 'child_process';

export default class AbstractProvider {

	protected _global: Global;
	protected _disposables: Disposable[];
	readonly _options?: CommonOptions;

	constructor(global: Global, cpp?: Boolean) {
		this._global = global;
		this._disposables = [];
		// If we know we are dealing with a C++ project, tell gtags to parse *.h as C++
		// Otherwise it parses it as C by default
		// (users can write their .gtagsrc and other configs but let's make it just work)
		if (cpp) this._options = { env: { ...process.env, GTAGSFORCECPP: 'vscode_true' } };
	}

	dispose() {
		while (this._disposables.length) {
			this._disposables.pop()!.dispose();
		}
	}
}
