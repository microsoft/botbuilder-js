/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { OnIntent } from './onIntent';

const qnaMatchIntent = 'QnAMatch';

/**
 * Actions triggered when a MessageUpdateActivity is received.
 */
export class OnQnAMatch extends OnIntent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(qnaMatchIntent, [], actions, condition);
    }
}