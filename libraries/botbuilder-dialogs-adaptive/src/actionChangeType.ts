/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export enum ActionChangeType {
    /**
     * Add the change actions to the head of the sequence.
     */
    insertActions = 'insertActions',

    /**
     * Add the change actions to the tail of the sequence.
     */
    appendActions = 'appendActions',

    /**
     * Terminate the action sequence.
     */
    endSequence = 'endSequence',

    /**
     * Terminate the action sequence, then add the change actions.
     */
    replaceSequence = 'replaceSequence',
}
