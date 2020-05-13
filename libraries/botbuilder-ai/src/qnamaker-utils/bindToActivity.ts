/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, TurnContext } from 'botbuilder-core';
import { TemplateInterface } from 'botbuilder-dialogs';

export class BindToActivity implements TemplateInterface<Activity> {
    private _activity: Activity;

    public constructor(activity: Activity) {
        this._activity = activity;
    }
    public async bindToData(turnContext: TurnContext, data: object): Promise<Activity> {
        return this._activity;
    }
}