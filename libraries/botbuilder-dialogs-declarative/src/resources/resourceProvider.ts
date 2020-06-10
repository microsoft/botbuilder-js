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

export abstract class ResourceProvider {
    private _resourceExplorer: ResourceExplorer;
    protected _id: string;

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
    }

    /**
     * Event which is fired if any resource managed by the resource provider detects changes to the underlining resource.
     */
    public changed: EventEmitter = new EventEmitter();

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

    protected onChanged(resources: Resource[]): void {
        this.changed.emit('changed', resources);
    }
}