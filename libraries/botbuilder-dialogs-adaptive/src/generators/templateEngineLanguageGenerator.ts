/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { Resource } from 'botbuilder-dialogs-declarative';
import { Templates, LGResource, EvaluationOptions } from 'botbuilder-lg';
import { LanguageGenerator } from '../languageGenerator';
import { LanguageResourceLoader } from '../languageResourceLoader';
import { LanguageGeneratorManager } from './languageGeneratorManager';

export interface TemplateEngineLanguageGeneratorConfiguration {
    id?: string;
}

/**
 * [LanguageGenerator](xref:botbuilder-dialogs-adaptive.LanguageGenerator) implementation which uses LGFile.
 */
export class TemplateEngineLanguageGenerator<T = unknown, D extends Record<string, unknown> = Record<string, unknown>>
    extends Configurable
    implements LanguageGenerator<T, D>, TemplateEngineLanguageGeneratorConfiguration {
    static $kind = 'Microsoft.TemplateEngineLanguageGenerator';

    private readonly DEFAULTLABEL: string = 'Unknown';

    private lg: Templates;

    id = '';

    /**
     * Initializes a new instance of the [TemplateEngineLanguageGenerator](xref:botbuilder-dialogs-adaptive.TemplateEngineLanguageGenerator) class.
     *
     * @param arg1 Optional. An LG [Templates](xref:botbuilder-lg.Templates) or a [Resource](xref:botbuilder-dialogs-declarative.Resource).
     * @param arg2 Optional. A `Map` object with a `Resource` array for each key.
     */
    constructor(arg1?: Templates | Resource, arg2?: Map<string, Resource[]>) {
        super();

        if (arguments.length === 0) {
            this.lg = new Templates();
        } else if (arguments.length === 1 && arg1 instanceof Templates) {
            this.lg = arg1;
        } else if (arguments.length === 2 && arg1 instanceof Resource && arg2 instanceof Map) {
            const resourceMapping = arg2 as Map<string, Resource[]>;
            this.id = arg1.id;
            const { prefix: _, language: locale } = LanguageResourceLoader.parseLGFileName(this.id);
            const importResolver = LanguageGeneratorManager.resourceExplorerResolver(locale, resourceMapping);
            const lgResource = new LGResource(this.id, arg1.fullName, arg1.readText());
            this.lg = Templates.parseResource(lgResource, importResolver);
        }
    }

    /**
     * Method to generate text from given template and data.
     *
     * @param dialogContext Context for the current turn of conversation.
     * @param template Template to evaluate.
     * @param data Data to bind to.
     * @returns A Promise string with the evaluated result.
     */
    generate(dialogContext: DialogContext, template: string, data: D): Promise<T> {
        try {
            const lgOptions = new EvaluationOptions();
            lgOptions.locale = dialogContext.getLocale();
            const result = this.lg.evaluateText(template, data, lgOptions);
            return Promise.resolve(result);
        } catch (e) {
            if (this.id !== undefined && this.id === '') {
                throw Error(`${this.id}:${e}`);
            }

            throw Error(e);
        }
    }
}
