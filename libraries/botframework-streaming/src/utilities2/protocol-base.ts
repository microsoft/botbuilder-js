/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import uuidv4 = require('uuid/v4');

export function generateGuid(): string {
    return uuidv4();
}
