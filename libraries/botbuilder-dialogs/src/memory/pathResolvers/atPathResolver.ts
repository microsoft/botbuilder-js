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

    constructor() {
        super('@', 'turn.recognized.entities.', '.first()');
    }

    public transformPath(path: string): string {
        // override to make sure it doesn't match @@
        path = path.trim();
        if (path.startsWith('@') && !path.startsWith('@@')) {
            return super.transformPath(path);
        }

        return path;
    }
}