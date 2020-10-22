/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { QnAMakerDialog } from './qnaMakerDialog';
import { QnAMakerRecognizer } from './qnaMakerRecognizer';

/**
 * Define component assets for QnAMaker.
 */
export class QnAMakerComponentRegistration extends ComponentRegistration {
    public getDeclarativeTypes(_resourceExplorer: unknown): unknown[] {
        return [
            {
                kind: QnAMakerRecognizer.$kind,
                type: QnAMakerRecognizer,
            },
            {
                kind: QnAMakerDialog.$kind,
                type: QnAMakerDialog,
            },
        ];
    }
}
