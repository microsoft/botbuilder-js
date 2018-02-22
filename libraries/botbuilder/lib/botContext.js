"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botframework_schema_1 = require("botframework-schema");
const bot_1 = require("./bot");
/**
 * Creates a new BotContext instance.
 *
 * @param bot Bot the context is for.
 * @param request (Optional) request to initialize the context with.
 */
function createBotContext(bot, request) {
    const context = {};
    context.bot = bot;
    context.request = request || {};
    context.responses = [];
    context.conversationReference = {};
    context.state = {};
    context.templateEngines = [];
    // Populate conversation reference
    if (request) {
        context.conversationReference = getConversationReference(request);
    }
    // Add methods
    // !!!!!!! Be sure to use "this." when accessing members of the context object because
    // !!!!!!! you could be working with a clone.
    function throwIfDisposed(method) {
        if (disposed) {
            throw new Error(`BotContext.${method}(): error calling method after context has been disposed.`);
        }
    }
    let disposed = false;
    context.delay = function delay(duration) {
        throwIfDisposed('delay');
        this.responses.push({ type: 'delay', value: duration });
        return this;
    };
    context.dispose = function dispose() {
        disposed = true;
    };
    context.endOfConversation = function endOfConversation(code) {
        throwIfDisposed('endOfConversation');
        const activity = {
            type: botframework_schema_1.ActivityTypes.EndOfConversation,
            code: code || botframework_schema_1.EndOfConversationCodes.CompletedSuccessfully
        };
        this.responses.push(activity);
        return this;
    };
    context.reply = function reply(textOrActivity, speak, additional) {
        throwIfDisposed('reply');
        // Check other parameters
        if (!additional && typeof speak === 'object') {
            additional = speak;
            speak = undefined;
        }
        if (typeof textOrActivity === 'object') {
            if (!textOrActivity.type) {
                textOrActivity.type = botframework_schema_1.ActivityTypes.Message;
            }
            this.responses.push(textOrActivity);
        }
        else {
            const activity = Object.assign({
                type: botframework_schema_1.ActivityTypes.Message,
                text: textOrActivity || '',
            }, additional || {});
            if (typeof speak === 'string') {
                activity.speak = speak;
            }
            this.responses.push(activity);
        }
        return this;
    };
    context.replyWith = function replyWith(templateId, data) {
        throwIfDisposed('replyTemplate');
        // push internal template record
        const activity = {
            type: "template",
        };
        activity.text = templateId;
        activity.value = data;
        this.responses.push(activity);
        return this;
    };
    let responded = false;
    context.flushResponses = function flushResponses() {
        throwIfDisposed('flushResponses');
        const args = this.responses.slice(0);
        const cnt = args.length;
        args.unshift(this);
        return bot_1.Bot.prototype.post.apply(this.bot, args)
            .then((results) => {
            if (cnt > 0) {
                this.responses.splice(0, cnt);
                responded = true;
            }
            return results;
        });
    };
    context.showTyping = function showTyping() {
        throwIfDisposed('showTyping');
        this.responses.push({ type: botframework_schema_1.ActivityTypes.Typing });
        return this;
    };
    Object.defineProperty(context, 'responded', {
        get: function () {
            return this.responses.length > 0 || responded;
        }
    });
    return context;
}
exports.createBotContext = createBotContext;
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
//# sourceMappingURL=botContext.js.map