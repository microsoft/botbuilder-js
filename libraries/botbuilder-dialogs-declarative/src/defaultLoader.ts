/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TypeLoader } from './typeLoader';
import { ResourceExplorer } from './resources/resourceExplorer';

/**
 * The default type loader to load declarative objects.
 */
export class DefaultLoader implements TypeLoader {
    private _resourceExplorer: ResourceExplorer;

    /**
     * Initialize a new `DefaultLoader`.
     * @param resourceExplorer The resource explorer used to load declarative objects.
     */
    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    /**
     * Load and convert declarative objects.
     * @param factory The factory to initialize new instances of declarative objects.
     * @param config The JSON object to be loaded as configuration to declarative objects.
     */
    public load(factory: new () => object, config: object): object {
        const obj = new factory();
        const kind = config['$kind'] || config['$type'];
        for (const key in config) {
            if (config.hasOwnProperty(key) && key != '$kind' && key != '$type') {

                const value = config[key];
                const converter = this._resourceExplorer.getConverter(kind, key);
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