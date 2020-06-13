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

export enum ResourceChangeEvent {
    added = 'added',
    changed = 'changed',
    removed = 'removed'
}

export abstract class ResourceProvider {
    private _resourceExplorer: ResourceExplorer;
    private _eventEmitter: EventEmitter = new EventEmitter();
    protected _id: string;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }


    /**
     * Event which is fired if any resource managed by the resource provider detects changes to the underlining resource.
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
     * Resource explorer
     */
    public get resourceExplorer(): ResourceExplorer {
        return this._resourceExplorer;
    }

    /**
     * Id for the resource provider
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Get resource by id
     * @param id resource id
     */
    public abstract getResource(id: string): Resource;

    /**
     * Enumerate resources
     * @param extension extension filter
     */
    public abstract getResources(extension: string): Resource[];

    /**
     * Refresh any cached resources
     */
    public abstract refresh(): void;

    protected onChanged(event: ResourceChangeEvent, resources: Resource[]): void {
        if (this._eventEmitter) {
            this._eventEmitter.emit(event, resources);
        }
    }
}