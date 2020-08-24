/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { TemplateInterface } from '../template';
import { LanguageGenerator } from '../languageGenerator';
import { languageGeneratorKey } from '../languageGeneratorExtensions';

/**
 * Defines a text template where the template expression is local aka "inline"
 * and processed through registered language generator.
 */
export class TextTemplate implements TemplateInterface<string> {

    /**
     * Initialize a new instance of TextTemplate class.
     * @param template The template to evaluate to create text.
     */
    public constructor(template: string) {
        this.template = template;
    }

    /**
     * Gets or sets the template to evaluate to create the text.
     */
    public template: string;

    /**
     * Bind data to template.
     * @param dialogContext DialogContext.
     * @param data Data to bind to.
     */
    public async bind(dialogContext: DialogContext, data: object): Promise<string> {
        if (!this.template) {
            throw new Error(`ArgumentNullException: ${ this.template }`);
        }

        const languageGenerator: LanguageGenerator = dialogContext.services.get(languageGeneratorKey);
        if (languageGenerator !== undefined) {
            const result = languageGenerator.generate(dialogContext, this.template, data);
            return Promise.resolve(result);
        }

        return Promise.resolve(undefined);
    }

    public toString = (): string => { return `TextTemplate(${ this.template })`; };
}
