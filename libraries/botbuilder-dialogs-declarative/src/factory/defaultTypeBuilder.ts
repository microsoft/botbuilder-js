/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ITypeBuilder } from './typeBuilder';

export class DefaultTypeBuilder implements ITypeBuilder {

    constructor(private factory: new () => any) {}

    public build(config: object) : object {
        return new this.factory();
    }
}