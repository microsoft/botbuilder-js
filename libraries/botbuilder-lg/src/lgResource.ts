/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * LG resource entity, contains some core data structure.
 */
export class LGResource {
    /**
     * esource id.
     */
    public id: string;
    /**
     * The full path to the resource on disk.
     */
    public fullName: string;
    /**
     * Resource content.
     */
    public content: string;
    /**
     * Source of this template
     */

    /**
     * Creates a new instance of the LGResource class.
     * @param id Resource id.
     * @param fullName The full path to the resource on disk.
     * @param content Resource content.
     */
    public constructor(id: string, fullName: string, content: string) {
        this.id = id || '';
        this.fullName = fullName || '';
        this.content = content;
    }
}
