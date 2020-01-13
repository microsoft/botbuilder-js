/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Class which manages cache of all LG resources from a ResourceExplorer. 
 * This class automatically updates the cache when resource change events occure.
 */
import { IResource, ResourceExplorer, FileResource } from '../resources';
import { MultiLanguageResourceLoader } from '../multiLanguageResourceLoader';
import { LanguageGenerator } from '../languageGenerator';
import { TemplateEngineLanguageGenerator } from './templateEngineLanguageGenerator';
import { normalize, basename} from 'path';
import { ImportResolverDelegate } from 'botbuilder-lg';

export class LanguageGeneratorManager {
    private _resourceExporer: ResourceExplorer;
    
    /// <summary>
    /// multi language lg resources. en -> [resourcelist].
    /// </summary>
    private _multiLanguageResources: Map<string, IResource[]>;

    public constructor(resourceManager: ResourceExplorer) {
        this._resourceExporer = resourceManager;

    }
    // load all LG resources
    public async loadResources(): Promise<void> {
        const resources = await this._resourceExporer.getResources('lg');
        for (const resource of resources) {
            const generator = await this.getTemplateEngineLanguageGenerator(resource);
            this._languageGenerator.set(resource.id().toLocaleLowerCase(), generator);
        }
    }
    
    public _languageGenerator: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    public static resourceExplorerResolver(locale: string, resourceMapping: Map<string, IResource[]>): ImportResolverDelegate {
        return  (source: string, id: string): {content: string; id: string} => {
            const fallbaclLocale = MultiLanguageResourceLoader.fallbackLocale(locale, Array.from(resourceMapping.keys()));
            const resources: IResource[] = resourceMapping[fallbaclLocale];

            const resourceName = basename(normalize(id));
            const resource: IResource = resources.filter((u): void => {
                MultiLanguageResourceLoader.parseLGFileName(u.id()).prefix.toLowerCase() === MultiLanguageResourceLoader.parseLGFileName(resourceName).prefix.toLowerCase();
            })[0];

            if (resource === undefined) {
                return {content: '', id: resource.id()};
            } else {
                const text = resource.readText();
                return {content: text, id: resource.id()};
            }
        };
    }

    // private  ResourceExplorer_Changed(resources: IResource[]): void {
    //     resources.filter(u => extname(u.id()).toLowerCase() === '.lg').forEach(resource => 
    //         this._languageGenerator[resource.id()] = this.getTemplateEngineLanguageGenerator(resource))
    // }

    private async getTemplateEngineLanguageGenerator(resource: IResource): Promise<TemplateEngineLanguageGenerator> {
        this._multiLanguageResources = await MultiLanguageResourceLoader.load(this._resourceExporer);
        const fileResource = resource as FileResource;
        if (fileResource !== undefined) {
            const templateEngineLanguageGenerator = new TemplateEngineLanguageGenerator().addTemplateEngineFromFile(fileResource.fullName, this._multiLanguageResources);
            return Promise.resolve(templateEngineLanguageGenerator);
        } else {
            const text = await resource.readText();
            const templateEngineLanguageGenerator = new TemplateEngineLanguageGenerator().addTemplateEngineFromText(text, resource.id(), this._multiLanguageResources);
            return Promise.resolve(templateEngineLanguageGenerator);
        }
    }
}