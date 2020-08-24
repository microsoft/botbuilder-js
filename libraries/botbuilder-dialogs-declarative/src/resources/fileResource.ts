/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import fs = require('fs');
import { Resource } from './resource';

/**
 * Class which represents a file as a resource.
 */
export class FileResource extends Resource {

    private _fullname: string;

    /**
     * Initialize a new instance of the `FileResouce` class.
     * @param path Path to file.
     */
    public constructor(path: string) {
        super();
        this._fullname = path;
        // The id will be the file name, without the path
        this._id = this._fullname.replace(/^.*[\\\/]/, '');
    }

    /**
     * The full path to the resource on disk
     */
    public get fullName(): string {
        return this._fullname;
    }

    /**
     * Read text content of a file resource.
     */
    public readText(): string {
        const filePath = this._fullname;
        const text = fs.readFileSync(filePath, 'utf-8');
        return text;
    }
}
