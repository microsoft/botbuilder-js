import { debug } from "util";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require('path');
const fs = require('fs');

export interface IResource {
    id(): string;
    readText(): string;
}
