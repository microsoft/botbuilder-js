/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { Converter, DialogStateManager } from 'botbuilder-dialogs';
import { TemplateInterface } from '../template';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';

type Input = string | Partial<Activity>;
type Output = TemplateInterface<Partial<Activity>, DialogStateManager>;

export class ActivityTemplateConverter implements Converter<Input, Output> {
    public convert(value: Input | Output): Output {
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
