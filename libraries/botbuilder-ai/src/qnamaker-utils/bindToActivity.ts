/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { DialogContext, TemplateInterface } from 'botbuilder-dialogs';

export class BindToActivity implements TemplateInterface<Partial<Activity>> {
    private _activity: Partial<Activity>;

    public constructor(activity: Partial<Activity>) {
        this._activity = activity;
    }
    public async bind(context: DialogContext, data: object): Promise<Partial<Activity>> {
        return this._activity;
    }
}
