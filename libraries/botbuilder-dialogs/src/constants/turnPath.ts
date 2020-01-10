/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class TurnPath {
    public static readonly LASTRESULT = 'turn.lastresult';

    public static readonly ACTIVITY = 'turn.activity';

    public static readonly RECOGNIZED = 'turn.recognized';

    public static readonly TOPINTENT = 'turn.recognized.intent';

    public static readonly TOPSCORE = 'turn.recognized.score';

    public static readonly TEXT = 'turn.recognized.text';

    public static readonly UNRECOGNIZEDTEXT = 'turn.unrecognizedText';

    public static readonly RECOGNIZEDENTITIES = 'turn.recognizedEntities';

    public static readonly INTERRUPTED = 'turn.interrupted';

    public static readonly DIALOGEVENT = 'turn.dialogEvent';

    public static readonly REPEATEDIDS = 'turn.repeatedIds';

    public static readonly ACTIVITYPROCESSED = 'turn.activityProcessed';
}