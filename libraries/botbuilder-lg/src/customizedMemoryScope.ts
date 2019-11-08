/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Extensions } from 'botframework-expressions';

/**
 *  This customzied memory scope is designed for allow sub template evaluation can refer
 *  to the orignial evaluation scope passed in by wrap the orignal one in globalScope field
 *  and inherit that for each sub evaluation.
 */
export class CustomizedMemoryScope extends Map {
    public globalScope: any;
    private readonly localScope: any;
    public constructor(localScope: any, globalScope: any) {
        super();
        this.localScope = localScope;
        this.globalScope = globalScope;
    }

    public get(key: any): any {
        let value: any;
        let error: string;
        ({ value, error } = Extensions.accessProperty(this.localScope, key));
        if (value !== undefined && error === undefined) {
            return value;
        }

        ({ value, error } = Extensions.accessProperty(this.globalScope, key));
        if (value !== undefined && error === undefined) {
            return value;
        }

        return undefined;
    }
}
