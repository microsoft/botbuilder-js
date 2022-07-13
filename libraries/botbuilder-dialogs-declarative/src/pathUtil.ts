/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';

/**
 * An utility class for file path operations.
 */
export class PathUtil {
    /**
     * Check if a path is a directory
     *
     * @param path Path of the directory.
     * @returns True if the path is a directory; false otherwise.
     */
    static isDirectory(path: string): boolean {
        return lstatSync(path).isDirectory();
    }

    /**
     * Get sub folders in a directory
     *
     * @param path Path of root directory.
     * @returns Sub folders in the directory.
     */
    static getDirectories(path: string): string[] {
        return readdirSync(path)
            .map((name: string): string => join(path, name))
            .filter(PathUtil.isDirectory);
    }

    /**
     * Get files in a directory
     *
     * @param path Path of root directory.
     * @param includeSubFolders Whether include its sub folders.
     * @returns The files in the directory.
     */
    static getFiles(path: string, includeSubFolders = true): string[] {
        return readdirSync(path)
            .map((name: string): string => join(path, name))
            .reduce((files: string[], file: string): string[] => {
                if (includeSubFolders && PathUtil.isDirectory(file)) {
                    files.push(...PathUtil.getFiles(file));
                } else {
                    files.push(file);
                }
                return files;
            }, []);
    }
}
