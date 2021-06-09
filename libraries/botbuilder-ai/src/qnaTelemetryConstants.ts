// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

/**
 * The BotTelemetryClient event, property and metric names that logged by default.
 */
export class QnATelemetryConstants {
    static readonly qnaMessageEvent: string = 'QnaMessage'; // Event name
    static readonly knowledgeBaseIdProperty: string = 'knowledgeBaseId';
    static readonly answerProperty: string = 'answer';
    static readonly articleFoundProperty: string = 'articleFound';
    static readonly channelIdProperty: string = 'channelId';
    static readonly conversationIdProperty: string = 'conversationId';
    static readonly questionProperty: string = 'question';
    static readonly matchedQuestionProperty: string = 'matchedQuestion';
    static readonly questionIdProperty: string = 'questionId';
    static readonly scoreMetric: string = 'score';
    static readonly usernameProperty: string = 'username';
}
