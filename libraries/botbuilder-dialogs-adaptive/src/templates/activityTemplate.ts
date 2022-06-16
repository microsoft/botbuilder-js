/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ActivityFactory } from 'botbuilder';
import {
    Configurable,
    Converter,
    ConverterFactory,
    DialogContext,
    DialogStateManager,
    TemplateInterface,
} from 'botbuilder-dialogs';
import { TemplateEngineLanguageGenerator } from '../generators';
import { LanguageGenerator } from '../languageGenerator';
import { languageGeneratorKey } from '../languageGeneratorExtensions';

export interface ActivityTemplateConguration {
    template?: string;
}

/**
 * Defines an activity template where the template expression is local aka "inline"
 * and processed through registered language generator.
 */
export class ActivityTemplate
    implements TemplateInterface<Partial<Activity>, DialogStateManager>, ActivityTemplateConguration, Configurable {
    static $kind = 'Microsoft.ActivityTemplate';

    /**
     * Initialize a new instance of ActivityTemplate class.
     *
     * @param template The template to evaluate to create the activity.
     */
    constructor(template?: string) {
        this.template = template;
    }

    /**
     * Gets or sets the template to evaluate to create the activity.
     */
    template: string;

    /**
     * @param _property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(_property: keyof ActivityTemplateConguration): Converter | ConverterFactory {
        return undefined;
    }

    /**
     * @param config The configuration.
     * @returns A object with the given configuration.
     */
    configure(config: ActivityTemplateConguration): this {
        const { template } = config;
        this.template = template;
        return this;
    }

    /**
     * Bind data to template.
     *
     * @param dialogContext DialogContext
     * @param data Data to bind to.
     * @returns A promise representing the asynchronous operation.
     */
    async bind(dialogContext: DialogContext, data: DialogStateManager): Promise<Partial<Activity>> {
        if (this.template) {
            let languageGenerator = dialogContext.services.get(languageGeneratorKey) as LanguageGenerator<
                unknown,
                DialogStateManager | Record<string, unknown>
            >;

            languageGenerator ??= new TemplateEngineLanguageGenerator();

            const lgResult = await languageGenerator.generate(dialogContext, this.template, data);
            const result = ActivityFactory.fromObject(lgResult);
            return result;
        }

        return undefined;
    }

    toString = (): string => {
        return `ActivityTemplate(${this.template})`;
    };
}
