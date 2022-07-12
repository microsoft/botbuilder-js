/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines constants that can be used in the processing of speech interactions.
 */
export class SpeechConstants {
    /**
     * The xml tag structure to indicate an empty speak tag, to be used in the 'speak' property of an Activity. When set this indicates to the channel that speech should not be generated.
     */
    static readonly EmptySpeakTag: string =
        '<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US" />';
}
