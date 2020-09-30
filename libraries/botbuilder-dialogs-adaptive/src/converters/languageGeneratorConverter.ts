/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ResourceMultiLanguageGenerator } from '../generators';

/**
 * Language generator converter that implements `Converter`.
 */
export class LanguageGeneratorConverter implements Converter {
    /**
     * Creates a new `ResourceMultiLanguageGenerator` instance from Resource id value.
     * @param value Resource id of LG file.
     * @returns A new `ResourceMultiLanguageGenerator` instance.
     */
    public convert(value: string|ResourceMultiLanguageGenerator): ResourceMultiLanguageGenerator {
        return typeof value === 'string' ? new ResourceMultiLanguageGenerator(value) : value;
    }
}
