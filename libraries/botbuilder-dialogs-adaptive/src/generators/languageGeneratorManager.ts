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
import { IResource, ResourceExplorer, FileResource } from 'botbuilder-dialogs-declarative';
import { LanguageResourceLoader } from '../languageResourceLoader';
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
        this._multiLanguageResources = LanguageResourceLoader.groupByLocale(this._resourceExporer);

        // load all LG resources
        const resources = this._resourceExporer.getResources('lg');
        for (const resource of resources) {
            this.languageGenerators.set(resource.id(), this.getTemplateEngineLanguageGenerator(resource));
        }
    }
    
    public languageGenerators: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    public static resourceExplorerResolver(locale: string, resourceMapping: Map<string, IResource[]>): ImportResolverDelegate {
        return  (source: string, id: string): {content: string; id: string} => {
            const fallbackLocale = LanguageResourceLoader.fallbackLocale(locale, Array.from(resourceMapping.keys()));
            const resources: IResource[] = resourceMapping.get(fallbackLocale.toLowerCase());

            const resourceName = basename(normalize(id));
            const resource = resources.find(u => 
                LanguageResourceLoader.parseLGFileName(u.id()).prefix === LanguageResourceLoader.parseLGFileName(resourceName).prefix);

            if (resource === undefined) {
                throw Error(`There is no matching LG resource for ${ resourceName }`);
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

    private getTemplateEngineLanguageGenerator(resource: IResource): TemplateEngineLanguageGenerator {
        const fileResource = resource as FileResource;
        if (fileResource !== undefined) {
            return new TemplateEngineLanguageGenerator(fileResource.fullName, this._multiLanguageResources);
        } else {
            const text = resource.readText();
            return new TemplateEngineLanguageGenerator(text, resource.id(), this._multiLanguageResources);
        }
    }
}