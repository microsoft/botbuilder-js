/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Choice, DialogContext, DialogStateManager, TemplateInterface } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';
import { languageGeneratorKey } from '../languageGeneratorExtensions';

/**
 * Defines ChoiceSet collection.
 */
export class ChoiceSet extends Array<Choice> implements TemplateInterface<ChoiceSet, DialogStateManager> {
    private readonly template: string;

    /**
     * Initializes a new instance of the [ChoiceSet](xref:botbuilder-dialogs-adaptive.ChoiceSet) class.
     *
     * @param obj Choice values.
     */
    constructor(obj: any) {
        super();
        if (typeof obj === 'string') {
            this.template = obj;
        } else if (obj instanceof Array) {
            obj.forEach((o) => {
                if (typeof o === 'string') {
                    this.push({
                        value: o,
                    } as Choice);
                } else if (typeof o === 'object') {
                    this.push(o as Choice);
                }
            });
        }
    }

    /**
     * Bind data to template.
     *
     * @param dialogContext DialogContext
     * @param data Data to bind to.
     * @returns Data binded ChoiceSet.
     */
    async bind(dialogContext: DialogContext, data?: DialogStateManager): Promise<ChoiceSet> {
        if (this.template == null) {
            return this;
        }

        const languageGenerator = dialogContext.services.get(languageGeneratorKey) as LanguageGenerator<
            unknown,
            DialogStateManager
        >;

        if (languageGenerator == null) {
            throw new Error('language generator is missing.');
        }

        const lgResult = await languageGenerator.generate(dialogContext, this.template, data);
        if (lgResult instanceof ChoiceSet) {
            return lgResult;
        } else if (typeof lgResult === 'string') {
            try {
                const jObj = JSON.parse(lgResult);
                if (Array.isArray(jObj)) {
                    return new ChoiceSet(jObj);
                }

                return jObj as ChoiceSet;
            } catch (_) {
                const choices = lgResult.split('|').map((u) => u.trim());
                return new ChoiceSet(choices);
            }
        }

        return new ChoiceSet(lgResult);
    }
}
