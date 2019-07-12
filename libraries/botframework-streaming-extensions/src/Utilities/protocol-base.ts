/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line:no-require-imports no-var-requires
const uuidv4 = require('uuid/v4');

export function generateGuid(): string {
    return uuidv4();
}
