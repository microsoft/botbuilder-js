/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable } from 'botbuilder-dialogs';
import { TypeBuilder } from './typeBuilder';

export class ConfigurableTypeBuilder implements TypeBuilder {

    public constructor(private factory: new () => Configurable) { }

    public build(config: object): object {
        let configurable = new this.factory();
        return configurable.configure(config);
    }
}