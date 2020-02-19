
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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
export function normalizePath(ambiguousPath: string): string {
    if (process.platform === 'win32') {
        // map linux/mac sep -> windows
        return ambiguousPath.replace(/\//g, '\\');
    } else {
        // map windows sep -> linux/mac
        return ambiguousPath.replace(/\\/g, '/');
    }
}
