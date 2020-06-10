/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';

export class PathUtil {
    /**
     * Check if a path is a directory
     * @param path path of the diretory
     */
    public static isDirectory(path: string): boolean {
        return lstatSync(path).isDirectory();
    }

    /**
     * Get sub folders in a directory
     * @param path path of root directory
     */
    public static getDirectories(path: string): string[] {
        return readdirSync(path)
            .map((name: string): string => join(path, name))
            .filter(PathUtil.isDirectory);
    }

    /**
     * Get files in a directory
     * @param path path of root directory
     * @param includeSubFolders whether include its sub folders
     */
    public static getFiles(path: string, includeSubFolders = true): string[] {
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
