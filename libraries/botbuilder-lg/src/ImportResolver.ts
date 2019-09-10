
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as fs from 'fs';
import * as path from 'path';
/**
 * Delegate for resolving resource id of imported lg file.
 */
export declare type ImportResolverDelegate = (source: string, resourceId: string) => { content: string; id: string };

/**
 * import resolver util
 */
export class ImportResolver {
    public static fileResolver: ImportResolverDelegate = (filePath: string, id: string) => {
        // import paths are in resource files which can be executed on multiple OS environments
            // Call GetOsPath() to map / & \ in importPath -> OSPath
            let importPath: string = ImportResolver.normalizePath(id);
            if (!path.isAbsolute(importPath)) {
                // get full path for importPath relative to path which is doing the import.
                importPath = path.normalize(path.join(path.dirname(filePath), importPath));
            }

            const content: string = fs.readFileSync(importPath, 'utf-8');

            return { content, id: importPath };
    }

     /// <summary>
    /// Normalize authored path to os path.
    /// </summary>
    /// <remarks>
    /// path is from authored content which doesn't know what OS it is running on.
    /// This method treats / and \ both as seperators regardless of OS, for windows that means / -> \ and for linux/mac \ -> /.
    /// This allows author to use ../foo.lg or ..\foo.lg as equivelents for importing.
    /// </remarks>
    /// <param name="ambiguousPath">authoredPath.</param>
    /// <returns>path expressed as OS path.</returns>
    public static normalizePath(ambiguousPath: string): string {
        if (process.platform === 'win32') {
             // map linux/mac sep -> windows
            return ambiguousPath.replace(/\//g, '\\');
        } else {
            // map windows sep -> linux/mac
            return ambiguousPath.replace(/\\/g, '/');
        }
    }
}
