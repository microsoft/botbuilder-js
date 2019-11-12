/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AliasPathResolver } from './aliasPathResolver';

/**
 * Maps $xxx => dialog.xxx
 */
export class DollarPathResolver extends AliasPathResolver {

    constructor() {
        super('$', 'dialog.');
    }
}