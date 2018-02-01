/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TemplateRenderer } from './templateManager';
import { Middleware } from './middleware';
import { Activity } from './activity';
/**
 * A template function that can return a stringified value from a given data object.
 *
 * @param data The data object to return a value from.
 * @param path (Optional) path to the value to return.
 */
export declare type TemplateFunction = (data: Object, path?: string) => string;
/**
 * A set of named template functions.
 */
export declare type TemplateFunctionMap = {
    [name: string]: TemplateFunction;
};
/**
 * Template source for rendering dynamic JSON objects. To use add to the pipeline
 * bot
 *    .use(new JsonTemplateEngine()
 *          .add('templateId', function()=>{} ))
 */
export declare class JsonTemplates implements TemplateRenderer, Middleware {
    private templates;
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    renderTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | string | undefined>;
    /**
     * Registers a new JSON template. The template will be compiled and cached.
     *
     * @param name Name of the template to register.
     * @param json JSON template.
     */
    add(name: string, json: string | any): this;
    /**
     * Registers a named function that can be called within a template.
     *
     * @param name Name of the function to register.
     * @param fn Function to register.
     */
    addFunction(name: string, fn: TemplateFunction): this;
    /**
     * Renders a registered JSON template to a string using the given data object.
     *
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     */
    render(name: string, data: Object): string | undefined;
    /**
     * Renders a registered JSON template using the given data object. The rendered string will
     * be `JSON.parsed()` into a JSON object prior to returning.
     *
     * @param name Name of the registered template to render.
     * @param data Data object to render template against.
     * @param postProcess (Optional) if `true` the rendered output object will be scanned looking
     * for any processing directives, such as @prune. The default value is `true`.
     */
    renderAsJSON(name: string, data: Object, postProcess?: boolean): any;
    /**
     * Post processes a JSON object by walking the object and evaluating any processing directives
     * like @prune.
     * @param object Object to post process.
     */
    postProcess(object: any): any;
    /**
     * Compiles a JSON template into a function that can be called to render a JSON object using
     * a data object.
     *
     * @param json The JSON template to compile.
     * @param templates (Optional) map of template functions (and other compiled templates) that
     * can be called at render time.
     */
    static compile(json: string | any, templates?: TemplateFunctionMap): TemplateFunction;
}
