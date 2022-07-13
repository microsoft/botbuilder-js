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
    static $kind = 'Microsoft.StaticActivityTemplate';

    /**
     * Intialize a new instance of StaticActivityTemplate class.
     *
     * @param activity Activity as a template.
     */
    constructor(activity?: Partial<Activity>) {
        this.activity = activity;
    }

    /**
     * Gets or sets the activity as template.
     */
    activity: Partial<Activity>;

    /**
     * @param _property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(_property: keyof StaticActivityTemplateConfiguration): Converter | ConverterFactory {
        return undefined;
    }

    /**
     * @param config The configuration.
     * @returns A object with the given configuration.
     */
    configure(config: StaticActivityTemplateConfiguration): this {
        const { activity } = config;
        this.activity = activity;
        return this;
    }

    /**
     * Get predefined activity.
     *
     * @param dialogContext DialogContext.
     * @param data Data to bind to (not working with static activity template).
     */
    async bind(dialogContext: DialogContext, data: unknown): Promise<Partial<Activity>>;
    /**
     * @returns A promise representing the asynchronous operation.
     */
    async bind(): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    toString = (): string => {
        return `${this.activity.text}`;
    };
}
