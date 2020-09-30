/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalize, basename } from 'path';
import { DialogContext } from 'botbuilder-dialogs';
import { Resource } from 'botbuilder-dialogs-declarative';
import { Templates, LGResource } from 'botbuilder-lg';
import { LanguageGenerator } from '../languageGenerator';
import { LanguageResourceLoader } from '../languageResourceLoader';
import { LanguageGeneratorManager } from './languageGeneratorManager';

/**
 * LanguageGenerator implementation which uses LGFile.
 */
export class TemplateEngineLanguageGenerator implements LanguageGenerator{
    private readonly DEFAULTLABEL: string  = 'Unknown';

    private lg: Templates;

    public id: string = '';

    /**
     * Initializes a new instance of the `TemplateEngineLanguageGenerator` class.
     * @param arg1 An LG `Templates` or a `Resource`.
     * @param arg2 A `Map` object with a `Resource` array for each key.
     */
    public constructor(arg1?: Templates | Resource, arg2?: Map<string,Resource[]>) {
        if (arguments.length === 0) {
            this.lg = new Templates();
        } else if(arguments.length === 1 && arg1 instanceof Templates) {
            this.lg = arg1;
        } else if (arguments.length === 2 && arg1 instanceof Resource && arg2 instanceof Map) {
            const resourceMapping = arg2 as  Map<string,Resource[]>;
            this.id = arg1.id;
            const {prefix: _, language: locale} = LanguageResourceLoader.parseLGFileName(this.id);
            const importResolver = LanguageGeneratorManager.resourceExplorerResolver(locale, resourceMapping);
            const lgResource = new LGResource(this.id, arg1.fullName, arg1.readText());
            this.lg = Templates.parseResource(lgResource, importResolver);
        }
    }

    /**
     * Method to generate text from given template and data.
     * @param dialogContext Context for the current turn of conversation.
     * @param template Template to evaluate.
     * @param data Data to bind to.
     * @returns A Promise string with the evaluated result.
     */
    public generate(dialogContext: DialogContext, template: string, data: object): Promise<string> {
        try {
            // BUGBUG: I'm casting objects to <any> to work around a bug in the activity factory.
            //         The string version of of the serialized card isn't being parsed. We should
            //         fix that in R10. The cast is working for now.
            const result = this.lg.evaluateText(template, data);
            return Promise.resolve(typeof result == 'object' ? result as any : result.toString());
        } catch(e) {
            if (this.id !== undefined && this.id === '') {
                throw Error(`${ this.id }:${ e }`);
            }

            throw Error(e);
        }
    }
}
