/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable } from 'botbuilder-dialogs';
import { CustomDeserializer } from './customDeserializer';
import { ResourceExplorer } from './resources';

export class DefaultLoader implements CustomDeserializer<Configurable, Record<string, unknown>> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public load(config: Record<string, unknown>, type: { new (...args: unknown[]): Configurable }): Configurable {
        const instance = new type();
        Object.getOwnPropertyNames(config).forEach((k: string) => {
            const value = config[k];
            let converter = instance.getConverter(k);
            if (converter) {
                if (typeof converter === 'function') {
                    converter = new converter(this._resourceExplorer);
                }
                instance[k] = converter.convert(value);
            } else {
                instance[k] = value;
            }
        });
        return instance;
    }
}
