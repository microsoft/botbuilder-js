/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines path for avaiable turns.
 */
export class TurnPath {
    /// The result from the last dialog that was called.
    public static readonly lastResult = 'turn.lastresult';

    /// The current activity for the turn.
    public static readonly activity = 'turn.activity';

    /// The recognized result for the current turn.
    public static readonly recognized = 'turn.recognized';

    /// Path to the top intent.
    public static readonly topIntent = 'turn.recognized.intent';

    /// Path to the top score.
    public static readonly topScore = 'turn.recognized.score';

    /// Original text.
    public static readonly text = 'turn.recognized.text';

    /// Original utterance split into unrecognized strings.
    public static readonly unrecognizedText = 'turn.unrecognizedText';

    /// Entities that were recognized from text.
    public static readonly recognizedEntities = 'turn.recognizedEntities';

    /// If true an interruption has occured.
    public static readonly interrupted = 'turn.interrupted';

    /// The current dialog event (set during event processings).
    public static readonly dialogEvent = 'turn.dialogEvent';

    /// Used to track that we don't end up in infinite loop of RepeatDialogs().
    public static readonly repeatedIds = 'turn.repeatedIds';

    /// This is a bool which if set means that the turncontext.activity has been consumed by some component in the system.
    public static readonly activityProcessed = 'turn.activityProcessed';
}
