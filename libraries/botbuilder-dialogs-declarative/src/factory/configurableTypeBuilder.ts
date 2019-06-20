import { ITypeBuilder } from "./typeBuilder";
import { Configurable } from "botbuilder-dialogs";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class ConfigurableTypeBuilder implements ITypeBuilder {

    constructor(private factory: new () => Configurable) {}

    public build(config: object) : object {
        let configurable = new this.factory();
        return configurable.configure(config);
    }
}