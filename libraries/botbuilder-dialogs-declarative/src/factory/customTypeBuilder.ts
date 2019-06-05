import { ITypeBuilder } from "./typeBuilder";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class CustomTypeBuilder implements ITypeBuilder {

    constructor(private factory: (config: object) => object) {}

    public build(config: object) : object {
        return this.factory(config);
    }
}