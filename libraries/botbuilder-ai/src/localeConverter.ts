/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import * as DateTimeRecognizers from '@microsoft/recognizers-text-date-time';
import * as moment from 'moment';
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
        if (context.activity.type != ActivityTypes.Message) {
            return next();
        }
        
        if (this.setUserLocale != undefined) {
            let changedLocale = await this.setUserLocale(context);
            if (changedLocale) {
                return Promise.resolve();
            }
        }

        return this.convertLocalesAsync(context)
        .then(() => next());
    }

    private async convertLocalesAsync(context: TurnContext): Promise<void> {
        let message = context.activity;
        let fromLocale: string;
        if (this.fromLocale != undefined) {
            fromLocale = this.fromLocale;
        } else if (this.getUserLocale != undefined) {
            fromLocale = this.getUserLocale(context);
        } else {
            fromLocale = 'en-us';
        }

        return this.localeConverter.convert(message.text, fromLocale, this.toLocale)
        .then(result => {
            message.text = result;
            return Promise.resolve();
        });
    }

    public getAvailableLocales(): Promise<string[]> {
        return this.localeConverter.getAvailableLocales()
        .then(result => Promise.resolve(result));
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

    mapLocaleToFunction: { [id: string] : DateAndTimeLocaleFormat } = {};

    constructor() {
        this.initLocales();
    }

    private initLocales() {

        let supportedLocales:string[] = [
            "en-us", "en-za", "en-ie", "en-gb", "en-ca", "en-au",
            "fr-fr", "fr-ca",  "fr-be", "fr-ch", "fr-lu", "fr-mc",
            "zh-cn", "zh-tw", "zh-sg", "zh-hk", "zh-mo",
            "de-de", "de-at", "de-ch", "de-lu", "de-li",
            "es-es"
        ];
    
        supportedLocales.forEach( locale => {
            var localeData = moment.localeData(locale);
            this.mapLocaleToFunction[locale] = new DateAndTimeLocaleFormat(localeData.longDateFormat('LT'), localeData.longDateFormat('L'));
        });
    }

    isLocaleAvailable(locale: string): boolean {
        return this.mapLocaleToFunction[locale] != undefined;
    }

    private extractDates(message: string, fromLocale:string): TextAndDateTime[] {
        let fndDates: string[];
        let culture = DateTimeRecognizers.Culture.English;
        if (fromLocale.startsWith("fr")) {
            culture = DateTimeRecognizers.Culture.French;
        } else if (fromLocale.startsWith("pt"))  {
            culture = DateTimeRecognizers.Culture.Portuguese;
        } else if (fromLocale.startsWith("zh"))  {
            culture = DateTimeRecognizers.Culture.Chinese;
        } else if (fromLocale.startsWith("es")) {
            culture = DateTimeRecognizers.Culture.Spanish;
        } else if(!fromLocale.startsWith("en")) {
            throw new Error("Unsupported from locale");
        }

        let model = new DateTimeRecognizers.DateTimeRecognizer(culture).getDateTimeModel();
        let results = model.parse(message);
        
        let foundDates: TextAndDateTime[] = [];
        results.forEach(result => {
            let curDateTimeText: TextAndDateTime;
            let momentTime: Date;
            let momentTimeEnd: Date;
            let foundType: string;
            let resolutionValues = result.resolution["values"][0];
            let type = result.typeName.replace('datetimeV2.', '');
            if (type.includes('range')) {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues["start"]).toDate();
                    momentTimeEnd = moment(resolutionValues["end"]).toDate();
                    foundType = 'datetime';
                } else if (type.includes('date')) {
                    momentTime = moment(resolutionValues["start"]).toDate();
                    momentTimeEnd = moment(resolutionValues["end"]).toDate();
                    foundType = 'date';
                } else { // Must be a time-only result with no date
                    momentTime = new Date();
                    momentTime.setHours(parseInt(String(resolutionValues['start']).substr(0, 2)));
                    momentTime.setMinutes(parseInt(String(resolutionValues['start']).substr(3, 2)));
                    
                    momentTimeEnd = new Date();
                    momentTimeEnd.setHours(parseInt(String(resolutionValues['end']).substr(0, 2)));
                    momentTimeEnd.setMinutes(parseInt(String(resolutionValues['end']).substr(3, 2)));
                    foundType = 'time';
                }

                curDateTimeText = {
                    text: new RegExp(`\\b${result.text}\\b`, "gi"),
                    dateTimeObj: momentTime,
                    endDateTimeObj: momentTimeEnd,
                    type: foundType,
                    range: true
                }
            } else {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues["value"]).toDate();
                    foundType = 'datetime';
                } else if (type.includes('date')) {
                    momentTime = moment(resolutionValues["value"]).toDate();
                    foundType = 'date';
                } else { // Must be a time-only result with no date
                    momentTime = new Date();
                    momentTime.setHours(parseInt(String(resolutionValues['value']).substr(0, 2)));
                    momentTime.setMinutes(parseInt(String(resolutionValues['value']).substr(3, 2)));
                    foundType = 'time';
                }

                curDateTimeText = {
                    text: new RegExp(`\\b${result.text}\\b`, "gi"),
                    dateTimeObj: momentTime,
                    type: foundType,
                    range: false
                }
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
        return `${this.formatDate(date, toLocale)} ${this.formatTime(date, toLocale)}`
    }

    convert(message: string, fromLocale: string, toLocale: string): Promise<string> {

        if (!this.isLocaleAvailable(toLocale)) {
           return Promise.reject(`Unsupported to locale ${toLocale}`);
        }


        try {
            let dates: TextAndDateTime[] = this.extractDates(message, fromLocale);
            let processedMessage = message;
            dates.forEach(date => {
                if (date.range) {
                    if (date.type == 'time') {
                        let convertedStartDate = this.formatTime(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    } else if (date.type == 'date') { 
                        let convertedStartDate = this.formatDate(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatDate(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    } else {
                        let convertedStartDate = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatDateAndTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    }
                } else {
                    if (date.type == 'time') {
                        let convertedDate = this.formatTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    } else if (date.type == 'date') { 
                        let convertedDate = this.formatDate(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    } else {
                        let convertedDateTime = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDateTime);
                    }
                }
                
            });
            return Promise.resolve(processedMessage);
        }
        catch(e) {
            return Promise.reject(e);
        }
        
    }

    getAvailableLocales(): Promise<string[]> {
        return Promise.resolve(Object.keys(this.mapLocaleToFunction));
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
class TextAndDateTime { 
    public text: RegExp;
    public dateTimeObj: Date;
    public type: string;
    public endDateTimeObj?: Date;
    public range: boolean
}