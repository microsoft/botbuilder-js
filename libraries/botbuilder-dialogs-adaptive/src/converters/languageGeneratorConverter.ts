/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs';
import { ResourceMultiLanguageGenerator } from '../generators';

/**
 * Language generator converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class LanguageGeneratorConverter implements Converter<string, ResourceMultiLanguageGenerator> {
    /**
     * Creates a new [ResourceMultiLanguageGenerator](xref:botbuilder-dialogs-adaptive.ResourceMultiLanguageGenerator) instance from Resource id value.
     *
     * @param value Resource id of LG file.
     * @returns A new [ResourceMultiLanguageGenerator](xref:botbuilder-dialogs-adaptive.ResourceMultiLanguageGenerator) instance.
     */
    convert(value: string | ResourceMultiLanguageGenerator): ResourceMultiLanguageGenerator {
        return typeof value === 'string' ? new ResourceMultiLanguageGenerator(value) : value;
    }
}
