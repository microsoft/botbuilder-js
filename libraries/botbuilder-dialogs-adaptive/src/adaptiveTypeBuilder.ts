/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeBuilder, Converter, ResourceExplorer } from 'botbuilder-dialogs-declarative';

export class AdaptiveTypeBuilder implements TypeBuilder {
    private _factory: new () => object;
    private _converters: { [key: string]: Converter } = {};
    private _resourceExplorer: ResourceExplorer;

    public constructor(factory: new () => object, resourceExplorer: ResourceExplorer, converters: { [key: string]: Converter }) {
        this._factory = factory;
        this._resourceExplorer = resourceExplorer;
        this._converters = converters;
    }

    public build(config: object): object {
        const obj = new this._factory();
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                const converter = this._converters[key];
                if (converter) {
                    if (Array.isArray(value) && Array.isArray(obj[key])) {
                        obj[key] = value.map((item): any => converter.convert(this._resourceExplorer.buildType(item)));
                    } else {
                        obj[key] = converter.convert(this._resourceExplorer.buildType(value));
                    }
                } else {
                    if (Array.isArray(value)) {
                        obj[key] = value.map((item): any => this._resourceExplorer.buildType(item));
                    } else {
                        obj[key] = this._resourceExplorer.buildType(value);
                    }
                }
            }
        }
        return obj;
    }
}
