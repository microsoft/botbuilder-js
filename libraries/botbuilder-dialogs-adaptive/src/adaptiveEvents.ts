/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogEvents } from 'botbuilder-dialogs'

export class AdaptiveEvents extends DialogEvents {
    /**
     * Raised when utterance is received.
     */
    public static readonly recognizeUtterance = 'recognizeUtterance';

    /**
     * Raised when intent is recognized from utterance.
     */
    public static readonly recognizedIntent = 'recognizedIntent';

    /**
     * Raised when no intent can be recognized from utterance.
     */
    public static readonly unknownIntent = 'unknownIntent';

    /**
     * Raised when all actions and ambiguity events have been finished.
     */
    public static readonly endOfActions = 'endOfActions';

    /**
     * aised when there are multiple possible entity to property mappings.
     */
    public static readonly chooseProperty = 'chooseProperty';

    /**
     * Raised when there are multiple possible resolutions of an entity.
     */
    public static readonly chooseEntity = 'chooseEntity';

    /**
     * Raised when an entity should be assigned to a property.
     */
    public static readonly assignEntity = 'assignEntity';
}