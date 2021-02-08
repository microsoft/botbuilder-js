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

    // eslint-disable-next-line @typescript-eslint/ban-types
    public async bind(_context: DialogContext, _data?: object): Promise<Partial<Activity>> {
        return this._activity;
    }
}
