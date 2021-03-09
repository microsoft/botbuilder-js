/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder';
import { Converter, ConverterFactory, Configurable, DialogContext, TemplateInterface } from 'botbuilder-dialogs';

export interface StaticActivityTemplateConfiguration {
    activity?: Partial<Activity>;
}

/**
 * Defines a static activity as a template.
 */
export class StaticActivityTemplate
    implements TemplateInterface<Partial<Activity>, unknown>, StaticActivityTemplateConfiguration, Configurable {
    public static $kind = 'Microsoft.StaticActivityTemplate';

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

    public getConverter(_property: keyof StaticActivityTemplateConfiguration): Converter | ConverterFactory {
        return undefined;
    }

    public configure(config: StaticActivityTemplateConfiguration): this {
        const { activity } = config;
        this.activity = activity;
        return this;
    }

    /**
     * Get predefined activity.
     * @param dialogContext DialogContext.
     * @param data Data to bind to (not working with static activity template).
     */
    public async bind(dialogContext: DialogContext, data: unknown): Promise<Partial<Activity>>;
    public async bind(): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => {
        return `${this.activity.text}`;
    };
}
