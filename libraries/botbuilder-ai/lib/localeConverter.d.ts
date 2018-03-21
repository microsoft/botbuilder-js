/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from 'botbuilder';
/**
 * The LocaleConverter converts all locales in a message to a given locale.
 */
export declare class LocaleConverter implements Middleware {
    private localeConverter;
    private fromLocale;
    private toLocale;
    private getUserLocale;
    private setUserLocale;
    constructor(toLocale: string, fromLocale: string);
    constructor(toLocale: string, getUserLocale: (context: BotContext) => string, setUserLocale: (context: BotContext) => Promise<boolean>);
    receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void>;
    private convertLocalesAsync(context);
}
