/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, EndOfConversationCodes, ConversationReference, getConversationReference } from './activity';
import { Bot } from './bot';
import { Intent } from './intentRecognizer';
import { EntityObject } from './entityObject';
import { RegExpRecognizer } from './regExpRecognizer';
import { TemplateManager } from './templateManager';

/**
 * Creates a new BotContext instance.
 *
 * @param bot Bot the context is for.
 * @param request (Optional) request to initialize the context with.
 */
export function createBotContext(bot: Bot, request?: Activity): BotContext {
    const context = <BotContext>{};
    context.bot = bot;
    context.request = request || {};
    context.responses = [];
    context.conversationReference = {};
    context.state = {};
    (<any>context).templateEngines = [];

    // Populate conversation reference
    if (request) {
        context.conversationReference = getConversationReference(request);
    }

    // Add methods
    // !!!!!!! Be sure to use "this." when accessing members of the context object because
    // !!!!!!! you could be working with a clone.
    function throwIfDisposed(method: string) {
        if (disposed) {
            throw new Error(`BotContext.${method}(): error calling method after context has been disposed.`)
        }
    }
    let disposed = false;

    context.delay = function delay(duration: number) {
        throwIfDisposed('delay');
        this.responses.push({ type: 'delay', value: duration });
        return this;
    };

    context.dispose = function dispose() {
        disposed = true;
    };

    context.endOfConversation = function endOfConversation(code?: string) {
        throwIfDisposed('endOfConversation');
        const activity: Partial<Activity> = {
            type: ActivityTypes.endOfConversation,
            code: code || EndOfConversationCodes.completedSuccessfully
        };
        this.responses.push(activity);
        return this;
    };

    context.reply = function reply(textOrActivity: string | Partial<Activity>, speak?: string | Partial<Activity>, additional?: Partial<Activity>) {
        throwIfDisposed('reply');
        // Check other parameters
        if (!additional && typeof speak === 'object') {
            additional = <Partial<Activity>>speak;
            speak = undefined;
        }

        if (typeof textOrActivity === 'object') {
            if (!(textOrActivity as Activity).type) { textOrActivity.type = ActivityTypes.message; }
            this.responses.push(textOrActivity);
        } else {
            const activity: Partial<Activity> = Object.assign(<Partial<Activity>>{
                type: ActivityTypes.message,
                text: textOrActivity || '',
            }, additional || {});
            if (typeof speak === 'string') {
                activity.speak = speak;
            }
            this.responses.push(activity);
        }
        return this;
    };

    context.replyWith = function replyWith(templateId: string, data: object): BotContext {
        throwIfDisposed('replyTemplate');

        // push internal template record
        const activity: Partial<Activity> = <Partial<Activity>>{
            type: "template",
        };
        activity.text = templateId;
        activity.value = data;
        this.responses.push(activity);
        return this;
    }

    let responded = false;
    context.flushResponses = function flushResponses() {
        throwIfDisposed('flushResponses');

        const args: any[] = this.responses.slice(0);
        const cnt = args.length;
        args.unshift(this);
        return Bot.prototype.post.apply(this.bot, args)
            .then((results: ConversationReference[]) => {
                if (cnt > 0) { 
                    this.responses.splice(0, cnt);
                    responded = true; 
                }
                return results;
            });
    };

    context.showTyping = function showTyping() {
        throwIfDisposed('showTyping');
        this.responses.push({ type: ActivityTypes.typing });
        return this;
    };

    Object.defineProperty(context, 'responded', {
        get: function () {
            return (this as BotContext).responses.length > 0 || responded; 
        }
    });

    return context;
}
