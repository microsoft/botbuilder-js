/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { TextTemplate } from '../templates';

/**
 * Text template converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class TextTemplateConverter implements Converter {
    /**
     * Converts a string to a [TextTemplate](xref:botbuilder-dialogs-adaptive.TextTemplate) instance.
     * @param value The template to evaluate to create text.
     * @returns A new [TextTemplate](xref:botbuilder-dialogs-adaptive.TextTemplate) instance.
     */
    public convert(value: string): TextTemplate {
        return new TextTemplate(value);
    }
}
