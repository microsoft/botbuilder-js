/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export enum AdaptiveEvents {
    /**
     * Raised when a dialog is started.
     */
    beginDialog = 'beginDialog',

    /**
     * Raised when a dialog has been asked to re-prompt.
     */
    repromptDialog = 'repromptDialog',

    /**
     * Raised when a dialog is being canceled.
     */
    cancelDialog = 'cancelDialog',

    /**
     * Raised when an new activity has been received.
     */
    activityReceived = 'activityReceived',

    /**
     * Raised when an error has occurred.
     */
    error = 'error',

    /**
     * Raised when utterance is received.
     */
    recognizeUtterance = 'recognizeUtterance',

    /**
     * Raised when intent is recognized from utterance.
     */
    recognizedIntent = 'recognizedIntent',

    /**
     * Raised when no intent can be recognized from utterance.
     */
    unknownIntent = 'unknownIntent',

    /**
     * Raised when all actions and ambiguity events have been finished.
     */
    endOfActions = 'endOfActions',

    /**
     * aised when there are multiple possible entity to property mappings.
     */
    chooseProperty = 'chooseProperty',

    /**
     * Raised when there are multiple possible resolutions of an entity.
     */
    chooseEntity = 'chooseEntity',

    /**
     * Raised when a property should be cleared.
     */
    clearProperty = 'clearProperty',

    /**
     * Raised when an entity should be assigned to a property.
     */
    assignEntity = 'assignEntity'
}