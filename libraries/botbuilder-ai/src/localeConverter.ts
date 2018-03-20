/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware } from 'botbuilder';
import { Activity, ResourceResponse } from 'botbuilder';
import * as LanguageMap from './languageMap';
import * as DateTimeRecognizers from '@microsoft/recognizers-text-date-time';

/**
 * The LocaleConverter converts all locales in a message to a given locale.
 */
export class LocaleConverter implements Middleware {
    private localeConverter: ILocaleConverter;
    private fromLocale: string | undefined;
    private toLocale: string;
    private getUserLocale: ((context: BotContext) => string) | undefined;
    private setUserLocale: ((context: BotContext) => Promise<boolean>) | undefined;

    public constructor(toLocale: string, fromLocale: string);
    public constructor(toLocale: string, getUserLocale: (context: BotContext) => string, setUserLocale: (context: BotContext) => Promise<boolean>);
    public constructor(toLocale: string, fromLocale: string | ((context: BotContext) => string), setUserLocale?: (context: BotContext) => Promise<boolean>) {
        this.localeConverter = new MicrosoftLocaleConverter();
        this.toLocale = toLocale;
        if (typeof(fromLocale) === 'string') {
            this.fromLocale = fromLocale as string;
        } else {
            this.getUserLocale = fromLocale as (context: BotContext) => string;
            this.setUserLocale = setUserLocale;
        }
    }

    /// Incoming activity
    public async receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void> {
        if (context.request.type == "message" && context.request.text) {
            // determine the language we are using for this conversation
            if (this.setUserLocale != undefined) {
                let changedLocale = await this.setUserLocale(context);
                if (changedLocale) {
                    return next();
                }
            }
            await this.convertLocalesAsync(context, context.request);
        }
        return next();
    }

    private convertLocalesAsync(context: BotContext, message: Partial<Activity>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (message.text) {
                let fromLocale: string;
                if (this.fromLocale != undefined) {
                    fromLocale = this.fromLocale;
                } else if (this.getUserLocale != undefined) {
                    fromLocale = this.getUserLocale(context);
                } else {
                    fromLocale = 'en-us';
                }
                this.localeConverter.convert(message.text, fromLocale, this.toLocale)
                .then(result => {
                    message.text = result;
                    resolve();
                })
                .catch(error => reject(error));
            }
        });
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
                moment = new Date(resolutionValues["value"] + 'Z');
            } else if (type.includes('date') && type.includes('range')) {
                moment = new Date(resolutionValues['start'] + 'Z');
            } else if (type.includes('time')) {
                moment = new Date();
                moment.setHours(parseInt(String(resolutionValues['value']).substr(0, 2)));
                moment.setMinutes(parseInt(String(resolutionValues['value']).substr(3, 2)));
            } else {
                return;
            }
            let curDateTimeText = new TextAndDateTime(result.text, moment);
            foundDates.push(curDateTimeText);
        });
        return foundDates;
    }

    convert(message: string, fromLocale: string, toLocale: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (message.trim().length == 0) {
                reject('Empty message');
            }

            if (!this.isLocaleAvailable(toLocale)) {
                reject('Unsupported locale ' + toLocale);
            }

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
            resolve(processedMessage);
        });
    }

    getAvailableLocales(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let locales: string[] = [];
            Object.keys(this.mapLocaleToFunction).forEach(locale => {
                locales.push(locale)
            });
            resolve(locales);
        })
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