/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ModelResult } from '@microsoft/recognizers-text';
import * as DateTimeRecognizers from '@microsoft/recognizers-text-date-time';
import { Activity, ActivityTypes, Middleware, TurnContext } from 'botbuilder';
import * as moment from 'moment';

/**
 * Settings used to configure an instance of `LocaleConverter`.
 */
export interface LocaleConverterSettings {
    // Target locale to convert to.
    toLocale: string;

    // (Optional) locale to convert from.
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
export class LocaleConverter implements Middleware {
    private localeConverter: ILocaleConverter;
    private fromLocale: string | undefined;
    private toLocale: string;
    private getUserLocale: ((context: TurnContext) => string) | undefined;
    private setUserLocale: ((context: TurnContext) => Promise<boolean>) | undefined;

    /**
     * Creates a new LocaleConverter instance.
     * @param settings
     */
    constructor(settings: LocaleConverterSettings) {
        this.localeConverter = new MicrosoftLocaleConverter();
        this.toLocale = settings.toLocale;
        this.fromLocale = settings.fromLocale;
        this.getUserLocale = settings.getUserLocale;
        this.setUserLocale = settings.setUserLocale;
    }

    /// Incoming activity
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type !== ActivityTypes.Message) {
            return next();
        }

        if (this.setUserLocale !== undefined) {
            const changedLocale: boolean = await this.setUserLocale(context);
            if (changedLocale) {
                return Promise.resolve();
            }
        }

        return this.convertLocalesAsync(context)
        .then(next);
    }

    public getAvailableLocales(): Promise<string[]> {
        return this.localeConverter.getAvailableLocales()
        .then((result: string[]) => Promise.resolve(result));
    }

    private async convertLocalesAsync(context: TurnContext): Promise<void> {
        const message: Activity = context.activity;
        let fromLocale: string;
        if (this.fromLocale !== undefined) {
            fromLocale = this.fromLocale;
        } else if (this.getUserLocale !== undefined) {
            fromLocale = this.getUserLocale(context);
        } else {
            fromLocale = 'en-us';
        }

        return this.localeConverter.convert(message.text, fromLocale, this.toLocale)
        .then((result: string) => {
            message.text = result;

            return Promise.resolve();
        });
    }

}

/**
 * @private
 */
interface ILocaleConverter {

    isLocaleAvailable(locale: string): boolean;

    convert(message: string, fromLocale: string, toLocale: string): Promise<string>;

    getAvailableLocales(): Promise<string[]>;
}

/**
 * @private
 */
class MicrosoftLocaleConverter implements ILocaleConverter {

    private mapLocaleToFunction: { [id: string] : DateAndTimeLocaleFormat } = {};

    constructor() {
        this.initLocales();
    }

    public isLocaleAvailable(locale: string): boolean {
        return this.mapLocaleToFunction[locale] !== undefined;
    }

    public getAvailableLocales(): Promise<string[]> {
        return Promise.resolve(Object.keys(this.mapLocaleToFunction));
    }

    public convert(message: string, fromLocale: string, toLocale: string): Promise<string> {

        if (!this.isLocaleAvailable(toLocale)) {
           return Promise.reject(`Unsupported to locale ${toLocale}`);
        }

        try {
            const dates: TextAndDateTime[] = this.extractDates(message, fromLocale);
            let processedMessage: string = message;
            dates.forEach((date: TextAndDateTime) => {
                if (date.range) {
                    if (date.type === 'time') {
                        const convertedStartDate: string = this.formatTime(date.dateTimeObj, toLocale);
                        const convertedEndDate: string = this.formatTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    } else if (date.type === 'date') {
                        const convertedStartDate: string = this.formatDate(date.dateTimeObj, toLocale);
                        const convertedEndDate: string = this.formatDate(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    } else {
                        const convertedStartDate: string = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        const convertedEndDate: string = this.formatDateAndTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    }
                } else {
                    if (date.type === 'time') {
                        const convertedDate: string = this.formatTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    } else if (date.type === 'date') {
                        const convertedDate: string = this.formatDate(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    } else {
                        const convertedDateTime: string = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDateTime);
                    }
                }

            });

            return Promise.resolve(processedMessage);
        } catch (e) {
            return Promise.reject(e);
        }

    }

    private initLocales(): void {

        const supportedLocales: string[] = [
            'en-us', 'en-za', 'en-ie', 'en-gb', 'en-ca', 'en-au',
            'fr-fr', 'fr-ca',  'fr-be', 'fr-ch', 'fr-lu', 'fr-mc',
            'zh-cn', 'zh-tw', 'zh-sg', 'zh-hk', 'zh-mo',
            'de-de', 'de-at', 'de-ch', 'de-lu', 'de-li',
            'es-es'
        ];

        supportedLocales.forEach((locale: string) => {
            const localeData: moment.Locale = moment.localeData(locale);
            this.mapLocaleToFunction[locale] = new DateAndTimeLocaleFormat(localeData.longDateFormat('LT'), localeData.longDateFormat('L'));
        });
    }

    private extractDates(message: string, fromLocale: string): TextAndDateTime[] {
        // let fndDates: string[];
        let culture: string = DateTimeRecognizers.Culture.English;
        if (fromLocale.startsWith('fr')) {
            culture = DateTimeRecognizers.Culture.French;
        } else if (fromLocale.startsWith('pt'))  {
            culture = DateTimeRecognizers.Culture.Portuguese;
        } else if (fromLocale.startsWith('zh'))  {
            culture = DateTimeRecognizers.Culture.Chinese;
        } else if (fromLocale.startsWith('es')) {
            culture = DateTimeRecognizers.Culture.Spanish;
        } else if (!fromLocale.startsWith('en')) {
            throw new Error('Unsupported from locale');
        }

        const model: DateTimeRecognizers.IDateTimeModel = new DateTimeRecognizers.DateTimeRecognizer(culture).getDateTimeModel();
        const results: ModelResult[] = model.parse(message);

        const foundDates: TextAndDateTime[] = [];
        results.forEach((result: ModelResult) => {
            let curDateTimeText: TextAndDateTime;
            let momentTime: Date;
            let momentTimeEnd: Date;
            let foundType: string;
            const resolutionValues: any = result.resolution.values[0];
            const type: string = result.typeName.replace('datetimeV2.', '');
            if (type.includes('range')) {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues.start).toDate();
                    momentTimeEnd = moment(resolutionValues.end).toDate();
                    foundType = 'datetime';
                } else if (type.includes('date')) {
                    momentTime = moment(resolutionValues.start).toDate();
                    momentTimeEnd = moment(resolutionValues.end).toDate();
                    foundType = 'date';
                } else { // Must be a time-only result with no date
                    momentTime = new Date();
                    momentTime.setHours(parseInt(String(resolutionValues.start).substr(0, 2), 10));
                    momentTime.setMinutes(parseInt(String(resolutionValues.start).substr(3, 2), 10));

                    momentTimeEnd = new Date();
                    momentTimeEnd.setHours(parseInt(String(resolutionValues.end).substr(0, 2), 10));
                    momentTimeEnd.setMinutes(parseInt(String(resolutionValues.end).substr(3, 2), 10));
                    foundType = 'time';
                }

                curDateTimeText = {
                    text: new RegExp(`\\b${result.text}\\b`, 'gi'),
                    dateTimeObj: momentTime,
                    endDateTimeObj: momentTimeEnd,
                    type: foundType,
                    range: true
                };
            } else {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues.value).toDate();
                    foundType = 'datetime';
                } else if (type.includes('date')) {
                    momentTime = moment(resolutionValues.value).toDate();
                    foundType = 'date';
                } else { // Must be a time-only result with no date
                    momentTime = new Date();
                    momentTime.setHours(parseInt(String(resolutionValues.value).substr(0, 2), 10));
                    momentTime.setMinutes(parseInt(String(resolutionValues.value).substr(3, 2), 10));
                    foundType = 'time';
                }

                curDateTimeText = {
                    text: new RegExp(`\\b${result.text}\\b`, 'gi'),
                    dateTimeObj: momentTime,
                    type: foundType,
                    range: false
                };
            }

            foundDates.push(curDateTimeText);
        });

        return foundDates;
    }

    private formatDate(date: Date, toLocale: string): string {
        return moment(date).format(this.mapLocaleToFunction[toLocale].dateFormat);
    }

    private formatTime(date: Date, toLocale: string): string {
        return moment(date).format(this.mapLocaleToFunction[toLocale].timeFormat);
    }

    private formatDateAndTime(date: Date, toLocale: string): string {
        return `${this.formatDate(date, toLocale)} ${this.formatTime(date, toLocale)}`;
    }

}

/**
 * @private
 */
class DateAndTimeLocaleFormat {
    public timeFormat: string;
    public dateFormat: string;

    constructor(timeFormat: string, dateFormat: string) {
        this.timeFormat = timeFormat;
        this.dateFormat = dateFormat;
    }
}

/**
 * @private
 */
// tslint:disable-next-line:max-classes-per-file
class TextAndDateTime {
    public text: RegExp;
    public dateTimeObj: Date;
    public type: string;
    public endDateTimeObj?: Date;
    public range: boolean;
}
