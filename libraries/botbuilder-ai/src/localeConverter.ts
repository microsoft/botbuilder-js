/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import * as DateTimeRecognizers from '@microsoft/recognizers-text-date-time';

export interface LocaleConverterSettings {
    toLocale: string,
    fromLocale?: string,
    getUserLocale?: (context: TurnContext) => string,
    setUserLocale?: (context: TurnContext) => Promise<boolean>
}

/**
 * The LocaleConverter converts all locales in a message to a given locale.
 */
export class LocaleConverter implements Middleware {
    private localeConverter: ILocaleConverter;
    private fromLocale: string | undefined;
    private toLocale: string;
    private getUserLocale: ((context: TurnContext) => string) | undefined;
    private setUserLocale: ((context: TurnContext) => Promise<boolean>) | undefined;

    public constructor(settings: LocaleConverterSettings) {
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

interface ILocaleConverter {
    
    isLocaleAvailable(locale: string): boolean;
    
    convert(message: string, fromLocale: string, toLocale: string): Promise<string>;

    getAvailableLocales(): Promise<string[]>;
}

class MicrosoftLocaleConverter implements ILocaleConverter {

    mapLocaleToFunction: { [id: string] : DateAndTimeLocaleFormat } = {};

    constructor() {
        this.initLocales();
    }

    private initLocales() {
        let yearMonthDay = new DateAndTimeLocaleFormat('hh:mm', 'yyyy-MM-dd');
        let dayMonthYear = new DateAndTimeLocaleFormat('hh:mm', 'dd/MM/yyyy');
        let monthDayYEar = new DateAndTimeLocaleFormat('hh:mm', 'MM/dd/yyyy');

        let yearMonthDayLocales = [ "en-za", "en-ie", "en-gb", "en-ca", "fr-ca", "zh-cn", "zh-sg", "zh-hk", "zh-mo", "zh-tw" ];
        yearMonthDayLocales.forEach(locale => {
            this.mapLocaleToFunction[locale] = yearMonthDay;
        });

        let dayMonthYearLocales = [ "en-au", "fr-be", "fr-ch", "fr-fr", "fr-lu", "fr-mc", "de-at", "de-ch", "de-de", "de-lu", "de-li" ];
        dayMonthYearLocales.forEach(locale => {
            this.mapLocaleToFunction[locale] = dayMonthYear;
        });

        this.mapLocaleToFunction["en-us"] = monthDayYEar;
    }

    isLocaleAvailable(locale: string): boolean {
        return !(typeof this.mapLocaleToFunction[locale] === "undefined")
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
        let moment: Date;
        let foundDates: TextAndDateTime[] = [];
        results.forEach(result => {
            let resolutionValues = result.resolution["values"][0];
            let type = result.typeName.replace('datetimeV2.', '');
            if (type.includes('date') && !type.includes('range')) {
                moment = new Date(new Date(resolutionValues["value"]).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
            } else if (type.includes('date') && type.includes('range')) {
                moment = new Date(new Date(resolutionValues["start"]).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
            } else { // Must be a time-only result with no date
                moment = new Date();
                moment.setHours(parseInt(String(resolutionValues['value']).substr(0, 2)));
                moment.setMinutes(parseInt(String(resolutionValues['value']).substr(3, 2)));
            }
            let curDateTimeText = new TextAndDateTime(result.text, moment);
            foundDates.push(curDateTimeText);
        });
        return foundDates;
    }

    convert(message: string, fromLocale: string, toLocale: string): Promise<string> {

        if (!this.isLocaleAvailable(toLocale)) {
           return Promise.reject(`Unsupported to locale ${toLocale}`);
        }


        try {
            let dates: TextAndDateTime[] = this.extractDates(message, fromLocale);
            let processedMessage = message;
            dates.forEach(date => {
                if (date.dateTimeObj.toDateString() == (new Date()).toDateString()) {
                    let convertedDate = this.mapLocaleToFunction[toLocale].timeFormat
                        .replace('hh', (date.dateTimeObj.getHours()).toLocaleString(undefined, {minimumIntegerDigits: 2}))
                        .replace('mm', (date.dateTimeObj.getMinutes()).toLocaleString(undefined, {minimumIntegerDigits: 2}));
                    
                    processedMessage = processedMessage.replace(date.text, convertedDate)
                } else {
                    let convertedDate = this.mapLocaleToFunction[toLocale].dateFormat
                        .replace('yyyy', (date.dateTimeObj.getFullYear()).toLocaleString(undefined, {minimumIntegerDigits: 4}).replace(',', ''))
                        .replace('MM', (date.dateTimeObj.getMonth() + 1).toLocaleString(undefined, {minimumIntegerDigits: 2}))
                        .replace('dd', (date.dateTimeObj.getDate()).toLocaleString(undefined, {minimumIntegerDigits: 2}));
                        
                    processedMessage = processedMessage.replace(date.text, convertedDate);
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

class DateAndTimeLocaleFormat { 
    public timeFormat: string;
    public dateFormat: string;

    constructor(timeFormat: string, dateFormat: string) {
        this.timeFormat = timeFormat;
        this.dateFormat = dateFormat;
    }
}

class TextAndDateTime { 
    public text: string;
    public dateTimeObj: Date;

    constructor(text: string, dateTimeObj: Date) {
        this.text = text;
        this.dateTimeObj = dateTimeObj;
    }
}