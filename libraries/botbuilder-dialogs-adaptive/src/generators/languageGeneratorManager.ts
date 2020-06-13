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
import { Resource, ResourceExplorer, FileResource, ResourceChangeEvent } from 'botbuilder-dialogs-declarative';
import { LanguageResourceLoader } from '../languageResourceLoader';
import { LanguageGenerator } from '../languageGenerator';
import { TemplateEngineLanguageGenerator } from './templateEngineLanguageGenerator';
import { normalize, basename, extname} from 'path';
import { ImportResolverDelegate } from 'botbuilder-lg';

export class LanguageGeneratorManager {
    private _resourceExporer: ResourceExplorer;
    
    /// <summary>
    /// multi language lg resources. en -> [resourcelist].
    /// </summary>
    private _multiLanguageResources: Map<string, Resource[]>;

    public constructor(resourceManager: ResourceExplorer) {
        this._resourceExporer = resourceManager;
        this._resourceExporer.changed = this.resourceExplorerChanged.bind(this);
    }

    // load all LG resources
    public async loadResources(): Promise<void> {
        const resources = this._resourceExporer.getResources('lg');
        for (const resource of resources) {
            const generator = await this.getTemplateEngineLanguageGenerator(resource);
            this.languageGenerator.set(resource.id, generator);
        }
    }
    
    public languageGenerator: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    public static resourceExplorerResolver(locale: string, resourceMapping: Map<string, Resource[]>): ImportResolverDelegate {
        return  (source: string, id: string): {content: string; id: string} => {
            const fallbackLocale = LanguageResourceLoader.fallbackLocale(locale, Array.from(resourceMapping.keys()));
            const resources: Resource[] = resourceMapping.get(fallbackLocale.toLowerCase());

            const resourceName = basename(normalize(id));
            const resource = resources.find(u => 
                LanguageResourceLoader.parseLGFileName(u.id).prefix === LanguageResourceLoader.parseLGFileName(resourceName).prefix);

            if (resource === undefined) {
                throw Error(`There is no matching LG resource for ${ resourceName }`);
            } else {
                const text = resource.readText();
                return {content: text, id: resource.id};
            }
        };
    }

    private async resourceExplorerChanged(event: ResourceChangeEvent, resources: Resource[]): Promise<void> {
        for (let i = 0; i < resources.length; i++) {
            if (extname(resources[i].id).toLowerCase() === '.lg') {
                if (event === ResourceChangeEvent.removed) {
                    this.languageGenerator.delete(resources[i].id);
                } else {
                    const generator = await this.getTemplateEngineLanguageGenerator(resources[i]);
                    this.languageGenerator.set(resources[i].id, generator);
                }
            }
        }
    }

    private async getTemplateEngineLanguageGenerator(resource: Resource): Promise<TemplateEngineLanguageGenerator> {
        this._multiLanguageResources = await LanguageResourceLoader.groupByLocale(this._resourceExporer);
        const fileResource = resource as FileResource;
        if (fileResource !== undefined) {
            const templateEngineLanguageGenerator = new TemplateEngineLanguageGenerator(fileResource.fullName, this._multiLanguageResources);
            return Promise.resolve(templateEngineLanguageGenerator);
        } else {
            const text = await resource.readText();
            const templateEngineLanguageGenerator = new TemplateEngineLanguageGenerator(text, resource.id, this._multiLanguageResources);
            return Promise.resolve(templateEngineLanguageGenerator);
        }
    }
}