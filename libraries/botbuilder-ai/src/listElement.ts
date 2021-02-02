/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines a sub-list to append to an existing list entity.
 */
export interface ListElement {
    /**
     * The canonical form of the sub-list.
     */
    canonicalForm?: string;

    /**
     * The synonyms of the canonical form.
     */
    synonyms?: string[];
}

/**
 * Validate the ListElement object, throw if validation fails.
 *
 * @param {ListElement} element The ListElement object to be validated.
 */
export function validateListElement(element: ListElement): void {
    if (!element.canonicalForm) {
        throw new Error('RequestList requires canonicalForm to be defined');
    }
}
