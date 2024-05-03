(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.microsoftRecognizersTextDataTypesTimexExpression = {})));
}(this, (function (exports) { 'use strict';

// Copyright (c) Microsoft Corporation. All rights reserved.

class Time {
    constructor(hour, minute, second) {
        if (arguments.length === 1) {
            this.hour = Math.floor(hour / 3600000);
            this.minute = Math.floor((hour - (this.hour * 3600000)) / 60000);
            this.second = (hour - (this.hour * 3600000) - (this.minute * 60000)) / 1000;
        }
        else {
            this.hour = hour;
            this.minute = minute;
            this.second = second;
        }
    }

    getTime () {
        return (this.second * 1000) + (this.minute * 60000) + (this.hour * 3600000);
    }
}

var Time_1 = Time;

var time = {
	Time: Time_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const value = function (s) { return s; };
const isTrue = function () { return true; };
const zero = function () { return 0; };

const timexRegex = {

    date: [
        // date
        { regex: /^(\d\d\d\d)-(\d\d)-(\d\d)$/, props: { year: Number, month: Number, dayOfMonth: Number } },
        { regex: /^XXXX-WXX-(\d)$/, props: { dayOfWeek: Number } },
        { regex: /^XXXX-(\d\d)-(\d\d)$/, props: { month: Number, dayOfMonth: Number } },
        // daterange
        { regex: /^(\d\d\d\d)$/, props: { year: Number } },
        { regex: /^(\d\d\d\d)-(\d\d)$/, props: { year: Number, month: Number } },
        { regex: /^(SP|SU|FA|WI)$/, props: { season: value } },
        { regex: /^(\d\d\d\d)-(SP|SU|FA|WI)$/, props: { year: Number, season: value } },
        { regex: /^(\d\d\d\d)-W(\d\d)$/, props: { year: Number, weekOfYear: Number } },
        { regex: /^(\d\d\d\d)-W(\d\d)-WE$/, props: { year: Number, weekOfYear: Number, weekend: isTrue } },
        { regex: /^XXXX-(\d\d)$/, props: { month: Number } },
        { regex: /^XXXX-(\d\d)-W(\d\d)$/, props: { month: Number, weekOfMonth: Number } },
        { regex: /^XXXX-(\d\d)-WXX-(\d)-(\d)$/, props: { month: Number, weekOfMonth: Number, dayOfWeek: Number } }
    ],

    time: [
        // time
        { regex: /^T(\d\d)$/, props: { hour: Number, minute: zero, second: zero } },
        { regex: /^T(\d\d):(\d\d)$/, props: { hour: Number, minute: Number, second: zero } },
        { regex: /^T(\d\d):(\d\d):(\d\d)$/, props: { hour: Number, minute: Number, second: Number } },
        // timerange
        { regex: /^T(DT|NI|MO|AF|EV)$/, props: { partOfDay: value } }
    ],

    period: [
        { regex: /^P(\d*\.?\d+)(Y|M|W|D)$/, props: { amount: Number, dateUnit: value } },
        { regex: /^PT(\d*\.?\d+)(H|M|S)$/, props: { amount: Number, timeUnit: value } }
    ]
};

const tryExtract = function (entry, timex, result) {
    const regexResult = timex.match(entry.regex);
    if (!regexResult) {
        return false;
    }
    let index = 1;
    for (const name in entry.props) {
        const val = regexResult[index++];
        result[name] = entry.props[name](val);
    }
    return true;
};

const extract = function (name, timex, result) {
    for (const entry of timexRegex[name]) {
        if (tryExtract(entry, timex, result)) {
            return true;
        }
    }
    return false;
};

var extract_1 = extract;

var timexregex = {
	extract: extract_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.



const parseString = function (timex, obj) {
    // a reference to the present
    if (timex === 'PRESENT_REF') {
        obj.now = true;
    }
    // duration
    else if (timex.startsWith('P')) {
        extractDuration(timex, obj);
    }
    // range indicated with start and end dates and a duration
    else if (timex.startsWith('(') && timex.endsWith(')')) {
        extractStartEndRange(timex, obj);
    }
    // date and time and their respective ranges
    else {
        extractDateTime(timex, obj);
    }
};

const extractDuration = function (s, obj) {
    const extracted = {};
    timexregex.extract('period', s, extracted);
    if (extracted.dateUnit) {
        obj[{ Y: 'years', M: 'months', W: 'weeks', D: 'days' }[extracted.dateUnit]] = extracted.amount;
    }
    else if (extracted.timeUnit) {
        obj[{ H: 'hours', M: 'minutes', S: 'seconds' }[extracted.timeUnit]] = extracted.amount;
    }
};

const extractStartEndRange = function (s, obj) {
    const parts = s.substring(1, s.length - 1).split(',');
    if (parts.length === 3) {
        extractDateTime(parts[0], obj);
        extractDuration(parts[2], obj);
    }
};

const extractDateTime = function (s, obj) {
    const indexOfT = s.indexOf('T');
    if (indexOfT === -1) {
        timexregex.extract('date', s, obj);
    }
    else {
        timexregex.extract('date', s.substr(0, indexOfT), obj);
        timexregex.extract('time', s.substr(indexOfT), obj);
    }
};

const fromObject = function (source, obj) {
    Object.assign(obj, source);
    if ('hour' in obj) {
        if (!('minute' in obj)) {
            obj.minute = 0;
        }
        if (!('second' in obj)) {
            obj.second = 0;
        }
    }
};

var timexParsing = {
    parseString: parseString,
    fromObject: fromObject
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const isPresent = function (obj) {
    return obj.now === true;
};

const isDuration = function (obj) {
    return 'years' in obj || 'months' in obj || 'weeks' in obj || 'days' in obj 
        || 'hours' in obj || 'minutes' in obj || 'seconds' in obj;
};

const isTime = function (obj) {
    return 'hour' in obj && 'minute' in obj && 'second' in obj;
};

const isDate = function (obj) {
    return ('month' in obj && 'dayOfMonth' in obj) || 'dayOfWeek' in obj;
};

const isTimeRange = function (obj) {
    return 'partOfDay' in obj;
};

const isDateRange = function (obj) {
    return ('year' in obj && !('dayOfMonth' in obj))
        || ('year' in obj && 'month' in obj && !('dayOfMonth' in obj))
        || ('month' in obj && !('dayOfMonth' in obj))
        || 'season' in obj
        || 'weekOfYear' in obj
        || 'weekOfMonth' in obj;
};

const isDefinite = function (obj) {
    return 'year' in obj &&  'month' in obj && 'dayOfMonth' in obj;
};

const infer = function (obj) {
    const types = new Set();
    if (isPresent(obj)) {
        types.add('present');
    }
    if (isDefinite(obj)) {
        types.add('definite');
    }
    if (isDate(obj)) {
        types.add('date');
    }
    if (isDateRange(obj)) {
        types.add('daterange');
    }
    if (isDuration(obj)) {
        types.add('duration');
    }
    if (isTime(obj)) {
        types.add('time');
    }
    if (isTimeRange(obj)) {
        types.add('timerange');
    }
    if (types.has('present')) {
        types.add('date');
        types.add('time');
    }
    if (types.has('time') && types.has('duration')) {
        types.add('timerange');
    }
    if (types.has('date') && types.has('time')) {
        types.add('datetime');
    }
    if (types.has('date') && types.has('duration')) {
        types.add('daterange');
    }
    if (types.has('datetime') && types.has('duration')) {
        types.add('datetimerange');
    }
    if (types.has('date') && types.has('timerange')) {
        types.add('datetimerange');
    }
    return types;
};

var infer_1 = infer;

var timexInference = {
	infer: infer_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const cloneDate = function (date) {
    const result = new Date();
    result.setTime(date.getTime());
    return result;
};

const tomorrow = function (date) {
    const result = cloneDate(date);
    result.setDate(result.getDate() + 1);
    return result;
};

const yesterday = function (date) {
    const result = cloneDate(date);
    result.setDate(result.getDate() - 1);
    return result;
};

const datePartEquals = function (dateX, dateY) {
    return (dateX.getFullYear() === dateY.getFullYear())
        && (dateX.getMonth() === dateY.getMonth())
        && (dateX.getDate() === dateY.getDate());
};

const isDateInWeek = function (date, startOfWeek) {
    let d = cloneDate(startOfWeek);
    for (let i=0; i<7; i++) {
        if (datePartEquals(date, d)) {
            return true;
        }
        d = tomorrow(d);
    }
    return false;
};

const isThisWeek = function (date, referenceDate) {
    const startOfThisWeek = cloneDate(referenceDate);
    startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
    return isDateInWeek(date, startOfThisWeek);
};

const isNextWeek = function (date, referenceDate) {
    const startOfNextWeek = cloneDate(referenceDate);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + (7 - startOfNextWeek.getDay()));
    return isDateInWeek(date, startOfNextWeek);
};

const isLastWeek = function (date, referenceDate) {
    const startOfLastWeek = cloneDate(referenceDate);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - (7 + startOfLastWeek.getDay()));
    return isDateInWeek(date, startOfLastWeek);
};

const weekOfYear = function (date) {
    const ds = new Date(date.getFullYear(), 0);
    const de = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let weeks = 1;
    while (ds.getTime() < de.getTime()) {
        const jsDayOfWeek = ds.getDay();
        const isoDayOfWeek = jsDayOfWeek == 0 ? 7 : jsDayOfWeek; 
        if (isoDayOfWeek === 7) {
            weeks++;
        }
        ds.setDate(ds.getDate() + 1);
    }
    return weeks;
};

const fixedFormatNumber$1 = function (n, size) {
    const s = n.toString();
    let zeros = '';
    const np = size - s.length;
    for (let i=0; i<np; i++) {
        zeros += '0';
    }
    return `${zeros}${s}`;
};

const dateOfLastDay = function (day, referenceDate) {
    const result = cloneDate(referenceDate);
    result.setDate(result.getDate() - 1);
    while (result.getDay() !== day) {
        result.setDate(result.getDate() - 1);
    }
    return result;
};

const dateOfNextDay = function (day, referenceDate) {
    const result = cloneDate(referenceDate);
    do {
        result.setDate(result.getDate() + 1);
    }
    while (result.getDay() !== day);
    return result;
};

const datesMatchingDay = function (day, start, end) {
    const result = [];
    const d = cloneDate(start);
    while (!datePartEquals(d, end)) {
        if (d.getDay() === day) {
            result.push(cloneDate(d));
        }
        d.setDate(d.getDate() + 1);
    }
    return result;
};

var timexDateHelpers = {
    tomorrow: tomorrow,
    yesterday: yesterday,
    datePartEquals: datePartEquals,
    isThisWeek: isThisWeek,
    isNextWeek: isNextWeek,
    isLastWeek: isLastWeek,
    weekOfYear: weekOfYear,
    fixedFormatNumber: fixedFormatNumber$1,
    dateOfLastDay: dateOfLastDay,
    dateOfNextDay: dateOfNextDay,
    datesMatchingDay: datesMatchingDay
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const Time$1 = time.Time;


const cloneDateTime = function (timex) {
    const result = Object.assign({}, timex);
    delete result.years;
    delete result.months;
    delete result.weeks;
    delete result.days;
    delete result.hours;
    delete result.minutes;
    delete result.seconds;
    return result;
};

const cloneDuration = function (timex) {
    const result = Object.assign({}, timex);
    delete result.year;
    delete result.month;
    delete result.dayOfMonth;
    delete result.dayOfWeek;
    delete result.weekOfYear;
    delete result.weekOfMonth;
    delete result.season;
    delete result.hour;
    delete result.minute;
    delete result.second;
    delete result.weekend;
    delete result.partOfDay;
    return result;
};

const timexDateAdd$1 = function (start, duration) {
    if ('dayOfWeek' in start) {
        const end = Object.assign({}, start);
        if ('days' in duration) {
            end.dayOfWeek += duration.days;
        }
        return end;
    }
    if ('month' in start && 'dayOfMonth' in start) {
        if ('days' in duration) {
            if ('year' in start) {
                const d = new Date(start.year, start.month - 1, start.dayOfMonth, 0, 0, 0);
                for (let i=0; i < duration.days; i++) {
                    d.setDate(d.getDate() + 1);
                }
                return { year: d.getFullYear(), month: d.getMonth() + 1, dayOfMonth: d.getDate() };
            }
            else {
                const d = new Date(2001, start.month - 1, start.dayOfMonth, 0, 0, 0);
                for (let i=0; i < duration.days; i++) {
                    d.setDate(d.getDate() + 1);
                }
                return { month: d.getMonth() + 1, dayOfMonth: d.getDate() };
            }
        }
        if ('years' in duration) {
            if ('year' in start) {
                return { year: start.year + duration.years, month: start.month, dayOfMonth: start.dayOfMonth };
            }
        }
        if ('months' in duration) {
            if ('month' in start) {
                return { year: start.year, month: start.month + duration.months, dayOfMonth: start.dayOfMonth };
            }
        }
    }
    return start;
};

const timexTimeAdd$1 = function (start, duration) {
    if ('hours' in duration) {
        const result = Object.assign({}, start);
        result.hour += duration.hours;
        if (result.hour > 23) {
            const days = Math.floor(result.hour / 24);
            const hour = result.hour % 24;
            result.hour = hour;
            if ('year' in result && 'month' in result && 'dayOfMonth' in result) {
                const d = new Date(result.year, result.month - 1, result.dayOfMonth, 0, 0, 0);
                for (let i=0; i<days; i++) {
                    d.setDate(d.getDate() + 1);
                }
                result.year = d.getFullYear();
                result.month = d.getMonth() + 1;
                result.dayOfMonth = d.getDate();
                return result;
            }
            if ('dayOfWeek' in result) {
                result.dayOfWeek += days;
                return result;
            }
        }
        return result;
    }
    if ('minutes' in duration) {
        const result = Object.assign({}, start);
        result.minute += duration.minutes;
        if (result.minute > 59) {
            result.hour++;
            result.minute = 0;
        }
        return result;
    }
    return start;
};

const timexDateTimeAdd$1 = function (start, duration) {
    return timexTimeAdd$1(timexDateAdd$1(start, duration), duration);
};

const expandDateTimeRange = function (timex) {
    const types = ('types' in timex) ? timex.types : timexInference.infer(timex);
    if (types.has('duration')) {
        const start = cloneDateTime(timex);
        const duration = cloneDuration(timex);
        return { start: start, end: timexDateTimeAdd$1(start, duration), duration: duration };
    }
    else {
        if ('year' in timex) {
            const range = { start: { year: timex.year }, end: {} };
            if ('month' in timex) {
                range.start.month = timex.month;
                range.start.dayOfMonth = 1;
                range.end.year = timex.year;
                range.end.month = timex.month + 1;
                range.end.dayOfMonth = 1;
            }
            else {
                range.start.month = 1;
                range.start.dayOfMonth = 1;
                range.end.year = timex.year + 1;
                range.end.month = 1;
                range.end.dayOfMonth = 1;
            }
            return range;
        }
    }
    return { start: {}, end: {} };
};

const timeAdd = function (start, duration) {
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    const seconds = duration.seconds || 0;
    return { hour: start.hour + hours, minute: start.minute + minutes, second: start.second + seconds };
};

const expandTimeRange = function (timex) {

    if (!timex.types.has('timerange'))
    {
        throw new exception('argument must be a timerange');
    }

    if (timex.partOfDay !== undefined) {
        switch (timex.partOfDay) {
            case 'DT':
                timex = { hour: 8, minute: 0, second: 0, hours: 10, minutes: 0, seconds: 0 };
                break;
            case 'MO':
                timex = { hour: 8, minute: 0, second: 0, hours: 4, minutes: 0, seconds: 0 };
                break;
            case 'AF':
                timex = { hour: 12, minute: 0, second: 0, hours: 4, minutes: 0, seconds: 0 };
                break;
            case 'EV':
                timex = { hour: 16, minute: 0, second: 0, hours: 4, minutes: 0, seconds: 0 };
                break;
            case 'NI':
                timex = { hour: 20, minute: 0, second: 0, hours: 4, minutes: 0, seconds: 0 };
                break;
            default:
                throw new exception('unrecognized part of day timerange');
        }
    }

    const start = { hour: timex.hour, minute: timex.minute, second: timex.second };
    const duration = cloneDuration(timex);
    return { start: start, end: timeAdd(start, duration), duration: duration };
};

const dateFromTimex = function (timex) {
    const year = 'year' in timex ? timex.year : 2001;
    const month = 'month' in timex ? timex.month - 1 : 0;
    const date = 'dayOfMonth' in timex ? timex.dayOfMonth : 1;
    const hour = 'hour' in timex ? timex.hour : 0;
    const minute = 'minute' in timex ? timex.minute : 0;
    const second = 'second' in timex ? timex.second : 0;
    return new Date(year, month, date, hour, minute, second);
};

const timeFromTimex = function (timex) {
    const hour = timex.hour || 0;
    const minute = timex.minute || 0;
    const second = timex.second || 0;
    return new Time$1(hour, minute, second);
};

const dateRangeFromTimex = function (timex) {
    const expanded = expandDateTimeRange(timex);
    return { start: dateFromTimex(expanded.start), end: dateFromTimex(expanded.end) };
};

const timeRangeFromTimex = function (timex) {
    const expanded = expandTimeRange(timex);
    return { start: timeFromTimex(expanded.start), end: timeFromTimex(expanded.end) };
};

var timexHelpers = {
    expandDateTimeRange: expandDateTimeRange,
    expandTimeRange: expandTimeRange,
    dateFromTimex: dateFromTimex,
    timeFromTimex: timeFromTimex,
    dateRangeFromTimex: dateRangeFromTimex,
    timeRangeFromTimex: timeRangeFromTimex,
    timexTimeAdd: timexTimeAdd$1,
    timexDateTimeAdd: timexDateTimeAdd$1
};

// Copyright (c) Microsoft Corporation. All rights reserved.


const fixedFormatNumber = timexDateHelpers.fixedFormatNumber;


const formatDuration = function (timex) {
    if ('years' in timex) {
        return `P${timex.years}Y`;
    }
    if ('months' in timex) {
        return `P${timex.months}M`;
    }
    if ('weeks' in timex) {
        return `P${timex.weeks}W`;
    }
    if ('days' in timex) {
        return `P${timex.days}D`;
    }
    if ('hours' in timex) {
        return `PT${timex.hours}H`;
    }
    if ('minutes' in timex) {
        return `PT${timex.minutes}M`;
    }
    if ('seconds' in timex) {
        return `PT${timex.seconds}S`;
    }
    return '';
};

const formatTime = function (timex) {
    if (timex.minute === 0 && timex.second === 0) {
        return `T${fixedFormatNumber(timex.hour, 2)}`;
    }
    if (timex.second === 0) {
        return `T${fixedFormatNumber(timex.hour, 2)}:${fixedFormatNumber(timex.minute, 2)}`;
    }
    return `T${fixedFormatNumber(timex.hour, 2)}:${fixedFormatNumber(timex.minute, 2)}:${fixedFormatNumber(timex.second, 2)}`;
};

const formatDate = function (timex) {
    if ('year' in timex && 'month' in timex && 'dayOfMonth' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}-${fixedFormatNumber(timex.month, 2)}-${fixedFormatNumber(timex.dayOfMonth, 2)}`;
    }
    if ('month' in timex && 'dayOfMonth' in timex) {
        return `XXXX-${fixedFormatNumber(timex.month, 2)}-${fixedFormatNumber(timex.dayOfMonth, 2)}`;
    }
    if ('dayOfWeek' in timex) {
        return `XXXX-WXX-${timex.dayOfWeek}`;
    }
    return '';
};

const formatDateRange = function (timex) {
    if ('year' in timex && 'weekOfYear' in timex && 'weekend' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}-W${fixedFormatNumber(timex.weekOfYear, 2)}-WE`;
    }
    if ('year' in timex && 'weekOfYear' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}-W${fixedFormatNumber(timex.weekOfYear, 2)}`;
    }
    if ('year' in timex && 'season' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}-${timex.season}`;
    }
    if ('season' in timex) {
        return `${timex.season}`;
    }
    if ('year' in timex && 'month' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}-${fixedFormatNumber(timex.month, 2)}`;
    }
    if ('year' in timex) {
        return `${fixedFormatNumber(timex.year, 4)}`;
    }
    if ('month' in timex && 'weekOfMonth' in timex && 'dayOfWeek' in timex) {
        return `XXXX-${fixedFormatNumber(timex.month, 2)}-WXX-${timex.weekOfMonth}-${timex.dayOfWeek}`;
    }
    if ('month' in timex && 'weekOfMonth' in timex) {
        return `XXXX-${fixedFormatNumber(timex.month, 2)}-WXX-${timex.weekOfMonth}`;
    }
    if ('month' in timex) {
        return `XXXX-${fixedFormatNumber(timex.month, 2)}`;
    }
    return '';
};

const formatTimeRange = function (timex) {
    if ('partOfDay' in timex) {
        return `T${timex.partOfDay}`;
    }
    return '';
};

const format = function(timex) {

    const types = ('types' in timex) ? timex.types : timexInference.infer(timex);

    if (types.has('present')) {
        return 'PRESENT_REF';
    }
    if ((types.has('datetimerange') || types.has('daterange') || types.has('timerange')) && types.has('duration')) {
        const range = timexHelpers.expandDateTimeRange(timex);
        return `(${format(range.start)},${format(range.end)},${format(range.duration)})`;
    }
    if (types.has('datetimerange')) {
        return `${formatDate(timex)}${formatTimeRange(timex)}`;
    }
    if (types.has('daterange')) {
        return `${formatDateRange(timex)}`;
    }
    if (types.has('timerange')) {
        return `${formatTimeRange(timex)}`;
    }
    if (types.has('datetime')) {
        return `${formatDate(timex)}${formatTime(timex)}`;
    }
    if (types.has('duration')) {
        return `${formatDuration(timex)}`;
    }
    if (types.has('date')) {
        return `${formatDate(timex)}`;
    }
    if (types.has('time')) {
        return `${formatTime(timex)}`;
    }
    return '';
};

var format_1 = format;

var timexFormat = {
	format: format_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.

var days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

var months = [
    'January',
    'Februrary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

var dateAbbreviation = { 0: 'th', 1: 'st', 2: 'nd', 3: 'rd', 4: 'th', 5: 'th', 6: 'th', 7: 'th', 8: 'th', 9: 'th' };

var hours = [
    'midnight', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
    'midday',   '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'
];

var seasons = { SP: 'spring', SU: 'summer', FA: 'fall', WI: 'winter' };

var weeks = [ 'first', 'second', 'third', 'forth' ];

var dayParts = { DT: 'daytime', NI: 'night', MO: 'morning', AF: 'afternoon', EV: 'evening' };

var timexConstants = {
	days: days,
	months: months,
	dateAbbreviation: dateAbbreviation,
	hours: hours,
	seasons: seasons,
	weeks: weeks,
	dayParts: dayParts
};

// Copyright (c) Microsoft Corporation. All rights reserved.




const convertDate = function(timex) {
    if ('dayOfWeek' in timex) {
        return timexConstants.days[timex.dayOfWeek - 1];
    }
    const month = timexConstants.months[timex.month - 1];
    const date = timex.dayOfMonth.toString();
    const abbreviation = timexConstants.dateAbbreviation[date.slice(-1)];
    if ('year' in timex) {
        return `${date}${abbreviation} ${month} ${timex.year}`.trim();
    }
    return `${date}${abbreviation} ${month}`;
};

const convertTime = function(timex) {
    if (timex.hour === 0 && timex.minute === 0 && timex.second === 0) {
        return 'midnight';
    }
    if (timex.hour === 12 && timex.minute === 0 && timex.second === 0) {
        return 'midday';
    }
    const pad = function (s) { return (s.length === 1) ? '0' + s : s; };
    const hour = (timex.hour === 0) ? '12' : (timex.hour > 12) ? (timex.hour - 12).toString() : timex.hour.toString();
    const minute = (timex.minute === 0 && timex.second === 0) ? '' : ':' + pad(timex.minute.toString());
    const second = (timex.second === 0) ? '' : ':' + pad(timex.second.toString());
    const period = timex.hour < 12 ? 'AM' : 'PM';
    return `${hour}${minute}${second}${period}`;
};

const convertDurationPropertyToString = function (timex, property, includeSingleCount) {
    const propertyName = property + 's';
    const value = timex[propertyName];
    if (value !== undefined) {
        if (value === 1) {
            return includeSingleCount ? '1 ' + property : property;
        }
        else {
            return `${value} ${property}s`;
        }
    }
    return false;
};

const convertTimexDurationToString = function (timex, includeSingleCount) {
    return convertDurationPropertyToString(timex, 'year', includeSingleCount)
        || convertDurationPropertyToString(timex, 'month', includeSingleCount)
        || convertDurationPropertyToString(timex, 'week', includeSingleCount)
        || convertDurationPropertyToString(timex, 'day', includeSingleCount)
        || convertDurationPropertyToString(timex, 'hour', includeSingleCount)
        || convertDurationPropertyToString(timex, 'minute', includeSingleCount)
        || convertDurationPropertyToString(timex, 'second', includeSingleCount);
};

const convertDuration = function(timex) {
    return convertTimexDurationToString(timex, true);
};

const convertDateRange = function(timex) {
    const season = ('season' in timex) ? timexConstants.seasons[timex.season] : '';
    const year = ('year' in timex) ? timex.year.toString() : '';
    if ('weekOfYear' in timex) {
        if (timex.weekend) {
            return '';
        }
        else {
            return '';
        }
    }
    if ('month' in timex) {
        const month = `${timexConstants.months[timex.month - 1]}`;
        if ('weekOfMonth' in timex) {
            return `${timexConstants.weeks[timex.weekOfMonth - 1]} week of ${month}`;
        }
        else {
            return `${month} ${year}`.trim();
        }
    }
    return `${season} ${year}`.trim();
};

const convertTimeRange = function(timex) {
    return timexConstants.dayParts[timex.partOfDay];
};

const convertDateTime = function(timex) {
    return `${convertTime(timex)} ${convertDate(timex)}`;
};

const convertDateTimeRange = function(timex) {
    if (timex.types.has('timerange')) {
        return `${convertDate(timex)} ${convertTimeRange(timex)}`;
    }
    // date + time + duration
    // - OR - 
    // date + duration
    return '';
};

const convertTimexToString = function (timex) {

    const types = ('types' in timex) ? timex.types : timexInference.infer(timex);

    if (types.has('present')) {
        return 'now';
    }
    if (types.has('datetimerange')) {
        return convertDateTimeRange(timex);
    }
    if (types.has('daterange')) {
        return convertDateRange(timex);
    }
    if (types.has('duration')) {
        return convertDuration(timex);
    }
    if (types.has('timerange')) {
        return convertTimeRange(timex);
    }

    // TODO: where appropriate delegate most the formatting delegate to Date.toLocaleString(options)
    if (types.has('datetime')) {
        return convertDateTime(timex);
    }
    if (types.has('date')) {
        return convertDate(timex);
    }
    if (types.has('time')) {
        return convertTime(timex);
    }
    return '';
};

const convertTimexSetToString = function(timexSet) {

    const timex = timexSet.timex;
    if (timex.types.has('duration')) {
        return `every ${convertTimexDurationToString(timex, false)}`;
    }
    else {
        return `every ${convertTimexToString(timex)}`;
    }
};

var timexConvert$2 = {
    convertDate: convertDate,
    convertTime: convertTime,
    convertTimexToString: convertTimexToString,
    convertTimexSetToString: convertTimexSetToString
};

// Copyright (c) Microsoft Corporation. All rights reserved.



var timexConvert = {
    convertTimexToString: timexConvert$2.convertTimexToString,
    convertTimexSetToString: timexConvert$2.convertTimexSetToString
};

// Copyright (c) Microsoft Corporation. All rights reserved.






const getDateDay = function (day) {
    const index = (day === 0) ? 6 : day - 1;
    return timexConstants.days[index];
};

const convertDate$1 = function(timex, date) {
    if ('year' in timex && 'month' in timex && 'dayOfMonth' in timex) {
        const timexDate = new Date(timex.year, timex.month - 1, timex.dayOfMonth);

        if (timexDateHelpers.datePartEquals(timexDate, date)) {
            return 'today';
        }
        const tomorrow = timexDateHelpers.tomorrow(date);
        if (timexDateHelpers.datePartEquals(timexDate, tomorrow)) {
            return 'tomorrow';
        }
        const yesterday = timexDateHelpers.yesterday(date);
        if (timexDateHelpers.datePartEquals(timexDate, yesterday)) {
            return 'yesterday';
        }
        if (timexDateHelpers.isThisWeek(timexDate, date)) {
            return `this ${getDateDay(timexDate.getDay())}`;
        }
        if (timexDateHelpers.isNextWeek(timexDate, date)) {
            return `next ${getDateDay(timexDate.getDay())}`;
        }
        if (timexDateHelpers.isLastWeek(timexDate, date)) {
            return `last ${getDateDay(timexDate.getDay())}`;
        }
    }
    return timexConvert$2.convertDate(timex);
};

const convertDateTime$1 = function (timex, date) {
    return `${convertDate$1(timex, date)} ${timexConvert$2.convertTime(timex)}`;
};

const convertDateRange$1 = function(timex, date) {
    if ('year' in timex) {
        const year = date.getFullYear();
        if (timex.year === year) {
            if ('weekOfYear' in timex) {
                const thisWeek = timexDateHelpers.weekOfYear(date);
                if (thisWeek === timex.weekOfYear) {
                    return timex.weekend ? 'this weekend' : 'this week';
                }
                if (thisWeek === timex.weekOfYear + 1) {
                    return timex.weekend ? 'last weekend' : 'last week';
                }
                if (thisWeek === timex.weekOfYear - 1) {
                    return timex.weekend ? 'next weekend' : 'next week';
                }
            }
            if ('month' in timex) {
                const isoMonth = date.getMonth() + 1;
                if (timex.month === isoMonth) {
                    return 'this month';
                }
                if (timex.month === isoMonth + 1) {
                    return 'next month';
                }
                if (timex.month === isoMonth - 1) {
                    return 'last month';
                }
            }
            return ('season' in timex) ? `this ${timexConstants.seasons[timex.season]}` : 'this year';
        }
        if (timex.year === year + 1) {
            return ('season' in timex) ? `next ${timexConstants.seasons[timex.season]}` : 'next year';
        }
        if (timex.year === year - 1) {
            return ('season' in timex) ? `last ${timexConstants.seasons[timex.season]}` : 'last year';
        }
    }
    return '';
};

const convertDateTimeRange$1 = function(timex, date) {
    if ('year' in timex && 'month' in timex && 'dayOfMonth' in timex) {
        const timexDate = new Date(timex.year, timex.month - 1, timex.dayOfMonth);

        if ('partOfDay' in timex) {
            if (timexDateHelpers.datePartEquals(timexDate, date)) {
                if (timex.partOfDay === 'NI') {
                    return 'tonight';
                }
                else {
                    return `this ${timexConstants.dayParts[timex.partOfDay]}`;
                }
            }
            const tomorrow = timexDateHelpers.tomorrow(date);
            if (timexDateHelpers.datePartEquals(timexDate, tomorrow)) {
                return `tomorrow ${timexConstants.dayParts[timex.partOfDay]}`;
            }
            const yesterday = timexDateHelpers.yesterday(date);
            if (timexDateHelpers.datePartEquals(timexDate, yesterday)) {
                return `yesterday ${timexConstants.dayParts[timex.partOfDay]}`;
            }

            if (timexDateHelpers.isNextWeek(timexDate, date)) {
                return `next ${getDateDay(timexDate.getDay())} ${timexConstants.dayParts[timex.partOfDay]}`;
            }

            if (timexDateHelpers.isLastWeek(timexDate, date)) {
                return `last ${getDateDay(timexDate.getDay())} ${timexConstants.dayParts[timex.partOfDay]}`;
            }
        }
    }
    return '';
};

const convertTimexToStringRelative$1 = function (timex, date) {

    const types = ('types' in timex) ? timex.types : timexInference.infer(timex);
    
    if (types.has('datetimerange')) {
        return convertDateTimeRange$1(timex, date);
    }
    if (types.has('daterange')) {
        return convertDateRange$1(timex, date);
    }
    if (types.has('datetime')) {
        return convertDateTime$1(timex, date);
    }
    if (types.has('date')) {
        return convertDate$1(timex, date);
    }

    return timexConvert$2.convertTimexToString(timex);
};

var convertTimexToStringRelative_1 = convertTimexToStringRelative$1;

var timexRelativeConvert$2 = {
	convertTimexToStringRelative: convertTimexToStringRelative_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.

var convertTimexToStringRelative = timexRelativeConvert$2.convertTimexToStringRelative;

var timexRelativeConvert = {
	convertTimexToStringRelative: convertTimexToStringRelative
};

// Copyright (c) Microsoft Corporation. All rights reserved.







class TimexProperty {
    constructor (timex) {
        if (typeof timex === 'string') {
            timexParsing.parseString(timex, this);
        }
        else {
            timexParsing.fromObject(timex, this);
        }
        // TODO: constructing a Timex from a Timex should be very cheap
    }

    get timex() {
        return timexFormat.format(this);
    }

    get types () {
        return timexInference.infer(this);
    }

    toString () {
        return timexConvert.convertTimexToString(this);
    }

    // TODO: consider [locales[, options]] similar to Date.toLocaleString([locales[, options]])
    toNaturalLanguage (referenceDate) {
        return timexRelativeConvert.convertTimexToStringRelative(this, referenceDate);
    }

    static fromDate (date) {
        return new TimexProperty({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dayOfMonth: date.getDate()
        });
    }
    
    static fromDateTime (date) {
        return new TimexProperty({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dayOfMonth: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        });
    }
    
    static fromTime (time) {
        return new TimexProperty(time);
    }
}

var TimexProperty_1 = TimexProperty;

var timexProperty = {
	TimexProperty: TimexProperty_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const TimexProperty$1 = timexProperty.TimexProperty;

class TimexSet {
    constructor (timex) {
        this.timex = new TimexProperty$1(timex);
    }
}

var TimexSet_1 = TimexSet;

var timexSet = {
	TimexSet: TimexSet_1
};

// Copyright (c) Microsoft Corporation. All rights reserved.



const TimexProperty$2 = timexProperty.TimexProperty;

const today = function (date) {
    return TimexProperty$2.fromDate(date || new Date()).timex;
};

const tomorrow$1 = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    d.setDate(d.getDate() + 1);
    return TimexProperty$2.fromDate(d).timex;
};

const yesterday$1 = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    d.setDate(d.getDate() - 1);
    return TimexProperty$2.fromDate(d).timex;
};

const weekFromToday = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(d), { days: 7 }))).timex;
};

const weekBackFromToday = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    d.setDate(d.getDate() - 7);
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(d), { days: 7 }))).timex;
};

const thisWeek = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    d.setDate(d.getDate() - 7);
    const start = timexDateHelpers.dateOfNextDay(1, d);
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(start), { days: 7 }))).timex;
};

const nextWeek = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    const start = timexDateHelpers.dateOfNextDay(1, d);
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(start), { days: 7 }))).timex;
};

const lastWeek = function (date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    const start = timexDateHelpers.dateOfLastDay(1, d);
    start.setDate(start.getDate() - 7);
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(start), { days: 7 }))).timex;
};

const nextWeeksFromToday = function (n, date) {
    const d = (date === undefined) ? new Date() : new Date(date.getTime());
    return (new TimexProperty$2(Object.assign(TimexProperty$2.fromDate(d), { days: 7 * n }))).timex;
};

// The following constants are consistent with the Recognizer results
const monday = 'XXXX-WXX-1';
const tuesday = 'XXXX-WXX-2';
const wednesday = 'XXXX-WXX-3';
const thursday = 'XXXX-WXX-4';
const friday = 'XXXX-WXX-5';
const saturday = 'XXXX-WXX-6';
const sunday = 'XXXX-WXX-7';
const morning = '(T08,T12,PT4H)';
const afternoon = '(T12,T16,PT4H)';
const evening = '(T16,T20,PT4H)';
const daytime = '(T08,T18,PT10H)';

var timexCreator = {
    today: today,
    tomorrow: tomorrow$1,
    yesterday: yesterday$1,
    weekFromToday: weekFromToday,
    weekBackFromToday: weekBackFromToday,
    thisWeek: thisWeek,
    nextWeek: nextWeek,
    lastWeek: lastWeek,
    nextWeeksFromToday: nextWeeksFromToday,
    monday: monday,
    tuesday: tuesday,
    wednesday: wednesday,
    thursday: thursday,
    friday: friday,
    saturday: saturday,
    sunday: sunday,
    morning: morning,
    afternoon: afternoon,
    evening: evening,
    daytime: daytime
};

// Copyright (c) Microsoft Corporation. All rights reserved.

const isOverlapping = function (r1, r2) {
    return r1.end.getTime() > r2.start.getTime() && r1.start.getTime() <= r2.start.getTime()
        || r1.start.getTime() < r2.end.getTime() && r1.start.getTime() >= r2.start.getTime();
};

const collapseOverlapping = function (r1, r2, T) {
    return {
        start: new T(Math.max(r1.start.getTime(), r2.start.getTime())),
        end: new T(Math.min(r1.end.getTime(), r2.end.getTime()))
    };
};

const innerCollapse = function (ranges, T) {
    if (ranges.length === 1) {
        return false;
    }
    for (let i=0; i<ranges.length; i++) {
        const r1 = ranges[i];
        for (let j=i+1; j<ranges.length; j++) {
            const r2 = ranges[j];
            if (isOverlapping(r1, r2)) {
                ranges.splice(i, 1);
                ranges.splice(j - 1, 1);
                ranges.push(collapseOverlapping(r1, r2, T));
                return true;
            }
        }
    }
    return false;
};

const collapse = function (ranges, T) {
    const r = ranges.slice(0);
    while (innerCollapse(r, T))
        ;
    r.sort((a, b) => a.start.getTime() - b.start.getTime());
    return r;
};

var timexConstraintsHelper = {
    collapse: collapse,
    isOverlapping: isOverlapping
};

// Copyright (c) Microsoft Corporation. All rights reserved.




const Time$2 = time.Time;
const TimexProperty$3 = timexProperty.TimexProperty;

const resolveDefiniteAgainstConstraint = function (timex, constraint) {
    const timexDate = timexHelpers.dateFromTimex(timex);
    if (timexDate.getTime() >= constraint.start.getTime() && timexDate.getTime() < constraint.end.getTime()) {
        return [ timex.timex ];
    }
    return [];
};

const resolveDateAgainstConstraint = function (timex, constraint) {
    if ('month' in timex && 'dayOfMonth' in timex) {
        const result = [];
        for (let year = constraint.start.getFullYear(); year <= constraint.end.getFullYear(); year++) {
            const r = resolveDefiniteAgainstConstraint(new TimexProperty$3(Object.assign({}, timex, { year: year })), constraint);
            if (r.length > 0) {
                result.push(r[0]);
            }
        }
        return result;
    }
    if ('dayOfWeek' in timex) {
        const day = timex.dayOfWeek === 7 ? 0 : timex.dayOfWeek;
        const dates = timexDateHelpers.datesMatchingDay(day, constraint.start, constraint.end);
        const result = [];
        for (const d of dates) {
            const t = Object.assign({}, timex);
            delete t.dayOfWeek;
            const r = new TimexProperty$3(Object.assign({}, t, { year: d.getFullYear(), month: d.getMonth() + 1, dayOfMonth: d.getDate() }));
            result.push(r.timex);
        }
        return result;
    }
    return [];
};

const resolveDate = function (timex, constraints) {
    const result = [];
    for (const constraint of constraints) {
        Array.prototype.push.apply(result, resolveDateAgainstConstraint(timex, constraint));
    }
    return result;
};

const resolveTimeAgainstConstraint = function (timex, constraint) {
    const t = new Time$2(timex.hour, timex.minute, timex.second);
    if (t.getTime() >= constraint.start.getTime() && t.getTime() < constraint.end.getTime()) {
        return [ timex.timex ];
    }
    return [];
};

const resolveTime = function (timex, constraints) {
    const result = [];
    for (const constraint of constraints) {
        Array.prototype.push.apply(result, resolveTimeAgainstConstraint(timex, constraint));
    }
    return result;
};

const removeDuplicates = function (array) {
    var seen = new Set();
    return array.filter(item => { return seen.has(item) ? false : seen.add(item); });
};

const resolveByDateRangeConstraints = function (candidates, timexConstraints) {
    
    const dateRangeConstraints = timexConstraints
        .filter((timex) => {
            return timex.types.has('daterange'); })
        .map((timex) => {
            return timexHelpers.dateRangeFromTimex(timex);
        });
    const collapsedDateRanges = timexConstraintsHelper.collapse(dateRangeConstraints, Date);

    if (collapsedDateRanges.length === 0) {
        return candidates;
    }

    const resolution = [];
    for (const timex of candidates) {
        const r = resolveDate(new TimexProperty$3(timex), collapsedDateRanges);
        Array.prototype.push.apply(resolution, r);        
    }

    return removeDuplicates(resolution);
};

const resolveByTimeConstraints = function (candidates, timexConstraints) {
    
    const times = timexConstraints
        .filter((timex) => {
            return timex.types.has('time'); })
        .map((timex) => {
            return timexHelpers.timeFromTimex(timex);
        });

    if (times.length === 0) {
        return candidates;
    }

    const resolution = [];
    for (const timex of candidates.map(t => new TimexProperty$3(t))) {
        if (timex.types.has('date') && !timex.types.has('time')) {
            for (const time$$2 of times) {
                timex.hour = time$$2.hour;
                timex.minute = time$$2.minute;
                timex.second = time$$2.second;
                resolution.push(timex.timex);
            }
        }
        else {
            resolution.push(timex.timex);
        }
    }
    return removeDuplicates(resolution);
};

const resolveByTimeRangeConstraints = function (candidates, timexConstraints) {

    const timeRangeConstraints = timexConstraints
        .filter((timex) => {
            return timex.types.has('timerange'); })
        .map((timex) => {
            return timexHelpers.timeRangeFromTimex(timex);
        });
    const collapsedTimeRanges = timexConstraintsHelper.collapse(timeRangeConstraints, Time$2);

    if (collapsedTimeRanges.length === 0) {
        return candidates;
    }

    const resolution = [];
    for (const timex of candidates) {
        const t = new TimexProperty$3(timex);
        if (t.types.has('timerange')) {
            const r = resolveTimeRange(t, collapsedTimeRanges);
            Array.prototype.push.apply(resolution, r);
        }
        else if (t.types.has('time')) {
            const r = resolveTime(t, collapsedTimeRanges);
            Array.prototype.push.apply(resolution, r);
        }
    }

    return removeDuplicates(resolution);
};

const resolveTimeRange = function (timex, constraints) {

    const candidate = timexHelpers.timeRangeFromTimex(timex);

    const result = [];
    for (const constraint of constraints) {

        if (timexConstraintsHelper.isOverlapping(candidate, constraint)) {

            const start = Math.max(candidate.start.getTime(), constraint.start.getTime());
            const time$$2 = new Time$2(start);

            // TODO: refer to comments in C# - consider first classing this clone/overwrite behavior
            const resolved = new TimexProperty$3(timex.timex);
            delete resolved.partOfDay;
            delete resolved.seconds;
            delete resolved.minutes;
            delete resolved.hours;
            resolved.second = time$$2.second;
            resolved.minute = time$$2.minute;
            resolved.hour = time$$2.hour;

            result.push(resolved.timex);
        }
    }
    return result;
};

const resolveDuration = function (candidate, constraints) {
    const results = [];
    for (const constraint of constraints) {
        if (constraint.types.has('datetime')) {
            results.push(new TimexProperty$3(timexHelpers.timexDateTimeAdd(constraint, candidate)));
        }
        else if (constraint.types.has('time')) {
            results.push(new TimexProperty$3(timexHelpers.timexTimeAdd(constraint, candidate)));
        }
    }
    return results;
};

const resolveDurations = function (candidates, constraints) {
    const results = [];
    for (const candidate of candidates) {
        const timex = new TimexProperty$3(candidate);
        if (timex.types.has('duration')) {
            const r = resolveDuration(timex, constraints);
            for (const resolved of r) {
                results.push(resolved.timex);
            }
        }
        else {
            results.push(candidate);
        }
    }
    return results;
};

const evaluate = function (candidates, constraints) {
    const timexConstraints = constraints.map((x) => { return new TimexProperty$3(x); });
    const candidatesWithDurationsResolved = resolveDurations(candidates, timexConstraints);
    const candidatesAccordingToDate = resolveByDateRangeConstraints(candidatesWithDurationsResolved, timexConstraints);
    const candidatesWithAddedTime = resolveByTimeConstraints(candidatesAccordingToDate, timexConstraints);
    const candidatesFilteredByTime = resolveByTimeRangeConstraints(candidatesWithAddedTime, timexConstraints);
    const timexResults = candidatesFilteredByTime.map((x) => { return new TimexProperty$3(x); });
    return timexResults;
};

var timexRangeResolver = {
    evaluate: evaluate
};

// Copyright (c) Microsoft Corporation. All rights reserved.

var datatypesDateTime = {
    Time: time.Time,
    TimexProperty: timexProperty.TimexProperty,
    TimexSet: timexSet.TimexSet,
    creator: timexCreator,
    resolver: timexRangeResolver
};

var datatypesDateTime_1 = datatypesDateTime.Time;
var datatypesDateTime_2 = datatypesDateTime.TimexProperty;
var datatypesDateTime_3 = datatypesDateTime.TimexSet;
var datatypesDateTime_4 = datatypesDateTime.creator;
var datatypesDateTime_5 = datatypesDateTime.resolver;

exports['default'] = datatypesDateTime;
exports.Time = datatypesDateTime_1;
exports.TimexProperty = datatypesDateTime_2;
exports.TimexSet = datatypesDateTime_3;
exports.creator = datatypesDateTime_4;
exports.resolver = datatypesDateTime_5;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=recognizers-text-data-types-timex-expression.umd.js.map
