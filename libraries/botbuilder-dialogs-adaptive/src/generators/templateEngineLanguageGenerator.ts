/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LanguageGenerator } from '../languageGenerator';
import { TurnContext } from 'botbuilder-core';
import{ TemplateEngine } from 'botbuilder-lg';
import { IResource } from '../resources';
import { MultiLanguageResourceLoader } from '../multiLanguageResourceLoader';
import { LanguageGeneratorManager } from './languageGeneratorManager';
import { normalize, basename } from 'path';

/**
 * LanguageGenerator implementation which uses TemplateEngine. 
 */
export class TemplateEngineLanguageGenerator implements LanguageGenerator{
    public static declarative: string = 'Microsoft.TemplateEngMineLanguageGenerator';
    
    private readonly DEFAULTLABEL: string  = 'Unknown';

    private readonly multiLangEngines: Map<string, TemplateEngine> = new Map<string, TemplateEngine>();

    private engine: TemplateEngine;

    public id: string = '';

    public constructor(templateEngine?: TemplateEngine) {
        if (templateEngine !== undefined) {
            this.engine = templateEngine;
        } else {
            this.engine = new TemplateEngine();
        }
    }

    public addTemplateEngineFromText(lgText: string, id: string, resourceMapping: Map<string,IResource[]>): TemplateEngineLanguageGenerator {
        this.id = id !== undefined? id : this.DEFAULTLABEL;
        const {prefix: _, language: locale} = MultiLanguageResourceLoader.parseLGFileName(id);
        const fallbackLocale: string = MultiLanguageResourceLoader.fallbackLocale(locale.toLocaleLowerCase(), Array.from(resourceMapping.keys()));
        for (const mappingKey of resourceMapping.keys()) {
            if (fallbackLocale === ''  || fallbackLocale === mappingKey) {
                const engine = new TemplateEngine().addText(lgText !== undefined? lgText : '', id, LanguageGeneratorManager.resourceExplorerResolver(mappingKey, resourceMapping));
                this.multiLangEngines.set(mappingKey, engine);
            }
        }

        return this;
    }

    public addTemplateEngineFromFile(filePath: string, resourceMapping: Map<string,IResource[]>): TemplateEngineLanguageGenerator {
        filePath = normalize(filePath);
        this.id = basename(filePath);
        const {prefix: _, language: locale} = MultiLanguageResourceLoader.parseLGFileName(this.id);
        const fallbackLocale = MultiLanguageResourceLoader.fallbackLocale(locale, Array.from(resourceMapping.keys()));
        for (const mappingKey of resourceMapping.keys()) {
            if (fallbackLocale === ''  || fallbackLocale === mappingKey) {
                const engine = new TemplateEngine().addFile(filePath, LanguageGeneratorManager.resourceExplorerResolver(mappingKey, resourceMapping));
                this.multiLangEngines.set(mappingKey, engine);
            }
        }

        return this;
    }
    
    public generate(turnContext: TurnContext, template: string, data: object): Promise<string> {
        this.engine = this.initTemplateEngine(turnContext);
        try {
            return Promise.resolve(this.engine.evaluate(template, data).toString());
        } catch(e) {
            if (this.id !== undefined && this.id === '') {
                throw Error(`${ this.id }:${ e }`);
            }

            throw Error(e);
        }
    }

    private initTemplateEngine(turnContext: TurnContext): TemplateEngine {
        const locale = turnContext.activity.locale? turnContext.activity.locale.toLocaleLowerCase() : '';
        if (this.multiLangEngines.size > 0) {
            const fallbackLocale = MultiLanguageResourceLoader.fallbackLocale(locale.toLocaleLowerCase(), Array.from(this.multiLangEngines.keys()));
            this.engine = this.multiLangEngines.get(fallbackLocale);
        } else {
            this.engine = this.engine? this.engine : new TemplateEngine();
        }

        return this.engine;
    }
}