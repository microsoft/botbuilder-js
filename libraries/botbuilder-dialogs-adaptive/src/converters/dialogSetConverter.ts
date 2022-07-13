/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Dialog, DialogSet } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

/**
 * DialogSet converter that implements [Converter](xref:botbuilder-dialogs-declarative.Converter).
 */
export class DialogSetConverter implements Converter<string[] | Dialog[], DialogSet> {
    /**
     * Initializes a new instance of the [DialogSetConverter](xref:botbuilder-dialogs-adaptive.DialogSetConverter) class.
     *
     * @param _resourceExplorer Resource explorer to use for resolving references.
     */
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    /**
     * Converts an array of dialog or dialog name to a [DialogSet](xref:botbuilder-dialogs.DialogSet) instance.
     *
     * @param value An array of dialog or dialog name.
     * @returns A new [DialogSet](xref:botbuilder-dialogs.DialogSet) instance.
     */
    convert(value: string[] | Dialog[] | DialogSet): DialogSet {
        if (value instanceof DialogSet) {
            return value;
        }

        const result = new DialogSet();

        value.forEach((item: string | Dialog) => {
            if (item instanceof Dialog) {
                result.add(item);
            } else {
                let resource = this._resourceExplorer.getResource(item);
                if (!resource) {
                    resource = this._resourceExplorer.getResource(`${item}.dialog`);
                }
                if (resource) {
                    result.add(this._resourceExplorer.loadType<Dialog>(resource));
                }
            }
        });

        return result;
    }
}
