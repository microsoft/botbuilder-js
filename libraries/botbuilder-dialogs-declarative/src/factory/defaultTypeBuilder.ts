/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder } from './typeBuilder';

export class DefaultTypeBuilder implements TypeBuilder {

    constructor(private factory: new () => any) {}

    public build(config: object) : object {
        return new this.factory();
    }
}
