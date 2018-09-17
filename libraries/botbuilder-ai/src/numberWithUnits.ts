/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// A number together with units returned by a recognizer.
export interface NumberWithUnits {
    /**
     * A recognized number if any.
     */
    number?: number;

    /**
     * Units for the number.
     */
    units: string;
}
