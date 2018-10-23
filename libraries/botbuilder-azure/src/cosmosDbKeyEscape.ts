/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export module CosmosDbKeyEscape {
    const illegalKeys: string[] = ['\\', '?', '/', '#', '\t', '\n', '\r', '*'];
    const illegalKeyCharacterReplacementMap: Map<string, string> =
        illegalKeys.reduce<Map<string, string>>(
            (map: Map<string, string>, c: string) => {
                map.set(c, `*${c.charCodeAt(0).toString(16)}`);

                return map;
            },
            new Map()
        );

     /**
     * Converts the key into a DocumentID that can be used safely with CosmosDB.
     * The following characters are restricted and cannot be used in the Id property: '/', '\', '?', '#'
     * More information at https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.resource.id?view=azure-dotnet#remarks
      * @param key The provided key to be escaped.
      */
    export function escapeKey(key: string): string {
        if (!key) {
            throw new Error('The \'key\' parameter is required.');
        }

        const keySplitted: string[] = key.split('');

        const firstIllegalCharIndex: number = keySplitted.findIndex(((c: string): boolean => illegalKeys.some((i: string) => i === c)));

        // If there are no illegal characters return immediately and avoid any further processing/allocations
        if (firstIllegalCharIndex === -1) {
            return key;
        }

        return keySplitted.reduce(
            (result: string, c: string) =>
                result + (illegalKeyCharacterReplacementMap.has(c) ? illegalKeyCharacterReplacementMap.get(c) : c),
            ''
        );
    }
}
