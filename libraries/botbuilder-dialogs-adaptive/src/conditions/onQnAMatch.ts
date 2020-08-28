/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { QnAMakerRecognizer } from 'botbuilder-ai';
import { Dialog } from 'botbuilder-dialogs';
import { OnIntent } from './onIntent';

/**
 * Actions triggered when a MessageUpdateActivity is received.
 */
export class OnQnAMatch extends OnIntent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(QnAMakerRecognizer.qnaMatchIntent, [], actions, condition);
    }
}