/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

export * from './attachmentRecognizer';
export * from './bot';
export * from './botService';
export * from './botStateManager';
export * from './browserStorage';
export * from './cardStyler';
export * from './activityAdapter';
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
export * from 'botbuilder-schema';
export * from './recognizerResult';
export * from './recognizer';

import { Bot } from './bot';
import { Activity, ConversationReference, ResourceResponse } from 'botframework-schema';
import { Intent } from './intentRecognizer';
import { EntityObject } from './entityObject';
import { StoreItem, Storage } from './storage';
import { TemplateRenderer, TemplateManager } from './templateManager';

declare global {
    /**
     * Context object for the current turn of a conversation with a user.
     */
    export interface BotContext {
        /** The Bot object for this context. */
        bot: Bot;

        /** The received activity. */
        request: Partial<Activity>;

        /** Queue of responses to send to the user. */
        responses: Partial<Activity>[];

        /** If true at least one response has been sent for the current turn of conversation. */
        readonly responded: boolean;

        /** The calculated conversation reference for this request. */
        conversationReference: Partial<ConversationReference>;

        /** 
         * Persisted state related to the request.
         */
        state: BotState;

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
        templateManager : TemplateManager; 

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
         *                    .flushResponses()
         *                    .then(() => runQuery(query))
         *                    .then((results) => resultsAsActivity(results))
         *                    .then((activity) => {
         *                        context.reply(`Here's what I found...`)
         *                               .reply(activity);
         *                    });
         * }
         * ```
         */
        flushResponses(): Promise<ResourceResponse[]>;

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
    export interface BotState {
        /** Key/value pairs. */
        [key: string]: any;

        /** Persisted state for the current conversation. */
        conversation?: ConversationState;

        /** Persisted state for the current user. */
        user?: UserState;

        /** Used by storage middleware to track hashes of objects that have been read from storage.  */
        writeOptimizer?: { [key: string]: string; };
    }

    /** Persisted state for the current user. */
    export interface UserState extends StoreItem {
    }

    /** Persisted state for the current conversation. */
    export interface ConversationState extends StoreItem {
    }

    /** Well known entity types. */
    export interface EntityTypes {
        attachment: string;
        string: string;
        number: string;
        boolean: string;
    }
}
