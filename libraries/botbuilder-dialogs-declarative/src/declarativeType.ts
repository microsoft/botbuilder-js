/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from './converter';
import { TypeLoader } from './typeLoader';

/**
 * Defines a declarative object which is $kind => type.
 */
export interface DeclarativeType {
    kind: string;
    factory: new () => object;
    loader?: TypeLoader;
    converters?: { [key: string]: Converter };
}