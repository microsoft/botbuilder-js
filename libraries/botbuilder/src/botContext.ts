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

    // Generate null logger
    context.logger = <BotLogger>{};
    context.logger.flush = () => {
        return new Promise<void>((resolve) => {
            resolve();
        });
    };

    ['logRequest', 'startRequest', 'logDependency', 'startDependency', 'logAvailability',
        'logEvent', 'logException', 'logException', 'logMetric', 'log'].forEach((method) => {
            (<any>context.logger)[method] = () => { };
        });

    // Add methods
    // !!!!!!! Be sure to use "this." when accessing members of the context object because
    // !!!!!!! you could be working with a clone.
    function throwIfDisposed(method: string) {
        if (disposed) {
            throw new Error(`BotContext.${method}(): error calling method after context has been disposed.`)
        }
    }
    let disposed = false;


    context.begin = function begin(dialog: BeginDialog) {
        throwIfDisposed('begin');
        return dialog.begin(this);
    };

    context.clone = function clone() {
        throwIfDisposed('clone');
        const clone = Object.assign({}, this);
        if (clone.state) {
            clone.state = Object.assign({}, clone.state);
        }
        return clone;
    };

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

    context.findEntities = function findEntities<T>(intent: Intent | string | RegExp | undefined, type?: string | RegExp) {
        throwIfDisposed('findEntities');
        if (!type && (typeof intent !== 'object' || !intent.hasOwnProperty('name'))) {
            type = <string | RegExp>intent;
            intent = undefined;
        }

        // Find entities to search over
        let entities: EntityObject<T>[] = this.request.entities as EntityObject<any>[] || [];
        const topIntent = <Intent>intent || this.topIntent;
        if (topIntent && topIntent.entities) { entities = entities.concat(topIntent.entities) }

        // Search over entities
        const matched: EntityObject<T>[] = [];
        if (type) {
            entities.forEach((entity) => {
                let matches = typeof type === 'string' ? (entity.type === type) : (type as RegExp).test(entity.type);
                if (matches) {
                    matched.push(entity);
                }
            });
        }
        return matched;
    };

    context.getEntity = function getEntity(intent: Intent | string | RegExp | undefined, type?: string | RegExp | number, occurrence?: number) {
        throwIfDisposed('getEntity');
        if (!occurrence && (typeof intent !== 'object' || !intent.hasOwnProperty('name'))) {
            occurrence = <number>type;
            type = <string | RegExp>intent;
            intent = undefined;
        }
        if (typeof occurrence !== 'number') { occurrence = 0 }
        const entities = this.findEntities(<Intent>intent, <string | RegExp>type);
        if (occurrence < entities.length) {
            const entity = entities[occurrence];
            return entity.hasOwnProperty('value') ? entity.value : entity
        }
        return undefined;
    };

    context.ifIntent = function ifIntent(filter: string | RegExp) {
        if (this.topIntent) {
            return typeof filter === 'string' ? this.topIntent.name === filter : filter.test(this.topIntent.name);
        }
        return false;
    }

    context.ifRegExp = function ifRegExp(filter: RegExp) {
        const utterance = (this.request.text || '').trim();
        return filter.test(utterance);
    }

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
    context.sendResponses = function sendResponses() {
        throwIfDisposed('sendResponses');

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
