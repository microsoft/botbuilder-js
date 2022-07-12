/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder';
import { Converter, DialogStateManager, TemplateInterface } from 'botbuilder-dialogs';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';

type Input = string | Partial<Activity>;
type Output = TemplateInterface<Partial<Activity>, DialogStateManager>;

/**
 * Activity template converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class ActivityTemplateConverter implements Converter<Input, Output> {
    /**
     * Converts a template to one of the following classes [ActivityTemplate](xref:botbuilder-dialogs-adaptive.ActivityTemplate) | [StaticActivityTemplate](xref:botbuilder-dialogs-adaptive.Static.ActivityTemplate)
     *
     * @param value The template to evaluate to create the activity.
     * @returns A new instance that could be the following classes [ActivityTemplate](xref:botbuilder-dialogs-adaptive.ActivityTemplate) | [StaticActivityTemplate](xref:botbuilder-dialogs-adaptive.Static.ActivityTemplate).
     */
    convert(value: Input | Output): Output {
        if (value instanceof ActivityTemplate || value instanceof StaticActivityTemplate) {
            return value;
        }
        if (typeof value === 'string') {
            return new ActivityTemplate(value);
        } else {
            return new StaticActivityTemplate(value as Partial<Activity>);
        }
    }
}
