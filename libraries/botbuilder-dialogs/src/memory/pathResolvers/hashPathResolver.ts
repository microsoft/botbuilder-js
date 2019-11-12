/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AliasPathResolver } from './aliasPathResolver';

/**
 * Maps #xxx => turn.recognized.intents.xxx
 */
export class HashPathResolver extends AliasPathResolver {

    constructor() {
        super('#', 'turn.recognized.intents.');
    }
}