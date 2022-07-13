/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from 'events';
import { Resource } from './resource';
import { ResourceExplorer } from './resourceExplorer';

/**
 * Resource change event types.
 * added - a new resource has been added.
 * changed - an existing resource has been changed.
 * removed - an existing resource has been removed.
 */
export enum ResourceChangeEvent {
    added = 'added',
    changed = 'changed',
    removed = 'removed',
}

/**
 * Abstract class for looking up a resource by id.
 */
export abstract class ResourceProvider {
    private _resourceExplorer: ResourceExplorer;
    private _eventEmitter: EventEmitter = new EventEmitter();
    protected _id: string;

    /**
     * Initialize an instance of `ResourceProvider` class.
     *
     * @param resourceExplorer Resource explorer.
     */
    constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    /**
     * Event which is fired if any resource managed by the resource provider detects changes to the underlining resource.
     *
     * @param callback Callback function to be called when an event fired.
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
     * Gets the resource explorer.
     *
     * @returns The resource explorer.
     */
    get resourceExplorer(): ResourceExplorer {
        return this._resourceExplorer;
    }

    /**
     * Gets the ID for this resource provider.
     *
     * @returns The ID for this resource provider.
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets resource by id.
     *
     * @param id Resource id.
     */
    abstract getResource(id: string): Resource;

    /**
     * Enumerate resources.
     *
     * @param extension Extension filter.
     */
    abstract getResources(extension: string): Resource[];

    /**
     * Refresh any cached resources.
     */
    abstract refresh(): void;

    /**
     * @protected
     * Actions to perform when the current object is changed.
     * @param event Resource change event.
     * @param resources A collection of changed resources.
     */
    protected onChanged(event: ResourceChangeEvent, resources: Resource[]): void {
        if (this._eventEmitter) {
            this._eventEmitter.emit(event, resources);
        }
    }
}
