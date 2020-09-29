/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder } from './typeBuilder';

/**
 * Declarative custom type builder.
 */
export class CustomTypeBuilder implements TypeBuilder {

    /**
     * Creates a new instance of the `CustomTypeBuilder` class.
     * @param factory Factory for the custom type.
     */
    constructor(private factory: (config: object) => object) {}

    /**
     * Builds a custom type.
     * @param config Configuration object for the type.
     */
    public build(config: object): object {
        return this.factory(config);
    }
}
