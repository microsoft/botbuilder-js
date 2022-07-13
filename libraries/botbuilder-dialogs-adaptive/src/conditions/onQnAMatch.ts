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
    static $kind = 'Microsoft.OnQnAMatch';

    /**
     * Initializes a new instance of the [OnQnAMatch](xref:botbuilder-dialogs-adaptive.OnQnAMatch) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(qnaMatchIntent, [], actions, condition);
    }
}
