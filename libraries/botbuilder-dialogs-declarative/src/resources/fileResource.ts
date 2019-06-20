/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { debug } from "util";
import { IResource } from "./resource";

const path = require('path');
const fs = require('fs');

export class FileResource implements IResource {

    private resourceId: string; 
    private path: string;

    constructor(path: string) {
        if (!path) {
            throw new Error("path");
        }

        this.path = path;
        
        // The id will be the file name, without the path
        this.resourceId = this.path.replace(/^.*[\\\/]/, '');
    }

    public id(): string {
        return this.resourceId;
    }

    public readText() : Promise<string> {
        const filePath = this.path;
        return new Promise<string>(function(resolve, reject) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                err ? reject(err) : resolve(data)
            });
        });
    }
}