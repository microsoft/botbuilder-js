/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogEvents } from 'botbuilder-dialogs';

/**
 * Adaptive event identifier definition list.
 */
export class AdaptiveEvents extends DialogEvents {
    /**
     * Raised when utterance is received.
     */
    static readonly recognizeUtterance = 'recognizeUtterance';

    /**
     * Raised when intent is recognized from utterance.
     */
    static readonly recognizedIntent = 'recognizedIntent';

    /**
     * Raised when no intent can be recognized from utterance.
     */
    static readonly unknownIntent = 'unknownIntent';

    /**
     * Raised when all actions and ambiguity events have been finished.
     */
    static readonly endOfActions = 'endOfActions';

    /**
     * aised when there are multiple possible entity to property mappings.
     */
    static readonly chooseProperty = 'chooseProperty';

    /**
     * Raised when there are multiple possible resolutions of an entity.
     */
    static readonly chooseEntity = 'chooseEntity';

    /**
     * Raised when an entity should be assigned to a property.
     */
    static readonly assignEntity = 'assignEntity';
}
