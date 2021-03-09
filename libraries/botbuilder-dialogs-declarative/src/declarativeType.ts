/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Newable } from 'botbuilder-stdlib';
import { CustomDeserializer } from './customDeserializer';

/**
 * DeclarativeType interface maps $kind to type.
 */
export interface DeclarativeType<T = unknown, C = Record<string, unknown>> {
    kind: string;
    type: Newable<T, any[]>;
    loader?: CustomDeserializer<T, C>;
}
