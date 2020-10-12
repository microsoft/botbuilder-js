/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Configurable } from 'botbuilder-dialogs';
import { DefaultLoader, ResourceExplorer } from 'botbuilder-dialogs-declarative';

type Input = {
    $kind: string;
    dialog: unknown;
};

export class CustomDialogLoader extends DefaultLoader {
    public constructor(resourceExplorer: ResourceExplorer) {
        super(resourceExplorer);
    }

    public load(value: Input, type: { new (...args: unknown[]): Configurable }): Configurable {
        const kind = value['$kind'];
        if (kind && !value['dialog']) {
            value['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.load(value, type);
    }
}
