"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const DateTimeRecognizers = require("@microsoft/recognizers-text-date-time");
/**
 * The LocaleConverter converts all locales in a message to a given locale.
 */
class LocaleConverter {
    constructor(settings) {
        this.localeConverter = new MicrosoftLocaleConverter();
        this.toLocale = settings.toLocale;
        this.fromLocale = settings.fromLocale;
        this.getUserLocale = settings.getUserLocale;
        this.setUserLocale = settings.setUserLocale;
    }
    /// Incoming activity
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type != botbuilder_1.ActivityTypes.Message) {
                return next();
            }
            if (this.setUserLocale != undefined) {
                let changedLocale = yield this.setUserLocale(context);
                if (changedLocale) {
                    return Promise.resolve();
                }
            }
            return this.convertLocalesAsync(context)
                .then(() => next());
        });
    }
    convertLocalesAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = context.activity;
            let fromLocale;
            if (this.fromLocale != undefined) {
                fromLocale = this.fromLocale;
            }
            else if (this.getUserLocale != undefined) {
                fromLocale = this.getUserLocale(context);
            }
            else {
                fromLocale = 'en-us';
            }
            return this.localeConverter.convert(message.text, fromLocale, this.toLocale)
                .then(result => {
                message.text = result;
                return Promise.resolve();
            });
        });
    }
    getAvailableLocales() {
        return this.localeConverter.getAvailableLocales()
            .then(result => Promise.resolve(result));
    }
}
exports.LocaleConverter = LocaleConverter;
class MicrosoftLocaleConverter {
    constructor() {
        this.mapLocaleToFunction = {};
        this.initLocales();
    }
    initLocales() {
        let yearMonthDay = new DateAndTimeLocaleFormat('hh:mm', 'yyyy-MM-dd');
        let dayMonthYear = new DateAndTimeLocaleFormat('hh:mm', 'dd/MM/yyyy');
        let monthDayYEar = new DateAndTimeLocaleFormat('hh:mm', 'MM/dd/yyyy');
        let yearMonthDayLocales = ["en-za", "en-ie", "en-gb", "en-ca", "fr-ca", "zh-cn", "zh-sg", "zh-hk", "zh-mo", "zh-tw"];
        yearMonthDayLocales.forEach(locale => {
            this.mapLocaleToFunction[locale] = yearMonthDay;
        });
        let dayMonthYearLocales = ["en-au", "fr-be", "fr-ch", "fr-fr", "fr-lu", "fr-mc", "de-at", "de-ch", "de-de", "de-lu", "de-li"];
        dayMonthYearLocales.forEach(locale => {
            this.mapLocaleToFunction[locale] = dayMonthYear;
        });
        this.mapLocaleToFunction["en-us"] = monthDayYEar;
    }
    isLocaleAvailable(locale) {
        return !(typeof this.mapLocaleToFunction[locale] === "undefined");
    }
    extractDates(message, fromLocale) {
        let fndDates;
        let culture = DateTimeRecognizers.Culture.English;
        if (fromLocale.startsWith("fr")) {
            culture = DateTimeRecognizers.Culture.French;
        }
        else if (fromLocale.startsWith("pt")) {
            culture = DateTimeRecognizers.Culture.Portuguese;
        }
        else if (fromLocale.startsWith("zh")) {
            culture = DateTimeRecognizers.Culture.Chinese;
        }
        else if (fromLocale.startsWith("es")) {
            culture = DateTimeRecognizers.Culture.Spanish;
        }
        else if (!fromLocale.startsWith("en")) {
            throw new Error("Unsupported from locale");
        }
        let model = new DateTimeRecognizers.DateTimeRecognizer(culture).getDateTimeModel();
        let results = model.parse(message);
        let moment;
        let foundDates = [];
        results.forEach(result => {
            let resolutionValues = result.resolution["values"][0];
            let type = result.typeName.replace('datetimeV2.', '');
            if (type.includes('date') && !type.includes('range')) {
                moment = new Date(new Date(resolutionValues["value"]).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
            }
            else if (type.includes('date') && type.includes('range')) {
                moment = new Date(new Date(resolutionValues["start"]).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
            }
            else {
                moment = new Date();
                moment.setHours(parseInt(String(resolutionValues['value']).substr(0, 2)));
                moment.setMinutes(parseInt(String(resolutionValues['value']).substr(3, 2)));
            }
            let curDateTimeText = new TextAndDateTime(result.text, moment);
            foundDates.push(curDateTimeText);
        });
        return foundDates;
    }
    convert(message, fromLocale, toLocale) {
        if (!this.isLocaleAvailable(toLocale)) {
            return Promise.reject(`Unsupported to locale ${toLocale}`);
        }
        try {
            let dates = this.extractDates(message, fromLocale);
            let processedMessage = message;
            dates.forEach(date => {
                if (date.dateTimeObj.toDateString() == (new Date()).toDateString()) {
                    let convertedDate = this.mapLocaleToFunction[toLocale].timeFormat
                        .replace('hh', (date.dateTimeObj.getHours()).toLocaleString(undefined, { minimumIntegerDigits: 2 }))
                        .replace('mm', (date.dateTimeObj.getMinutes()).toLocaleString(undefined, { minimumIntegerDigits: 2 }));
                    processedMessage = processedMessage.replace(date.text, convertedDate);
                }
                else {
                    let convertedDate = this.mapLocaleToFunction[toLocale].dateFormat
                        .replace('yyyy', (date.dateTimeObj.getFullYear()).toLocaleString(undefined, { minimumIntegerDigits: 4 }).replace(',', ''))
                        .replace('MM', (date.dateTimeObj.getMonth() + 1).toLocaleString(undefined, { minimumIntegerDigits: 2 }))
                        .replace('dd', (date.dateTimeObj.getDate()).toLocaleString(undefined, { minimumIntegerDigits: 2 }));
                    processedMessage = processedMessage.replace(date.text, convertedDate);
                }
            });
            return Promise.resolve(processedMessage);
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    getAvailableLocales() {
        return Promise.resolve(Object.keys(this.mapLocaleToFunction));
    }
}
class DateAndTimeLocaleFormat {
    constructor(timeFormat, dateFormat) {
        this.timeFormat = timeFormat;
        this.dateFormat = dateFormat;
    }
}
class TextAndDateTime {
    constructor(text, dateTimeObj) {
        this.text = text;
        this.dateTimeObj = dateTimeObj;
    }
}
//# sourceMappingURL=localeConverter.js.map