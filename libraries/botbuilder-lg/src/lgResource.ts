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
    id: string;
    /**
     * The full path to the resource on disk.
     */
    fullName: string;
    /**
     * Resource content.
     */
    content: string;
    /**
     * Source of this template
     */

    /**
     * Creates a new instance of the [LGResource](xref:botbuilder-lg.LGResource) class.
     *
     * @param id Resource id.
     * @param fullName The full path to the resource on disk.
     * @param content Resource content.
     */
    constructor(id: string, fullName: string, content: string) {
        this.id = id || '';
        this.fullName = fullName || '';
        this.content = content;
    }
}
