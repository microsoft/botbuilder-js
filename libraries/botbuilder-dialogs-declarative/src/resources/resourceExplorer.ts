/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog } from 'botbuilder-dialogs';
import { Newable } from 'botbuilder-stdlib';
import { normalize, join } from 'path';
import { EventEmitter } from 'events';
import { ResourceProvider, ResourceChangeEvent } from './resourceProvider';
import { FolderResourceProvider } from './folderResourceProvider';
import { Resource } from './resource';
import { PathUtil } from '../pathUtil';
import { ComponentDeclarativeTypes } from '../componentDeclarativeTypes';
import { DeclarativeType } from '../declarativeType';
import { CustomDeserializer } from '../customDeserializer';
import { DefaultLoader } from '../defaultLoader';
import { ResourceExplorerOptions } from './resourceExplorerOptions';

/**
 * Class which gives standard access to content resources.
 */
export class ResourceExplorer {
    private _declarativeTypes: ComponentDeclarativeTypes[];
    private _kindToType: Map<string, Newable<unknown>> = new Map();
    private _kindDeserializer: Map<string, CustomDeserializer<unknown, unknown>> = new Map();
    private _eventEmitter: EventEmitter = new EventEmitter();
    private _cache = new Map<string, unknown>();
    private _typesLoaded = false;

    /**
     * Initializes a new instance of the [ResourceExplorer](botbuilder-dialogs.declarative.ResourceExplorer) class.
     *
     * @param {ResourceProvider[]} providers The list of [ResourceProvider](botbuilder-dialogs-declarative.ResourceProvider) to initialize the current instance.
     */
    constructor(providers: ResourceProvider[]);
    /**
     * Initializes a new instance of the [ResourceExplorer](botbuilder-dialogs.declarative.ResourceExplorer) class.
     *
     * @param {ResourceExplorerOptions} options The configuration options.
     */
    constructor(options?: ResourceExplorerOptions);
    /**
     * @param providersOrOptions The list of [ResourceProvider](xref:botbuilder-dialogs-declarative.ResourceProvider) or configuration options to initialize the current instance.
     */
    constructor(providersOrOptions: ResourceProvider[] | ResourceExplorerOptions = []) {
        if (Array.isArray(providersOrOptions)) {
            const providers: ResourceProvider[] = providersOrOptions;
            this.resourceProviders = providers;
        } else {
            const options: ResourceExplorerOptions = providersOrOptions;
            this.resourceProviders = options.providers ?? [];
            if (options.declarativeTypes) {
                this._declarativeTypes = options.declarativeTypes;
            }
        }
    }

    /**
     * Gets resource providers.
     */
    readonly resourceProviders: ResourceProvider[];

    /**
     * Gets resource type id extensions managed by resource explorer.
     */
    readonly resourceTypes: Set<string> = new Set(['dialog', 'lu', 'lg', 'qna', 'schema', 'json']);

    /**
     * Event which fires when a resource is changed.
     */
    set changed(callback: (event: ResourceChangeEvent, resources: Resource[]) => void) {
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
     * Add a resource type to resource type set.
     *
     * @param {string} type Resource type.
     */
    addResourceType(type: string): void {
        type = type.toLowerCase().replace(/^\./, '');
        if (!this.resourceTypes.has(type)) {
            this.resourceTypes.add(type);
            this.refresh();
        }
    }

    /**
     * Reload any cached data.
     */
    refresh(): void {
        this.resourceProviders.forEach((resourceProvider) => resourceProvider.refresh());
    }

    /**
     * Add a resource provider to the resources managed by resource explorer.
     *
     * @param {ResourceProvider} resourceProvider Resource provider to be added.
     * @returns {ResourceExplorer} Resource explorer so that you can fluently call multiple methods on the resource explorer.
     */
    addResourceProvider(resourceProvider: ResourceProvider): ResourceExplorer {
        if (this.resourceProviders.some((r): boolean => r.id === resourceProvider.id)) {
            throw Error(`${resourceProvider.id} has already been added as a resource`);
        }

        resourceProvider.changed = this.onChanged.bind(this);
        this.resourceProviders.push(resourceProvider);

        return this;
    }

    /**
     * Add a folder resource.
     *
     * @param {string}  folder Folder to be included as a resource.
     * @param {boolean} includeSubFolders Whether to include subfolders.
     * @param {boolean} monitorChanges Whether to track changes.
     * @returns {ResourceExplorer} Resource explorer so that you can fluently call multiple methods on the resource explorer.
     */
    addFolder(folder: string, includeSubFolders = true, monitorChanges = true): ResourceExplorer {
        this.addResourceProvider(new FolderResourceProvider(this, folder, includeSubFolders, monitorChanges));

        return this;
    }

    /**
     * Add folder resources.
     *
     * @param {string} folder Collection of folders to be included as resources.
     * @param {string[]} ignoreFolders Imediate subfolders to ignore.
     * @param {boolean} monitorChanges Whether to track changes.
     * @returns {ResourceExplorer} Resource explorer so that you can fluently call multiple methods on the resource explorer.
     */
    addFolders(folder: string, ignoreFolders?: string[], monitorChanges = true): ResourceExplorer {
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
     * Get resources of a given type extension.
     *
     * @param {string} fileExtension File extension filter.
     * @returns {Resource[]} The resources.
     */
    getResources(fileExtension: string): Resource[] {
        const resources: Resource[] = [];
        for (const rp of this.resourceProviders) {
            for (const rpResources of rp.getResources(fileExtension)) {
                resources.push(rpResources);
            }
        }

        return resources;
    }

    /**
     * Gets resource by id.
     *
     * @param {string} id Resource id.
     * @returns {Resource} The resource, or undefined if not found.
     */
    getResource(id: string): Resource {
        for (const rp of this.resourceProviders) {
            const resource: Resource = rp.getResource(id);
            if (resource) {
                return resource;
            }
        }

        return undefined;
    }

    /**
     * Register a declarative type with the resource loader system.
     *
     * @template T The type of object.
     * @param {string} kind The $kind name to map to this type.
     * @param {Newable<T>} type Type of object to create.
     * @param {CustomDeserializer}  loader Optional custom deserializer.
     * @returns {ResourceExplorer} Resource explorer for fluent style multiple calls.
     */
    registerType<T>(
        kind: string,
        type: Newable<T>,
        loader?: CustomDeserializer<T, Record<string, unknown>>
    ): ResourceExplorer {
        this.registerComponentTypes();
        this.registerTypeInternal(kind, type, loader);
        return this;
    }

    /**
     * Build type for given $kind from configuration.
     *
     * @template T Type of object.
     * @template C Type of configuration
     * @param {string} kind $kind.
     * @param {C} config Source configuration object.
     * @returns {T} Instantiated object.
     */
    buildType<T, C>(kind: string, config: C): T {
        this.registerComponentTypes();

        const type = this._kindToType.get(kind);
        if (!type) {
            throw new Error(`Type ${kind} not registered.`);
        }
        const loader = this._kindDeserializer.get(kind);
        return loader.load(config, type) as T;
    }

    /**
     * Load type from resource
     *
     * @template T Type of object.
     * @param {string} resourceId Resource id to bind to.
     * @returns {T} Type created from resource
     */
    loadType<T>(resourceId: string): T;
    /**
     * Load type from resource
     *
     * @template T Type of object.
     * @param {Resource} resource Resource id to bind to.
     * @returns {T} Type created from resource.
     */
    loadType<T>(resource: Resource): T;
    /**
     * @param resourceOrId The resource or resource id to bind to.
     * @returns Type created from resource.
     */
    loadType<T>(resourceOrId: Resource | string): T {
        this.registerComponentTypes();

        const resource = typeof resourceOrId === 'string' ? this.getResource(resourceOrId) : resourceOrId;
        if (!resource) {
            throw new Error(`Resource ${typeof resourceOrId === 'string' ? resourceOrId : resourceOrId.id} not found.`);
        }

        if (this._cache.has(resource.id)) {
            return this._cache.get(resource.id) as T;
        }

        const json = resource.readText();
        const config = JSON.parse(json);

        const result = this.preload<T>(config.$kind, resource.id);

        Object.assign(
            result,
            JSON.parse(json, (_key: string, value: unknown): unknown => {
                if (typeof value !== 'object' || value === null) {
                    return value;
                }
                if (Array.isArray(value)) {
                    return value;
                }
                const kind = value['$kind'];
                if (!kind) {
                    return value;
                }
                return this.load(value as { $kind: string } & Record<string, unknown>);
            })
        );

        if (result instanceof Dialog && !config['id']) {
            // If there is no id for the dialog, then the resource id would be used as dialog id.
            result.id = resource.id;
        }

        return result;
    }

    /**
     * Handler for onChanged events.
     *
     * @param {ResourceChangeEvent} event Event name.
     * @param {Resource} resources A collection of resources changed.
     */
    protected onChanged(event: ResourceChangeEvent, resources: Resource[]): void {
        if (this._eventEmitter) {
            this._eventEmitter.emit(event, resources);
        }
    }

    private load<T>(value: { $kind: string } & Record<string, unknown>): T {
        const kind = value['$kind'] as string;
        const type = this._kindToType.get(kind);
        if (!type) {
            throw new Error(`Type ${kind} not registered.`);
        }
        const loader = this._kindDeserializer.get(kind);
        return loader.load(value, type) as T;
    }

    // preload type into cache.
    private preload<T>(kind: string, resourceId: string): T {
        const type = this._kindToType.get(kind);
        if (!type) {
            throw new Error(`Type ${kind} not registered.`);
        }
        const result = new type();
        this._cache.set(resourceId, result);
        return result as T;
    }

    private registerTypeInternal<T, C>(kind: string, type: Newable<T>, loader?: CustomDeserializer<T, C>): void {
        this._kindToType.set(kind, type);
        this._kindDeserializer.set(kind, loader ?? new DefaultLoader(this));
    }

    private registerComponentTypes(): void {
        if (this._typesLoaded) {
            return;
        }

        this._typesLoaded = true;

        this._declarativeTypes.forEach((component: ComponentDeclarativeTypes) => {
            component.getDeclarativeTypes(this).forEach((declarativeType: DeclarativeType) => {
                const { kind, type, loader } = declarativeType;
                this.registerTypeInternal(kind, type, loader);
            });
        });
    }
}
