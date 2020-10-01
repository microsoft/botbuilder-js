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

export class DefaultLoader implements CustomDeserializer {

    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public load(value: any, type: new () => {}): any {
        const instance = new type();
        const converters: Record<string, Converter | ((resourceExplorer: ResourceExplorer) => Converter)> = Object.assign({}, instance['converters']);
        Object.getOwnPropertyNames(value).forEach((k: string) => {
            const config = value[k];
            let converter = converters[k];
            if (converter) {
                if (typeof converter === 'function') {
                    converter = converter(this._resourceExplorer);
                }
                instance[k] = converter.convert(config);
            } else {
                instance[k] = config;
            }
        });
        return instance;
    }
}