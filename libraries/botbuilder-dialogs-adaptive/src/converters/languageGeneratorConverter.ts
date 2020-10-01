/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs';
import { ResourceMultiLanguageGenerator } from '../generators';

export class LanguageGeneratorConverter implements Converter<string | ResourceMultiLanguageGenerator, ResourceMultiLanguageGenerator> {
    public convert(value: string | ResourceMultiLanguageGenerator): ResourceMultiLanguageGenerator {
        return typeof value === 'string' ? new ResourceMultiLanguageGenerator(value) : value;
    }
}