/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from './middleware';
import { Activity, ResourceResponse } from 'botframework-schema';
/** Interface for a template renderer which provides the ability
 * to create a text reply or activity reply from the language, templateid and data object
 **/
export interface TemplateRenderer {
    /**
     * renders a template for the language/templateId
     *
     * @param language id (such as 'en')
     * @param templateId id of the template to apply
     * @param data Data object to bind to
     **/
    renderTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | string | undefined>;
}
export declare class TemplateManager implements Middleware {
    private templateRenderers;
    private languageFallback;
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    postActivity(context: BotContext, activities: Partial<Activity>[], next: (newActivities?: Partial<Activity>[]) => Promise<ResourceResponse[]>): Promise<ResourceResponse[]>;
    /**
     * register template renderer
     * @param renderer
     */
    register(renderer: TemplateRenderer): TemplateManager;
    /**
     * list of registered template renderers
     */
    list(): TemplateRenderer[];
    /**
     * SetLanguagePolicy allows you to set the fallback strategy
     * @param fallback array of languages to try when binding templates
     */
    setLanguagePolicy(fallback: string[]): void;
    /**
     * Get the current language fallback policy
     */
    getLanguagePolicy(): string[];
    private findAndApplyTemplate(context, language, templateId, data);
    private bindActivityTemplate(context, activity);
}
