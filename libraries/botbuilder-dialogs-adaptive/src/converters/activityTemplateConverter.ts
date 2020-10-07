/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { Converter } from 'botbuilder-dialogs';
import { TemplateInterface } from '../template';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';

export class ActivityTemplateConverter
    implements Converter<string | Partial<Activity>, TemplateInterface<Partial<Activity>>> {
    public convert(value: string | Partial<Activity>): TemplateInterface<Partial<Activity>> {
        if (typeof value === 'string') {
            return new ActivityTemplate(value);
        } else {
            return new StaticActivityTemplate(value);
        }
    }
}
