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
    constructor(private readonly activity: Partial<Activity>) {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    async bind(_context: DialogContext, _data?: object): Promise<Partial<Activity>> {
        return this.activity;
    }
}
