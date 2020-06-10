/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export abstract class Resource {
    protected _id: string;

    /**
     * Resources id
     */
    public get id(): string {
        return this._id;
    }

    /**
     * Get resource as text
     */
    public abstract readText(): string;
}
