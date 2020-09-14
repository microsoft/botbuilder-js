/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ActivityTemplate, StaticActivityTemplate, TextTemplate } from '../templates';

export class ActivityTemplateConverter implements Converter {
    public convert(value: string): ActivityTemplate | StaticActivityTemplate | TextTemplate {
        if (typeof value === 'string') { 
            return new ActivityTemplate(value);
        } else {
            return new StaticActivityTemplate(value);
        }
    }
}