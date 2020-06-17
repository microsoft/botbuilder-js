/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { Activity, ActivityFactory, MessageFactory } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { LanguageGenerator } from '../languageGenerator';

export class ActivityTemplate implements TemplateInterface<Partial<Activity>> {
    public template: string;

    public constructor(template: string) {
        this.template = template;
    }

    public async bind(dialogContext: DialogContext, data: object): Promise<Partial<Activity>> {
        if(this.template) {
            const languageGenerator: LanguageGenerator = dialogContext.context.turnState.get('LanguageGenerator');
            if (languageGenerator) {
                const lgStringResult = await languageGenerator.generate(dialogContext, this.template, data);
                const result = ActivityFactory.fromObject(lgStringResult);
                return Promise.resolve(result);
            } else {
                const message = MessageFactory.text(this.template, this.template);
                return Promise.resolve(message);
            }  
        }

        return Promise.resolve(undefined);
    }

    public toString = (): string => { return `ActivityTemplate(${ this.template })`;};
}