/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CustomDeserializer } from './customDeserializer';

export interface DeclarativeType {
    kind: string;
    type: new () => unknown;
    loader?: CustomDeserializer;
}