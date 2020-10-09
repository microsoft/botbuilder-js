/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs';
import { CustomDeserializer } from './customDeserializer';
import { ResourceExplorer } from './resources';

export class DefaultLoader<T, C> implements CustomDeserializer<T, C> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public load(config: C, type: new (...args: unknown[]) => T): T {
        const instance = new type();
        const converters: Record<
            string,
            Converter | ((resourceExplorer: ResourceExplorer) => Converter)
        > = Object.assign({}, instance['converters']);
        Object.getOwnPropertyNames(config).forEach((k: string) => {
            const value = config[k];
            let converter = converters[k];
            if (converter) {
                if (typeof converter === 'function') {
                    converter = converter(this._resourceExplorer);
                }
                instance[k] = converter.convert(value);
            } else {
                instance[k] = value;
            }
        });
        return instance;
    }
}
