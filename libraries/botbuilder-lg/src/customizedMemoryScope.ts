/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Extensions } from 'botframework-expressions';

export class CustomizedMemoryScope extends Map {
    private localScope: any;
    public globalScope: any;
    constructor(localScope: any, globalScope: any) {
        super();
        this.localScope = localScope;
        this.globalScope = globalScope;
    }

    get(key: any) {
        let value: any;
        let error: string;
        ({ value, error } = Extensions.AccessProperty(this.localScope, key));
        if (value !== undefined && error === undefined) {
            return value;
        }

        ({ value, error } = Extensions.AccessProperty(this.globalScope, key));
        if (value !== undefined && error === undefined) {
            return value;
        }

        return undefined;
    }
}