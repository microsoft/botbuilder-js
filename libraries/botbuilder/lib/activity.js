"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function getConversationReference(activity) {
    return {
        activityId: activity.id,
        user: activity.from,
        bot: activity.recipient,
        conversation: activity.conversation,
        channelId: activity.channelId,
        serviceUrl: activity.serviceUrl
    };
}
exports.getConversationReference = getConversationReference;
function applyConversationReference(activity, reference) {
    activity.channelId = reference.channelId;
    activity.serviceUrl = reference.serviceUrl;
    activity.conversation = reference.conversation;
    activity.from = reference.bot;
    activity.recipient = reference.user;
    activity.replyToId = reference.activityId;
}
exports.applyConversationReference = applyConversationReference;
//# sourceMappingURL=activity.js.map