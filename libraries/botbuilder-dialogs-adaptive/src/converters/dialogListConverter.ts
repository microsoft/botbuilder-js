/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter, Dialog } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

export class DialogListConverter implements Converter<string[], Dialog[]> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string[] | Dialog[]): Dialog[] {
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
