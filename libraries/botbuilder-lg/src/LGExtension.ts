/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LGTemplate } from './lgTemplate';

/**
 * LG extensions.
 */
export class LGExtension {
    public static MarkSource(lgTemplates: LGTemplate[], source: string): LGTemplate[] {
        return lgTemplates.map((x: LGTemplate) => {
            x.Source = source;

            return x;
        });
    }
}