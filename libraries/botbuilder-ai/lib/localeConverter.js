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
    onProcessRequest(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.request.type == "message" && context.request.text) {
                // determine the language we are using for this conversation
                if (this.setUserLocale != undefined) {
                    let changedLocale = yield this.setUserLocale(context);
                    if (changedLocale) {
                        return next();
                    }
                }
                yield this.convertLocalesAsync(context);
            }
            return next();
        });
    }
    convertLocalesAsync(context) {
        let message = context.request;
        if (message.text) {
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
            this.localeConverter.convert(message.text, fromLocale, this.toLocale)
                .then(result => {
                message.text = result;
                return Promise.resolve();
            })
                .catch(error => Promise.reject(error));
        }
        return Promise.resolve();
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
                moment = new Date(resolutionValues["value"] + 'Z');
            }
            else if (type.includes('date') && type.includes('range')) {
                moment = new Date(resolutionValues['start'] + 'Z');
            }
            else if (type.includes('time')) {
                moment = new Date();
                moment.setHours(parseInt(String(resolutionValues['value']).substr(0, 2)));
                moment.setMinutes(parseInt(String(resolutionValues['value']).substr(3, 2)));
            }
            else {
                return;
            }
            let curDateTimeText = new TextAndDateTime(result.text, moment);
            foundDates.push(curDateTimeText);
        });
        return foundDates;
    }
    convert(message, fromLocale, toLocale) {
        if (message.trim().length == 0) {
            return Promise.reject('Empty message');
        }
        if (!this.isLocaleAvailable(toLocale)) {
            return Promise.reject('Unsupported locale ' + toLocale);
        }
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
    getAvailableLocales() {
        let locales = [];
        Object.keys(this.mapLocaleToFunction).forEach(locale => {
            locales.push(locale);
        });
        return Promise.resolve(locales);
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