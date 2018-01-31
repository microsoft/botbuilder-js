/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export * from './activity';
export * from './attachmentRecognizer';
export * from './bot';
export * from './botService';
export * from './botStateManager';
export * from './browserStorage';
export * from './cardStyler';
export * from './activityAdapter';
export * from './consoleLogger';
export * from './entityObject';
export * from './intentRecognizer';
export * from './intentRecognizerSet';
export * from './jsonTemplates';
export * from './middleware';
export * from './memoryStorage';
export * from './messageStyler';
export * from './middleware';
export * from './middlewareSet';
export * from './regExpRecognizer';
export * from './search';
export * from './storage';
export * from './storageMiddleware';
export * from './templateManager';
export * from './dictionaryRenderer';
export * from './testAdapter';
import { Bot } from './bot';
import { Activity, ConversationReference, ConversationResourceResponse } from './activity';
import { Intent } from './intentRecognizer';
import { EntityObject } from './entityObject';
import { StoreItem, Storage } from './storage';
import { TemplateManager } from './templateManager';
declare global  {
    /**
     * Context object for the current turn of a conversation with a user.
     */
    interface BotContext {
        /** The Bot object for this context. */
        bot: Bot;
        /** The received activity. */
        request: Activity;
        /** Queue of responses to send to the user. */
        responses: Partial<Activity>[];
        /** If true at least one response has been sent for the current turn of conversation. */
        readonly responded: boolean;
        /** The calculated conversation reference for this request. */
        conversationReference: ConversationReference;
        /**
         * Persisted state related to the request.
         */
        state: BotState;
        /**
         *  Logger to trace messages and telemetry data.
         */
        logger: BotLogger;
        /**
         * (Optional) storage service for storing JSON based object.
         */
        storage?: Storage;
        /**
         * (Optional) a named "intent" object representing the current best understanding of what
         * the user is attempting to do. This can be populated by either an `IntentRecognizer` or
         * a `Router` like `ifRegExp()`.
         */
        topIntent?: Intent;
        /**
         * tempalmtemanager for registering template engines
         */
        templateManager: TemplateManager;
        /**
         * Starts a prompt or other type of dialog.
         *
         * **Usage Example**
         *
         * ```js
         * context.prompt(namePrompt.reply(`Hi. What's your name?`));
         * ```
         *
         * @param promptOrDialog An instance of a prompt or dialog to start.
         */
        begin(promptOrDialog: BeginDialog): Promise<any> | any;
        /**
         * Returns a clone that's a shallow copy of the context object.
         */
        clone(): this;
        /**
         * Queues a new "delay" activity to the [responses](#responses) array. This will
         * cause a pause to occur before delivering additional queued responses to the user.
         *
         * If your bot send a message with images and then immediately sends a message without
         * images, you run the risk of the client displaying your messages out of order. The
         * reason being that most clients want to copy the images you sent to a CDN for faster
         * rendering in the future.
         *
         * You can often avoid out of order messages by inserting a delay between the message
         * with images and the one without.
         *
         * **Usage Example**
         *
         * ```js
         * context.reply(hotelsFound)
         *        .delay(2000)
         *        .reply(`Would you like to see more results?`);
         * ```
         *
         * @param duration Number of milliseconds to pause.
         */
        delay(duration: number): this;
        /**
         * INTERNAL disposes of the context object, making it unusable. Calling any methods off a
         * disposed context will result in an exception being thrown;
         */
        dispose(): void;
        /**
         * Queues a new "endOfConversation" activity that will be sent to the channel. This
         * is often used by skill based channels to signal that the skill is finished.
         *
         * **Usage Example**
         *
         * ```js
         * context.reply(weatherForecast)
         *        .endOfConversation();
         * ```
         *
         * @param duration Number of milliseconds to pause.
         * @param code (Optional) code indicating the reason why the conversation is being ended.
         * The default value is `EndOfConversationCodes.completedSuccessfully`.
         */
        endOfConversation(code?: string): this;
        /**
         * Finds all entities of a given type on the [topIntent](#topintent).
         *
         * **Usage Example**
         *
         * ```js
         * function sendMessage(context) {
         *      const text = context.getEntity('text');
         *      const recipients = context.findEntities('recipient') || [];
         *      recipients.forEach((entity) => {
         *          name = entity.value;
         *          // ... send text to recipient ...
         *      });
         * }
         * ```
         *
         * @param intent (Optional) intent that should be searched over. This will override the use
         * of `topIntent`.
         * @param type The type of entities to return. If this is a RegExp, then any type matching
         * the specified pattern will be returned.
         */
        findEntities<T = any>(intent: Intent, type: string | RegExp): EntityObject<T>[];
        findEntities<T = any>(type: string | RegExp): EntityObject<T>[];
        /**
         * Returns the value of an individual entity of a specified type.
         *
         * **Usage Example**
         *
         * ```js
         * const helpIntent = context.ifRegExp(/help .*with (.*)/i, ['topic']);
         *
         * if (helpIntent) {
         *      const topic = context.getEntity(helpIntent, 'topic');
         *      // ... return help for topic ...
         * }
         * ```
         *
         * @param intent (Optional) intent that should be searched over. This will override the use
         * of `topIntent`.
         * @param type The type of entity to return. If this is a RegExp, then any type matching
         * the specified pattern will be returned.
         * @param occurrence (Optional) a zero based index of the entity to return when there are
         * multiple occurrences of  same entity type. The default value is `0` meaning the first
         * occurrence will be returned.
         */
        getEntity<T = any>(intent: Intent, type: string | RegExp, occurrence?: number): T | undefined;
        getEntity<T = any>(type: string | RegExp, occurrence?: number): T | undefined;
        /**
         * Returns `true` if the context has a [topIntent](#topintent) that matches the specified filter.
         * @param filter The name of the intent or a regular expression to match against the intent.
         */
        ifIntent(filter: string | RegExp): boolean;
        /**
         * Returns `true` in the specified expression matches the users utterance.
         * @param filter The expression to match against the users utterance.
         */
        ifRegExp(filter: RegExp): boolean;
        /**
         * Queues a new "message" or activity to the [responses](#responses) array.
         *
         * **Usage Example**
         *
         * ```js
         * context.reply(`Let's flip a coin. Would you like heads or tails?`, `heads or tails?`);
         * ```
         *
         * @param textOrActivity Text of a message or an activity object to send to the user.
         * @param speak (Optional) SSML that should be spoken to the user on channels that support speech.
         * @param additional (Optional) other activities fields, like attachments, that should be sent with the activity.
         */
        reply(textOrActivity: string, speak: string, additional?: Partial<Activity>): this;
        reply(textOrActivity: string, additional?: Partial<Activity>): this;
        reply(textOrActivity: Partial<Activity>): this;
        /**
         * Queues a new "message" or activity to the [responses](#responses) array using the specified template.
         *
         * **Usage Example**
         *
         * ```js
         * context.replyWith('greeting', { name:'joe'});
         * ```
         *
         * @param templateId id of template to bind to (using language of the current user)
         * @param data  data object to bind to
         */
        replyWith(id: string, data: any): this;
        /**
         * Sends any queued up responses to the user.
         * **Usage Example**
         *
         * ```js
         * function search(context) {
         *      const query = context.request.text;
         *      return context.reply(`Please wait while I find that...`)
         *                    .showTyping()
         *                    .sendResponses()
         *                    .then(() => runQuery(query))
         *                    .then((results) => resultsAsActivity(results))
         *                    .then((activity) => {
         *                        context.reply(`Here's what I found...`)
         *                               .reply(activity);
         *                    });
         * }
         * ```
         */
        sendResponses(): Promise<ConversationResourceResponse[]>;
        /**
         * Queues a new "typing" activity to the [responses](#responses) array. On supported
         * channels this will display a typing indicator which can be used to convey to the
         * user that activity is occurring within the bot. This indicator is typically only
         * displayed to the user for 3 - 5 seconds so the bot should periodically send additional
         * "typing" activities for longer running operations.
         *
         * **Usage Example**
         *
         * ```js
         * context.showTyping(1000)
         *        .reply(`It was a dark and stormy night.`);
         * ```
         */
        showTyping(): this;
    }
    /** State for the bot relative to the current request. */
    interface BotState {
        /** Key/value pairs. */
        [key: string]: any;
        /** Persisted state for the current conversation. */
        conversation?: ConversationState;
        /** Persisted state for the current user. */
        user?: UserState;
        /** Used by storage middleware to track hashes of objects that have been read from storage.  */
        writeOptimizer?: {
            [key: string]: string;
        };
    }
    /** Persisted state for the current user. */
    interface UserState extends StoreItem {
    }
    /** Persisted state for the current conversation. */
    interface ConversationState extends StoreItem {
    }
    /** Extensible logging interface. */
    interface BotLogger {
        flush(): Promise<void>;
        logRequest(name: string, startTime: Date, duration: number, responseCode: string, success: boolean): void;
        startRequest(name: string, startTime?: Date): BotLoggerOperation;
        logDependency(dependencyName: string, commandName: string, startTime: Date, duration: number, success: boolean, dependencyTypeName?: string, target?: string, data?: string, resultCode?: string): void;
        startDependency(dependencyName: string, commandName: string, startTime: Date, dependencyTypeName?: string, target?: string, data?: string): BotLoggerOperation;
        logAvailability(name: string, timeStamp: Date, duration: number, runLocation: string, success: boolean, message?: string, properties?: {
            [key: string]: string;
        }, metrics?: {
            [key: string]: number;
        }): void;
        logEvent(eventName: string, properties?: {
            [key: string]: string;
        }, metrics?: {
            [key: string]: number;
        }): void;
        logException(exception: Error, message?: string, properties?: {
            [key: string]: string;
        }, metrics?: {
            [key: string]: number;
        }): void;
        logMetric(name: string, value: number, properties?: {
            [key: string]: string;
        }): void;
        log(message: string, traceLevel?: TraceLevel, properties?: {
            [key: string]: string;
        }): void;
    }
    interface BotLoggerOperation {
        stop(resultCode: string, success: boolean): void;
    }
    /** Logging trace levels. */
    enum TraceLevel {
        /** Debug only information. */
        debug,
        /** Generic log message. */
        log,
        /** More verbose than log. */
        information,
        /** A warning condition. */
        warning,
        /** An error occurred, but it is recoverable. */
        error,
        /** A critical, non-recoverable error. */
        critical,
    }
    /** Well known entity types. */
    interface EntityTypes {
        attachment: string;
        string: string;
        number: string;
        boolean: string;
    }
    /** Implemented by objects, like prompts, that can be started using `context.begin()`. */
    interface BeginDialog {
        /**
         * Function that will be called to start the object.
         *
         * @param context Context for the current turn of conversation.
         */
        begin(context: BotContext): Promise<any> | any;
    }
}
