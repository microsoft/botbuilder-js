/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ActivityTemplate, StaticActivityTemplate, TextTemplate } from '../templates';

/**
 * Activity template converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class ActivityTemplateConverter implements Converter {
    /**
     * Converts a template to one of the following classes [ActivityTemplate](xref:botbuilder-dialogs-adaptive.ActivityTemplate) | [StaticActivityTemplate](xref:botbuilder-dialogs-adaptive.Static.ActivityTemplate)
     * @param value The template to evaluate to create the activity.
     * @returns A new instance that could be the following classes [ActivityTemplate](xref:botbuilder-dialogs-adaptive.ActivityTemplate) | [StaticActivityTemplate](xref:botbuilder-dialogs-adaptive.Static.ActivityTemplate).
     */
    public convert(value: string): ActivityTemplate | StaticActivityTemplate | TextTemplate {
        if (typeof value === 'string') {
            return new ActivityTemplate(value);
        } else {
            return new StaticActivityTemplate(value);
        }
    }
}
