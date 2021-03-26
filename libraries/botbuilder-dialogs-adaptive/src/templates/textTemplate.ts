/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, ConverterFactory, Configurable, DialogContext, TemplateInterface, DialogStateManager } from 'botbuilder-dialogs';
import { TemplateEngineLanguageGenerator } from '../generators/templateEngineLanguageGenerator';
import { LanguageGenerator } from '../languageGenerator';
import { languageGeneratorKey } from '../languageGeneratorExtensions';

export interface TextTemplateConfiguration {
    template?: string;
}

/**
 * Defines a text template where the template expression is local aka "inline"
 * and processed through registered language generator.
 */
export class TextTemplate<D = Record<string, unknown>>
    implements TemplateInterface<string, D>, TextTemplateConfiguration, Configurable {
    public static $kind = 'Microsoft.TextTemplate';

    /**
     * Initialize a new instance of TextTemplate class.
     * @param template The template to evaluate to create text.
     */
    public constructor(template?: string) {
        this.template = template;
    }

    /**
     * Gets or sets the template to evaluate to create the text.
     */
    public template: string;

    public getConverter(_property: keyof TextTemplateConfiguration): Converter | ConverterFactory {
        return undefined;
    }

    public configure(config: TextTemplateConfiguration): this {
        const { template } = config;
        this.template = template;
        return this;
    }

    /**
     * Bind data to template.
     * @param dialogContext DialogContext.
     * @param data Data to bind to.
     */
    public async bind(dialogContext: DialogContext, data: D): Promise<string> {
        if (!this.template) {
            throw new Error(`ArgumentNullException: ${this.template}`);
        }

        let languageGenerator = dialogContext.services.get(languageGeneratorKey) as LanguageGenerator<string, unknown>;
        languageGenerator ??= new TemplateEngineLanguageGenerator();

        const lgResult = await languageGenerator.generate(dialogContext, this.template, data);
        return lgResult ? lgResult.toString() : '';
    }

    public toString = (): string => {
        return `TextTemplate(${this.template})`;
    };
}
