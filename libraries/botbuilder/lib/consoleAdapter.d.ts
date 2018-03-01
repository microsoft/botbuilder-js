/// <reference types="node" />
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, BotContext, Activity, ResourceResponse, Promiseable, ConversationReference } from 'botbuilder-core';
import * as readline from 'readline';
/**
 * Lets a user communicate with a bot from a console window.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder | no |
 */
export declare class ConsoleAdapter extends BotAdapter {
    private nextId;
    private readonly reference;
    constructor(reference?: ConversationReference);
    /**
     * Begins listening to console input.
     * @param logic Function which will be called each time a message is input by the user.
     */
    listen(logic: (context: BotContext) => Promiseable<void>): Function;
    sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(activity: Partial<Activity>): Promise<void>;
    deleteActivity(reference: Partial<ConversationReference>): Promise<void>;
    protected createInterface(options: readline.ReadLineOptions): readline.ReadLine;
}
