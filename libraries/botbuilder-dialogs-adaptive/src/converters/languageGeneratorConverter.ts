/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ResourceMultiLanguageGenerator } from '../generators';

export class LanguageGeneratorConverter implements Converter {
    public convert(value: string): ResourceMultiLanguageGenerator {
        return new ResourceMultiLanguageGenerator(value);
    }
}