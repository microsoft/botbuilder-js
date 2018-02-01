/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export interface ModelResult<T extends Object = {}> {
    
    text: string

    start: number

    end: number

    typeName: string

    resolution: T
}