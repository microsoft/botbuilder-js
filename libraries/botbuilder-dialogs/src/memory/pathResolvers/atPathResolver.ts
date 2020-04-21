/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AliasPathResolver } from './aliasPathResolver';

/**
 * Maps @@ => turn.recognized.entitites.xxx[0]
 */
export class AtPathResolver extends AliasPathResolver {

    private readonly _prefix = 'turn.recognized.entities.';
    private readonly _delims = ['.', '['];

    public constructor() {
        super('@', '');
    }

    public transformPath(path: string): string {
        path = path.trim();
        if (path.startsWith('@') && path.length > 1 && !path.startsWith('@@')) {
            let end = -1;
            for (let i = 0; i < this._delims.length; i++) {
                const indexOfDelim = path.indexOf(this._delims[i]);
                if (indexOfDelim >= 0) {
                    end = indexOfDelim;
                    break;
                }
            }
            if (end == -1) {
                end = path.length;
            }
            const property = path.substr(1, end - 1);
            const suffix = path.substr(end);
            path = `${ this._prefix }${ property }.first()${ suffix }`;
        }

        return path;
    }
}