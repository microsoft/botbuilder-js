/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TemplateRenderer } from './TemplateManager';
import { Middleware } from './middleware';
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
export declare class DictionaryRenderer implements TemplateRenderer, Middleware {
    private templates;
    constructor(templates: TemplateDictionary);
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    renderTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | string | undefined>;
}
