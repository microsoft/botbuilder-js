/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, BotContext } from 'botbuilder';
export interface LocaleConverterSettings {
    toLocale: string;
    fromLocale?: string;
    getUserLocale?: (context: BotContext) => string;
    setUserLocale?: (context: BotContext) => Promise<boolean>;
}
/**
 * The LocaleConverter converts all locales in a message to a given locale.
 */
export declare class LocaleConverter implements Middleware {
    private localeConverter;
    private fromLocale;
    private toLocale;
    private getUserLocale;
    private setUserLocale;
    constructor(settings: LocaleConverterSettings);
    onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void>;
    private convertLocalesAsync(context);
}
