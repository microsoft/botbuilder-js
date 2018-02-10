/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { TemplateRenderer } from './templateManager';
import { Middleware } from './middleware';
import { BotService } from './botService';
import { Activity } from './activity';

export declare type SimpleTemplateFunction = (context: BotContext, data: Object) => Partial<Activity> | string | undefined;

/**
 * Map of template Id -> Function
 */
export declare type TemplateIdMap = {
    [id: string]: SimpleTemplateFunction;
};

/**
 * Map of Language -> map of functions
 */
export declare type TemplateDictionary = {
    [language: string]: TemplateIdMap;
};

/**
 * This is a simple template renderer which has a resource map of template functions
 * let myTemplates  = {
 *      "en" : {
 *          "templateId": (context, data) => `your name  is ${data.name}`  
 *      }
 * }
 * 
 * To use, simply add to your pipeline
 * bot.use(new DictionaryRenderer(myTemplates))
 */
export class DictionaryRenderer implements TemplateRenderer, Middleware {

    public constructor(private templates: TemplateDictionary) {
    }

    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        context.templateManager.register(this);
        return next();
    }

    renderTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | string | undefined> {
        if (!(language in this.templates)) {
            //console.warn(`didn't find language ${language}`);
            return Promise.resolve(undefined);
        }
        let languageResource = this.templates[language];

        if (!(templateId in languageResource)) {
            //console.warn(`didn't find templateId ${templateId}`);
            return Promise.resolve(undefined);
        }
        let template = languageResource[templateId];
        return Promise.resolve(template(context, data));
    }
}
