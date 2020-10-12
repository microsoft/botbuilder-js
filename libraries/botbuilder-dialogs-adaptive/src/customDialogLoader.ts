/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converters, Properties } from 'botbuilder-dialogs';
import { DefaultLoader, ResourceExplorer } from 'botbuilder-dialogs-declarative';

type Type<T> = T & {
    new (...args: unknown[]): Type<T>;
    getConverters(): Converters<Properties<T>>;
};

export class CustomDialogLoader<T, C> extends DefaultLoader<T, C> {
    public constructor(resourceExplorer: ResourceExplorer) {
        super(resourceExplorer);
    }

    public load(value: C, type: Type<T>): T {
        const kind = value['$kind'];
        if (kind && !value['dialog']) {
            value['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.load(value, type);
    }
}
