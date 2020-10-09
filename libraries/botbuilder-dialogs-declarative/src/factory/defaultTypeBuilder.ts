/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder } from './typeBuilder';

/**
 * Declarative default type builder.
 */
export class DefaultTypeBuilder implements TypeBuilder {
    /**
     * Creates a new instance of the [DefaultTypeBuilder](xref:botbuilder-dialogs-declarative.DefaultTypeBuilder) class.
     * @param factory Factory for the default type.
     */
    constructor(private factory: new () => any) {}

    /**
     * Builds a default type.
     * @param config Configuration object for the type.
     * @returns A new factory object for the default type.
     */
    public build(config: object) : object {
        return new this.factory();
    }
}
