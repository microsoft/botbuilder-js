/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines a converter which converts values to desired types.
 */
export interface Converter {
    convert(value: any): any;
}