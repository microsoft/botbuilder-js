/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable } from "botbuilder-dialogs";
import { TypeFactory } from "./typeFactory";

export class TypeLoader {

    constructor(private factory?: TypeFactory) { 
        if (!factory) {
            factory = new TypeFactory();
        }
    }

    public load(json: string): object {
        const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
        return TypeLoader.loadObjectTree(this.factory, jsonObj);
    }

    private static loadObjectTree(factory: TypeFactory, jsonObj: object) : object {
        if (!jsonObj) {
            return null;
        }

        // Recursively load object tree leaves to root, calling the factory to build objects from json tokens
        if (jsonObj['$type']) {
            const type = jsonObj['$type'];
            const obj = factory.build(type, jsonObj);

            if(!obj) {
                return obj;
            }

            for (const key in jsonObj) {
                if (jsonObj.hasOwnProperty(key)) {
                    const setting = jsonObj[key];
                    if (Array.isArray(setting)) {
                        if (Array.isArray(obj[key])) {
                            // Apply as an array update
                            setting.forEach((item) => obj[key].push(this.loadObjectTree(factory, item)));
                        } else {
                            obj[key] = setting;
                        }
                    } else if (typeof setting == 'object' && setting.hasOwnProperty('$type')) {
                            obj[key] = this.loadObjectTree(factory, setting);
                    } else if (setting !== undefined) {
                        obj[key] = setting; 
                    }
                }
            }
            return obj;
        }

        return null;
    }
}