/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from './middleware';
/**
 * Middleware that simplifies adding a new service to the BotContext. Services expose themselves
 * as a new property of the BotContext and this class formalizes that process.
 *
 * This class is typically derived from but can also be used like
 * `bot.use(new BotService('myService', new MyService()));`. The registered service would be
 * accessible globally by developers through `context.myService`.
 *
 * __Extends BotContext:__
 * * context.<service name> - New service
 */
export declare class BotService<T> implements Middleware {
    protected name: string;
    protected instance: T;
    /**
     * Creates a new instance of a service definition.
     *
     * @param name Name of the service being registered. This is the property off the context object
     * that will be used by developers to access the service.
     * @param instance (Optional) singleton instance of the service to add to the context object.
     * Dynamic instances can be added by implementing [getService()](#getservice).
     */
    constructor(name: string, instance?: T);
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    /**
     * Overrided by derived classes to register a dynamic instance of the service.
     *
     * @param context Context for the current turn of the conversation.
     */
    protected getService(context: BotContext): T;
}
