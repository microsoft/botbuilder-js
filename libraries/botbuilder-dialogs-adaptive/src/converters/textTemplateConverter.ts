/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { TextTemplate } from '../templates';

export class TextTemplateConverter implements Converter {
    public convert(value: string): TextTemplate {
        return new TextTemplate(value);
    }
}
