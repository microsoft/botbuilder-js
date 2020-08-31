/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultLoader } from 'botbuilder-dialogs-declarative';

/**
 * The cutomized type loader to load cutom dialogs.
 */
export class CustomDialogLoader extends DefaultLoader {
    public load(factory: new () => object, config: object): object {
        const kind = config['$kind'];
        if (!config['dialog']) {
            config['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.load(factory, config);
    }
}