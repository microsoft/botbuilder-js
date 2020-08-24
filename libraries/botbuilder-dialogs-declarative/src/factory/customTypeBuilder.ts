/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder } from './typeBuilder';

export class CustomTypeBuilder implements TypeBuilder {

    constructor(private factory: (config: object) => object) {}

    public build(config: object): object {
        return this.factory(config);
    }
}
