/**
 * @module botbuilder-ai
 */

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

/**
 * The BotTelemetryClient event and property names that logged by default.
 */
export class LuisTelemetryConstants {
    static readonly luisResultEvent = 'LuisResult'; // Event name
    static readonly applicationIdProperty = 'applicationId';
    static readonly intentProperty = 'intent';
    static readonly intentScoreProperty = 'intentScore';
    static readonly intent2Property = 'intent2';
    static readonly intentScore2Property = 'intentScore2';
    static readonly entitiesProperty = 'entities';
    static readonly questionProperty = 'question';
    static readonly activityIdProperty = 'activityId';
    static readonly sentimentLabelProperty = 'sentimentLabel';
    static readonly sentimentScoreProperty = 'sentimentScore';
    static readonly fromIdProperty = 'fromId';
}
