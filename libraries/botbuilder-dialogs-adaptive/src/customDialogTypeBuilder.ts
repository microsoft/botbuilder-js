/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultTypeBuilder } from 'botbuilder-dialogs-declarative';

export class CustomDialogTypeBuilder extends DefaultTypeBuilder {
    public build(config: object): object {
        const kind = config['$kind'];
        if (!config['dialog']) {
            config['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.build(config);
    }
}