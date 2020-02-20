/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';

export class LGExtensions {
    public static trimExpression(expression: string): string {
        let result = expression.trim();
        if (result.startsWith('$')) {
            result = result.substr(1);
        }

        result = result.trim();
        
        if (result.startsWith('{') && result.endsWith('}')) {
            result = result.substr(1, result.length - 2);
        }

        return result.trim();
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
            return path.normalize(ambiguousPath.replace(/\//g, '\\'));
        } else {
            // map windows sep -> linux/mac
            return path.normalize(ambiguousPath.replace(/\\/g, '/'));
        }
    }
}