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
const moment = require("moment");
/**
 * Middleware used to convert locale specific entities, like dates and times, from one locale
 * to another.
 *
 * @remarks
 * When added to the bot adapters middleware pipeline it will attempt to recognize entities in
 * incoming message activities and then automatically convert those entities to the target locale.
 */
class LocaleConverter {
    /**
     * Creates a new LocaleConverter instance.
     * @param settings
     */
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
/**
 * @private
 */
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
        let foundDates = [];
        results.forEach(result => {
            let curDateTimeText;
            let momentTime;
            let momentTimeEnd;
            let foundType;
            let resolutionValues = result.resolution["values"][0];
            let type = result.typeName.replace('datetimeV2.', '');
            if (type.includes('range')) {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues["start"]).toDate();
                    momentTimeEnd = moment(resolutionValues["end"]).toDate();
                    foundType = 'datetime';
                }
                else if (type.includes('date')) {
                    momentTime = moment(resolutionValues["start"]).toDate();
                    momentTimeEnd = moment(resolutionValues["end"]).toDate();
                    foundType = 'date';
                }
                else {
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
                };
            }
            else {
                if (type.includes('date') && type.includes('time')) {
                    momentTime = moment(resolutionValues["value"]).toDate();
                    foundType = 'datetime';
                }
                else if (type.includes('date')) {
                    momentTime = moment(resolutionValues["value"]).toDate();
                    foundType = 'date';
                }
                else {
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
                };
            }
            foundDates.push(curDateTimeText);
        });
        return foundDates;
    }
    formatDate(date, toLocale) {
        return this.mapLocaleToFunction[toLocale].dateFormat
            .replace('yyyy', (date.getFullYear()).toLocaleString(undefined, { minimumIntegerDigits: 4 }).replace(',', ''))
            .replace('MM', (date.getMonth() + 1).toLocaleString(undefined, { minimumIntegerDigits: 2 }))
            .replace('dd', (date.getDate()).toLocaleString(undefined, { minimumIntegerDigits: 2 }));
    }
    formatTime(date, toLocale) {
        return this.mapLocaleToFunction[toLocale].timeFormat
            .replace('hh', (date.getHours()).toLocaleString(undefined, { minimumIntegerDigits: 2 }))
            .replace('mm', (date.getMinutes()).toLocaleString(undefined, { minimumIntegerDigits: 2 }));
    }
    formatDateAndTime(date, toLocale) {
        return `${this.formatDate(date, toLocale)} ${this.formatTime(date, toLocale)}`;
    }
    convert(message, fromLocale, toLocale) {
        if (!this.isLocaleAvailable(toLocale)) {
            return Promise.reject(`Unsupported to locale ${toLocale}`);
        }
        try {
            let dates = this.extractDates(message, fromLocale);
            let processedMessage = message;
            dates.forEach(date => {
                if (date.range) {
                    if (date.type == 'time') {
                        let convertedStartDate = this.formatTime(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    }
                    else if (date.type == 'date') {
                        let convertedStartDate = this.formatDate(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatDate(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    }
                    else {
                        let convertedStartDate = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        let convertedEndDate = this.formatDateAndTime(date.endDateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, `${convertedStartDate} - ${convertedEndDate}`);
                    }
                }
                else {
                    if (date.type == 'time') {
                        let convertedDate = this.formatTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    }
                    else if (date.type == 'date') {
                        let convertedDate = this.formatDate(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDate);
                    }
                    else {
                        let convertedDateTime = this.formatDateAndTime(date.dateTimeObj, toLocale);
                        processedMessage = processedMessage.replace(date.text, convertedDateTime);
                    }
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
/**
 * @private
 */
class DateAndTimeLocaleFormat {
    constructor(timeFormat, dateFormat) {
        this.timeFormat = timeFormat;
        this.dateFormat = dateFormat;
    }
}
/**
 * @private
 */
class TextAndDateTime {
}
//# sourceMappingURL=localeConverter.js.map