/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class TurnPath {
    /**
     * The result from the last dialog that was called.
     */
    public static readonly LASTRESULT = 'turn.lastresult';

    /**
     * The current activity for the turn.
     */
    public static readonly ACTIVITY = 'turn.activity';

    /**
     * The recognized result for the current turn.
     */
    public static readonly RECOGNIZED = 'turn.recognized';

    /**
     * Path to the top intent.
     */
    public static readonly TOPINTENT = 'turn.recognized.intent';

    /**
     * Path to the top score.
     */
    public static readonly TOPSCORE = 'turn.recognized.score';

    /**
     * Original text.
     */
    public static readonly TEXT = 'turn.recognized.text';

    /**
     * Original utterance split into unrecognized strings.
     */
    public static readonly UNRECOGNIZEDTEXT = 'turn.unrecognizedText';

    /**
     * Entities that were recognized from text.
     */
    public static readonly RECOGNIZEDENTITIES = 'turn.recognizedEntities';

    /**
     * If true an interruption has occured.
     */
    public static readonly INTERRUPTED = 'turn.interrupted';

    /**
     * The current dialog event (set during event processing.)
     */
    public static readonly DIALOGEVENT = 'turn.dialogEvent';

    /**
     * Used to track that we don't end up in infinite loop of RepeatDialogs().
     */
    public static readonly REPEATEDIDS = 'turn.repeatedIds';

    /**
     * This is a bool which if set means that the `TurnContext.activity` has been consumed by some component in the system.
     */
    public static readonly ACTIVITYPROCESSED = 'turn.activityProcessed';
}