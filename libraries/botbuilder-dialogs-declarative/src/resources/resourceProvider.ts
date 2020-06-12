/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Resource } from './resource';
import { ResourceExplorer } from './resourceExplorer';
import { EventEmitter } from 'events';

export enum ResourceChangeEvent {
    added = 'added',
    changed = 'changed',
    removed = 'removed'
}

export abstract class ResourceProvider {
    private _resourceExplorer: ResourceExplorer;
    protected _id: string;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    /**
     * Event emitter which would fire an event when resources changed.
     */
    public eventEmitter: EventEmitter = new EventEmitter();

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
        if (this.eventEmitter) {
            this.eventEmitter.emit(event, resources);
        }
    }
}