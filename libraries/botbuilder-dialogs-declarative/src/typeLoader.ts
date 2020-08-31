/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 /**
  * Defines the contract to load a json object and convert it to desired types.
  */
export interface TypeLoader {
    load(factory: new () => object, config: object): object;
}