/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Converters, Properties } from 'botbuilder-dialogs';
import { CustomDeserializer } from './customDeserializer';
import { ResourceExplorer } from './resources';

type Type<T> = T & {
    new (...args: unknown[]): Type<T>;
    getConverters(): Converters<Properties<T>>;
};

export class DefaultLoader<T, C> implements CustomDeserializer<T, C> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public load(config: C, type: Type<T>): T {
        const instance = new type();
        const converters: Record<
            string,
            Converter | { new (resourceExplorer: ResourceExplorer): Converter }
        > = Object.assign({}, instance.getConverters());
        Object.getOwnPropertyNames(config).forEach((k: string) => {
            const value = config[k];
            let converter = converters[k];
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
