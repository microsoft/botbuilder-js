/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates an uuid v4 string.
 *
 * @returns An uuidv4 string.
 */
export function generateGuid(): string {
    return uuidv4();
}
