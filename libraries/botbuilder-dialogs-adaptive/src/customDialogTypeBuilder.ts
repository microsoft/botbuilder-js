/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AdaptiveTypeBuilder } from './adaptiveTypeBuilder';


/**
 * Custom dialog adaptive type builder.
 */
export class CustomDialogTypeBuilder extends AdaptiveTypeBuilder {
    /**
     * Builds a custom adaptive type.
     * @param config Configuration object for the type.
     * @returns A new factory object for the custom adaptive type.
     */
    public build(config: object): object {
        const kind = config['$kind'];
        if (!config['dialog']) {
            config['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.build(config);
    }
}
