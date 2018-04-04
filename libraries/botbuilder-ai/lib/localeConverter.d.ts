/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
export interface LocaleConverterSettings {
    toLocale: string;
    fromLocale?: string;
    getUserLocale?: (context: TurnContext) => string;
    setUserLocale?: (context: TurnContext) => Promise<boolean>;
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
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private convertLocalesAsync(context);
    getAvailableLocales(): Promise<string[]>;
}
