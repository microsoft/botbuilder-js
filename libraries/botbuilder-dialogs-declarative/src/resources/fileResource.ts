/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { readFileSync } from 'fs';
import { Resource } from './resource';

/**
 * Class which represents a file as a resource.
 */
export class FileResource extends Resource {
    /**
     * Initialize a new instance of the `FileResouce` class.
     *
     * @param path Path to file.
     */
    constructor(path: string) {
        super();
        this._fullname = path;
        // The id will be the file name, without the path
        this._id = this._fullname.replace(/^.*[\\/]/, '');
    }

    /**
     * Read text content of a file resource.
     *
     * @returns Read content text.
     */
    readText(): string {
        const filePath = this._fullname;
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const text = readFileSync(filePath, 'utf-8');
        return text;
    }
}
