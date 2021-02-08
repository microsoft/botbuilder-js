/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines a user predicted entity that extends an already existing one.
 */
export interface ExternalEntity<T = unknown> {
    /**
     * The name of the entity to extend.
     */
    entityName?: string;

    /**
     * The start character index of the predicted entity.
     */
    startIndex?: number;

    /**
     * The length of the predicted entity.
     */
    entityLength?: number;

    /**
     * A user supplied custom resolution to return as the entity's prediction.
     */
    resolution?: T;
}

/**
 * Validate the ExternalEntity object, throw if validation fails.
 *
 * @param {ExternalEntity} entity The ExternalEntity object to be validated.
 */
export function validateExternalEntity(entity: ExternalEntity): void {
    if (!entity.entityName || !entity.entityLength) {
        throw new Error('ExternalEntity requires an entityName and entityLength > 0');
    }
}
