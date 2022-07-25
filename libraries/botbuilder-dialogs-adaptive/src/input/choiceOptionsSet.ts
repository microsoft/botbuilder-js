/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogStateManager, TemplateInterface, ChoiceFactoryOptions } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';
import { languageGeneratorKey } from '../languageGeneratorExtensions';

/**
 * Sets the ChoiceFactoryOptions.
 */
export class ChoiceOptionsSet implements ChoiceFactoryOptions, TemplateInterface<ChoiceFactoryOptions> {
    private readonly template: string;
    inlineSeparator?: string;
    inlineOr?: string;
    inlineOrMore?: string;
    includeNumbers?: boolean;

    /**
     * Initializes a new instance of the [ChoiceOptionsSet](xref:botbuilder-dialogs-adaptive.ChoiceOptionsSet) class.
     *
     * @param obj Choice values.
     */
    constructor(obj: any) {
        if (typeof obj === 'string') {
            this.template = obj;
        }
    }

    /**
     * Bind data to template.
     *
     * @param dialogContext DialogContext
     * @param data Data to bind to.
     * @returns Data binded ChoiceFactoryOptions.
     */
    async bind(dialogContext: DialogContext, data?: any): Promise<ChoiceFactoryOptions> {
        if (this.template == null) {
            return this as ChoiceFactoryOptions;
        }

        const languageGenerator = dialogContext.services.get(languageGeneratorKey) as LanguageGenerator<
            unknown,
            DialogStateManager
        >;

        if (languageGenerator == null) {
            throw new Error('language generator is missing.');
        }

        const lgResult = await languageGenerator.generate(dialogContext, this.template, data);
        if (lgResult instanceof ChoiceOptionsSet) {
            return lgResult as ChoiceFactoryOptions;
        } else if (typeof lgResult === 'string') {
            try {
                const jObj = JSON.parse(lgResult);
                const options = <ChoiceFactoryOptions>{
                    inlineSeparator: jObj[0].toString(),
                    inlineOr: jObj[1].toString(),
                    inlineOrMore: jObj[2].toString(),
                };

                if (Object.keys(jObj).length > 3) {
                    options.includeNumbers = Boolean(jObj[3]);
                }

                return options;
            } catch {
                return null;
            }
        }

        return null;
    }
}
