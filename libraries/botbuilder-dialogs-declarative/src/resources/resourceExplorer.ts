/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalize, join } from 'path';
import { EventEmitter } from 'events';
import { ResourceProvider, ResourceChangeEvent } from './resourceProvider';
import { FolderResourceProvider } from './folderResourceProvider';
import { Resource } from './resource';
import { PathUtil } from '../pathUtil';
import { TypeFactory } from '../factory/typeFactory';
import { ComponentRegistration } from '../componentRegistration';

export class ResourceExplorer {
    private _factory: TypeFactory = new TypeFactory();
    private _resourceProviders: ResourceProvider[] = [];
    private _resourceTypes: Set<string> = new Set(['dialog', 'lu', 'lg', 'qna', 'schema', 'json']);
    private _eventEmitter: EventEmitter = new EventEmitter();

    /**
     * Initializes a new instance of the `ResourceExplorer` class.
     * @param providers Resource providers
     */
    public constructor(providers?: ResourceProvider[]) {
        if (providers) { this._resourceProviders = providers; }
    }

    /**
     * Event which fires when a resource is changed.
     */
    public set changed(callback: (event: ResourceChangeEvent, resources: Resource[]) => void) {
        this._eventEmitter.on(ResourceChangeEvent.added, (resources: Resource[]): void => {
            callback(ResourceChangeEvent.added, resources);
        });
        this._eventEmitter.on(ResourceChangeEvent.changed, (resources: Resource[]): void => {
            callback(ResourceChangeEvent.changed, resources);
        });
        this._eventEmitter.on(ResourceChangeEvent.removed, (resources: Resource[]): void => {
            callback(ResourceChangeEvent.removed, resources);
        });
    }

    /**
     * Gets resource providers.
     */
    public get resourceProviders(): ResourceProvider[] {
        return this._resourceProviders;
    }

    /**
     * Gets resource type id extensions managed by resource explorer.
     */
    public get resourceTypes(): Set<string> {
        return this._resourceTypes;
    }

    /**
     * Add a resource type to resource type set.
     * @param type resource type
     */
    public addResourceType(type: string): void {
        type = type.toLowerCase().replace(/^\./, '');
        if (!this._resourceTypes.has(type)) {
            this._resourceTypes.add(type);
            this.refresh();
        }
    }

    /**
     * Reload any cached data.
     */
    public refresh(): void {
        for (let i = 0; i < this._resourceProviders.length; i++) {
            this._resourceProviders[i].refresh();
        }
    }

    /**
     * Add a resource provider to the resources managed by resource explorer.
     * @param resourceProvider resource provider to be added.
     */
    public addResourceProvider(resourceProvider: ResourceProvider): ResourceExplorer {
        if (this._resourceProviders.some((r): boolean => r.id === resourceProvider.id)) {
            throw Error(`${ resourceProvider.id } has already been added as a resource`);
        }

        resourceProvider.changed = this.onChanged.bind(this);
        this._resourceProviders.push(resourceProvider);

        return this;
    }

    /**
     * Add a folder resource
     * @param folder folder to be included as a resource
     * @param includeSubFolders whether to include subfolders
     * @param monitorChanges whether to track changes
     */
    public addFolder(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true): ResourceExplorer {
        this.addResourceProvider(new FolderResourceProvider(this, folder, includeSubFolders, monitorChanges));

        return this;
    }

    /**
     * Add folder resources
     * @param folder collection of folders to be included as resources.
     * @param ignoreFolders imediate subfolders to ignore
     * @param monitorChanges whether to track changes
     */
    public addFolders(folder: string, ignoreFolders?: string[], monitorChanges: boolean = true): ResourceExplorer {
        if (ignoreFolders) {
            folder = normalize(folder);
            this.addFolder(folder, false, monitorChanges);
            const ignoreFoldersSet = new Set<string>(ignoreFolders.map((p): string => join(folder, p)));
            const subFolders = PathUtil.getDirectories(folder);
            for (let i = 0; i < subFolders.length; i++) {
                const subFolder = subFolders[i];
                if (!ignoreFoldersSet.has(subFolder)) {
                    this.addFolder(subFolder, true, monitorChanges);
                }
            }
        } else {
            this.addFolder(folder, true, monitorChanges);
        }

        return this;
    }

    /**
     * Add a ComponentRegistration to resource explorer for building types
     * @param component component registration to be added
     */
    public addComponent(component: ComponentRegistration): ResourceExplorer {
        const builders = component.getTypeBuilders();
        for (let i = 0; i < builders.length; i++) {
            const type = builders[i];
            this._factory.register(type.name, type.builder);
        }

        return this;
    }

    /**
     * Get resources of a given type extension.
     * @param fileExtension file extension filter
     */
    public getResources(fileExtension: string): Resource[] {
        let resources: Resource[] = [];
        for (const rp of this._resourceProviders) {
            for (const rpResources of rp.getResources(fileExtension)) {
                resources.push(rpResources);
            }
        }

        return resources;
    }

    /**
     * Get resource by id.
     * @param id resource id
     */
    public getResource(id: string): Resource {
        for (const rp of this._resourceProviders) {
            const resource: Resource = rp.getResource(id);
            if (resource) {
                return resource;
            }
        }

        return undefined;
    }

    /**
     * Build types from object configuration
     * @param config configuration to be parsed as a type
     */
    public buildType(config: object): object {
        if (typeof config == 'object') {
            const kind = config['$kind'] || config['$type'];
            if (kind) {
                const result = this._factory.build(kind, config);
                return result;
            } else {
                for (const key in config) {
                    config[key] = this.buildType(config[key]);
                }
            }
        }
        return config;
    }

    /**
     * Load types from resource or resource id
     * @param resource resource or resource id to be parsed as a type
     */
    public loadType(resource: string | Resource): object {
        if (typeof resource == 'string') {
            resource = this.getResource(resource);
        }
        const json = resource.readText();
        const result = JSON.parse(json);
        return this.buildType(result as object);
    }

    protected onChanged(event: ResourceChangeEvent, resources: Resource[]): void {
        if (this._eventEmitter) {
            this._eventEmitter.emit(event, resources);
        }
    }
}