/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext } from 'botbuilder';
/**
 * Settings used to configure an instance of `LocaleConverter`.
 */
export interface LocaleConverterSettings {
    /** Target locale to convert to. */
    toLocale: string;
    /** (Optional) locale to convert from. */
    fromLocale?: string;
    /**
     * (Optional) handler that will be called to get the locale for the current turn.
     */
    getUserLocale?: (context: TurnContext) => string;
    /**
     * (Optional) handler that will be called to determine if the locale has changed for the
     * current turn.
     */
    setUserLocale?: (context: TurnContext) => Promise<boolean>;
}
/**
 * Middleware used to convert locale specific entities, like dates and times, from one locale
 * to another.
 *
 * @remarks
 * When added to the bot adapters middleware pipeline it will attempt to recognize entities in
 * incoming message activities and then automatically convert those entities to the target locale.
 */
export declare class LocaleConverter implements Middleware {
    private localeConverter;
    private fromLocale;
    private toLocale;
    private getUserLocale;
    private setUserLocale;
    /**
     * Creates a new LocaleConverter instance.
     * @param settings
     */
    constructor(settings: LocaleConverterSettings);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    private convertLocalesAsync(context);
    getAvailableLocales(): Promise<string[]>;
}
