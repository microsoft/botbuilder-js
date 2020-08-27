/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { DialogContext, TemplateInterface } from 'botbuilder-dialogs';

/**
 * Defines a static activity as a template.
 */
export class StaticActivityTemplate implements TemplateInterface<Partial<Activity>> {

    /**
     * Intialize a new instance of StaticActivityTemplate class.
     * @param activity Activity as a template.
     */
    public constructor(activity?: Partial<Activity>) {
        this.activity = activity;
    }

    /**
     * Gets or sets the activity as template.
     */
    public activity: Partial<Activity>;

    /**
     * Get predefined activity.
     * @param dialogContext DialogContext.
     * @param data Data to bind to (not working with static activity template).
     */
    public async bind(dialogContext: DialogContext, data: object): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => { return `${ this.activity.text }`; }
}