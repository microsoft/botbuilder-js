/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { DialogContext, TemplateInterface } from 'botbuilder-dialogs';

/**
 * Creates a new template to send the user based on the activity.
 */
export class BindToActivity implements TemplateInterface<Partial<Activity>> {
    /**
     * Initializes a new instance of the [BindToActivity](xref:botbuilder-ai.BindToActivity) class.
     *
     * @param activity The activity to send the user.
     * @returns Template to send the user.
     */
    constructor(private readonly activity: Partial<Activity>) {}

    /**
     * Binds the provided activity.
     *
     * @param _context The dialog context.
     * @param _data Data to bind to. If Null, then dc.State will be used.
     * @returns The linked activity.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    async bind(_context: DialogContext, _data?: object): Promise<Partial<Activity>> {
        return this.activity;
    }
}
