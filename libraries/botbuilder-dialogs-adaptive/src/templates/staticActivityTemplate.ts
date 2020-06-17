/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';
import { TemplateInterface } from '../template';

export class StaticActivityTemplate implements TemplateInterface<Partial<Activity>> {

    public activity: Partial<Activity>;

    public constructor(activity?: Partial<Activity>) {
        this.activity = activity;
    }

    public async bind(dialogContext: DialogContext, data: object): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => { return `${ this.activity.text }`;}
}