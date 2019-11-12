/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver } from './pathResolver';

/**
 * Maps aliasXXX -> path.xxx ($foo => dialog.foo).
 */
export class AliasPathResolver implements PathResolver {
    private readonly alias: string;
    private readonly prefix: string;
    private readonly postfix: string;

    constructor(alias: string, prefix: string, postfix?: string)
    {
        this.alias = alias.trim();
        this.prefix = prefix.trim();
        this.postfix = postfix ? postfix.trim() : '';
    }

    public transformPath(path: string): string {
        const start = path.indexOf(this.alias);
        if (start >= 0) {
            // $xxx -> path.xxx
            path = `${this.prefix}${path.substr(start + this.alias.length)}${this.postfix}`;
            if (path.endsWith('.')) { 
                path = path.substr(0, path.length - 1);
            }
        }

        return path;
    }
}