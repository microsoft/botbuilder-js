// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

/**
 * The BotTelemetryClient event and property names that logged by default.
 */
export class LuisTelemetryConstants {
    public static readonly luisResultEvent: string = 'LuisResult'; // Event name
    public static readonly applicationIdProperty: string = 'applicationId';
    public static readonly intentProperty: string = 'intent';
    public static readonly intentScoreProperty: string = 'intentScore';
    public static readonly entitiesProperty: string = 'entities';
    public static readonly questionProperty: string = 'question';
    public static readonly activityIdProperty: string = 'activityId';
    public static readonly sentimentLabelProperty: string = 'sentimentLabel';
    public static readonly sentimentScoreProperty: string = 'sentimentScore';
    public static readonly fromIdProperty: string = 'fromId';
}