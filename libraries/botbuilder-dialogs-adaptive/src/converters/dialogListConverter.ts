/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Dialog } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * Converter which allows json to be expression to object or static object.
 */
export class DialogListConverter implements Converter<string[], Dialog[]> {
    /**
     * Initializes a new instance of the [DialogListConverter](xref:botbuilder-dialogs-adaptive.DialogListConverter) class.
     *
     * @param _resourceExplorer Resource explorer to use for resolving references.
     */
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    /**
     * @param value A list of strings representing dialogs, or a list of dialogs.
     * @returns A new list of [Dialog](xref:botbuilder-dialogs.Dialog) instance.
     */
    convert(value: string[] | Dialog[]): Dialog[] {
        const results: Dialog[] = [];

        value.forEach((item: string | Dialog) => {
            if (item instanceof Dialog) {
                results.push(item);
            } else {
                let resource = this._resourceExplorer.getResource(item);
                if (!resource) {
                    resource = this._resourceExplorer.getResource(`${item}.dialog`);
                }
                if (resource) {
                    results.push(this._resourceExplorer.loadType<Dialog>(resource));
                }
            }
        });

        return results;
    }
}
