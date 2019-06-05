/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable } from "botbuilder-dialogs";
import { TypeFactory } from "./factory/typeFactory";
import { IResourceProvider } from "./resources/resourceProvider";

export class TypeLoader {

    constructor(private factory?: TypeFactory, private resourceProvider?: IResourceProvider) { 
        if (!this.factory) {
            this.factory = new TypeFactory();
        }
    }

    public async load(json: string): Promise<object> {
        const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
        return await this.loadObjectTree(jsonObj);
    }

    private async loadObjectTree(jsonObj: object) : Promise<object> {
        if (!jsonObj) {
            return null;
        }

        // Recursively load object tree leaves to root, calling the factory to build objects from json tokens
        if (jsonObj['$type']) {
            const type = jsonObj['$type'];
            const obj = this.factory.build(type, jsonObj);

            if(!obj) {
                return obj;
            }

            for (const key in jsonObj) {
                if (jsonObj.hasOwnProperty(key) && key != "$type") {
                    const setting = jsonObj[key];
                    if (Array.isArray(setting)) {
                        if (Array.isArray(obj[key])) {
                            obj[key] = [];

                            for (let item of setting) {
                                let loadedItem = await this.loadObjectTree(item);
                                obj[key].push(loadedItem);
                            }
                        } else {
                            obj[key] = setting;
                        }
                    } else if (typeof setting == 'object' && setting.hasOwnProperty('$type')) {
                        obj[key] = await this.loadObjectTree(setting);
                    } else if (setting && typeof setting == 'string' && !setting.includes('=') && obj.hasOwnProperty(key) && typeof obj[key] != 'string' && this.resourceProvider) {
                        let resource = await this.resourceProvider.getResource(`${setting}.dialog`)

                        if (resource) {
                            const text = await resource.readText();
                            obj[key] = JSON.parse(text);
                        } else if (!obj[key]){
                            obj[key] = setting;
                        }
                    } 
                    else {
                        if (!obj[key]) {
                            obj[key] = setting; 
                        }
                        
                    }
                }
            }
            return obj;
        } 
        // Implicit copy
        else if (typeof jsonObj == 'string') {
            let resource = await this.resourceProvider.getResource(`${jsonObj}.dialog`)
            if (resource) {
                const text = await resource.readText();

                return await this.loadObjectTree(JSON.parse(text));
            } 
        }
        
        return null;
    }
}