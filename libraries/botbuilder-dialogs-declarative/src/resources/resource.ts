/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Abstract class for access the content of a resource.
 */
export abstract class Resource {
    protected _id: string;

    /**
     * Resource id.
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Get resource as text.
     */
    public abstract readText(): string;
}
