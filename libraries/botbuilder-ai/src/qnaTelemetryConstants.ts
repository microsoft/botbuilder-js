// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

/**
 * The BotTelemetryClient event, property and metric names that logged by default.
 */
export class QnATelemetryConstants {
    public static readonly qnaMessageEvent: string = 'QnaMessage'; // Event name
    public static readonly knowledgeBaseIdProperty: string = 'knowledgeBaseId';
    public static readonly answerProperty: string = 'answer';
    public static readonly articleFoundProperty: string = 'articleFound';
    public static readonly channelIdProperty: string = 'channelId';
    public static readonly conversationIdProperty: string = 'conversationId';
    public static readonly questionProperty: string = 'question';
    public static readonly matchedQuestionProperty: string = 'matchedQuestion';
    public static readonly questionIdProperty: string = 'questionId';
    public static readonly scoreMetric: string = 'score';
    public static readonly usernameProperty: string = 'username';
}