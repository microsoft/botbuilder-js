/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ListElement, validateListElement } from './listElement';

/**
 * Defines an extension for a list entity.
 */
export interface DynamicList {
    /**
     * The name of the list entity to extend.
     */
    listEntityName?: string;

    /**
     * The lists to append on the extended list entity.
     */
    requestLists?: ListElement[];
}

/**
 * Validate the DynamicList object, throw if validation fails.
 *
 * @param {DynamicList} dynamicList The DynamicList object to be validated.
 */
export function validateDynamicList(dynamicList: DynamicList): void {
    if (!dynamicList.listEntityName || !dynamicList.requestLists) {
        throw new Error('DynamicList requires listEntityName and requestsLists to be defined.');
    }
    dynamicList.requestLists.forEach((list) => validateListElement(list));
}
