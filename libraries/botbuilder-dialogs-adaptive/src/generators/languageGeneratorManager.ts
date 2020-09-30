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
import { ImportResolverDelegate, LGResource } from 'botbuilder-lg';
import { normalize, basename, extname } from 'path';
import { LanguageGenerator } from '../languageGenerator';
import { LanguageResourceLoader } from '../languageResourceLoader';
import { TemplateEngineLanguageGenerator } from './templateEngineLanguageGenerator';

/**
 * Class which manages cache of all LG resources from a ResourceExplorer.
 */
export class LanguageGeneratorManager {
    /**
     * Resource explorer to manager LG files used by language generator manager.
     */
    private _resourceExporer: ResourceExplorer;

    /**
     * Multi language lg resources. en -> [resourcelist].
     */
    private _multiLanguageResources: Map<string, Resource[]>;

    /**
     * Initialize a new instance of LanguageResourceManager class.
     * @param resourceManager Resource explorer to manager LG files.
     */
    public constructor(resourceManager: ResourceExplorer) {
        this._resourceExporer = resourceManager;
        this._resourceExporer.changed = async (event: ResourceChangeEvent, resources: Resource[]): Promise<void> => {
            for (let i = 0; i < resources.length; i++) {
                if (extname(resources[i].id).toLowerCase() === '.lg') {
                    if (event === ResourceChangeEvent.removed) {
                        this.languageGenerators.delete(resources[i].id);
                    } else {
                        const generator = this.getTemplateEngineLanguageGenerator(resources[i]);
                        this.languageGenerators.set(resources[i].id, generator);
                    }
                }
            }
        };

        this._multiLanguageResources = LanguageResourceLoader.groupByLocale(this._resourceExporer);

        // load all LG resources
        const resources = this._resourceExporer.getResources('lg');
        for (const resource of resources) {
            this.languageGenerators.set(resource.id, this.getTemplateEngineLanguageGenerator(resource));
        }
    }

    /**
     * Gets or sets language generators.
     */
    public languageGenerators: Map<string, LanguageGenerator> = new Map<string, LanguageGenerator>();

    /**
     * Returns the resolver to resolve LG import id to template text based on language and a template resource loader delegate.
     * @param locale Locale to identify language.
     * @param resourceMapping Template resource loader delegate.
     * @returns The delegate to resolve the resource.
     */
    public static resourceExplorerResolver(locale: string, resourceMapping: Map<string, Resource[]>): ImportResolverDelegate {
        return (lgResource: LGResource, id: string): LGResource => {
            const fallbackLocale = LanguageResourceLoader.fallbackLocale(locale, Array.from(resourceMapping.keys()));
            const resources: Resource[] = resourceMapping.get(fallbackLocale.toLowerCase());

            const resourceName = basename(normalize(id));
            const resource = resources.find(u =>
                LanguageResourceLoader.parseLGFileName(u.id).prefix === LanguageResourceLoader.parseLGFileName(resourceName).prefix);

            if (resource === undefined) {
                throw Error(`There is no matching LG resource for ${ resourceName }`);
            } else {
                return new LGResource(resource.id, resource.fullName, resource.readText());
            }
        };
    }

    /**
     * @private
     */
    private getTemplateEngineLanguageGenerator(resource: Resource): TemplateEngineLanguageGenerator {
        return new TemplateEngineLanguageGenerator(resource, this._multiLanguageResources);
    }
}
