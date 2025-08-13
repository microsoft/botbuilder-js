'use strict';

var recognizersText = require('../recognizers-text');
var recognizersTextNumber = require('../recognizers-number');
var recognizersTextNumberWithUnit = require('../recognizers-number-with-unit');
var isEqual = require("lodash/isEqual");
var toNumber = require("lodash/toNumber");

var DateTimeModelResult = class extends recognizersText.ModelResult {
};
var DateTimeModel = class {
  constructor(parser, extractor) {
    this.modelTypeName = "datetime";
    this.extractor = extractor;
    this.parser = parser;
  }
  parse(query, referenceDate = /* @__PURE__ */ new Date()) {
    query = recognizersText.FormatUtility.preProcess(query);
    let extractResults = this.extractor.extract(query, referenceDate);
    let parseDates = new Array();
    for (let result of extractResults) {
      let parseResult = this.parser.parse(result, referenceDate);
      if (Array.isArray(parseResult.value)) {
        parseDates.push(...parseResult.value);
      } else {
        parseDates.push(parseResult);
      }
    }
    return parseDates.map((o) => ({
      start: o.start,
      end: o.start + o.length - 1,
      resolution: o.value,
      // TODO: convert to proper resolution
      text: o.text,
      typeName: o.type
    }));
  }
};

// recognizers/recognizers-date-time/src/resources/baseDateTime.ts
exports.BaseDateTime = void 0;
((BaseDateTime2) => {
  BaseDateTime2.HourRegex = `(?<hour>00|01|02|03|04|05|06|07|08|09|0|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|1|2|3|4|5|6|7|8|9)(h)?`;
  BaseDateTime2.MinuteRegex = `(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)(?!\\d)`;
  BaseDateTime2.DeltaMinuteRegex = `(?<deltamin>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
  BaseDateTime2.SecondRegex = `(?<sec>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
  BaseDateTime2.FourDigitYearRegex = `\\b(?<![$])(?<year>((1\\d|20)\\d{2})|2100)(?!\\.0\\b)\\b`;
  BaseDateTime2.IllegalYearRegex = `([-])(${BaseDateTime2.FourDigitYearRegex})([-])`;
  BaseDateTime2.MinYearNum = "1500";
  BaseDateTime2.MaxYearNum = "2100";
  BaseDateTime2.MaxTwoDigitYearFutureNum = "30";
  BaseDateTime2.MinTwoDigitYearPastNum = "70";
  BaseDateTime2.DayOfMonthDictionary = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["13", 13], ["14", 14], ["15", 15], ["16", 16], ["17", 17], ["18", 18], ["19", 19], ["20", 20], ["21", 21], ["22", 22], ["23", 23], ["24", 24], ["25", 25], ["26", 26], ["27", 27], ["28", 28], ["29", 29], ["30", 30], ["31", 31], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9]]);
  BaseDateTime2.VariableHolidaysTimexDictionary = /* @__PURE__ */ new Map([["fathers", "-06-WXX-7-3"], ["mothers", "-05-WXX-7-2"], ["thanksgiving", "-11-WXX-4-4"], ["martinlutherking", "-01-WXX-1-3"], ["washingtonsbirthday", "-02-WXX-1-3"], ["canberra", "-03-WXX-1-1"], ["labour", "-09-WXX-1-1"], ["columbus", "-10-WXX-1-2"], ["memorial", "-05-WXX-1-4"]]);
})(exports.BaseDateTime || (exports.BaseDateTime = {}));

// recognizers/recognizers-date-time/src/dateTime/constants.ts
var Constants = class {
};
Constants.SYS_DATETIME_DATE = "date";
Constants.SYS_DATETIME_TIME = "time";
Constants.SYS_DATETIME_DATEPERIOD = "daterange";
Constants.SYS_DATETIME_DATETIME = "datetime";
Constants.SYS_DATETIME_TIMEPERIOD = "timerange";
Constants.SYS_DATETIME_DATETIMEPERIOD = "datetimerange";
Constants.SYS_DATETIME_DURATION = "duration";
Constants.SYS_DATETIME_SET = "set";
// key
Constants.TimexKey = "timex";
Constants.ModKey = "Mod";
Constants.TypeKey = "type";
Constants.IsLunarKey = "isLunar";
Constants.ResolveKey = "resolve";
Constants.ResolveToPastKey = "resolveToPast";
Constants.ResolveToFutureKey = "resolveToFuture";
Constants.CommentKey = "Comment";
Constants.CommentAmPm = "ampm";
Constants.SemesterMonthCount = 6;
Constants.TrimesterMonthCount = 3;
Constants.FourDigitsYearLength = 4;
Constants.DefaultLanguageFallback_MDY = "MDY";
Constants.DefaultLanguageFallback_DMY = "DMY";
Constants.MinYearNum = parseInt(exports.BaseDateTime.MinYearNum);
Constants.MaxYearNum = parseInt(exports.BaseDateTime.MaxYearNum);
Constants.MaxTwoDigitYearFutureNum = parseInt(exports.BaseDateTime.MaxTwoDigitYearFutureNum);
Constants.MinTwoDigitYearPastNum = parseInt(exports.BaseDateTime.MinTwoDigitYearPastNum);
// Mod Value
// "before" -> To mean "preceding in time". I.e. Does not include the extracted datetime entity in the resolution's ending point. Equivalent to "<"
Constants.BEFORE_MOD = "before";
// "after" -> To mean "following in time". I.e. Does not include the extracted datetime entity in the resolution's starting point. Equivalent to ">"
Constants.AFTER_MOD = "after";
// "since" -> Same as "after", but including the extracted datetime entity. Equivalent to ">="
Constants.SINCE_MOD = "since";
// "until" -> Same as "before", but including the extracted datetime entity. Equivalent to "<="
Constants.UNTIL_MOD = "until";
Constants.EARLY_MOD = "start";
Constants.MID_MOD = "mid";
Constants.LATE_MOD = "end";
Constants.MORE_THAN_MOD = "more";
Constants.LESS_THAN_MOD = "less";
Constants.REF_UNDEF_MOD = "ref_undef";
var TimeTypeConstants = class {
};
TimeTypeConstants.DATE = "date";
TimeTypeConstants.START_DATE = "startDate";
TimeTypeConstants.END_DATE = "endDate";
TimeTypeConstants.DATETIME = "dateTime";
TimeTypeConstants.START_DATETIME = "startDateTime";
TimeTypeConstants.END_DATETIME = "endDateTime";
TimeTypeConstants.DURATION = "duration";
TimeTypeConstants.SET = "set";
TimeTypeConstants.TIME = "time";
TimeTypeConstants.VALUE = "value";
TimeTypeConstants.START_TIME = "startTime";
TimeTypeConstants.END_TIME = "endTime";
TimeTypeConstants.START = "start";
TimeTypeConstants.END = "end";
TimeTypeConstants.beforeMod = "before";
TimeTypeConstants.afterMod = "after";
TimeTypeConstants.sinceMod = "since";
TimeTypeConstants.moreThanMod = "more";
TimeTypeConstants.lessThanMod = "less";
var Token = class {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  get length() {
    return this.end - this.start;
  }
  static mergeAllTokens(tokens, source, extractorName) {
    let ret = [];
    let mergedTokens = [];
    tokens = tokens.sort((a, b) => {
      return a.start < b.start ? -1 : 1;
    });
    tokens.forEach((token) => {
      if (token) {
        let bAdd = true;
        for (let index = 0; index < mergedTokens.length && bAdd; index++) {
          let mergedToken = mergedTokens[index];
          if (token.start >= mergedToken.start && token.end <= mergedToken.end) {
            bAdd = false;
          }
          if (token.start > mergedToken.start && token.start < mergedToken.end) {
            bAdd = false;
          }
          if (token.start <= mergedToken.start && token.end >= mergedToken.end) {
            bAdd = false;
            mergedTokens[index] = token;
          }
        }
        if (bAdd) {
          mergedTokens.push(token);
        }
      }
    });
    mergedTokens.forEach((token) => {
      ret.push({
        start: token.start,
        length: token.length,
        text: source.substr(token.start, token.length),
        type: extractorName
      });
    });
    return ret;
  }
};
var AgoLaterMode = /* @__PURE__ */ ((AgoLaterMode2) => {
  AgoLaterMode2[AgoLaterMode2["Date"] = 0] = "Date";
  AgoLaterMode2[AgoLaterMode2["DateTime"] = 1] = "DateTime";
  return AgoLaterMode2;
})(AgoLaterMode || {});
var AgoLaterUtil = class _AgoLaterUtil {
  static extractorDurationWithBeforeAndAfter(source, er, ret, config) {
    let pos = er.start + er.length;
    if (pos <= source.length) {
      let afterString = source.substring(pos);
      let beforeString = source.substring(0, er.start);
      let value = MatchingUtil.getAgoLaterIndex(afterString, config.agoRegex);
      if (value.matched) {
        ret.push(new Token(er.start, er.start + er.length + value.index));
      } else {
        value = MatchingUtil.getAgoLaterIndex(afterString, config.laterRegex);
        if (value.matched) {
          ret.push(new Token(er.start, er.start + er.length + value.index));
        } else {
          value = MatchingUtil.getInIndex(beforeString, config.inConnectorRegex);
          if (recognizersText.RegExpUtility.getMatches(config.rangeUnitRegex, er.text).length > 0) return ret;
          if (value.matched && er.start && er.length && er.start >= value.index) {
            ret.push(new Token(er.start - value.index, er.start + er.length));
          }
        }
      }
    }
    return ret;
  }
  static parseDurationWithAgoAndLater(source, referenceDate, durationExtractor, durationParser, unitMap, unitRegex, utilityConfiguration, mode) {
    let result = new DateTimeResolutionResult();
    let duration = durationExtractor.extract(source, referenceDate).pop();
    if (!duration) return result;
    let pr = durationParser.parse(duration, referenceDate);
    if (!pr) return result;
    let match = recognizersText.RegExpUtility.getMatches(unitRegex, source).pop();
    if (!match) return result;
    let afterStr = source.substr(duration.start + duration.length);
    let beforeStr = source.substr(0, duration.start);
    let srcUnit = match.groups("unit").value;
    let durationResult = pr.value;
    let numStr = durationResult.timex.substr(0, durationResult.timex.length - 1).replace("P", "").replace("T", "");
    let num = Number.parseInt(numStr, 10);
    if (!num) return result;
    return _AgoLaterUtil.getAgoLaterResult(pr, num, unitMap, srcUnit, afterStr, beforeStr, referenceDate, utilityConfiguration, mode);
  }
  static getAgoLaterResult(durationParseResult, num, unitMap, srcUnit, afterStr, beforeStr, referenceDate, utilityConfiguration, mode) {
    let result = new DateTimeResolutionResult();
    let unitStr = unitMap.get(srcUnit);
    if (!unitStr) return result;
    num.toString();
    let containsAgo = MatchingUtil.containsAgoLaterIndex(afterStr, utilityConfiguration.agoRegex);
    let containsLaterOrIn = MatchingUtil.containsAgoLaterIndex(afterStr, utilityConfiguration.laterRegex) || MatchingUtil.containsInIndex(beforeStr, utilityConfiguration.inConnectorRegex);
    if (containsAgo) {
      result = _AgoLaterUtil.getDateResult(unitStr, num, referenceDate, false, mode);
      durationParseResult.value.mod = TimeTypeConstants.beforeMod;
      result.subDateTimeEntities = [durationParseResult];
      return result;
    }
    if (containsLaterOrIn) {
      result = _AgoLaterUtil.getDateResult(unitStr, num, referenceDate, true, mode);
      durationParseResult.value.mod = TimeTypeConstants.afterMod;
      result.subDateTimeEntities = [durationParseResult];
      return result;
    }
    return result;
  }
  static getDateResult(unitStr, num, referenceDate, isFuture, mode) {
    let value = new Date(referenceDate);
    let result = new DateTimeResolutionResult();
    let swift = isFuture ? 1 : -1;
    switch (unitStr) {
      case "D":
        value.setDate(referenceDate.getDate() + num * swift);
        break;
      case "W":
        value.setDate(referenceDate.getDate() + num * swift * 7);
        break;
      case "MON":
        value.setMonth(referenceDate.getMonth() + num * swift);
        break;
      case "Y":
        value.setFullYear(referenceDate.getFullYear() + num * swift);
        break;
      case "H":
        value.setHours(referenceDate.getHours() + num * swift);
        break;
      case "M":
        value.setMinutes(referenceDate.getMinutes() + num * swift);
        break;
      case "S":
        value.setSeconds(referenceDate.getSeconds() + num * swift);
        break;
      default:
        return result;
    }
    result.timex = mode === 0 /* Date */ ? FormatUtil.luisDateFromDate(value) : FormatUtil.luisDateTime(value);
    result.futureValue = value;
    result.pastValue = value;
    result.success = true;
    return result;
  }
};
var MatchingUtil = class {
  static getAgoLaterIndex(source, regex) {
    let result = { matched: false, index: -1 };
    let referencedMatches = recognizersText.RegExpUtility.getMatches(regex, source.trim().toLowerCase());
    if (referencedMatches && referencedMatches.length > 0 && referencedMatches[0].index === 0) {
      result.index = source.toLowerCase().indexOf(referencedMatches[0].value) + referencedMatches[0].length;
      result.matched = true;
    }
    return result;
  }
  static getInIndex(source, regex) {
    let result = { matched: false, index: -1 };
    let referencedMatch = recognizersText.RegExpUtility.getMatches(regex, source.trim().toLowerCase().split(" ").pop());
    if (referencedMatch && referencedMatch.length > 0) {
      result.index = source.length - source.toLowerCase().lastIndexOf(referencedMatch[0].value);
      result.matched = true;
    }
    return result;
  }
  static containsAgoLaterIndex(source, regex) {
    return this.getAgoLaterIndex(source, regex).matched;
  }
  static containsInIndex(source, regex) {
    return this.getInIndex(source, regex).matched;
  }
};
var _FormatUtil = class _FormatUtil {
  // Emulates .NET ToString("D{size}")
  static toString(num, size) {
    let s = "000000" + (num || "");
    return s.substr(s.length - size);
  }
  static luisDate(year, month, day) {
    if (year === -1) {
      if (month === -1) {
        return new Array("XXXX", "XX", _FormatUtil.toString(day, 2)).join("-");
      }
      return new Array("XXXX", _FormatUtil.toString(month + 1, 2), _FormatUtil.toString(day, 2)).join("-");
    }
    return new Array(_FormatUtil.toString(year, 4), _FormatUtil.toString(month + 1, 2), _FormatUtil.toString(day, 2)).join("-");
  }
  static luisDateFromDate(date) {
    return _FormatUtil.luisDate(date.getFullYear(), date.getMonth(), date.getDate());
  }
  static luisTime(hour, min, second) {
    return new Array(_FormatUtil.toString(hour, 2), _FormatUtil.toString(min, 2), _FormatUtil.toString(second, 2)).join(":");
  }
  static luisTimeFromDate(time) {
    return _FormatUtil.luisTime(time.getHours(), time.getMinutes(), time.getSeconds());
  }
  static luisDateTime(time) {
    return `${_FormatUtil.luisDateFromDate(time)}T${_FormatUtil.luisTimeFromDate(time)}`;
  }
  static formatDate(date) {
    return new Array(
      _FormatUtil.toString(date.getFullYear(), 4),
      _FormatUtil.toString(date.getMonth() + 1, 2),
      _FormatUtil.toString(date.getDate(), 2)
    ).join("-");
  }
  static formatTime(time) {
    return new Array(
      _FormatUtil.toString(time.getHours(), 2),
      _FormatUtil.toString(time.getMinutes(), 2),
      _FormatUtil.toString(time.getSeconds(), 2)
    ).join(":");
  }
  static formatDateTime(datetime) {
    return `${_FormatUtil.formatDate(datetime)} ${_FormatUtil.formatTime(datetime)}`;
  }
  static shortTime(hour, minute, second) {
    if (minute < 0 && second < 0) {
      return `T${_FormatUtil.toString(hour, 2)}`;
    } else if (second < 0) {
      return `T${_FormatUtil.toString(hour, 2)}:${_FormatUtil.toString(minute, 2)}`;
    }
    return `T${_FormatUtil.toString(hour, 2)}:${_FormatUtil.toString(minute, 2)}:${_FormatUtil.toString(second, 2)}`;
  }
  static luisTimeSpan(from, to) {
    let result = "PT";
    let span = DateUtils.totalHoursFloor(from, to);
    if (span > 0) {
      result = `${result}${span}H`;
    }
    span = DateUtils.totalMinutesFloor(from, to) - span * 60;
    if (span > 0 && span < 60) {
      result = `${result}${span}M`;
    }
    span = DateUtils.totalSeconds(from, to) - span * 60;
    if (span > 0 && span < 60) {
      result = `${result}${span}S`;
    }
    return result;
  }
  static allStringToPm(timeStr) {
    let matches = recognizersText.RegExpUtility.getMatches(_FormatUtil.HourTimexRegex, timeStr);
    let split = Array();
    let lastPos = 0;
    matches.forEach((match) => {
      if (lastPos !== match.index) split.push(timeStr.substring(lastPos, match.index));
      split.push(timeStr.substring(match.index, match.index + match.length));
      lastPos = match.index + match.length;
    });
    if (timeStr.substring(lastPos)) {
      split.push(timeStr.substring(lastPos));
    }
    for (let i = 0; i < split.length; i += 1) {
      if (recognizersText.RegExpUtility.getMatches(_FormatUtil.HourTimexRegex, split[i]).length > 0) {
        split[i] = _FormatUtil.toPm(split[i]);
      }
    }
    return split.join("");
  }
  static toPm(timeStr) {
    let hasT = false;
    if (timeStr.startsWith("T")) {
      hasT = true;
      timeStr = timeStr.substring(1);
    }
    let split = timeStr.split(":");
    let hour = parseInt(split[0], 10);
    hour = hour === 12 ? 0 : hour + 12;
    split[0] = _FormatUtil.toString(hour, 2);
    return (hasT ? "T" : "") + split.join(":");
  }
};
_FormatUtil.HourTimexRegex = recognizersText.RegExpUtility.getSafeRegExp(String.raw`(?<!P)T\d{2}`, "gis");
var FormatUtil = _FormatUtil;
var DateTimeResolutionResult = class {
  constructor() {
    this.success = false;
  }
};
var DayOfWeek = /* @__PURE__ */ ((DayOfWeek2) => {
  DayOfWeek2[DayOfWeek2["Sunday"] = 0] = "Sunday";
  DayOfWeek2[DayOfWeek2["Monday"] = 1] = "Monday";
  DayOfWeek2[DayOfWeek2["Tuesday"] = 2] = "Tuesday";
  DayOfWeek2[DayOfWeek2["Wednesday"] = 3] = "Wednesday";
  DayOfWeek2[DayOfWeek2["Thursday"] = 4] = "Thursday";
  DayOfWeek2[DayOfWeek2["Friday"] = 5] = "Friday";
  DayOfWeek2[DayOfWeek2["Saturday"] = 6] = "Saturday";
  return DayOfWeek2;
})(DayOfWeek || {});
var _DateUtils = class _DateUtils {
  static next(from, dayOfWeek) {
    let start = from.getDay();
    let target = dayOfWeek;
    if (start === 0) start = 7;
    if (target === 0) target = 7;
    let result = new Date(from);
    result.setDate(from.getDate() + target - start + 7);
    return result;
  }
  static this(from, dayOfWeek) {
    let start = from.getDay();
    let target = dayOfWeek;
    if (start === 0) start = 7;
    if (target === 0) target = 7;
    let result = new Date(from);
    result.setDate(from.getDate() + target - start);
    return result;
  }
  static last(from, dayOfWeek) {
    let start = from.getDay();
    let target = dayOfWeek;
    if (start === 0) start = 7;
    if (target === 0) target = 7;
    let result = new Date(from);
    result.setDate(from.getDate() + target - start - 7);
    return result;
  }
  static diffDays(from, to) {
    return Math.round(Math.abs((from.getTime() - to.getTime()) / this.oneDay));
  }
  static totalHours(from, to) {
    let fromEpoch = from.getTime() - from.getTimezoneOffset() * 60 * 1e3;
    let toEpoch = to.getTime() - to.getTimezoneOffset() * 60 * 1e3;
    return Math.round(Math.abs(fromEpoch - toEpoch - 1e-5) / this.oneHour);
  }
  static totalHoursFloor(from, to) {
    let fromEpoch = from.getTime() - from.getTimezoneOffset() * this.oneMinute;
    let toEpoch = to.getTime() - to.getTimezoneOffset() * this.oneMinute;
    return Math.floor(Math.abs(fromEpoch - toEpoch) / this.oneHour);
  }
  static totalMinutesFloor(from, to) {
    let fromEpoch = from.getTime() - from.getTimezoneOffset() * this.oneMinute;
    let toEpoch = to.getTime() - to.getTimezoneOffset() * this.oneMinute;
    return Math.floor(Math.abs(fromEpoch - toEpoch) / this.oneMinute);
  }
  static totalSeconds(from, to) {
    let fromEpoch = from.getTime() - from.getTimezoneOffset() * 60 * 1e3;
    let toEpoch = to.getTime() - to.getTimezoneOffset() * 60 * 1e3;
    return Math.round(Math.abs(fromEpoch - toEpoch) / this.oneSecond);
  }
  static addTime(seedDate, timeToAdd) {
    let date = new Date(seedDate);
    date.setHours(seedDate.getHours() + timeToAdd.getHours());
    date.setMinutes(seedDate.getMinutes() + timeToAdd.getMinutes());
    date.setSeconds(seedDate.getSeconds() + timeToAdd.getSeconds());
    return date;
  }
  static addSeconds(seedDate, secondsToAdd) {
    let date = new Date(seedDate);
    date.setSeconds(seedDate.getSeconds() + secondsToAdd);
    return date;
  }
  static addMinutes(seedDate, minutesToAdd) {
    let date = new Date(seedDate);
    date.setMinutes(seedDate.getMinutes() + minutesToAdd);
    return date;
  }
  static addHours(seedDate, hoursToAdd) {
    let date = new Date(seedDate);
    date.setHours(seedDate.getHours() + hoursToAdd);
    return date;
  }
  static addDays(seedDate, daysToAdd) {
    let date = new Date(seedDate);
    date.setDate(seedDate.getDate() + daysToAdd);
    return date;
  }
  static addMonths(seedDate, monthsToAdd) {
    let date = new Date(seedDate);
    date.setMonth(seedDate.getMonth() + monthsToAdd);
    return date;
  }
  static addYears(seedDate, yearsToAdd) {
    let date = new Date(seedDate);
    date.setFullYear(seedDate.getFullYear() + yearsToAdd);
    return date;
  }
  static getWeekNumber(referenceDate) {
    let target = new Date(referenceDate.valueOf());
    let dayNr = (referenceDate.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    let firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);
    }
    let weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 6048e5);
    return { weekNo, year: referenceDate.getUTCFullYear() };
  }
  static minValue() {
    let date = new Date(1, 0, 1, 0, 0, 0, 0);
    date.setFullYear(1);
    return date;
  }
  static safeCreateFromValue(seedDate, year, month, day, hour = 0, minute = 0, second = 0) {
    if (this.isValidDate(year, month, day) && this.isValidTime(hour, minute, second)) {
      return new Date(year, month, day, hour, minute, second, 0);
    }
    return seedDate;
  }
  static safeCreateFromMinValue(year, month, day, hour = 0, minute = 0, second = 0) {
    return this.safeCreateFromValue(this.minValue(), year, month, day, hour, minute, second);
  }
  // Resolve month overflow
  static safeCreateDateResolveOverflow(year, month, day) {
    if (month >= 12) {
      year += (month + 1) / 12;
      month %= 12;
    }
    return this.safeCreateFromMinValue(year, month, day);
  }
  static safeCreateFromMinValueWithDateAndTime(date, time) {
    return this.safeCreateFromMinValue(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time ? time.getHours() : 0,
      time ? time.getMinutes() : 0,
      time ? time.getSeconds() : 0
    );
  }
  static isLeapYear(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  static dayOfYear(date) {
    let start = new Date(date.getFullYear(), 0, 1);
    let diffDays = date.valueOf() - start.valueOf();
    return Math.floor(diffDays / _DateUtils.oneDay);
  }
  static validDays(year) {
    return [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
  static isValidDate(year, month, day) {
    return year > 0 && year <= 9999 && month >= 0 && month < 12 && day > 0 && day <= this.validDays(year)[month];
  }
  static isValidTime(hour, minute, second) {
    return hour >= 0 && hour < 24 && minute >= 0 && minute < 60 && second >= 0 && minute < 60;
  }
};
_DateUtils.oneDay = 24 * 60 * 60 * 1e3;
_DateUtils.oneHour = 60 * 60 * 1e3;
_DateUtils.oneMinute = 60 * 1e3;
_DateUtils.oneSecond = 1e3;
var DateUtils = _DateUtils;

// recognizers/recognizers-date-time/src/dateTime/baseMerged.ts
var BaseMergedExtractor = class {
  constructor(config, options) {
    this.config = config;
    this.options = options;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let result = new Array();
    this.addTo(result, this.config.dateExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.timeExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.durationExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.datePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.dateTimeExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.timePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.dateTimePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.setExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.holidayExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.numberEndingRegexMatch(source, result), source);
    this.addMod(result, source);
    if ((this.options & 4 /* Calendar */) !== 0) {
      this.checkCalendarFilterList(result, source);
    }
    result = result.sort((a, b) => a.start - b.start);
    return result;
  }
  checkCalendarFilterList(ers, text) {
    for (let er of ers.reverse()) {
      for (let negRegex of this.config.filterWordRegexList) {
        let match = recognizersTextNumber.RegExpUtility.getMatches(negRegex, er.text).pop();
        if (match) {
          ers.splice(ers.indexOf(er));
        }
      }
    }
  }
  // handle cases like "move 3pm appointment to 4"
  numberEndingRegexMatch(text, extractResults) {
    let tokens = new Array();
    extractResults.forEach((extractResult) => {
      if (extractResult.type === Constants.SYS_DATETIME_TIME || extractResult.type === Constants.SYS_DATETIME_DATETIME) {
        let stringAfter = text.substring(extractResult.start + extractResult.length);
        let match = recognizersTextNumber.RegExpUtility.getMatches(this.config.numberEndingPattern, stringAfter);
        if (match != null && match.length) {
          let newTime = match[0].groups("newTime");
          let numRes = this.config.integerExtractor.extract(newTime.value);
          if (numRes.length === 0) {
            return;
          }
          let startPosition = extractResult.start + extractResult.length + newTime.index;
          tokens.push(new Token(startPosition, startPosition + newTime.length));
        }
      }
    });
    return Token.mergeAllTokens(tokens, text, Constants.SYS_DATETIME_TIME);
  }
  addTo(destination, source, text) {
    source.forEach((value) => {
      if (this.options === 1 /* SkipFromToMerge */ && this.shouldSkipFromMerge(value)) return;
      let isFound = false;
      let overlapIndexes = new Array();
      let firstIndex = -1;
      destination.forEach((dest, index) => {
        if (recognizersText.ExtractResult.isOverlap(dest, value)) {
          isFound = true;
          if (recognizersText.ExtractResult.isCover(dest, value)) {
            if (firstIndex === -1) {
              firstIndex = index;
            }
            overlapIndexes.push(index);
          } else {
            return;
          }
        }
      });
      if (!isFound) {
        destination.push(value);
      } else if (overlapIndexes.length) {
        let tempDst = new Array();
        for (let i = 0; i < destination.length; i++) {
          if (overlapIndexes.indexOf(i) === -1) {
            tempDst.push(destination[i]);
          }
        }
        tempDst.splice(firstIndex, 0, value);
        destination.length = 0;
        destination.push.apply(destination, tempDst);
      }
    });
  }
  shouldSkipFromMerge(er) {
    return recognizersTextNumber.RegExpUtility.getMatches(this.config.fromToRegex, er.text).length > 0;
  }
  filterAmbiguousSingleWord(er, text) {
    let matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.singleAmbiguousMonthRegex, er.text.toLowerCase());
    if (matches.length) {
      let stringBefore = text.substring(0, er.start).replace(/\s+$/, "");
      matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.prepositionSuffixRegex, stringBefore);
      if (!matches.length) {
        return true;
      }
    }
    return false;
  }
  addMod(ers, source) {
    let lastEnd = 0;
    ers.forEach((er) => {
      let beforeStr = source.substr(lastEnd, er.start).toLowerCase();
      let before = this.hasTokenIndex(beforeStr.trim(), this.config.beforeRegex);
      if (before.matched) {
        let modLength = beforeStr.length - before.index;
        er.length += modLength;
        er.start -= modLength;
        er.text = source.substr(er.start, er.length);
      }
      let after = this.hasTokenIndex(beforeStr.trim(), this.config.afterRegex);
      if (after.matched) {
        let modLength = beforeStr.length - after.index;
        er.length += modLength;
        er.start -= modLength;
        er.text = source.substr(er.start, er.length);
      }
      let since = this.hasTokenIndex(beforeStr.trim(), this.config.sinceRegex);
      if (since.matched) {
        let modLength = beforeStr.length - since.index;
        er.length += modLength;
        er.start -= modLength;
        er.text = source.substr(er.start, er.length);
      }
    });
  }
  hasTokenIndex(source, regex) {
    let result = { matched: false, index: -1 };
    let match = recognizersTextNumber.RegExpUtility.getMatches(regex, source).pop();
    if (match) {
      result.matched = true;
      result.index = match.index;
    }
    return result;
  }
};
var BaseMergedParser = class {
  constructor(config, options) {
    this.parserTypeName = "datetimeV2";
    this.dateMinValue = FormatUtil.formatDate(DateUtils.minValue());
    this.dateTimeMinValue = FormatUtil.formatDateTime(DateUtils.minValue());
    this.config = config;
    this.options = options;
  }
  parse(er, refTime) {
    let referenceTime = refTime || /* @__PURE__ */ new Date();
    let pr = null;
    let hasBefore = false;
    let hasAfter = false;
    let hasSince = false;
    let modStr = "";
    let beforeMatch = recognizersTextNumber.RegExpUtility.getMatches(this.config.beforeRegex, er.text).shift();
    let afterMatch = recognizersTextNumber.RegExpUtility.getMatches(this.config.afterRegex, er.text).shift();
    let sinceMatch = recognizersTextNumber.RegExpUtility.getMatches(this.config.sinceRegex, er.text).shift();
    if (beforeMatch && beforeMatch.index === 0) {
      hasBefore = true;
      er.start += beforeMatch.length;
      er.length -= beforeMatch.length;
      er.text = er.text.substring(beforeMatch.length);
      modStr = beforeMatch.value;
    } else if (afterMatch && afterMatch.index === 0) {
      hasAfter = true;
      er.start += afterMatch.length;
      er.length -= afterMatch.length;
      er.text = er.text.substring(afterMatch.length);
      modStr = afterMatch.value;
    } else if (sinceMatch && sinceMatch.index === 0) {
      hasSince = true;
      er.start += sinceMatch.length;
      er.length -= sinceMatch.length;
      er.text = er.text.substring(sinceMatch.length);
      modStr = sinceMatch.value;
    }
    if (er.type === Constants.SYS_DATETIME_DATE) {
      pr = this.config.dateParser.parse(er, referenceTime);
      if (pr.value === null || pr.value === void 0) {
        pr = this.config.holidayParser.parse(er, referenceTime);
      }
    } else if (er.type === Constants.SYS_DATETIME_TIME) {
      pr = this.config.timeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIME) {
      pr = this.config.dateTimeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATEPERIOD) {
      pr = this.config.datePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_TIMEPERIOD) {
      pr = this.config.timePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIMEPERIOD) {
      pr = this.config.dateTimePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DURATION) {
      pr = this.config.durationParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_SET) {
      pr = this.config.setParser.parse(er, referenceTime);
    } else {
      return null;
    }
    if (hasBefore && pr.value !== null) {
      pr.length += modStr.length;
      pr.start -= modStr.length;
      pr.text = modStr + pr.text;
      let val = pr.value;
      val.mod = TimeTypeConstants.beforeMod;
      pr.value = val;
    }
    if (hasAfter && pr.value !== null) {
      pr.length += modStr.length;
      pr.start -= modStr.length;
      pr.text = modStr + pr.text;
      let val = pr.value;
      val.mod = TimeTypeConstants.afterMod;
      pr.value = val;
    }
    if (hasSince && pr.value !== null) {
      pr.length += modStr.length;
      pr.start -= modStr.length;
      pr.text = modStr + pr.text;
      let val = pr.value;
      val.mod = TimeTypeConstants.sinceMod;
      pr.value = val;
    }
    if ((this.options & 2 /* SplitDateAndTime */) === 2 /* SplitDateAndTime */ && pr.value && pr.value.subDateTimeEntities != null) {
      pr.value = this.dateTimeResolutionForSplit(pr);
    } else {
      pr = this.setParseResult(pr, hasBefore, hasAfter, hasSince);
    }
    return pr;
  }
  setParseResult(slot, hasBefore, hasAfter, hasSince) {
    slot.value = this.dateTimeResolution(slot, hasBefore, hasAfter, hasSince);
    slot.type = `${this.parserTypeName}.${this.determineDateTimeType(slot.type, hasBefore, hasAfter, hasSince)}`;
    return slot;
  }
  getParseResult(extractorResult, referenceDate) {
    let extractorType = extractorResult.type;
    if (extractorType === Constants.SYS_DATETIME_DATE) {
      let pr = this.config.dateParser.parse(extractorResult, referenceDate);
      if (!pr || !pr.value) return this.config.holidayParser.parse(extractorResult, referenceDate);
      return pr;
    }
    if (extractorType === Constants.SYS_DATETIME_TIME) {
      return this.config.timeParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_DATETIME) {
      return this.config.dateTimeParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_DATEPERIOD) {
      return this.config.datePeriodParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_TIMEPERIOD) {
      return this.config.timePeriodParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_DATETIMEPERIOD) {
      return this.config.dateTimePeriodParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_DURATION) {
      return this.config.durationParser.parse(extractorResult, referenceDate);
    }
    if (extractorType === Constants.SYS_DATETIME_SET) {
      return this.config.setParser.parse(extractorResult, referenceDate);
    }
    return null;
  }
  determineDateTimeType(type, hasBefore, hasAfter, hasSince) {
    if ((this.options & 2 /* SplitDateAndTime */) === 2 /* SplitDateAndTime */) {
      if (type === Constants.SYS_DATETIME_DATETIME) {
        return Constants.SYS_DATETIME_TIME;
      }
    } else {
      if (hasBefore || hasAfter || hasSince) {
        if (type === Constants.SYS_DATETIME_DATE) return Constants.SYS_DATETIME_DATEPERIOD;
        if (type === Constants.SYS_DATETIME_TIME) return Constants.SYS_DATETIME_TIMEPERIOD;
        if (type === Constants.SYS_DATETIME_DATETIME) return Constants.SYS_DATETIME_DATETIMEPERIOD;
      }
    }
    return type;
  }
  dateTimeResolutionForSplit(slot) {
    let results = new Array();
    if (slot.value.subDateTimeEntities != null) {
      let subEntities = slot.value.subDateTimeEntities;
      for (let subEntity of subEntities) {
        let result = subEntity;
        results.push(...this.dateTimeResolutionForSplit(result));
      }
    } else {
      slot.value = this.dateTimeResolution(slot, false, false, false);
      slot.type = `${this.parserTypeName}.${this.determineDateTimeType(slot.type, false, false, false)}`;
      results.push(slot);
    }
    return results;
  }
  dateTimeResolution(slot, hasBefore, hasAfter, hasSince) {
    if (!slot) return null;
    let result = /* @__PURE__ */ new Map();
    let resolutions = new Array();
    let type = slot.type;
    let outputType = this.determineDateTimeType(type, hasBefore, hasAfter, hasSince);
    let timex = slot.timexStr;
    let value = slot.value;
    if (!value) return null;
    let isLunar = value.isLunar;
    let mod = value.mod;
    let comment = value.comment;
    this.addResolutionFieldsAny(result, Constants.TimexKey, timex);
    this.addResolutionFieldsAny(result, Constants.CommentKey, comment);
    this.addResolutionFieldsAny(result, Constants.ModKey, mod);
    this.addResolutionFieldsAny(result, Constants.TypeKey, outputType);
    this.addResolutionFieldsAny(result, Constants.IsLunarKey, isLunar ? String(isLunar) : "");
    let futureResolution = value.futureResolution;
    let pastResolution = value.pastResolution;
    let future = this.generateFromResolution(type, futureResolution, mod);
    let past = this.generateFromResolution(type, pastResolution, mod);
    let futureValues = Array.from(this.getValues(future)).sort();
    let pastValues = Array.from(this.getValues(past)).sort();
    if (isEqual(futureValues, pastValues)) {
      if (pastValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveKey, past);
    } else {
      if (pastValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveToPastKey, past);
      if (futureValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveToFutureKey, future);
    }
    if (comment && comment === "ampm") {
      if (result.has("resolve")) {
        this.resolveAMPM(result, "resolve");
      } else {
        this.resolveAMPM(result, "resolveToPast");
        this.resolveAMPM(result, "resolveToFuture");
      }
    }
    result.forEach((value2, key) => {
      if (this.isObject(value2)) {
        let newValues = {};
        this.addResolutionFields(newValues, Constants.TimexKey, timex);
        this.addResolutionFields(newValues, Constants.ModKey, mod);
        this.addResolutionFields(newValues, Constants.TypeKey, outputType);
        this.addResolutionFields(newValues, Constants.IsLunarKey, isLunar ? String(isLunar) : "");
        Object.keys(value2).forEach((innerKey) => {
          newValues[innerKey] = value2[innerKey];
        });
        resolutions.push(newValues);
      }
    });
    if (Object.keys(past).length === 0 && Object.keys(future).length === 0) {
      let o = {};
      o["timex"] = timex;
      o["type"] = outputType;
      o["value"] = "not resolved";
      resolutions.push(o);
    }
    return {
      values: resolutions
    };
  }
  isObject(o) {
    return !!o && o.constructor === Object;
  }
  addResolutionFieldsAny(dic, key, value) {
    if (value instanceof String) {
      if (!recognizersTextNumber.StringUtility.isNullOrEmpty(value)) {
        dic.set(key, value);
      }
    } else {
      dic.set(key, value);
    }
  }
  addResolutionFields(dic, key, value) {
    if (!recognizersTextNumber.StringUtility.isNullOrEmpty(value)) {
      dic[key] = value;
    }
  }
  generateFromResolution(type, resolutions, mod) {
    let result = {};
    switch (type) {
      case Constants.SYS_DATETIME_DATETIME:
        this.addSingleDateTimeToResolution(resolutions, TimeTypeConstants.DATETIME, mod, result);
        break;
      case Constants.SYS_DATETIME_TIME:
        this.addSingleDateTimeToResolution(resolutions, TimeTypeConstants.TIME, mod, result);
        break;
      case Constants.SYS_DATETIME_DATE:
        this.addSingleDateTimeToResolution(resolutions, TimeTypeConstants.DATE, mod, result);
        break;
      case Constants.SYS_DATETIME_DURATION:
        if (resolutions.hasOwnProperty(TimeTypeConstants.DURATION)) {
          result[TimeTypeConstants.VALUE] = resolutions[TimeTypeConstants.DURATION];
        }
        break;
      case Constants.SYS_DATETIME_TIMEPERIOD:
        this.addPeriodToResolution(resolutions, TimeTypeConstants.START_TIME, TimeTypeConstants.END_TIME, mod, result);
        break;
      case Constants.SYS_DATETIME_DATEPERIOD:
        this.addPeriodToResolution(resolutions, TimeTypeConstants.START_DATE, TimeTypeConstants.END_DATE, mod, result);
        break;
      case Constants.SYS_DATETIME_DATETIMEPERIOD:
        this.addPeriodToResolution(resolutions, TimeTypeConstants.START_DATETIME, TimeTypeConstants.END_DATETIME, mod, result);
        break;
    }
    return result;
  }
  addSingleDateTimeToResolution(resolutions, type, mod, result) {
    let key = TimeTypeConstants.VALUE;
    let value = resolutions[type];
    if (!value || this.dateMinValue === value || this.dateTimeMinValue === value) return;
    if (!recognizersTextNumber.StringUtility.isNullOrEmpty(mod)) {
      if (mod === TimeTypeConstants.beforeMod) {
        key = TimeTypeConstants.END;
      } else if (mod === TimeTypeConstants.afterMod) {
        key = TimeTypeConstants.START;
      } else if (mod === TimeTypeConstants.sinceMod) {
        key = TimeTypeConstants.START;
      }
    }
    result[key] = value;
  }
  addPeriodToResolution(resolutions, startType, endType, mod, result) {
    let start = resolutions[startType];
    let end = resolutions[endType];
    if (!recognizersTextNumber.StringUtility.isNullOrEmpty(mod)) {
      if (mod === TimeTypeConstants.beforeMod) {
        if (!recognizersTextNumber.StringUtility.isNullOrEmpty(start) && !recognizersTextNumber.StringUtility.isNullOrEmpty(end)) {
          result[TimeTypeConstants.END] = start;
        } else {
          result[TimeTypeConstants.END] = end;
        }
        return;
      }
      if (mod === TimeTypeConstants.afterMod) {
        if (!recognizersTextNumber.StringUtility.isNullOrEmpty(start) && !recognizersTextNumber.StringUtility.isNullOrEmpty(end)) {
          var dateObj = new Date(end);
          dateObj.setDate(dateObj.getDate() - 1);
          result[TimeTypeConstants.START] = FormatUtil.formatDate(dateObj);
        } else {
          result[TimeTypeConstants.START] = start;
        }
        return;
      }
      if (mod === TimeTypeConstants.sinceMod) {
        result[TimeTypeConstants.START] = start;
        return;
      }
    }
    if (recognizersTextNumber.StringUtility.isNullOrEmpty(start) || recognizersTextNumber.StringUtility.isNullOrEmpty(end)) return;
    result[TimeTypeConstants.START] = start;
    result[TimeTypeConstants.END] = end;
  }
  getValues(obj) {
    return Object.keys(obj).map((key) => obj[key]);
  }
  resolveAMPM(valuesMap, keyName) {
    if (!valuesMap.has(keyName)) return;
    let resolution = valuesMap.get(keyName);
    if (!valuesMap.has("timex")) return;
    let timex = valuesMap.get("timex");
    valuesMap.delete(keyName);
    valuesMap.set(keyName + "Am", resolution);
    let resolutionPm = {};
    switch (valuesMap.get("type")) {
      case Constants.SYS_DATETIME_TIME:
        resolutionPm[TimeTypeConstants.VALUE] = FormatUtil.toPm(resolution[TimeTypeConstants.VALUE]);
        resolutionPm["timex"] = FormatUtil.toPm(timex);
        break;
      case Constants.SYS_DATETIME_DATETIME:
        let splitValue = resolution[TimeTypeConstants.VALUE].split(" ");
        resolutionPm[TimeTypeConstants.VALUE] = `${splitValue[0]} ${FormatUtil.toPm(splitValue[1])}`;
        resolutionPm["timex"] = FormatUtil.allStringToPm(timex);
        break;
      case Constants.SYS_DATETIME_TIMEPERIOD:
        if (resolution.hasOwnProperty(TimeTypeConstants.START)) resolutionPm[TimeTypeConstants.START] = FormatUtil.toPm(resolution[TimeTypeConstants.START]);
        if (resolution.hasOwnProperty(TimeTypeConstants.END)) resolutionPm[TimeTypeConstants.END] = FormatUtil.toPm(resolution[TimeTypeConstants.END]);
        resolutionPm["timex"] = FormatUtil.allStringToPm(timex);
        break;
      case Constants.SYS_DATETIME_DATETIMEPERIOD:
        if (resolution.hasOwnProperty(TimeTypeConstants.START)) {
          let splitValue2 = resolution[TimeTypeConstants.START].split(" ");
          resolutionPm[TimeTypeConstants.START] = `${splitValue2[0]} ${FormatUtil.toPm(splitValue2[1])}`;
        }
        if (resolution.hasOwnProperty(TimeTypeConstants.END)) {
          let splitValue2 = resolution[TimeTypeConstants.END].split(" ");
          resolutionPm[TimeTypeConstants.END] = `${splitValue2[0]} ${FormatUtil.toPm(splitValue2[1])}`;
        }
        resolutionPm["timex"] = FormatUtil.allStringToPm(timex);
        break;
    }
    valuesMap.set(keyName + "Pm", resolutionPm);
  }
};

// recognizers/recognizers-date-time/src/resources/englishDateTime.ts
exports.EnglishDateTime = void 0;
((EnglishDateTime2) => {
  EnglishDateTime2.TillRegex = `(?<till>\\b(to|till|til|until|thru|through)\\b|(--|-|\u2014|\u2014\u2014|~|\u2013))`;
  EnglishDateTime2.RangeConnectorRegex = `(?<and>\\b(and|through|to)\\b|(--|-|\u2014|\u2014\u2014|~|\u2013))`;
  EnglishDateTime2.RelativeRegex = `\\b(?<order>following|next|coming|upcoming|this|last|past|previous|current|the)\\b`;
  EnglishDateTime2.StrictRelativeRegex = `\\b(?<order>following|next|coming|upcoming|this|last|past|previous|current)\\b`;
  EnglishDateTime2.NextPrefixRegex = `\\b(following|next|upcoming|coming)\\b`;
  EnglishDateTime2.AfterNextSuffixRegex = `\\b(after\\s+(the\\s+)?next)\\b`;
  EnglishDateTime2.PastPrefixRegex = `(last|past|previous)\\b`;
  EnglishDateTime2.ThisPrefixRegex = `(this|current)\\b`;
  EnglishDateTime2.CenturySuffixRegex = `(^century)\\b`;
  EnglishDateTime2.ReferencePrefixRegex = `(that|same)\\b`;
  EnglishDateTime2.FutureSuffixRegex = `\\b(in\\s+the\\s+)?(future|hence)\\b`;
  EnglishDateTime2.DayRegex = `(the\\s*)?(?<day>01|02|03|04|05|06|07|08|09|10th|10|11th|11st|11|12nd|12th|12|13rd|13th|13|14th|14|15th|15|16th|16|17th|17|18th|18|19th|19|1st|1|20th|20|21st|21th|21|22nd|22th|22|23rd|23th|23|24th|24|25th|25|26th|26|27th|27|28th|28|29th|29|2nd|2|30th|30|31st|31|3rd|3|4th|4|5th|5|6th|6|7th|7|8th|8|9th|9)(?=\\b|t)`;
  EnglishDateTime2.ImplicitDayRegex = `(the\\s*)?(?<day>10th|11th|11st|12nd|12th|13rd|13th|14th|15th|16th|17th|18th|19th|1st|20th|21st|21th|22nd|22th|23rd|23th|24th|25th|26th|27th|28th|29th|2nd|30th|31st|3rd|4th|5th|6th|7th|8th|9th)\\b`;
  EnglishDateTime2.MonthNumRegex = `(?<month>01|02|03|04|05|06|07|08|09|10|11|12|1|2|3|4|5|6|7|8|9)\\b`;
  EnglishDateTime2.CenturyRegex = `\\b(?<century>((one|two)\\s+thousand(\\s+and)?(\\s+(one|two|three|four|five|six|seven|eight|nine)\\s+hundred(\\s+and)?)?)|((twenty one|twenty two|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(\\s+hundred)?(\\s+and)?))\\b`;
  EnglishDateTime2.WrittenNumRegex = `(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety)`;
  EnglishDateTime2.FullTextYearRegex = `\\b((?<firsttwoyearnum>${EnglishDateTime2.CenturyRegex})\\s+(?<lasttwoyearnum>((zero|twenty|thirty|forty|fourty|fifty|sixty|seventy|eighty|ninety)\\s+${EnglishDateTime2.WrittenNumRegex})|${EnglishDateTime2.WrittenNumRegex}))\\b|\\b(?<firsttwoyearnum>${EnglishDateTime2.CenturyRegex})\\b`;
  EnglishDateTime2.AmDescRegex = `(am\\b|a\\.m\\.|a m\\b|a\\. m\\.|a\\.m\\b|a\\. m\\b|a m\\b)`;
  EnglishDateTime2.PmDescRegex = `(pm\\b|p\\.m\\.|p\\b|p m\\b|p\\. m\\.|p\\.m\\b|p\\. m\\b|p m\\b)`;
  EnglishDateTime2.TwoDigitYearRegex = `\\b(?<![$])(?<year>([0-27-9]\\d))(?!(\\s*((\\:)|${EnglishDateTime2.AmDescRegex}|${EnglishDateTime2.PmDescRegex}|\\.\\d)))\\b`;
  EnglishDateTime2.YearRegex = `(${exports.BaseDateTime.FourDigitYearRegex}|${EnglishDateTime2.FullTextYearRegex})`;
  EnglishDateTime2.WeekDayRegex = `\\b(?<weekday>Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Mon|Tues|Tue|Wedn|Weds|Wed|Thurs|Thur|Thu|Fri|Sat|Sun)s?\\b`;
  EnglishDateTime2.SingleWeekDayRegex = `\\b(?<weekday>Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Mon|Tue|Tues|Wedn|Weds|Wed|Thurs|Thur|Thu|Fri|((?<=on\\s+)(Sat|Sun)))\\b`;
  EnglishDateTime2.RelativeMonthRegex = `(?<relmonth>(of\\s+)?${EnglishDateTime2.RelativeRegex}\\s+month)\\b`;
  EnglishDateTime2.WrittenMonthRegex = `(((the\\s+)?month of\\s+)?(?<month>April|Apr|August|Aug|December|Dec|February|Feb|January|Jan|July|Jul|June|Jun|March|Mar|May|November|Nov|October|Oct|September|Sept|Sep))`;
  EnglishDateTime2.MonthSuffixRegex = `(?<msuf>(in\\s+|of\\s+|on\\s+)?(${EnglishDateTime2.RelativeMonthRegex}|${EnglishDateTime2.WrittenMonthRegex}))`;
  EnglishDateTime2.DateUnitRegex = `(?<unit>decades?|years?|months?|weeks?|(?<business>business\\s+)?days?)\\b`;
  EnglishDateTime2.DateTokenPrefix = "on ";
  EnglishDateTime2.TimeTokenPrefix = "at ";
  EnglishDateTime2.TokenBeforeDate = "on ";
  EnglishDateTime2.TokenBeforeTime = "at ";
  EnglishDateTime2.SimpleCasesRegex = `\\b((from|between)\\s+)?(${EnglishDateTime2.DayRegex})\\s*${EnglishDateTime2.TillRegex}\\s*(${EnglishDateTime2.DayRegex}\\s+${EnglishDateTime2.MonthSuffixRegex}|${EnglishDateTime2.MonthSuffixRegex}\\s+${EnglishDateTime2.DayRegex})((\\s+|\\s*,\\s*)${EnglishDateTime2.YearRegex})?\\b`;
  EnglishDateTime2.MonthFrontSimpleCasesRegex = `\\b((from|between)\\s+)?${EnglishDateTime2.MonthSuffixRegex}\\s+((from)\\s+)?(${EnglishDateTime2.DayRegex})\\s*${EnglishDateTime2.TillRegex}\\s*(${EnglishDateTime2.DayRegex})((\\s+|\\s*,\\s*)${EnglishDateTime2.YearRegex})?\\b`;
  EnglishDateTime2.MonthFrontBetweenRegex = `\\b${EnglishDateTime2.MonthSuffixRegex}\\s+(between\\s+)(${EnglishDateTime2.DayRegex})\\s*${EnglishDateTime2.RangeConnectorRegex}\\s*(${EnglishDateTime2.DayRegex})((\\s+|\\s*,\\s*)${EnglishDateTime2.YearRegex})?\\b`;
  EnglishDateTime2.BetweenRegex = `\\b(between\\s+)(${EnglishDateTime2.DayRegex})\\s*${EnglishDateTime2.RangeConnectorRegex}\\s*(${EnglishDateTime2.DayRegex})\\s+${EnglishDateTime2.MonthSuffixRegex}((\\s+|\\s*,\\s*)${EnglishDateTime2.YearRegex})?\\b`;
  EnglishDateTime2.MonthWithYear = `\\b((${EnglishDateTime2.WrittenMonthRegex}(\\.)?(\\s*),?(\\s+of)?(\\s*)(${EnglishDateTime2.YearRegex}|(?<order>following|next|last|this)\\s+year))|((${EnglishDateTime2.YearRegex}|(?<order>following|next|last|this)\\s+year)(\\s*),?(\\s*)${EnglishDateTime2.WrittenMonthRegex}))\\b`;
  EnglishDateTime2.OneWordPeriodRegex = `\\b((((the\\s+)?month of\\s+)?(${EnglishDateTime2.StrictRelativeRegex}\\s+)?(?<month>April|Apr|August|Aug|December|Dec|February|Feb|January|Jan|July|Jul|June|Jun|March|Mar|May|November|Nov|October|Oct|September|Sep|Sept))|(month|year) to date|(${EnglishDateTime2.RelativeRegex}\\s+)?(my\\s+)?(weekend|week|month|year)(?!((\\s+of)?\\s+\\d+|\\s+to\\s+date))(\\s+${EnglishDateTime2.AfterNextSuffixRegex})?)\\b`;
  EnglishDateTime2.MonthNumWithYear = `\\b((${exports.BaseDateTime.FourDigitYearRegex}(\\s*)[/\\-\\.](\\s*)${EnglishDateTime2.MonthNumRegex})|(${EnglishDateTime2.MonthNumRegex}(\\s*)[/\\-](\\s*)${exports.BaseDateTime.FourDigitYearRegex}))\\b`;
  EnglishDateTime2.WeekOfMonthRegex = `\\b(?<wom>(the\\s+)?(?<cardinal>first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\\s+week\\s+${EnglishDateTime2.MonthSuffixRegex})\\b`;
  EnglishDateTime2.WeekOfYearRegex = `\\b(?<woy>(the\\s+)?(?<cardinal>first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\\s+week(\\s+of)?\\s+(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))\\b`;
  EnglishDateTime2.FollowedDateUnit = `^\\s*${EnglishDateTime2.DateUnitRegex}`;
  EnglishDateTime2.NumberCombinedWithDateUnit = `\\b(?<num>\\d+(\\.\\d*)?)${EnglishDateTime2.DateUnitRegex}`;
  EnglishDateTime2.QuarterTermRegex = `\\b(((?<cardinal>first|1st|second|2nd|third|3rd|fourth|4th)[ -]+quarter)|(Q(?<number>[1-4])))\\b`;
  EnglishDateTime2.QuarterRegex = `(the\\s+)?${EnglishDateTime2.QuarterTermRegex}((\\s+of|\\s*,\\s*)?\\s+(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))?`;
  EnglishDateTime2.QuarterRegexYearFront = `(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year)('s)?\\s+(the\\s+)?${EnglishDateTime2.QuarterTermRegex}`;
  EnglishDateTime2.HalfYearTermRegex = `(?<cardinal>first|1st|second|2nd)\\s+half`;
  EnglishDateTime2.HalfYearFrontRegex = `(?<year>((1[5-9]|20)\\d{2})|2100)\\s*(the\\s+)?H(?<number>[1-2])`;
  EnglishDateTime2.HalfYearBackRegex = `(the\\s+)?(H(?<number>[1-2])|(${EnglishDateTime2.HalfYearTermRegex}))(\\s+of|\\s*,\\s*)?\\s+(${EnglishDateTime2.YearRegex})`;
  EnglishDateTime2.HalfYearRelativeRegex = `(the\\s+)?${EnglishDateTime2.HalfYearTermRegex}(\\s+of|\\s*,\\s*)?\\s+(${EnglishDateTime2.RelativeRegex}\\s+year)`;
  EnglishDateTime2.AllHalfYearRegex = `(${EnglishDateTime2.HalfYearFrontRegex})|(${EnglishDateTime2.HalfYearBackRegex})|(${EnglishDateTime2.HalfYearRelativeRegex})`;
  EnglishDateTime2.EarlyPrefixRegex = `\\b(?<EarlyPrefix>early|beginning of|start of|(?<RelEarly>earlier(\\s+in)?))\\b`;
  EnglishDateTime2.MidPrefixRegex = `\\b(?<MidPrefix>mid-?|middle of)\\b`;
  EnglishDateTime2.LaterPrefixRegex = `\\b(?<LatePrefix>late|end of|(?<RelLate>later(\\s+in)?))\\b`;
  EnglishDateTime2.PrefixPeriodRegex = `(${EnglishDateTime2.EarlyPrefixRegex}|${EnglishDateTime2.MidPrefixRegex}|${EnglishDateTime2.LaterPrefixRegex})`;
  EnglishDateTime2.PrefixDayRegex = `\\b((?<EarlyPrefix>early)|(?<MidPrefix>mid|middle)|(?<LatePrefix>late|later))(\\s+in)?(\\s+the\\s+day)?$`;
  EnglishDateTime2.SeasonDescRegex = `(?<seas>spring|summer|fall|autumn|winter)`;
  EnglishDateTime2.SeasonRegex = `\\b(?<season>(${EnglishDateTime2.PrefixPeriodRegex}\\s+)?(${EnglishDateTime2.RelativeRegex}\\s+)?${EnglishDateTime2.SeasonDescRegex}((\\s+of|\\s*,\\s*)?\\s+(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))?)\\b`;
  EnglishDateTime2.WhichWeekRegex = `(week)(\\s*)(?<number>\\d\\d|\\d|0\\d)`;
  EnglishDateTime2.WeekOfRegex = `(the\\s+)?(week)(\\s+of)(\\s+the)?`;
  EnglishDateTime2.MonthOfRegex = `(month)(\\s*)(of)`;
  EnglishDateTime2.MonthRegex = `(?<month>April|Apr|August|Aug|December|Dec|February|Feb|January|Jan|July|Jul|June|Jun|March|Mar|May|November|Nov|October|Oct|September|Sept|Sep)`;
  EnglishDateTime2.AmbiguousMonthP0Regex = `\\b((^may i)|(i|you|he|she|we|they)\\s+may|(may\\s+((((also|not|(also not)|well)\\s+)?(be|contain|constitute|email|e-mail|take|have|result|involve|get|work|reply))|(or may not))))\\b`;
  EnglishDateTime2.DateYearRegex = `(?<year>${exports.BaseDateTime.FourDigitYearRegex}|${EnglishDateTime2.TwoDigitYearRegex})`;
  EnglishDateTime2.YearSuffix = `(,?\\s*(${EnglishDateTime2.DateYearRegex}|${EnglishDateTime2.FullTextYearRegex}))`;
  EnglishDateTime2.OnRegex = `(?<=\\bon\\s+)(${EnglishDateTime2.DayRegex}s?)\\b`;
  EnglishDateTime2.RelaxedOnRegex = `(?<=\\b(on|at|in)\\s+)((?<day>10th|11th|11st|12nd|12th|13rd|13th|14th|15th|16th|17th|18th|19th|1st|20th|21st|21th|22nd|22th|23rd|23th|24th|25th|26th|27th|28th|29th|2nd|30th|31st|3rd|4th|5th|6th|7th|8th|9th)s?)\\b`;
  EnglishDateTime2.ThisRegex = `\\b((this(\\s*week)?(\\s*on)?\\s+)${EnglishDateTime2.WeekDayRegex})|(${EnglishDateTime2.WeekDayRegex}((\\s+of)?\\s+this\\s*week))\\b`;
  EnglishDateTime2.LastDateRegex = `\\b(${EnglishDateTime2.PastPrefixRegex}(\\s*week)?\\s+${EnglishDateTime2.WeekDayRegex})|(${EnglishDateTime2.WeekDayRegex}(\\s+last\\s*week))\\b`;
  EnglishDateTime2.NextDateRegex = `\\b(${EnglishDateTime2.NextPrefixRegex}(\\s*week(\\s*,?\\s*on)?)?\\s+${EnglishDateTime2.WeekDayRegex})|((on\\s+)?${EnglishDateTime2.WeekDayRegex}((\\s+of)?\\s+(the\\s+following|(the\\s+)?next)\\s*week))\\b`;
  EnglishDateTime2.SpecialDayRegex = `\\b((the\\s+)?day before yesterday|(the\\s+)?day after (tomorrow|tmr)|((the\\s+)?(${EnglishDateTime2.RelativeRegex}|my)\\s+day)|yesterday|tomorrow|tmr|today)\\b`;
  EnglishDateTime2.SpecialDayWithNumRegex = `\\b((?<number>${EnglishDateTime2.WrittenNumRegex})\\s+days?\\s+from\\s+(?<day>yesterday|tomorrow|tmr|today))\\b`;
  EnglishDateTime2.RelativeDayRegex = `\\b(((the\\s+)?${EnglishDateTime2.RelativeRegex}\\s+day))\\b`;
  EnglishDateTime2.SetWeekDayRegex = `\\b(?<prefix>on\\s+)?(?<weekday>morning|afternoon|evening|night|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)s\\b`;
  EnglishDateTime2.WeekDayOfMonthRegex = `(?<wom>(the\\s+)?(?<cardinal>first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last)\\s+${EnglishDateTime2.WeekDayRegex}\\s+${EnglishDateTime2.MonthSuffixRegex})`;
  EnglishDateTime2.RelativeWeekDayRegex = `\\b(${EnglishDateTime2.WrittenNumRegex}\\s+${EnglishDateTime2.WeekDayRegex}\\s+(from\\s+now|later))\\b`;
  EnglishDateTime2.SpecialDate = `(?=\\b(on|at)\\s+the\\s+)${EnglishDateTime2.DayRegex}\\b`;
  EnglishDateTime2.DatePreposition = `\\b(on|in)`;
  EnglishDateTime2.DateExtractor1 = `\\b((this\\s+)?${EnglishDateTime2.WeekDayRegex}\\s*[,-]?\\s*)?((${EnglishDateTime2.MonthRegex}(\\.)?\\s*[/\\\\.,-]?\\s*${EnglishDateTime2.DayRegex})|(\\(${EnglishDateTime2.MonthRegex}\\s*[-.]\\s*${EnglishDateTime2.DayRegex}\\)))(\\s*\\(\\s*${EnglishDateTime2.WeekDayRegex}\\s*\\))?`;
  EnglishDateTime2.DateExtractor2 = `\\b${EnglishDateTime2.DateExtractor1}(\\s+|\\s*,\\s*|\\s+of\\s+)${EnglishDateTime2.DateYearRegex}\\b`;
  EnglishDateTime2.DateExtractor3 = `\\b(${EnglishDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${EnglishDateTime2.DayRegex}(\\.)?(\\s+|\\s*,\\s*|\\s+of\\s+|\\s*-\\s*)${EnglishDateTime2.MonthRegex}(\\.)?((\\s+|\\s*,\\s*)${EnglishDateTime2.DateYearRegex})?\\b`;
  EnglishDateTime2.DateExtractor4 = `\\b${EnglishDateTime2.MonthNumRegex}\\s*[/\\\\\\-]\\s*${EnglishDateTime2.DayRegex}(\\.)?\\s*[/\\\\\\-]\\s*${EnglishDateTime2.DateYearRegex}`;
  EnglishDateTime2.DateExtractor5 = `\\b${EnglishDateTime2.DayRegex}\\s*[/\\\\\\-\\.]\\s*${EnglishDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${EnglishDateTime2.DateYearRegex}`;
  EnglishDateTime2.DateExtractor6 = `(?<=${EnglishDateTime2.DatePreposition}\\s+)(${EnglishDateTime2.WeekDayRegex}\\s+)?${EnglishDateTime2.MonthNumRegex}[\\-\\.]${EnglishDateTime2.DayRegex}(?![%])\\b`;
  EnglishDateTime2.DateExtractor7 = `\\b(${EnglishDateTime2.WeekDayRegex}\\s+)?${EnglishDateTime2.MonthNumRegex}\\s*/\\s*${EnglishDateTime2.DayRegex}((\\s+|\\s*,\\s*|\\s+of\\s+)${EnglishDateTime2.DateYearRegex})?(?![%])\\b`;
  EnglishDateTime2.DateExtractor8 = `(?<=${EnglishDateTime2.DatePreposition}\\s+)(${EnglishDateTime2.WeekDayRegex}\\s+)?${EnglishDateTime2.DayRegex}[\\\\\\-]${EnglishDateTime2.MonthNumRegex}(?![%])\\b`;
  EnglishDateTime2.DateExtractor9 = `\\b(${EnglishDateTime2.WeekDayRegex}\\s+)?${EnglishDateTime2.DayRegex}\\s*/\\s*${EnglishDateTime2.MonthNumRegex}((\\s+|\\s*,\\s*|\\s+of\\s+)${EnglishDateTime2.DateYearRegex})?(?![%])\\b`;
  EnglishDateTime2.DateExtractorA = `\\b(${EnglishDateTime2.WeekDayRegex}\\s+)?${EnglishDateTime2.DateYearRegex}\\s*[/\\\\\\-\\.]\\s*${EnglishDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${EnglishDateTime2.DayRegex}`;
  EnglishDateTime2.OfMonth = `^\\s*of\\s*${EnglishDateTime2.MonthRegex}`;
  EnglishDateTime2.MonthEnd = `${EnglishDateTime2.MonthRegex}\\s*(the)?\\s*$`;
  EnglishDateTime2.WeekDayEnd = `(this\\s+)?${EnglishDateTime2.WeekDayRegex}\\s*,?\\s*$`;
  EnglishDateTime2.RangeUnitRegex = `\\b(?<unit>years|year|months|month|weeks|week)\\b`;
  EnglishDateTime2.OclockRegex = `(?<oclock>o\\s*\u2019\\s*clock|o\\s*\u2018\\s*clock|o\\s*'\\s*clock|o\\s*clock)`;
  EnglishDateTime2.DescRegex = `(((${EnglishDateTime2.OclockRegex}\\s+)?(?<desc>ampm|am\\b|a\\.m\\.|a m\\b|a\\. m\\.|a\\.m\\b|a\\. m\\b|a m\\b|pm\\b|p\\.m\\.|p m\\b|p\\. m\\.|p\\.m\\b|p\\. m\\b|p\\b|p m\\b))|${EnglishDateTime2.OclockRegex})`;
  EnglishDateTime2.HourNumRegex = `\\b(?<hournum>zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\\b`;
  EnglishDateTime2.MinuteNumRegex = `(?<minnum>one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)`;
  EnglishDateTime2.DeltaMinuteNumRegex = `(?<deltaminnum>one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)`;
  EnglishDateTime2.PmRegex = `(?<pm>(((at|in|around|on|for)\\s+(the\\s+)?)?(afternoon|evening|midnight|lunchtime))|((at|in|around|on|for)\\s+(the\\s+)?night))`;
  EnglishDateTime2.PmRegexFull = `(?<pm>((at|in|around|on|for)\\s+(the\\s+)?)?(afternoon|evening|midnight|night|lunchtime))`;
  EnglishDateTime2.AmRegex = `(?<am>((at|in|around|on|for)\\s+(the\\s+)?)?(morning))`;
  EnglishDateTime2.LunchRegex = `\\b(lunchtime)\\b`;
  EnglishDateTime2.NightRegex = `\\b(midnight|night)\\b`;
  EnglishDateTime2.CommonDatePrefixRegex = `^[\\.]`;
  EnglishDateTime2.LessThanOneHour = `(?<lth>(a\\s+)?quarter|three quarter(s)?|half( an hour)?|${exports.BaseDateTime.DeltaMinuteRegex}(\\s+(minute|minutes|min|mins))|${EnglishDateTime2.DeltaMinuteNumRegex}(\\s+(minute|minutes|min|mins)))`;
  EnglishDateTime2.WrittenTimeRegex = `(?<writtentime>${EnglishDateTime2.HourNumRegex}\\s+(${EnglishDateTime2.MinuteNumRegex}|(?<tens>twenty|thirty|forty|fourty|fifty)\\s+${EnglishDateTime2.MinuteNumRegex}))`;
  EnglishDateTime2.TimePrefix = `(?<prefix>(${EnglishDateTime2.LessThanOneHour} past|${EnglishDateTime2.LessThanOneHour} to))`;
  EnglishDateTime2.TimeSuffix = `(?<suffix>${EnglishDateTime2.AmRegex}|${EnglishDateTime2.PmRegex}|${EnglishDateTime2.OclockRegex})`;
  EnglishDateTime2.TimeSuffixFull = `(?<suffix>${EnglishDateTime2.AmRegex}|${EnglishDateTime2.PmRegexFull}|${EnglishDateTime2.OclockRegex})`;
  EnglishDateTime2.BasicTime = `\\b(?<basictime>${EnglishDateTime2.WrittenTimeRegex}|${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}:${exports.BaseDateTime.MinuteRegex}(:${exports.BaseDateTime.SecondRegex})?|${exports.BaseDateTime.HourRegex})`;
  EnglishDateTime2.MidnightRegex = `(?<midnight>midnight|mid-night|mid night)`;
  EnglishDateTime2.MidmorningRegex = `(?<midmorning>midmorning|mid-morning|mid morning)`;
  EnglishDateTime2.MidafternoonRegex = `(?<midafternoon>midafternoon|mid-afternoon|mid afternoon)`;
  EnglishDateTime2.MiddayRegex = `(?<midday>midday|mid-day|mid day|((12\\s)?noon))`;
  EnglishDateTime2.MidTimeRegex = `(?<mid>(${EnglishDateTime2.MidnightRegex}|${EnglishDateTime2.MidmorningRegex}|${EnglishDateTime2.MidafternoonRegex}|${EnglishDateTime2.MiddayRegex}))`;
  EnglishDateTime2.AtRegex = `\\b(((?<=\\bat\\s+)(${EnglishDateTime2.WrittenTimeRegex}|${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}(?!\\.\\d)(\\s*((?<iam>a)|(?<ipm>p)))?|${EnglishDateTime2.MidTimeRegex}))|${EnglishDateTime2.MidTimeRegex})\\b`;
  EnglishDateTime2.IshRegex = `\\b(${exports.BaseDateTime.HourRegex}(-|\u2014\u2014)?ish|noonish|noon)\\b`;
  EnglishDateTime2.TimeUnitRegex = `([^A-Za-z]{1,}|\\b)(?<unit>hours|hour|hrs|hr|h|minutes|minute|mins|min|seconds|second|secs|sec)\\b`;
  EnglishDateTime2.RestrictedTimeUnitRegex = `(?<unit>hour|minute)\\b`;
  EnglishDateTime2.FivesRegex = `(?<tens>(fifteen|twenty(\\s*five)?|thirty(\\s*five)?|forty(\\s*five)?|fourty(\\s*five)?|fifty(\\s*five)?|ten|five))\\b`;
  EnglishDateTime2.HourRegex = `\\b${exports.BaseDateTime.HourRegex}`;
  EnglishDateTime2.PeriodHourNumRegex = `\\b(?<hour>twenty one|twenty two|twenty three|twenty four|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\\b`;
  EnglishDateTime2.ConnectNumRegex = `\\b${exports.BaseDateTime.HourRegex}(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59)\\s*${EnglishDateTime2.DescRegex}`;
  EnglishDateTime2.TimeRegexWithDotConnector = `(${exports.BaseDateTime.HourRegex}(\\s*\\.\\s*)${exports.BaseDateTime.MinuteRegex})`;
  EnglishDateTime2.TimeRegex1 = `\\b(${EnglishDateTime2.TimePrefix}\\s+)?(${EnglishDateTime2.WrittenTimeRegex}|${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*${EnglishDateTime2.DescRegex}`;
  EnglishDateTime2.TimeRegex2 = `(\\b${EnglishDateTime2.TimePrefix}\\s+)?(T)?${exports.BaseDateTime.HourRegex}(\\s*)?:(\\s*)?${exports.BaseDateTime.MinuteRegex}((\\s*)?:(\\s*)?${exports.BaseDateTime.SecondRegex})?((\\s*${EnglishDateTime2.DescRegex})|\\b)`;
  EnglishDateTime2.TimeRegex3 = `(\\b${EnglishDateTime2.TimePrefix}\\s+)?${exports.BaseDateTime.HourRegex}\\.${exports.BaseDateTime.MinuteRegex}(\\s*${EnglishDateTime2.DescRegex})`;
  EnglishDateTime2.TimeRegex4 = `\\b${EnglishDateTime2.TimePrefix}\\s+${EnglishDateTime2.BasicTime}(\\s*${EnglishDateTime2.DescRegex})?\\s+${EnglishDateTime2.TimeSuffix}\\b`;
  EnglishDateTime2.TimeRegex5 = `\\b${EnglishDateTime2.TimePrefix}\\s+${EnglishDateTime2.BasicTime}((\\s*${EnglishDateTime2.DescRegex})|\\b)`;
  EnglishDateTime2.TimeRegex6 = `${EnglishDateTime2.BasicTime}(\\s*${EnglishDateTime2.DescRegex})?\\s+${EnglishDateTime2.TimeSuffix}\\b`;
  EnglishDateTime2.TimeRegex7 = `\\b${EnglishDateTime2.TimeSuffixFull}\\s+at\\s+${EnglishDateTime2.BasicTime}((\\s*${EnglishDateTime2.DescRegex})|\\b)`;
  EnglishDateTime2.TimeRegex8 = `\\b${EnglishDateTime2.TimeSuffixFull}\\s+${EnglishDateTime2.BasicTime}((\\s*${EnglishDateTime2.DescRegex})|\\b)`;
  EnglishDateTime2.TimeRegex9 = `\\b${EnglishDateTime2.PeriodHourNumRegex}\\s+${EnglishDateTime2.FivesRegex}((\\s*${EnglishDateTime2.DescRegex})|\\b)`;
  EnglishDateTime2.TimeRegex10 = `\\b(${EnglishDateTime2.TimePrefix}\\s+)?${exports.BaseDateTime.HourRegex}(\\s*h\\s*)${exports.BaseDateTime.MinuteRegex}(\\s*${EnglishDateTime2.DescRegex})?`;
  EnglishDateTime2.TimeRegex11 = `\\b((${EnglishDateTime2.TimeTokenPrefix}${EnglishDateTime2.TimeRegexWithDotConnector})(?!\\s*per\\s*cent|%)|(${EnglishDateTime2.TimeRegexWithDotConnector}(\\s*${EnglishDateTime2.DescRegex})))`;
  EnglishDateTime2.FirstTimeRegexInTimeRange = `\\b${EnglishDateTime2.TimeRegexWithDotConnector}(\\s*${EnglishDateTime2.DescRegex})?`;
  EnglishDateTime2.PureNumFromTo = `((from|between)\\s+)?(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${EnglishDateTime2.DescRegex}))?\\s*${EnglishDateTime2.TillRegex}\\s*(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(?<rightDesc>\\s*(${EnglishDateTime2.PmRegex}|${EnglishDateTime2.AmRegex}|${EnglishDateTime2.DescRegex}))?`;
  EnglishDateTime2.PureNumBetweenAnd = `(between\\s+)(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${EnglishDateTime2.DescRegex}))?\\s*${EnglishDateTime2.RangeConnectorRegex}\\s*(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(?<rightDesc>\\s*(${EnglishDateTime2.PmRegex}|${EnglishDateTime2.AmRegex}|${EnglishDateTime2.DescRegex}))?`;
  EnglishDateTime2.SpecificTimeFromTo = `((from|between)\\s+)?(?<time1>((${EnglishDateTime2.TimeRegex2}|${EnglishDateTime2.FirstTimeRegexInTimeRange})|(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${EnglishDateTime2.DescRegex}))?))\\s*${EnglishDateTime2.TillRegex}\\s*(?<time2>((${EnglishDateTime2.TimeRegex2}|${EnglishDateTime2.TimeRegexWithDotConnector}(?<rightDesc>\\s*${EnglishDateTime2.DescRegex}))|(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<rightDesc>${EnglishDateTime2.DescRegex}))?))`;
  EnglishDateTime2.SpecificTimeBetweenAnd = `(between\\s+)(?<time1>((${EnglishDateTime2.TimeRegex2}|${EnglishDateTime2.FirstTimeRegexInTimeRange})|(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${EnglishDateTime2.DescRegex}))?))\\s*${EnglishDateTime2.RangeConnectorRegex}\\s*(?<time2>((${EnglishDateTime2.TimeRegex2}|${EnglishDateTime2.TimeRegexWithDotConnector}(?<rightDesc>\\s*${EnglishDateTime2.DescRegex}))|(${EnglishDateTime2.HourRegex}|${EnglishDateTime2.PeriodHourNumRegex})(\\s*(?<rightDesc>${EnglishDateTime2.DescRegex}))?))`;
  EnglishDateTime2.PrepositionRegex = `(?<prep>^(at|on|of)(\\s+the)?$)`;
  EnglishDateTime2.TimeOfDayRegex = `\\b(?<timeOfDay>((((in\\s+(the)?\\s+)?((?<early>early(\\s+|-))|(?<late>late(\\s+|-)))?(morning|afternoon|night|evening)))|(((in\\s+(the)?\\s+)?)(daytime|business\\s+hour)))s?)\\b`;
  EnglishDateTime2.SpecificTimeOfDayRegex = `\\b((${EnglishDateTime2.StrictRelativeRegex}\\s+${EnglishDateTime2.TimeOfDayRegex})\\b|\\btonight)s?\\b`;
  EnglishDateTime2.TimeFollowedUnit = `^\\s*${EnglishDateTime2.TimeUnitRegex}`;
  EnglishDateTime2.TimeNumberCombinedWithUnit = `\\b(?<num>\\d+(\\.\\d*)?)${EnglishDateTime2.TimeUnitRegex}`;
  EnglishDateTime2.BusinessHourSplitStrings = ["business", "hour"];
  EnglishDateTime2.NowRegex = `\\b(?<now>(right\\s+)?now|as soon as possible|asap|recently|previously)\\b`;
  EnglishDateTime2.SuffixRegex = `^\\s*(in the\\s+)?(morning|afternoon|evening|night)\\b`;
  EnglishDateTime2.DateTimeTimeOfDayRegex = `\\b(?<timeOfDay>morning|afternoon|night|evening)\\b`;
  EnglishDateTime2.DateTimeSpecificTimeOfDayRegex = `\\b((${EnglishDateTime2.RelativeRegex}\\s+${EnglishDateTime2.DateTimeTimeOfDayRegex})\\b|\\btonight)\\b`;
  EnglishDateTime2.TimeOfTodayAfterRegex = `^\\s*(,\\s*)?(in\\s+)?${EnglishDateTime2.DateTimeSpecificTimeOfDayRegex}`;
  EnglishDateTime2.TimeOfTodayBeforeRegex = `${EnglishDateTime2.DateTimeSpecificTimeOfDayRegex}(\\s*,)?(\\s+(at|around|in|on))?\\s*$`;
  EnglishDateTime2.SimpleTimeOfTodayAfterRegex = `(${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*(,\\s*)?(in\\s+)?${EnglishDateTime2.DateTimeSpecificTimeOfDayRegex}`;
  EnglishDateTime2.SimpleTimeOfTodayBeforeRegex = `\\b${EnglishDateTime2.DateTimeSpecificTimeOfDayRegex}(\\s*,)?(\\s+(at|around))?\\s*(${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\b`;
  EnglishDateTime2.TheEndOfRegex = `(the\\s+)?end of(\\s+the)?\\s*$`;
  EnglishDateTime2.PeriodTimeOfDayRegex = `\\b((in\\s+(the)?\\s+)?((?<early>early(\\s+|-))|(?<late>late(\\s+|-)))?(?<timeOfDay>morning|afternoon|night|evening))\\b`;
  EnglishDateTime2.PeriodSpecificTimeOfDayRegex = `\\b((${EnglishDateTime2.StrictRelativeRegex}\\s+${EnglishDateTime2.PeriodTimeOfDayRegex})\\b|\\btonight)\\b`;
  EnglishDateTime2.PeriodTimeOfDayWithDateRegex = `\\b((${EnglishDateTime2.TimeOfDayRegex}(\\s+(on|of))?))\\b`;
  EnglishDateTime2.LessThanRegex = `\\b(less\\s+than)\\b`;
  EnglishDateTime2.MoreThanRegex = `\\b(more\\s+than)\\b`;
  EnglishDateTime2.DurationUnitRegex = `(?<unit>${EnglishDateTime2.DateUnitRegex}|hours?|hrs?|h|minutes?|mins?|seconds?|secs?)\\b`;
  EnglishDateTime2.SuffixAndRegex = `(?<suffix>\\s*(and)\\s+((an|a)\\s+)?(?<suffix_num>half|quarter))`;
  EnglishDateTime2.PeriodicRegex = `\\b(?<periodic>daily|monthly|weekly|biweekly|yearly|annually|annual)\\b`;
  EnglishDateTime2.EachUnitRegex = `(?<each>(each|every)(?<other>\\s+other)?\\s*${EnglishDateTime2.DurationUnitRegex})`;
  EnglishDateTime2.EachPrefixRegex = `\\b(?<each>(each|(every))\\s*$)`;
  EnglishDateTime2.SetEachRegex = `\\b(?<each>(each|(every))\\s*)`;
  EnglishDateTime2.SetLastRegex = `(?<last>following|next|upcoming|this|last|past|previous|current)`;
  EnglishDateTime2.EachDayRegex = `^\\s*(each|every)\\s*day\\b`;
  EnglishDateTime2.DurationFollowedUnit = `^\\s*${EnglishDateTime2.SuffixAndRegex}?(\\s+|-)?${EnglishDateTime2.DurationUnitRegex}`;
  EnglishDateTime2.NumberCombinedWithDurationUnit = `\\b(?<num>\\d+(\\.\\d*)?)(-)?${EnglishDateTime2.DurationUnitRegex}`;
  EnglishDateTime2.AnUnitRegex = `\\b((?<half>half\\s+)?(an|a)|another)\\s+${EnglishDateTime2.DurationUnitRegex}`;
  EnglishDateTime2.DuringRegex = `\\b(for|during)\\s+the\\s+(?<unit>year|month|week|day)\\b`;
  EnglishDateTime2.AllRegex = `\\b(?<all>(all|full|whole)(\\s+|-)(?<unit>year|month|week|day))\\b`;
  EnglishDateTime2.HalfRegex = `(((a|an)\\s*)|\\b)(?<half>half\\s+(?<unit>year|month|week|day|hour))\\b`;
  EnglishDateTime2.ConjunctionRegex = `\\b((and(\\s+for)?)|with)\\b`;
  EnglishDateTime2.HolidayRegex1 = `\\b(?<holiday>clean monday|good friday|ash wednesday|mardi gras|washington's birthday|mao's birthday|chinese new Year|new years' eve|new year's eve|new year 's eve|new years eve|new year eve|new years'|new year's|new year 's|new years|new year|may\\s*day|yuan dan|april fools|christmas eve|christmas|xmas|thanksgiving|halloween|yuandan|easter)(\\s+(of\\s+)?(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))?\\b`;
  EnglishDateTime2.HolidayRegex2 = `\\b(?<holiday>all saint's|tree planting day|white lover|st patrick|st george|cinco de mayo|us independence|all hallow|all souls|guy fawkes)(\\s+(of\\s+)?(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))?\\b`;
  EnglishDateTime2.HolidayRegex3 = `(?<holiday>(independence|mlk|martin luther king|martin luther king jr|canberra|easter|columbus|thanks\\s*giving|christmas|xmas|labour|(international|int'l)\\s+workers'?|mother's|mother|mothers|father's|father|fathers|female|single|teacher's|youth|children|arbor|girls|chsmilbuild|lover|labor|inauguration|groundhog|valentine's|baptiste|bastille|halloween|veterans|memorial|mid(-| )autumn|moon|spring|lantern|qingming|dragon boat|new years'|new year's|new year 's|new years|new year)\\s+(day))(\\s+(of\\s+)?(${EnglishDateTime2.YearRegex}|${EnglishDateTime2.RelativeRegex}\\s+year))?`;
  EnglishDateTime2.AMTimeRegex = `(?<am>morning)`;
  EnglishDateTime2.PMTimeRegex = `\\b(?<pm>afternoon|evening|night)\\b`;
  EnglishDateTime2.InclusiveModPrepositions = `(?<include>((on|in|at)\\s+or\\s+)|(\\s+or\\s+(on|in|at)))`;
  EnglishDateTime2.BeforeRegex = `(\\b${EnglishDateTime2.InclusiveModPrepositions}?(before|in\\s+advance\\s+of|prior\\s+to|(no\\s+later|earlier|sooner)\\s+than|ending\\s+(with|on)|by|till|til|until|(?<include>as\\s+late\\s+as))${EnglishDateTime2.InclusiveModPrepositions}?\\b\\s*)|(?<!\\w|>)((?<include><=)|<)`;
  EnglishDateTime2.AfterRegex = `(\\b${EnglishDateTime2.InclusiveModPrepositions}?((after|(?<!no\\s+)later than)|(year greater than))(?!\\s+or equal to)${EnglishDateTime2.InclusiveModPrepositions}?\\b\\s*)|(?<!\\w|<)((?<include>>=)|>)`;
  EnglishDateTime2.SinceRegex = `(\\b(since|after\\s+or\\s+equal\\s+to|starting\\s+(from|on|with)|as\\s+early\\s+as|any\\s+time\\s+from)\\b\\s*)|(?<!\\w|<)(>=)`;
  EnglishDateTime2.AroundRegex = `(\\b(around|circa)\\s*\\b)`;
  EnglishDateTime2.AgoRegex = `\\b(ago|before\\s+(?<day>yesterday|today))\\b`;
  EnglishDateTime2.LaterRegex = `\\b(later|from now|(from|after) (?<day>tomorrow|tmr|today))\\b`;
  EnglishDateTime2.InConnectorRegex = `\\b(in)\\b`;
  EnglishDateTime2.WithinNextPrefixRegex = `\\b(within(\\s+the)?(\\s+(?<next>${EnglishDateTime2.NextPrefixRegex}))?)\\b`;
  EnglishDateTime2.AmPmDescRegex = `(ampm)`;
  EnglishDateTime2.MorningStartEndRegex = `(^(morning|${EnglishDateTime2.AmDescRegex}))|((morning|${EnglishDateTime2.AmDescRegex})$)`;
  EnglishDateTime2.AfternoonStartEndRegex = `(^(afternoon|${EnglishDateTime2.PmDescRegex}))|((afternoon|${EnglishDateTime2.PmDescRegex})$)`;
  EnglishDateTime2.EveningStartEndRegex = `(^(evening))|((evening)$)`;
  EnglishDateTime2.NightStartEndRegex = `(^(overnight|tonight|night))|((overnight|tonight|night)$)`;
  EnglishDateTime2.InexactNumberRegex = `\\b(a few|few|some|several|(?<NumTwoTerm>(a\\s+)?couple(\\s+of)?))\\b`;
  EnglishDateTime2.InexactNumberUnitRegex = `(${EnglishDateTime2.InexactNumberRegex})\\s+(${EnglishDateTime2.DurationUnitRegex})`;
  EnglishDateTime2.RelativeTimeUnitRegex = `(((${EnglishDateTime2.NextPrefixRegex}|${EnglishDateTime2.PastPrefixRegex}|${EnglishDateTime2.ThisPrefixRegex})\\s+(${EnglishDateTime2.TimeUnitRegex}))|((the|my))\\s+(${EnglishDateTime2.RestrictedTimeUnitRegex}))`;
  EnglishDateTime2.RelativeDurationUnitRegex = `(((?<=(${EnglishDateTime2.NextPrefixRegex}|${EnglishDateTime2.PastPrefixRegex}|${EnglishDateTime2.ThisPrefixRegex})\\s+)(${EnglishDateTime2.DurationUnitRegex}))|((the|my))\\s+(${EnglishDateTime2.RestrictedTimeUnitRegex}))`;
  EnglishDateTime2.ReferenceDatePeriodRegex = `\\b${EnglishDateTime2.ReferencePrefixRegex}\\s+(?<duration>week|month|year|decade|weekend)\\b`;
  EnglishDateTime2.ConnectorRegex = `^(-|,|for|t|around|@)$`;
  EnglishDateTime2.FromToRegex = `\\b(from).+(to)\\b.+`;
  EnglishDateTime2.SingleAmbiguousMonthRegex = `^(the\\s+)?(may|march)$`;
  EnglishDateTime2.SingleAmbiguousTermsRegex = `^(the\\s+)?(day|week|month|year)$`;
  EnglishDateTime2.UnspecificDatePeriodRegex = `^(week|weekend|month|year)$`;
  EnglishDateTime2.PrepositionSuffixRegex = `\\b(on|in|at|around|from|to)$`;
  EnglishDateTime2.FlexibleDayRegex = `(?<DayOfMonth>([A-Za-z]+\\s)?[A-Za-z\\d]+)`;
  EnglishDateTime2.ForTheRegex = `\\b((((?<=for\\s+)the\\s+${EnglishDateTime2.FlexibleDayRegex})|((?<=on\\s+)(the\\s+)?${EnglishDateTime2.FlexibleDayRegex}(?<=(st|nd|rd|th))))(?<end>\\s*(,|\\.|!|\\?|$)))`;
  EnglishDateTime2.WeekDayAndDayOfMonthRegex = `\\b${EnglishDateTime2.WeekDayRegex}\\s+(the\\s+${EnglishDateTime2.FlexibleDayRegex})\\b`;
  EnglishDateTime2.RestOfDateRegex = `\\bRest\\s+(of\\s+)?((the|my|this|current)\\s+)?(?<duration>week|month|year|decade)\\b`;
  EnglishDateTime2.RestOfDateTimeRegex = `\\bRest\\s+(of\\s+)?((the|my|this|current)\\s+)?(?<unit>day)\\b`;
  EnglishDateTime2.MealTimeRegex = `\\b(at\\s+)?(?<mealTime>lunchtime)\\b`;
  EnglishDateTime2.NumberEndingPattern = `^(\\s+(?<meeting>meeting|appointment|conference|call|skype call)\\s+to\\s+(?<newTime>${EnglishDateTime2.PeriodHourNumRegex}|${EnglishDateTime2.HourRegex})((\\.)?$|(\\.,|,|!|\\?)))`;
  EnglishDateTime2.OneOnOneRegex = `\\b(1\\s*:\\s*1)|(one (on )?one|one\\s*-\\s*one|one\\s*:\\s*one)\\b`;
  EnglishDateTime2.LaterEarlyPeriodRegex = `\\b(${EnglishDateTime2.PrefixPeriodRegex})\\s*\\b\\s*(?<suffix>${EnglishDateTime2.OneWordPeriodRegex})\\b`;
  EnglishDateTime2.WeekWithWeekDayRangeRegex = `\\b((?<week>(${EnglishDateTime2.NextPrefixRegex}|${EnglishDateTime2.PastPrefixRegex}|this)\\s+week)((\\s+between\\s+${EnglishDateTime2.WeekDayRegex}\\s+and\\s+${EnglishDateTime2.WeekDayRegex})|(\\s+from\\s+${EnglishDateTime2.WeekDayRegex}\\s+to\\s+${EnglishDateTime2.WeekDayRegex})))\\b`;
  EnglishDateTime2.GeneralEndingRegex = `^\\s*((\\.,)|\\.|,|!|\\?)?\\s*$`;
  EnglishDateTime2.MiddlePauseRegex = `\\s*(,)\\s*`;
  EnglishDateTime2.DurationConnectorRegex = `^\\s*(?<connector>\\s+|and|,)\\s*$`;
  EnglishDateTime2.PrefixArticleRegex = `\\bthe\\s+`;
  EnglishDateTime2.OrRegex = `\\s*((\\b|,\\s*)(or|and)\\b|,)\\s*`;
  EnglishDateTime2.YearPlusNumberRegex = `\\b(Year\\s+((?<year>(\\d{3,4}))|${EnglishDateTime2.FullTextYearRegex}))\\b`;
  EnglishDateTime2.NumberAsTimeRegex = `\\b(${EnglishDateTime2.WrittenTimeRegex}|${EnglishDateTime2.PeriodHourNumRegex}|${exports.BaseDateTime.HourRegex})\\b`;
  EnglishDateTime2.TimeBeforeAfterRegex = `\\b(((?<=\\b(before|no later than|by|after)\\s+)(${EnglishDateTime2.WrittenTimeRegex}|${EnglishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}|${EnglishDateTime2.MidTimeRegex}))|${EnglishDateTime2.MidTimeRegex})\\b`;
  EnglishDateTime2.DateNumberConnectorRegex = `^\\s*(?<connector>\\s+at)\\s*$`;
  EnglishDateTime2.DecadeRegex = `(?<decade>noughties|twenties|thirties|forties|fifties|sixties|seventies|eighties|nineties|two thousands)`;
  EnglishDateTime2.DecadeWithCenturyRegex = `(the\\s+)?(((?<century>\\d|1\\d|2\\d)?(')?(?<decade>\\d0)(')?s)|((${EnglishDateTime2.CenturyRegex}(\\s+|-)(and\\s+)?)?${EnglishDateTime2.DecadeRegex})|(${EnglishDateTime2.CenturyRegex}(\\s+|-)(and\\s+)?(?<decade>tens|hundreds)))`;
  EnglishDateTime2.RelativeDecadeRegex = `\\b((the\\s+)?${EnglishDateTime2.RelativeRegex}\\s+((?<number>[\\w,]+)\\s+)?decades?)\\b`;
  EnglishDateTime2.DateAfterRegex = `\\b((or|and)\\s+(above|after|later|greater)(?!\\s+than))\\b`;
  EnglishDateTime2.YearPeriodRegex = `((((from|during|in)\\s+)?${EnglishDateTime2.YearRegex}\\s*(${EnglishDateTime2.TillRegex})\\s*${EnglishDateTime2.YearRegex})|(((between)\\s+)${EnglishDateTime2.YearRegex}\\s*(${EnglishDateTime2.RangeConnectorRegex})\\s*${EnglishDateTime2.YearRegex}))`;
  EnglishDateTime2.ComplexDatePeriodRegex = `(((from|during|in)\\s+)?(?<start>.+)\\s*(${EnglishDateTime2.TillRegex})\\s*(?<end>.+)|((between)\\s+)(?<start>.+)\\s*(${EnglishDateTime2.RangeConnectorRegex})\\s*(?<end>.+))`;
  EnglishDateTime2.UnitMap = /* @__PURE__ */ new Map([["decades", "10Y"], ["decade", "10Y"], ["years", "Y"], ["year", "Y"], ["months", "MON"], ["month", "MON"], ["weeks", "W"], ["week", "W"], ["days", "D"], ["day", "D"], ["hours", "H"], ["hour", "H"], ["hrs", "H"], ["hr", "H"], ["h", "H"], ["minutes", "M"], ["minute", "M"], ["mins", "M"], ["min", "M"], ["seconds", "S"], ["second", "S"], ["secs", "S"], ["sec", "S"]]);
  EnglishDateTime2.UnitValueMap = /* @__PURE__ */ new Map([["decades", 31536e4], ["decade", 31536e4], ["years", 31536e3], ["year", 31536e3], ["months", 2592e3], ["month", 2592e3], ["weeks", 604800], ["week", 604800], ["days", 86400], ["day", 86400], ["hours", 3600], ["hour", 3600], ["hrs", 3600], ["hr", 3600], ["h", 3600], ["minutes", 60], ["minute", 60], ["mins", 60], ["min", 60], ["seconds", 1], ["second", 1], ["secs", 1], ["sec", 1]]);
  EnglishDateTime2.SeasonMap = /* @__PURE__ */ new Map([["spring", "SP"], ["summer", "SU"], ["fall", "FA"], ["autumn", "FA"], ["winter", "WI"]]);
  EnglishDateTime2.SeasonValueMap = /* @__PURE__ */ new Map([["SP", 3], ["SU", 6], ["FA", 9], ["WI", 12]]);
  EnglishDateTime2.CardinalMap = /* @__PURE__ */ new Map([["first", 1], ["1st", 1], ["second", 2], ["2nd", 2], ["third", 3], ["3rd", 3], ["fourth", 4], ["4th", 4], ["fifth", 5], ["5th", 5]]);
  EnglishDateTime2.DayOfWeek = /* @__PURE__ */ new Map([["monday", 1], ["tuesday", 2], ["wednesday", 3], ["thursday", 4], ["friday", 5], ["saturday", 6], ["sunday", 0], ["mon", 1], ["tue", 2], ["tues", 2], ["wed", 3], ["wedn", 3], ["weds", 3], ["thu", 4], ["thur", 4], ["thurs", 4], ["fri", 5], ["sat", 6], ["sun", 0]]);
  EnglishDateTime2.MonthOfYear = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["january", 1], ["february", 2], ["march", 3], ["april", 4], ["may", 5], ["june", 6], ["july", 7], ["august", 8], ["september", 9], ["october", 10], ["november", 11], ["december", 12], ["jan", 1], ["feb", 2], ["mar", 3], ["apr", 4], ["jun", 6], ["jul", 7], ["aug", 8], ["sep", 9], ["sept", 9], ["oct", 10], ["nov", 11], ["dec", 12], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9]]);
  EnglishDateTime2.Numbers = /* @__PURE__ */ new Map([["zero", 0], ["one", 1], ["a", 1], ["an", 1], ["two", 2], ["three", 3], ["four", 4], ["five", 5], ["six", 6], ["seven", 7], ["eight", 8], ["nine", 9], ["ten", 10], ["eleven", 11], ["twelve", 12], ["thirteen", 13], ["fourteen", 14], ["fifteen", 15], ["sixteen", 16], ["seventeen", 17], ["eighteen", 18], ["nineteen", 19], ["twenty", 20], ["twenty one", 21], ["twenty two", 22], ["twenty three", 23], ["twenty four", 24], ["twenty five", 25], ["twenty six", 26], ["twenty seven", 27], ["twenty eight", 28], ["twenty nine", 29], ["thirty", 30], ["thirty one", 31], ["thirty two", 32], ["thirty three", 33], ["thirty four", 34], ["thirty five", 35], ["thirty six", 36], ["thirty seven", 37], ["thirty eight", 38], ["thirty nine", 39], ["forty", 40], ["forty one", 41], ["forty two", 42], ["forty three", 43], ["forty four", 44], ["forty five", 45], ["forty six", 46], ["forty seven", 47], ["forty eight", 48], ["forty nine", 49], ["fifty", 50], ["fifty one", 51], ["fifty two", 52], ["fifty three", 53], ["fifty four", 54], ["fifty five", 55], ["fifty six", 56], ["fifty seven", 57], ["fifty eight", 58], ["fifty nine", 59], ["sixty", 60], ["sixty one", 61], ["sixty two", 62], ["sixty three", 63], ["sixty four", 64], ["sixty five", 65], ["sixty six", 66], ["sixty seven", 67], ["sixty eight", 68], ["sixty nine", 69], ["seventy", 70], ["seventy one", 71], ["seventy two", 72], ["seventy three", 73], ["seventy four", 74], ["seventy five", 75], ["seventy six", 76], ["seventy seven", 77], ["seventy eight", 78], ["seventy nine", 79], ["eighty", 80], ["eighty one", 81], ["eighty two", 82], ["eighty three", 83], ["eighty four", 84], ["eighty five", 85], ["eighty six", 86], ["eighty seven", 87], ["eighty eight", 88], ["eighty nine", 89], ["ninety", 90], ["ninety one", 91], ["ninety two", 92], ["ninety three", 93], ["ninety four", 94], ["ninety five", 95], ["ninety six", 96], ["ninety seven", 97], ["ninety eight", 98], ["ninety nine", 99], ["one hundred", 100]]);
  EnglishDateTime2.DayOfMonth = /* @__PURE__ */ new Map([["1st", 1], ["2nd", 2], ["3rd", 3], ["4th", 4], ["5th", 5], ["6th", 6], ["7th", 7], ["8th", 8], ["9th", 9], ["10th", 10], ["11th", 11], ["11st", 11], ["12th", 12], ["12nd", 12], ["13th", 13], ["13rd", 13], ["14th", 14], ["15th", 15], ["16th", 16], ["17th", 17], ["18th", 18], ["19th", 19], ["20th", 20], ["21st", 21], ["21th", 21], ["22nd", 22], ["22th", 22], ["23rd", 23], ["23th", 23], ["24th", 24], ["25th", 25], ["26th", 26], ["27th", 27], ["28th", 28], ["29th", 29], ["30th", 30], ["31st", 31]]);
  EnglishDateTime2.DoubleNumbers = /* @__PURE__ */ new Map([["half", 0.5], ["quarter", 0.25]]);
  EnglishDateTime2.HolidayNames = /* @__PURE__ */ new Map([["easterday", ["easterday", "easter"]], ["fathers", ["fatherday", "fathersday"]], ["mothers", ["motherday", "mothersday"]], ["thanksgiving", ["thanksgivingday", "thanksgiving"]], ["martinlutherking", ["mlkday", "martinlutherkingday", "martinlutherkingjrday"]], ["washingtonsbirthday", ["washingtonsbirthday", "washingtonbirthday"]], ["canberra", ["canberraday"]], ["labour", ["labourday", "laborday"]], ["columbus", ["columbusday"]], ["memorial", ["memorialday"]], ["yuandan", ["yuandan"]], ["maosbirthday", ["maosbirthday"]], ["teachersday", ["teachersday", "teacherday"]], ["singleday", ["singleday"]], ["allsaintsday", ["allsaintsday"]], ["youthday", ["youthday"]], ["childrenday", ["childrenday", "childday"]], ["femaleday", ["femaleday"]], ["treeplantingday", ["treeplantingday"]], ["arborday", ["arborday"]], ["girlsday", ["girlsday"]], ["whiteloverday", ["whiteloverday"]], ["loverday", ["loverday"]], ["christmas", ["christmasday", "christmas"]], ["xmas", ["xmasday", "xmas"]], ["newyear", ["newyear"]], ["newyearday", ["newyearday"]], ["newyearsday", ["newyearsday"]], ["inaugurationday", ["inaugurationday"]], ["groundhougday", ["groundhougday"]], ["valentinesday", ["valentinesday"]], ["stpatrickday", ["stpatrickday"]], ["aprilfools", ["aprilfools"]], ["stgeorgeday", ["stgeorgeday"]], ["mayday", ["mayday", "intlworkersday", "internationalworkersday"]], ["cincodemayoday", ["cincodemayoday"]], ["baptisteday", ["baptisteday"]], ["usindependenceday", ["usindependenceday"]], ["independenceday", ["independenceday"]], ["bastilleday", ["bastilleday"]], ["halloweenday", ["halloweenday"]], ["allhallowday", ["allhallowday"]], ["allsoulsday", ["allsoulsday"]], ["guyfawkesday", ["guyfawkesday"]], ["veteransday", ["veteransday"]], ["christmaseve", ["christmaseve"]], ["newyeareve", ["newyearseve", "newyeareve"]]]);
  EnglishDateTime2.WrittenDecades = /* @__PURE__ */ new Map([["hundreds", 0], ["tens", 10], ["twenties", 20], ["thirties", 30], ["forties", 40], ["fifties", 50], ["sixties", 60], ["seventies", 70], ["eighties", 80], ["nineties", 90]]);
  EnglishDateTime2.SpecialDecadeCases = /* @__PURE__ */ new Map([["noughties", 2e3], ["two thousands", 2e3]]);
  EnglishDateTime2.DefaultLanguageFallback = "MDY";
  EnglishDateTime2.SuperfluousWordList = ["preferably", "how about", "maybe", "say", "like"];
  EnglishDateTime2.DurationDateRestrictions = ["today", "now"];
  EnglishDateTime2.AmbiguityFiltersDict = /* @__PURE__ */ new Map([["\\bmorning|afternoon|evening|night|day\\b", "\\bgood\\s+(morning|afternoon|evening|night|day)\\b"], ["\\bmay\\b", "\\b((^may i)|(i|you|he|she|we|they)\\s+may|(may\\s+((((also|not|(also not)|well)\\s+)?(be|contain|constitute|email|e-mail|take|have|result|involve|get|work|reply))|(or may not))))\\b"]]);
})(exports.EnglishDateTime || (exports.EnglishDateTime = {}));
var DateTimeParseResult = class extends recognizersText.ParseResult {
};
var BaseDateParserConfiguration = class {
  constructor() {
    this.dayOfMonth = exports.BaseDateTime.DayOfMonthDictionary;
  }
};
var BaseDateExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DATE;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array();
    tokens = tokens.concat(this.basicRegexMatch(source));
    tokens = tokens.concat(this.implicitDate(source));
    tokens = tokens.concat(this.numberWithMonth(source, referenceDate));
    tokens = tokens.concat(this.durationWithBeforeAndAfter(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  basicRegexMatch(source) {
    let ret = [];
    this.config.dateRegexList.forEach((regexp) => {
      let matches = recognizersText.RegExpUtility.getMatches(regexp, source);
      matches.forEach((match) => {
        ret.push(new Token(match.index, match.index + match.length));
      });
    });
    return ret;
  }
  implicitDate(source) {
    let ret = [];
    this.config.implicitDateList.forEach((regexp) => {
      let matches = recognizersText.RegExpUtility.getMatches(regexp, source);
      matches.forEach((match) => {
        ret.push(new Token(match.index, match.index + match.length));
      });
    });
    return ret;
  }
  numberWithMonth(source, refDate) {
    let ret = [];
    let er = this.config.ordinalExtractor.extract(source).concat(this.config.integerExtractor.extract(source));
    er.forEach((result) => {
      let num = toNumber(this.config.numberParser.parse(result).value);
      if (num < 1 || num > 31) {
        return;
      }
      if (result.start >= 0) {
        let frontString = source.substring(0, result.start | 0);
        let match = recognizersText.RegExpUtility.getMatches(this.config.monthEnd, frontString)[0];
        if (match && match.length) {
          ret.push(new Token(match.index, match.index + match.length + result.length));
          return;
        }
        let matches = recognizersText.RegExpUtility.getMatches(this.config.forTheRegex, source);
        let isFound = false;
        matches.forEach((matchCase) => {
          if (matchCase) {
            let ordinalNum = matchCase.groups("DayOfMonth").value;
            if (ordinalNum === result.text) {
              let length = matchCase.groups("end").value.length;
              ret.push(new Token(matchCase.index, matchCase.index + matchCase.length - length));
              isFound = true;
            }
          }
        });
        if (isFound) {
          return;
        }
        matches = recognizersText.RegExpUtility.getMatches(this.config.weekDayAndDayOfMonthRegex, source);
        matches.forEach((matchCase) => {
          if (matchCase) {
            let ordinalNum = matchCase.groups("DayOfMonth").value;
            if (ordinalNum === result.text) {
              let month = refDate.getMonth();
              let year = refDate.getFullYear();
              let date = DateUtils.safeCreateFromMinValue(year, month, num);
              let numWeekDayStr = DayOfWeek[date.getDay()].toString().toLowerCase();
              let extractedWeekDayStr = matchCase.groups("weekday").value.toString().toLowerCase();
              if (date !== DateUtils.minValue() && this.config.dayOfWeek.get(numWeekDayStr) === this.config.dayOfWeek.get(extractedWeekDayStr)) {
                ret.push(new Token(matchCase.index, result.start + result.length));
                isFound = true;
              }
            }
          }
        });
        if (isFound) {
          return;
        }
        let suffixStr = source.substr(result.start + result.length).toLowerCase();
        match = recognizersText.RegExpUtility.getMatches(this.config.relativeMonthRegex, suffixStr.trim()).pop();
        if (match && match.index === 0) {
          let spaceLen = suffixStr.length - suffixStr.trim().length;
          ret.push(new Token(result.start, result.start + result.length + spaceLen + match.length));
        }
        match = recognizersText.RegExpUtility.getMatches(this.config.weekDayRegex, suffixStr.trim()).pop();
        if (match && match.index === 0 && num >= 1 && num <= 5 && result.type === recognizersTextNumber.Constants.SYS_NUM_ORDINAL) {
          let weekDayStr = match.groups("weekday").value;
          if (this.config.dayOfWeek.has(weekDayStr)) {
            let spaceLen = suffixStr.length - suffixStr.trim().length;
            ret.push(new Token(result.start, result.start + result.length + spaceLen + match.length));
          }
        }
      }
      if (result.start + result.length < source.length) {
        let afterString = source.substring(result.start + result.length);
        let match = recognizersText.RegExpUtility.getMatches(this.config.ofMonth, afterString)[0];
        if (match && match.length) {
          ret.push(new Token(result.start, result.start + result.length + match.length));
          return;
        }
      }
    });
    return ret;
  }
  durationWithBeforeAndAfter(source, refDate) {
    let ret = [];
    let durEx = this.config.durationExtractor.extract(source, refDate);
    durEx.forEach((er) => {
      let match = recognizersText.RegExpUtility.getMatches(this.config.dateUnitRegex, er.text).pop();
      if (!match) return;
      ret = AgoLaterUtil.extractorDurationWithBeforeAndAfter(source, er, ret, this.config.utilityConfiguration);
    });
    return ret;
  }
};
var BaseDateParser = class {
  constructor(config) {
    this.parserName = Constants.SYS_DATETIME_DATE;
    this.config = config;
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.toLowerCase();
      let innerResult = this.parseBasicRegexMatch(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.parseImplicitDate(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekdayOfMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parserDurationWithAgoAndLater(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseNumberWithMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseSingleNumber(source, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.pastValue);
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  parseBasicRegexMatch(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    this.config.dateRegex.some((regex) => {
      let offset = 0;
      let match = recognizersText.RegExpUtility.getMatches(regex, trimmedSource).pop();
      if (!match) {
        match = recognizersText.RegExpUtility.getMatches(regex, this.config.dateTokenPrefix + trimmedSource).pop();
        offset = this.config.dateTokenPrefix.length;
      }
      if (match && match.index === offset && match.length === trimmedSource.length) {
        result = this.matchToDate(match, referenceDate);
        return true;
      }
    });
    return result;
  }
  parseImplicitDate(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.onRegex, this.config.dateTokenPrefix + trimmedSource).pop();
    if (match && match.index === this.config.dateTokenPrefix.length && match.length === trimmedSource.length) {
      let day = 0;
      let month = referenceDate.getMonth();
      let year = referenceDate.getFullYear();
      let dayStr = match.groups("day").value;
      day = this.config.dayOfMonth.get(dayStr);
      result.timex = FormatUtil.luisDate(-1, -1, day);
      let tryStr = FormatUtil.luisDate(year, month, day);
      let tryDate = Date.parse(tryStr);
      let futureDate;
      let pastDate;
      if (tryDate && !isNaN(tryDate)) {
        futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
        pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
        if (futureDate < referenceDate) {
          futureDate.setMonth(futureDate.getMonth() + 1);
        }
        if (pastDate >= referenceDate) {
          pastDate.setMonth(pastDate.getMonth() - 1);
        }
      } else {
        futureDate = DateUtils.safeCreateFromMinValue(year, month + 1, day);
        pastDate = DateUtils.safeCreateFromMinValue(year, month - 1, day);
      }
      result.futureValue = futureDate;
      result.pastValue = pastDate;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.specialDayRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let swift = this.config.getSwiftDay(match.value);
      let value = DateUtils.addDays(referenceDate, swift);
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.specialDayWithNumRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let swift = this.config.getSwiftDay(match.groups("day").value);
      let numErs = this.config.integerExtractor.extract(trimmedSource);
      let numOfDays = Number.parseInt(this.config.numberParser.parse(numErs[0]).value);
      let value = DateUtils.addDays(referenceDate, swift + numOfDays);
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.relativeWeekDayRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let numErs = this.config.integerExtractor.extract(trimmedSource);
      let num = Number.parseInt(this.config.numberParser.parse(numErs[0]).value);
      let weekdayStr = match.groups("weekday").value.toLowerCase();
      let value = referenceDate;
      if (value.getDay() > this.config.dayOfWeek.get(weekdayStr)) {
        num--;
      }
      while (num-- > 0) {
        value = DateUtils.next(value, this.config.dayOfWeek.get(weekdayStr));
      }
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.nextRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.next(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.thisRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.this(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.lastRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.last(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.weekDayRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let weekday = this.config.dayOfWeek.get(weekdayStr);
      let value = DateUtils.this(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      if (weekday === 0) weekday = 7;
      if (weekday < referenceDate.getDay()) value = DateUtils.next(referenceDate, weekday);
      result.timex = "XXXX-WXX-" + weekday;
      let futureDate = new Date(value);
      let pastDate = new Date(value);
      if (futureDate < referenceDate) futureDate.setDate(value.getDate() + 7);
      if (pastDate >= referenceDate) pastDate.setDate(value.getDate() - 7);
      result.futureValue = futureDate;
      result.pastValue = pastDate;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.forTheRegex, trimmedSource).pop();
    if (match) {
      let dayStr = match.groups("DayOfMonth").value;
      let er = recognizersText.ExtractResult.getFromText(dayStr);
      let day = Number.parseInt(this.config.numberParser.parse(er).value);
      let month = referenceDate.getMonth();
      let year = referenceDate.getFullYear();
      result.timex = FormatUtil.luisDate(-1, -1, day);
      let date = new Date(year, month, day);
      result.futureValue = date;
      result.pastValue = date;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.weekDayAndDayOfMonthRegex, trimmedSource).pop();
    if (match) {
      let dayStr = match.groups("DayOfMonth").value;
      let er = recognizersText.ExtractResult.getFromText(dayStr);
      let day = Number.parseInt(this.config.numberParser.parse(er).value);
      let month = referenceDate.getMonth();
      let year = referenceDate.getFullYear();
      result.timex = FormatUtil.luisDate(year, month, day);
      result.futureValue = new Date(year, month, day);
      result.pastValue = new Date(year, month, day);
      result.success = true;
      return result;
    }
    return result;
  }
  parseNumberWithMonth(source, referenceDate) {
    let trimmedSource = source.trim();
    let ambiguous = true;
    let result = new DateTimeResolutionResult();
    let ers = this.config.ordinalExtractor.extract(trimmedSource);
    if (!ers || ers.length === 0) {
      ers = this.config.integerExtractor.extract(trimmedSource);
    }
    if (!ers || ers.length === 0) return result;
    let num = Number.parseInt(this.config.numberParser.parse(ers[0]).value);
    let day = 1;
    let month = 0;
    let match = recognizersText.RegExpUtility.getMatches(this.config.monthRegex, trimmedSource).pop();
    if (match) {
      month = this.config.monthOfYear.get(match.value) - 1;
      day = num;
    } else {
      match = recognizersText.RegExpUtility.getMatches(this.config.relativeMonthRegex, trimmedSource).pop();
      if (match) {
        let monthStr = match.groups("order").value;
        let swift = this.config.getSwiftMonth(monthStr);
        let date = new Date(referenceDate);
        date.setMonth(referenceDate.getMonth() + swift);
        month = date.getMonth();
        day = num;
        ambiguous = false;
      }
    }
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.weekDayRegex, trimmedSource).pop();
      if (match) {
        month = referenceDate.getMonth();
        let wantedWeekDay = this.config.dayOfWeek.get(match.groups("weekday").value);
        let firstDate = DateUtils.safeCreateFromMinValue(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        let firstWeekday = firstDate.getDay();
        let firstWantedWeekDay = new Date(firstDate);
        firstWantedWeekDay.setDate(firstDate.getDate() + (wantedWeekDay > firstWeekday ? wantedWeekDay - firstWeekday : wantedWeekDay - firstWeekday + 7));
        day = firstWantedWeekDay.getDate() + (num - 1) * 7;
        ambiguous = false;
      }
    }
    if (!match) return result;
    let year = referenceDate.getFullYear();
    let futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
    let pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
    if (ambiguous) {
      result.timex = FormatUtil.luisDate(-1, month, day);
      if (futureDate < referenceDate) futureDate.setFullYear(year + 1);
      if (pastDate >= referenceDate) pastDate.setFullYear(year - 1);
    } else {
      result.timex = FormatUtil.luisDate(year, month, day);
    }
    result.futureValue = futureDate;
    result.pastValue = pastDate;
    result.success = true;
    return result;
  }
  // handle cases like "the 27th". In the extractor, only the unmatched weekday and date will output this date.
  parseSingleNumber(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let er = this.config.ordinalExtractor.extract(trimmedSource).pop();
    if (!er || recognizersText.StringUtility.isNullOrEmpty(er.text)) {
      er = this.config.integerExtractor.extract(trimmedSource).pop();
    }
    if (!er || recognizersText.StringUtility.isNullOrEmpty(er.text)) return result;
    let day = Number.parseInt(this.config.numberParser.parse(er).value);
    let month = referenceDate.getMonth();
    let year = referenceDate.getFullYear();
    result.timex = FormatUtil.luisDate(-1, -1, day);
    let pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
    let futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
    if (futureDate !== DateUtils.minValue() && futureDate < referenceDate) futureDate.setMonth(month + 1);
    if (pastDate !== DateUtils.minValue() && pastDate >= referenceDate) pastDate.setMonth(month - 1);
    result.futureValue = futureDate;
    result.pastValue = pastDate;
    result.success = true;
    return result;
  }
  parserDurationWithAgoAndLater(source, referenceDate) {
    return AgoLaterUtil.parseDurationWithAgoAndLater(
      source,
      referenceDate,
      this.config.durationExtractor,
      this.config.durationParser,
      this.config.unitMap,
      this.config.unitRegex,
      this.config.utilityConfiguration,
      0 /* Date */
    );
  }
  parseWeekdayOfMonth(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.weekDayOfMonthRegex, trimmedSource).pop();
    if (!match) return result;
    let cardinalStr = match.groups("cardinal").value;
    let weekdayStr = match.groups("weekday").value;
    let monthStr = match.groups("month").value;
    let noYear = false;
    let cardinal = this.config.isCardinalLast(cardinalStr) ? 5 : this.config.cardinalMap.get(cardinalStr);
    let weekday = this.config.dayOfWeek.get(weekdayStr);
    let month = referenceDate.getMonth();
    let year = referenceDate.getFullYear();
    if (recognizersText.StringUtility.isNullOrEmpty(monthStr)) {
      let swift = this.config.getSwiftMonth(trimmedSource);
      let temp = new Date(referenceDate);
      temp.setMonth(referenceDate.getMonth() + swift);
      month = temp.getMonth();
      year = temp.getFullYear();
    } else {
      month = this.config.monthOfYear.get(monthStr) - 1;
      noYear = true;
    }
    let value = this.computeDate(cardinal, weekday, month, year);
    if (value.getMonth() !== month) {
      cardinal -= 1;
      value.setDate(value.getDate() - 7);
    }
    let futureDate = value;
    let pastDate = value;
    if (noYear && futureDate < referenceDate) {
      futureDate = this.computeDate(cardinal, weekday, month, year + 1);
      if (futureDate.getMonth() !== month) futureDate.setDate(futureDate.getDate() - 7);
    }
    if (noYear && pastDate >= referenceDate) {
      pastDate = this.computeDate(cardinal, weekday, month, year - 1);
      if (pastDate.getMonth() !== month) pastDate.setDate(pastDate.getDate() - 7);
    }
    result.timex = ["XXXX", FormatUtil.toString(month + 1, 2), "WXX", weekday, "#" + cardinal].join("-");
    result.futureValue = futureDate;
    result.pastValue = pastDate;
    result.success = true;
    return result;
  }
  matchToDate(match, referenceDate) {
    let result = new DateTimeResolutionResult();
    let yearStr = match.groups("year").value;
    let monthStr = match.groups("month").value;
    let dayStr = match.groups("day").value;
    let month = 0;
    let day = 0;
    let year = 0;
    if (this.config.monthOfYear.has(monthStr) && this.config.dayOfMonth.has(dayStr)) {
      month = this.config.monthOfYear.get(monthStr) - 1;
      day = this.config.dayOfMonth.get(dayStr);
      if (!recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
        year = Number.parseInt(yearStr, 10);
        if (year < 100 && year >= Constants.MinTwoDigitYearPastNum) year += 1900;
        else if (year >= 0 && year < Constants.MaxTwoDigitYearFutureNum) year += 2e3;
      }
    }
    let noYear = false;
    if (year === 0) {
      year = referenceDate.getFullYear();
      result.timex = FormatUtil.luisDate(-1, month, day);
      noYear = true;
    } else {
      result.timex = FormatUtil.luisDate(year, month, day);
    }
    let futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
    let pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
    if (noYear && futureDate < referenceDate) {
      futureDate = DateUtils.safeCreateFromMinValue(year + 1, month, day);
    }
    if (noYear && pastDate >= referenceDate) {
      pastDate = DateUtils.safeCreateFromMinValue(year - 1, month, day);
    }
    result.futureValue = futureDate;
    result.pastValue = pastDate;
    result.success = true;
    return result;
  }
  computeDate(cardinal, weekday, month, year) {
    let firstDay = new Date(year, month, 1);
    let firstWeekday = DateUtils.this(firstDay, weekday);
    let dayOfWeekOfFirstDay = firstDay.getDay();
    if (weekday === 0) weekday = 7;
    if (dayOfWeekOfFirstDay === 0) dayOfWeekOfFirstDay = 7;
    if (weekday < dayOfWeekOfFirstDay) firstWeekday = DateUtils.next(firstDay, weekday);
    firstWeekday.setDate(firstWeekday.getDate() + 7 * (cardinal - 1));
    return firstWeekday;
  }
};
var BaseTimeExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_TIME;
    this.config = config;
  }
  extract(text, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.basicRegexMatch(text)).concat(this.atRegexMatch(text)).concat(this.specialsRegexMatch(text, referenceDate));
    let result = Token.mergeAllTokens(tokens, text, this.extractorName);
    return result;
  }
  basicRegexMatch(text) {
    let ret = [];
    this.config.timeRegexList.forEach((regexp) => {
      let matches = recognizersTextNumber.RegExpUtility.getMatches(regexp, text);
      matches.forEach((match) => {
        ret.push(new Token(match.index, match.index + match.length));
      });
    });
    return ret;
  }
  atRegexMatch(text) {
    let ret = [];
    let matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.atRegex, text);
    matches.forEach((match) => {
      if (match.index + match.length < text.length && text.charAt(match.index + match.length) === "%") {
        return;
      }
      ret.push(new Token(match.index, match.index + match.length));
    });
    return ret;
  }
  specialsRegexMatch(text, refDate) {
    let ret = [];
    if (this.config.ishRegex !== null) {
      let matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.ishRegex, text);
      matches.forEach((match) => {
        ret.push(new Token(match.index, match.index + match.length));
      });
    }
    return ret;
  }
};
var BaseTimeParser = class {
  constructor(configuration) {
    this.ParserName = Constants.SYS_DATETIME_TIME;
    this.config = configuration;
  }
  parse(er, referenceTime) {
    if (!referenceTime) referenceTime = /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === this.ParserName) {
      let innerResult = this.internalParse(er.text, referenceTime);
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.TIME] = FormatUtil.formatTime(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.TIME] = FormatUtil.formatTime(innerResult.pastValue);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value, ret.timexStr = value === null ? "" : value.timex, ret.resolutionStr = "";
    return ret;
  }
  internalParse(text, referenceTime) {
    let innerResult = this.parseBasicRegexMatch(text, referenceTime);
    return innerResult;
  }
  // parse basic patterns in TimeRegexList
  parseBasicRegexMatch(text, referenceTime) {
    let trimmedText = text.trim().toLowerCase();
    let offset = 0;
    let matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.atRegex, trimmedText);
    if (matches.length === 0) {
      matches = recognizersTextNumber.RegExpUtility.getMatches(this.config.atRegex, this.config.timeTokenPrefix + trimmedText);
      offset = this.config.timeTokenPrefix.length;
    }
    if (matches.length > 0 && matches[0].index === offset && matches[0].length === trimmedText.length) {
      return this.match2Time(matches[0], referenceTime);
    }
    let hour = this.config.numbers.get(text) || Number(text);
    if (hour) {
      if (hour >= 0 && hour <= 24) {
        let ret = new DateTimeResolutionResult();
        if (hour === 24) {
          hour = 0;
        }
        if (hour <= 12 && hour !== 0) {
          ret.comment = "ampm";
        }
        ret.timex = "T" + FormatUtil.toString(hour, 2);
        ret.futureValue = ret.pastValue = DateUtils.safeCreateFromMinValue(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), hour, 0, 0);
        ret.success = true;
        return ret;
      }
    }
    for (let regex of this.config.timeRegexes) {
      offset = 0;
      matches = recognizersTextNumber.RegExpUtility.getMatches(regex, trimmedText);
      if (matches.length && matches[0].index === offset && matches[0].length === trimmedText.length) {
        return this.match2Time(matches[0], referenceTime);
      }
    }
    return new DateTimeResolutionResult();
  }
  match2Time(match, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let hour = 0;
    let min = 0;
    let second = 0;
    let day = referenceTime.getDate();
    let month = referenceTime.getMonth();
    let year = referenceTime.getFullYear();
    let hasMin = false;
    let hasSec = false;
    let hasAm = false;
    let hasPm = false;
    let hasMid = false;
    let engTimeStr = match.groups("engtime").value;
    if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(engTimeStr)) {
      let hourStr = match.groups("hournum").value.toLowerCase();
      hour = this.config.numbers.get(hourStr);
      let minStr = match.groups("minnum").value;
      let tensStr = match.groups("tens").value;
      if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(minStr)) {
        min = this.config.numbers.get(minStr);
        if (tensStr) {
          min += this.config.numbers.get(tensStr);
        }
        hasMin = true;
      }
    } else if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(match.groups("mid").value)) {
      hasMid = true;
      if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(match.groups("midnight").value)) {
        hour = 0;
        min = 0;
        second = 0;
      } else if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(match.groups("midmorning").value)) {
        hour = 10;
        min = 0;
        second = 0;
      } else if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(match.groups("midafternoon").value)) {
        hour = 14;
        min = 0;
        second = 0;
      } else if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(match.groups("midday").value)) {
        hour = 12;
        min = 0;
        second = 0;
      }
    } else {
      let hourStr = match.groups("hour").value;
      if (recognizersTextNumber.StringUtility.isNullOrWhitespace(hourStr)) {
        hourStr = match.groups("hournum").value.toLowerCase();
        hour = this.config.numbers.get(hourStr);
        if (!hour) {
          return ret;
        }
      } else {
        hour = Number.parseInt(hourStr, 10);
        if (!hour) {
          hour = this.config.numbers.get(hourStr);
          if (!hour) {
            return ret;
          }
        }
      }
      let minStr = match.groups("min").value.toLowerCase();
      if (recognizersTextNumber.StringUtility.isNullOrWhitespace(minStr)) {
        minStr = match.groups("minnum").value;
        if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(minStr)) {
          min = this.config.numbers.get(minStr);
          hasMin = true;
        }
        let tensStr = match.groups("tens").value;
        if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(tensStr)) {
          min += this.config.numbers.get(tensStr);
          hasMin = true;
        }
      } else {
        min = Number.parseInt(minStr, 10);
        hasMin = true;
      }
      let secStr = match.groups("sec").value.toLowerCase();
      if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(secStr)) {
        second = Number.parseInt(secStr, 10);
        hasSec = true;
      }
    }
    let descStr = match.groups("desc").value.toLowerCase();
    if (recognizersTextNumber.RegExpUtility.getMatches(this.config.utilityConfiguration.amDescRegex, descStr).length > 0 || recognizersTextNumber.RegExpUtility.getMatches(this.config.utilityConfiguration.amPmDescRegex, descStr).length > 0 || !recognizersTextNumber.StringUtility.isNullOrEmpty(match.groups("iam").value)) {
      if (hour >= 12) {
        hour -= 12;
      }
      if (recognizersTextNumber.RegExpUtility.getMatches(this.config.utilityConfiguration.amPmDescRegex, descStr).length === 0) {
        hasAm = true;
      }
    } else if (recognizersTextNumber.RegExpUtility.getMatches(this.config.utilityConfiguration.pmDescRegex, descStr).length > 0 || !recognizersTextNumber.StringUtility.isNullOrEmpty(match.groups("ipm").value)) {
      if (hour < 12) {
        hour += 12;
      }
      hasPm = true;
    }
    let timePrefix = match.groups("prefix").value.toLowerCase();
    if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(timePrefix)) {
      let adjust = { hour, min, hasMin };
      this.config.adjustByPrefix(timePrefix, adjust);
      hour = adjust.hour;
      min = adjust.min;
      hasMin = adjust.hasMin;
    }
    let timeSuffix = match.groups("suffix").value.toLowerCase();
    if (!recognizersTextNumber.StringUtility.isNullOrWhitespace(timeSuffix)) {
      let adjust = { hour, min, hasMin, hasAm, hasPm };
      this.config.adjustBySuffix(timeSuffix, adjust);
      hour = adjust.hour;
      min = adjust.min;
      hasMin = adjust.hasMin;
      hasAm = adjust.hasAm;
      hasPm = adjust.hasPm;
    }
    if (hour === 24) {
      hour = 0;
    }
    ret.timex = "T" + FormatUtil.toString(hour, 2);
    if (hasMin) {
      ret.timex += ":" + FormatUtil.toString(min, 2);
    }
    if (hasSec) {
      ret.timex += ":" + FormatUtil.toString(second, 2);
    }
    if (hour <= 12 && !hasPm && !hasAm && !hasMid) {
      ret.comment = "ampm";
    }
    ret.futureValue = ret.pastValue = new Date(year, month, day, hour, min, second);
    ret.success = true;
    return ret;
  }
};
var BaseDatePeriodExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DATEPERIOD;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array();
    tokens = tokens.concat(this.matchSimpleCases(source));
    tokens = tokens.concat(this.mergeTwoTimePoints(source, referenceDate));
    tokens = tokens.concat(this.matchDuration(source, referenceDate));
    tokens = tokens.concat(this.singleTimePointWithPatterns(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchSimpleCases(source) {
    let tokens = new Array();
    this.config.simpleCasesRegexes.forEach((regexp) => {
      recognizersText.RegExpUtility.getMatches(regexp, source).forEach((match) => {
        let addToken = true;
        let matchYear = recognizersText.RegExpUtility.getMatches(this.config.YearRegex, match.value).pop();
        if (matchYear && matchYear.length === match.value.length) {
          let yearStr = matchYear.groups("year").value;
          if (recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
            let year = this.getYearFromText(matchYear);
            if (!(year >= Constants.MinYearNum && year <= Constants.MaxYearNum)) {
              addToken = false;
            }
          }
        }
        if (match.length === Constants.FourDigitsYearLength && recognizersText.RegExpUtility.isMatch(this.config.YearRegex, match.value) && this.infixBoundaryCheck(match, source)) {
          let substr = source.substr(match.index - 1, 6);
          if (recognizersText.RegExpUtility.isMatch(this.config.illegalYearRegex, substr)) {
            addToken = false;
          }
        }
        if (addToken) {
          tokens.push(new Token(match.index, match.index + match.length));
        }
      });
    });
    return tokens;
  }
  getYearFromText(match) {
    let firstTwoYearNumStr = match.groups("firsttwoyearnum").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(firstTwoYearNumStr)) {
      let er = new recognizersText.ExtractResult();
      er.text = firstTwoYearNumStr;
      er.start = match.groups("firsttwoyearnum").index;
      er.length = match.groups("firsttwoyearnum").length;
      let firstTwoYearNum = Number.parseInt(this.config.numberParser.parse(er).value);
      let lastTwoYearNum = 0;
      let lastTwoYearNumStr = match.groups("lasttwoyearnum").value;
      if (!recognizersText.StringUtility.isNullOrEmpty(lastTwoYearNumStr)) {
        er.text = lastTwoYearNumStr;
        er.start = match.groups("lasttwoyearnum").index;
        er.length = match.groups("lasttwoyearnum").length;
        lastTwoYearNum = Number.parseInt(this.config.numberParser.parse(er).value);
      }
      if (firstTwoYearNum < 100 && lastTwoYearNum === 0 || firstTwoYearNum < 100 && firstTwoYearNum % 10 === 0 && lastTwoYearNumStr.trim().split(" ").length === 1) {
        return -1;
      }
      if (firstTwoYearNum >= 100) {
        return firstTwoYearNum + lastTwoYearNum;
      } else {
        return firstTwoYearNum * 100 + lastTwoYearNum;
      }
    } else {
      return -1;
    }
  }
  mergeTwoTimePoints(source, refDate) {
    let tokens = new Array();
    let er = this.config.datePointExtractor.extract(source, refDate);
    if (er.length <= 1) {
      return tokens;
    }
    let idx = 0;
    while (idx < er.length - 1) {
      let middleBegin = er[idx].start + (er[idx].length || 0);
      let middleEnd = er[idx + 1].start || 0;
      if (middleBegin >= middleEnd) {
        idx++;
        continue;
      }
      let middleStr = source.substr(middleBegin, middleEnd - middleBegin).trim().toLowerCase();
      let match = recognizersText.RegExpUtility.getMatches(this.config.tillRegex, middleStr);
      if (match && match.length > 0 && match[0].index === 0 && match[0].length === middleStr.length) {
        let periodBegin = er[idx].start || 0;
        let periodEnd = (er[idx + 1].start || 0) + (er[idx + 1].length || 0);
        let beforeStr = source.substring(0, periodBegin).trim().toLowerCase();
        let fromTokenIndex = this.config.getFromTokenIndex(beforeStr);
        let betweenTokenIndex = this.config.getBetweenTokenIndex(beforeStr);
        if (fromTokenIndex.matched || betweenTokenIndex.matched) {
          periodBegin = fromTokenIndex.matched ? fromTokenIndex.index : betweenTokenIndex.index;
        }
        tokens.push(new Token(periodBegin, periodEnd));
        idx += 2;
        continue;
      }
      if (this.config.hasConnectorToken(middleStr)) {
        let periodBegin = er[idx].start || 0;
        let periodEnd = (er[idx + 1].start || 0) + (er[idx + 1].length || 0);
        let beforeStr = source.substring(0, periodBegin).trim().toLowerCase();
        let betweenTokenIndex = this.config.getBetweenTokenIndex(beforeStr);
        if (betweenTokenIndex.matched) {
          periodBegin = betweenTokenIndex.index;
          tokens.push(new Token(periodBegin, periodEnd));
          idx += 2;
          continue;
        }
      }
      idx++;
    }
    return tokens;
  }
  matchDuration(source, refDate) {
    let tokens = new Array();
    let durations = new Array();
    this.config.durationExtractor.extract(source, refDate).forEach((durationEx) => {
      let match = recognizersText.RegExpUtility.getMatches(this.config.dateUnitRegex, durationEx.text).pop();
      if (match) {
        durations.push(new Token(durationEx.start, durationEx.start + durationEx.length));
      }
    });
    durations.forEach((duration) => {
      let beforeStr = source.substring(0, duration.start).toLowerCase();
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) return;
      let match = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
      if (this.matchRegexInPrefix(beforeStr, match)) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
      match = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
      if (this.matchRegexInPrefix(beforeStr, match)) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
      match = recognizersText.RegExpUtility.getMatches(this.config.inConnectorRegex, beforeStr).pop();
      if (this.matchRegexInPrefix(beforeStr, match)) {
        let rangeStr = source.substr(duration.start, duration.length);
        let rangeMatch = recognizersText.RegExpUtility.getMatches(this.config.rangeUnitRegex, rangeStr).pop();
        if (rangeMatch) {
          tokens.push(new Token(match.index, duration.end));
        }
        return;
      }
    });
    return tokens;
  }
  singleTimePointWithPatterns(source, refDate) {
    let tokens = new Array();
    let ers = this.config.datePointExtractor.extract(source, refDate);
    if (ers.length < 1) return tokens;
    ers.forEach((er) => {
      if (er.start && er.length) {
        let beforeStr = source.substring(0, er.start);
        tokens = tokens.concat(this.getTokenForRegexMatching(beforeStr, this.config.weekOfRegex, er)).concat(this.getTokenForRegexMatching(beforeStr, this.config.monthOfRegex, er));
      }
    });
    return tokens;
  }
  getTokenForRegexMatching(source, regexp, er) {
    let tokens = new Array();
    let match = recognizersText.RegExpUtility.getMatches(regexp, source).shift();
    if (match && source.trim().endsWith(match.value.trim())) {
      let startIndex = source.lastIndexOf(match.value);
      tokens.push(new Token(startIndex, er.start + er.length));
    }
    return tokens;
  }
  matchRegexInPrefix(source, match) {
    return match && recognizersText.StringUtility.isNullOrWhitespace(source.substring(match.index + match.length));
  }
  infixBoundaryCheck(match, source) {
    let isMatchInfixOfSource = false;
    if (match.index > 0 && match.index + match.length < source.length) {
      if (source.substr(match.index, match.length) === match.value) {
        isMatchInfixOfSource = true;
      }
    }
    return isMatchInfixOfSource;
  }
};
var BaseDatePeriodParser = class {
  constructor(config, inclusiveEndPeriod = false) {
    this.parserName = Constants.SYS_DATETIME_DATEPERIOD;
    this.weekOfComment = "WeekOf";
    this.monthOfComment = "MonthOf";
    this.config = config;
    this.inclusiveEndPeriod = inclusiveEndPeriod;
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.trim().toLowerCase();
      let innerResult = this.parseMonthWithYear(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.parseSimpleCases(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseOneWordPeriod(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.mergeTwoTimePoints(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseYear(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekOfMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekOfYear(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseHalfYear(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseQuarter(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseSeason(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWhichWeek(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekOfDate(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseMonthOfDate(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseDuration(source, referenceDate);
      }
      if (innerResult.success) {
        if (innerResult.futureValue && innerResult.pastValue) {
          innerResult.futureResolution = {};
          innerResult.futureResolution[TimeTypeConstants.START_DATE] = FormatUtil.formatDate(innerResult.futureValue[0]);
          innerResult.futureResolution[TimeTypeConstants.END_DATE] = FormatUtil.formatDate(innerResult.futureValue[1]);
          innerResult.pastResolution = {};
          innerResult.pastResolution[TimeTypeConstants.START_DATE] = FormatUtil.formatDate(innerResult.pastValue[0]);
          innerResult.pastResolution[TimeTypeConstants.END_DATE] = FormatUtil.formatDate(innerResult.pastValue[1]);
        } else {
          innerResult.futureResolution = {};
          innerResult.pastResolution = {};
        }
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  parseMonthWithYear(source, referenceDate) {
    let trimmedSource = source.trim().toLowerCase();
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.monthWithYear, trimmedSource).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.monthNumWithYear, trimmedSource).pop();
    }
    if (!match || match.length !== trimmedSource.length) return result;
    let monthStr = match.groups("month").value;
    let yearStr = match.groups("year").value;
    let orderStr = match.groups("order").value;
    let month = this.config.monthOfYear.get(monthStr) - 1;
    let year = Number.parseInt(yearStr, 10);
    if (!year || isNaN(year)) {
      let swift = this.config.getSwiftYear(orderStr);
      if (swift < -1) return result;
      year = referenceDate.getFullYear() + swift;
    }
    let beginDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, 1);
    let endDate = DateUtils.addDays(DateUtils.addMonths(beginDate, 1), this.inclusiveEndPeriod ? -1 : 0);
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.timex = `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(month + 1, 2)}`;
    result.success = true;
    return result;
  }
  getMatchSimpleCase(source) {
    let match = recognizersText.RegExpUtility.getMatches(this.config.monthFrontBetweenRegex, source).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.betweenRegex, source).pop();
    }
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.monthFrontSimpleCasesRegex, source).pop();
    }
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.simpleCasesRegex, source).pop();
    }
    return match;
  }
  parseSimpleCases(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let year = referenceDate.getFullYear();
    let month = referenceDate.getMonth();
    let noYear = true;
    let match = this.getMatchSimpleCase(source);
    if (!match || match.index !== 0 || match.length !== source.length) return result;
    let days = match.groups("day");
    let beginDay = this.config.dayOfMonth.get(days.captures[0]);
    let endDay = this.config.dayOfMonth.get(days.captures[1]);
    let yearStr = match.groups("year").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
      year = Number.parseInt(yearStr, 10);
      noYear = false;
    }
    let monthStr = match.groups("month").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(monthStr)) {
      month = this.config.monthOfYear.get(monthStr) - 1;
    } else {
      monthStr = match.groups("relmonth").value;
      month += this.config.getSwiftDayOrMonth(monthStr);
      if (month < 0) {
        month = 0;
        year--;
      } else if (month > 11) {
        month = 11;
        year++;
      }
      if (this.config.isFuture(monthStr)) {
        noYear = false;
      }
    }
    let beginDateLuis = FormatUtil.luisDate(noYear ? -1 : year, month, beginDay);
    let endDateLuis = FormatUtil.luisDate(noYear ? -1 : year, month, endDay);
    let futureYear = year;
    let pastYear = year;
    let startDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, beginDay);
    if (noYear && startDate < referenceDate) futureYear++;
    if (noYear && startDate >= referenceDate) pastYear--;
    result.timex = `(${beginDateLuis},${endDateLuis},P${endDay - beginDay}D)`;
    result.futureValue = [
      DateUtils.safeCreateFromValue(DateUtils.minValue(), futureYear, month, beginDay),
      DateUtils.safeCreateFromValue(DateUtils.minValue(), futureYear, month, endDay)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromValue(DateUtils.minValue(), pastYear, month, beginDay),
      DateUtils.safeCreateFromValue(DateUtils.minValue(), pastYear, month, endDay)
    ];
    result.success = true;
    return result;
  }
  parseOneWordPeriod(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let year = referenceDate.getFullYear();
    let month = referenceDate.getMonth();
    let earlyPrefix = false;
    let latePrefix = false;
    let earlierPrefix = false;
    let laterPrefix = false;
    if (this.config.isYearToDate(source)) {
      result.timex = FormatUtil.toString(year, 4);
      result.futureValue = [DateUtils.safeCreateFromValue(DateUtils.minValue(), year, 0, 1), referenceDate];
      result.pastValue = [DateUtils.safeCreateFromValue(DateUtils.minValue(), year, 0, 1), referenceDate];
      result.success = true;
      return result;
    }
    if (this.config.isMonthToDate(source)) {
      result.timex = `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(month + 1, 2)}`;
      result.futureValue = [DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, 1), referenceDate];
      result.pastValue = [DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, 1), referenceDate];
      result.success = true;
      return result;
    }
    let futureYear = year;
    let pastYear = year;
    let trimedText = source.trim().toLowerCase();
    let match = recognizersText.RegExpUtility.getMatches(this.config.oneWordPeriodRegex, trimedText).pop();
    if (!(match && match.index === 0 && match.length === trimedText.length)) {
      match = recognizersText.RegExpUtility.getMatches(this.config.laterEarlyPeriodRegex, trimedText).pop();
    }
    if (!match || match.index !== 0 || match.length !== trimedText.length) return result;
    if (match.groups("EarlyPrefix").value) {
      earlyPrefix = true;
      trimedText = match.groups("suffix").value;
      result.mod = Constants.EARLY_MOD;
    }
    if (match.groups("LatePrefix").value) {
      latePrefix = true;
      trimedText = match.groups("suffix").value;
      result.mod = Constants.LATE_MOD;
    }
    if (match.groups("MidPrefix").value) {
      latePrefix = true;
      trimedText = match.groups("suffix").value;
      result.mod = Constants.MID_MOD;
    }
    if (match.groups("RelEarly").value) {
      earlierPrefix = true;
      result.mod = null;
    }
    if (match.groups("RelLate").value) {
      laterPrefix = true;
      result.mod = null;
    }
    let monthStr = match.groups("month").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(monthStr)) {
      let swift = this.config.getSwiftYear(trimedText);
      month = this.config.monthOfYear.get(monthStr) - 1;
      if (swift >= -1) {
        result.timex = `${FormatUtil.toString(year + swift, 4)}-${FormatUtil.toString(month + 1, 2)}`;
        year += swift;
        futureYear = year;
        pastYear = year;
      } else {
        result.timex = `XXXX-${FormatUtil.toString(month + 1, 2)}`;
        if (month < referenceDate.getMonth()) futureYear++;
        if (month >= referenceDate.getMonth()) pastYear--;
      }
    } else {
      let swift = this.config.getSwiftDayOrMonth(trimedText);
      if (this.config.isWeekOnly(trimedText)) {
        let monday = DateUtils.addDays(DateUtils.this(referenceDate, 1 /* Monday */), 7 * swift);
        result.timex = `${FormatUtil.toString(monday.getFullYear(), 4)}-W${FormatUtil.toString(DateUtils.getWeekNumber(monday).weekNo, 2)}`;
        let beginDate = DateUtils.addDays(DateUtils.this(referenceDate, 1 /* Monday */), 7 * swift);
        let endDate = this.inclusiveEndPeriod ? DateUtils.addDays(DateUtils.this(referenceDate, 0 /* Sunday */), 7 * swift) : DateUtils.addDays(
          DateUtils.addDays(DateUtils.this(referenceDate, 0 /* Sunday */), 7 * swift),
          1
        );
        if (earlyPrefix) {
          endDate = this.inclusiveEndPeriod ? DateUtils.addDays(DateUtils.this(referenceDate, 3 /* Wednesday */), 7 * swift) : DateUtils.addDays(
            DateUtils.addDays(DateUtils.this(referenceDate, 3 /* Wednesday */), 7 * swift),
            1
          );
        }
        if (latePrefix) {
          beginDate = DateUtils.addDays(DateUtils.this(referenceDate, 4 /* Thursday */), 7 * swift);
        }
        if (earlierPrefix && swift === 0) {
          if (endDate > referenceDate) {
            endDate = referenceDate;
          }
        } else if (laterPrefix && swift === 0) {
          if (beginDate < referenceDate) {
            beginDate = referenceDate;
          }
        }
        result.futureValue = [beginDate, endDate];
        result.pastValue = [beginDate, endDate];
        result.success = true;
        return result;
      }
      if (this.config.isWeekend(trimedText)) {
        let beginDate = DateUtils.addDays(DateUtils.this(referenceDate, 6 /* Saturday */), 7 * swift);
        let endDate = DateUtils.addDays(DateUtils.this(referenceDate, 0 /* Sunday */), 7 * swift + (this.inclusiveEndPeriod ? 0 : 1));
        result.timex = `${FormatUtil.toString(beginDate.getFullYear(), 4)}-W${FormatUtil.toString(DateUtils.getWeekNumber(beginDate).weekNo, 2)}-WE`;
        result.futureValue = [beginDate, endDate];
        result.pastValue = [beginDate, endDate];
        result.success = true;
        return result;
      }
      if (this.config.isMonthOnly(trimedText)) {
        let tempDate = new Date(referenceDate);
        tempDate.setMonth(referenceDate.getMonth() + swift);
        month = tempDate.getMonth();
        year = tempDate.getFullYear();
        result.timex = `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(month + 1, 2)}`;
        futureYear = year;
        pastYear = year;
      } else if (this.config.isYearOnly(trimedText)) {
        let tempDate = new Date(referenceDate);
        tempDate.setFullYear(referenceDate.getFullYear() + swift);
        year = tempDate.getFullYear();
        let beginDate = DateUtils.safeCreateFromMinValue(year, 0, 1);
        let endDate = this.inclusiveEndPeriod ? DateUtils.safeCreateFromMinValue(year, 11, 31) : DateUtils.addDays(
          DateUtils.safeCreateFromMinValue(year, 11, 31),
          1
        );
        if (earlyPrefix) {
          endDate = this.inclusiveEndPeriod ? DateUtils.safeCreateFromMinValue(year, 5, 30) : DateUtils.addDays(
            DateUtils.safeCreateFromMinValue(year, 5, 30),
            1
          );
        }
        if (latePrefix) {
          beginDate = DateUtils.safeCreateFromMinValue(year, 6, 1);
        }
        if (earlierPrefix && swift === 0) {
          if (endDate > referenceDate) {
            endDate = referenceDate;
          }
        } else if (laterPrefix && swift === 0) {
          if (beginDate < referenceDate) {
            beginDate = referenceDate;
          }
        }
        result.timex = FormatUtil.toString(year, 4);
        result.futureValue = [beginDate, endDate];
        result.pastValue = [beginDate, endDate];
        result.success = true;
        return result;
      }
    }
    let futureStart = DateUtils.safeCreateFromMinValue(futureYear, month, 1);
    let futureEnd = this.inclusiveEndPeriod ? DateUtils.addDays(
      DateUtils.addMonths(
        DateUtils.safeCreateFromMinValue(futureYear, month, 1),
        1
      ),
      -1
    ) : DateUtils.addMonths(
      DateUtils.safeCreateFromMinValue(futureYear, month, 1),
      1
    );
    let pastStart = DateUtils.safeCreateFromMinValue(pastYear, month, 1);
    let pastEnd = this.inclusiveEndPeriod ? DateUtils.addDays(
      DateUtils.addMonths(
        DateUtils.safeCreateFromMinValue(pastYear, month, 1),
        1
      ),
      -1
    ) : DateUtils.addMonths(
      DateUtils.safeCreateFromMinValue(pastYear, month, 1),
      1
    );
    if (earlyPrefix) {
      futureEnd = this.inclusiveEndPeriod ? DateUtils.safeCreateFromMinValue(futureYear, month, 15) : DateUtils.addDays(
        DateUtils.safeCreateFromMinValue(futureYear, month, 15),
        1
      );
      pastEnd = this.inclusiveEndPeriod ? DateUtils.safeCreateFromMinValue(pastYear, month, 15) : DateUtils.addDays(
        DateUtils.safeCreateFromMinValue(pastYear, month, 15),
        1
      );
    } else if (latePrefix) {
      futureStart = DateUtils.safeCreateFromMinValue(futureYear, month, 16);
      pastStart = DateUtils.safeCreateFromMinValue(pastYear, month, 16);
    }
    if (earlierPrefix && futureYear === pastYear) {
      if (futureEnd > referenceDate) {
        futureEnd = pastEnd = referenceDate;
      }
    } else if (laterPrefix && futureYear === pastYear) {
      if (futureStart < referenceDate) {
        futureStart = pastStart = referenceDate;
      }
    }
    result.futureValue = [futureStart, futureEnd];
    result.pastValue = [pastStart, pastEnd];
    result.success = true;
    return result;
  }
  mergeTwoTimePoints(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let ers = this.config.dateExtractor.extract(trimmedSource, referenceDate);
    if (!ers || ers.length < 2) {
      ers = this.config.dateExtractor.extract(this.config.tokenBeforeDate + trimmedSource, referenceDate).map((er) => {
        er.start -= this.config.tokenBeforeDate.length;
        return er;
      });
      if (!ers || ers.length < 2) return result;
    }
    let match = recognizersText.RegExpUtility.getMatches(this.config.weekWithWeekDayRangeRegex, source).pop();
    let weekPrefix = null;
    if (match) {
      weekPrefix = match.groups("week").value;
    }
    if (!recognizersText.StringUtility.isNullOrWhitespace(weekPrefix)) {
      ers[0].text = weekPrefix + " " + ers[0].text;
      ers[1].text = weekPrefix + " " + ers[1].text;
    }
    let prs = ers.map((er) => this.config.dateParser.parse(er, referenceDate)).filter((pr) => pr);
    if (prs.length < 2) return result;
    let prBegin = prs[0];
    let prEnd = prs[1];
    let futureBegin = prBegin.value.futureValue;
    let futureEnd = prEnd.value.futureValue;
    let pastBegin = prBegin.value.pastValue;
    let pastEnd = prEnd.value.pastValue;
    result.subDateTimeEntities = prs;
    result.timex = `(${prBegin.timexStr},${prEnd.timexStr},P${DateUtils.diffDays(futureEnd, futureBegin)}D)`;
    result.futureValue = [futureBegin, futureEnd];
    result.pastValue = [pastBegin, pastEnd];
    result.success = true;
    return result;
  }
  parseYear(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.yearRegex, trimmedSource).pop();
    if (!match || match.length !== trimmedSource.length) return result;
    let year = Number.parseInt(match.value, 10);
    let beginDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, 0, 1);
    let endDate = DateUtils.addDays(DateUtils.safeCreateFromValue(DateUtils.minValue(), year + 1, 0, 1), this.inclusiveEndPeriod ? -1 : 0);
    result.timex = FormatUtil.toString(year, 4);
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.success = true;
    return result;
  }
  parseDuration(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let ers = this.config.durationExtractor.extract(source, referenceDate);
    let beginDate = new Date(referenceDate);
    let endDate = new Date(referenceDate);
    let restNowSunday = false;
    let durationTimex = "";
    if (ers.length === 1) {
      let pr = this.config.durationParser.parse(ers[0]);
      if (pr === null) return result;
      let beforeStr = source.substr(0, pr.start).trim();
      let mod;
      let durationResult = pr.value;
      if (recognizersText.StringUtility.isNullOrEmpty(durationResult.timex)) return result;
      let prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
      if (prefixMatch) {
        mod = TimeTypeConstants.beforeMod;
        beginDate = this.getSwiftDate(endDate, durationResult.timex, false);
      }
      prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
      if (prefixMatch && prefixMatch.length === beforeStr.length) {
        mod = TimeTypeConstants.afterMod;
        beginDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1);
        endDate = this.getSwiftDate(beginDate, durationResult.timex, true);
      }
      prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.inConnectorRegex, beforeStr).pop();
      if (prefixMatch && prefixMatch.length === beforeStr.length) {
        mod = TimeTypeConstants.afterMod;
        beginDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 1);
        endDate = this.getSwiftDate(beginDate, durationResult.timex, true);
        let unit = durationResult.timex.substr(durationResult.timex.length - 1);
        durationResult.timex = `P1${unit}`;
        beginDate = this.getSwiftDate(endDate, durationResult.timex, false);
      }
      if (mod) {
        pr.value.mod = mod;
      }
      durationTimex = durationResult.timex;
      result.subDateTimeEntities = [pr];
    }
    let match = recognizersText.RegExpUtility.getMatches(this.config.restOfDateRegex, source).pop();
    if (match) {
      let diffDays = 0;
      let durationStr = match.groups("duration").value;
      let durationUnit = this.config.unitMap.get(durationStr);
      switch (durationUnit) {
        case "W":
          diffDays = 7 - (beginDate.getDay() === 0 ? 7 : beginDate.getDay());
          endDate = DateUtils.addDays(referenceDate, diffDays);
          restNowSunday = diffDays === 0;
          break;
        case "MON":
          endDate = DateUtils.safeCreateFromMinValue(beginDate.getFullYear(), beginDate.getMonth(), 1);
          endDate.setMonth(beginDate.getMonth() + 1);
          endDate.setDate(endDate.getDate() - 1);
          diffDays = endDate.getDate() - beginDate.getDate() + 1;
          break;
        case "Y":
          endDate = DateUtils.safeCreateFromMinValue(beginDate.getFullYear(), 11, 1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(endDate.getDate() - 1);
          diffDays = DateUtils.dayOfYear(endDate) - DateUtils.dayOfYear(beginDate) + 1;
          break;
      }
      durationTimex = `P${diffDays}D`;
    }
    if (beginDate.getTime() !== endDate.getTime() || restNowSunday) {
      endDate = DateUtils.addDays(endDate, this.inclusiveEndPeriod ? -1 : 0);
      result.timex = `(${FormatUtil.luisDateFromDate(beginDate)},${FormatUtil.luisDateFromDate(endDate)},${durationTimex})`;
      result.futureValue = [beginDate, endDate];
      result.pastValue = [beginDate, endDate];
      result.success = true;
    }
    return result;
  }
  getSwiftDate(date, timex, isPositiveSwift) {
    let result = new Date(date);
    let numStr = timex.replace("P", "").substr(0, timex.length - 2);
    let unitStr = timex.substr(timex.length - 1);
    let swift = Number.parseInt(numStr, 10) || 0;
    if (swift === 0) return result;
    if (!isPositiveSwift) swift *= -1;
    switch (unitStr) {
      case "D":
        result.setDate(date.getDate() + swift);
        break;
      case "W":
        result.setDate(date.getDate() + 7 * swift);
        break;
      case "M":
        result.setMonth(date.getMonth() + swift);
        break;
      case "Y":
        result.setFullYear(date.getFullYear() + swift);
        break;
    }
    return result;
  }
  parseWeekOfMonth(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.weekOfMonthRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let cardinalStr = match.groups("cardinal").value;
    let monthStr = match.groups("month").value;
    let month = referenceDate.getMonth();
    let year = referenceDate.getFullYear();
    let noYear = false;
    let cardinal = this.config.isLastCardinal(cardinalStr) ? 5 : this.config.cardinalMap.get(cardinalStr);
    if (recognizersText.StringUtility.isNullOrEmpty(monthStr)) {
      let swift = this.config.getSwiftDayOrMonth(source);
      let tempDate = new Date(referenceDate);
      tempDate.setMonth(referenceDate.getMonth() + swift);
      month = tempDate.getMonth();
      year = tempDate.getFullYear();
    } else {
      month = this.config.monthOfYear.get(monthStr) - 1;
      noYear = true;
    }
    return this.getWeekOfMonth(cardinal, month, year, referenceDate, noYear);
  }
  getWeekOfMonth(cardinal, month, year, referenceDate, noYear) {
    let result = new DateTimeResolutionResult();
    let seedDate = this.computeDate(cardinal, 1, month, year);
    if (seedDate.getMonth() !== month) {
      cardinal--;
      seedDate.setDate(seedDate.getDate() - 7);
    }
    let futureDate = new Date(seedDate);
    let pastDate = new Date(seedDate);
    if (noYear && futureDate < referenceDate) {
      futureDate = this.computeDate(cardinal, 1, month, year + 1);
      if (futureDate.getMonth() !== month) {
        futureDate.setDate(futureDate.getDate() - 7);
      }
    }
    if (noYear && pastDate >= referenceDate) {
      pastDate = this.computeDate(cardinal, 1, month, year - 1);
      if (pastDate.getMonth() !== month) {
        pastDate.setDate(pastDate.getDate() - 7);
      }
    }
    result.timex = noYear ? `XXXX-${FormatUtil.toString(month + 1, 2)}-W${FormatUtil.toString(cardinal, 2)}` : `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(month + 1, 2)}-W${FormatUtil.toString(cardinal, 2)}`;
    result.futureValue = [futureDate, DateUtils.addDays(futureDate, this.inclusiveEndPeriod ? 6 : 7)];
    result.pastValue = [pastDate, DateUtils.addDays(pastDate, this.inclusiveEndPeriod ? 6 : 7)];
    result.success = true;
    return result;
  }
  parseWeekOfYear(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.weekOfYearRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let cardinalStr = match.groups("cardinal").value;
    let yearStr = match.groups("year").value;
    let orderStr = match.groups("order").value;
    let year = Number.parseInt(yearStr, 10);
    if (isNaN(year)) {
      let swift = this.config.getSwiftYear(orderStr);
      if (swift < -1) return result;
      year = referenceDate.getFullYear() + swift;
    }
    let targetWeekMonday;
    if (this.config.isLastCardinal(cardinalStr)) {
      let lastDay = DateUtils.safeCreateFromMinValue(year, 11, 31);
      let lastDayWeekMonday = DateUtils.this(lastDay, 1 /* Monday */);
      let weekNum = DateUtils.getWeekNumber(lastDay).weekNo;
      if (weekNum === 1) {
        lastDayWeekMonday = DateUtils.this(DateUtils.addDays(lastDay, -7), 1 /* Monday */);
      }
      targetWeekMonday = lastDayWeekMonday;
      weekNum = DateUtils.getWeekNumber(targetWeekMonday).weekNo;
      result.timex = `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(targetWeekMonday.getMonth() + 1, 2)}-W${FormatUtil.toString(weekNum, 2)}`;
    } else {
      let cardinal = this.config.cardinalMap.get(cardinalStr);
      let firstDay = DateUtils.safeCreateFromMinValue(year, 0, 1);
      let firstDayWeekMonday = DateUtils.this(firstDay, 1 /* Monday */);
      let weekNum = DateUtils.getWeekNumber(firstDay).weekNo;
      if (weekNum !== 1) {
        firstDayWeekMonday = DateUtils.this(DateUtils.addDays(firstDay, 7), 1 /* Monday */);
      }
      targetWeekMonday = DateUtils.addDays(firstDayWeekMonday, 7 * (cardinal - 1));
      let targetWeekSunday = DateUtils.this(targetWeekMonday, 0 /* Sunday */);
      result.timex = `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(targetWeekSunday.getMonth() + 1, 2)}-W${FormatUtil.toString(cardinal, 2)}`;
    }
    result.futureValue = [targetWeekMonday, DateUtils.addDays(targetWeekMonday, this.inclusiveEndPeriod ? 6 : 7)];
    result.pastValue = [targetWeekMonday, DateUtils.addDays(targetWeekMonday, this.inclusiveEndPeriod ? 6 : 7)];
    result.success = true;
    return result;
  }
  parseHalfYear(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.allHalfYearRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let cardinalStr = match.groups("cardinal").value;
    let yearStr = match.groups("year").value;
    let orderStr = match.groups("order").value;
    let numberStr = match.groups("number").value;
    let year = Number.parseInt(yearStr, 10);
    if (isNaN(year)) {
      let swift = this.config.getSwiftYear(orderStr);
      if (swift < -1) {
        return result;
      }
      year = referenceDate.getFullYear() + swift;
    }
    let quarterNum;
    if (!numberStr) {
      quarterNum = this.config.cardinalMap.get(cardinalStr);
    } else {
      quarterNum = parseInt(numberStr);
    }
    let beginDate = DateUtils.safeCreateDateResolveOverflow(year, (quarterNum - 1) * Constants.SemesterMonthCount, 1);
    let endDate = DateUtils.safeCreateDateResolveOverflow(year, quarterNum * Constants.SemesterMonthCount, 1);
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.timex = `(${FormatUtil.luisDateFromDate(beginDate)},${FormatUtil.luisDateFromDate(endDate)},P6M)`;
    result.success = true;
    return result;
  }
  parseQuarter(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.quarterRegex, source).pop();
    if (!match || match.length !== source.length) {
      match = recognizersText.RegExpUtility.getMatches(this.config.quarterRegexYearFront, source).pop();
    }
    if (!match || match.length !== source.length) return result;
    let cardinalStr = match.groups("cardinal").value;
    let yearStr = match.groups("year").value;
    let orderStr = match.groups("order").value;
    let numberStr = match.groups("number").value;
    let noSpecificYear = false;
    let year = Number.parseInt(yearStr, 10);
    if (isNaN(year)) {
      let swift = this.config.getSwiftYear(orderStr);
      if (swift < -1) {
        swift = 0;
        noSpecificYear = true;
      }
      year = referenceDate.getFullYear() + swift;
    }
    let quarterNum;
    if (!numberStr) {
      quarterNum = this.config.cardinalMap.get(cardinalStr);
    } else {
      quarterNum = parseInt(numberStr);
    }
    let beginDate = DateUtils.safeCreateDateResolveOverflow(year, (quarterNum - 1) * Constants.TrimesterMonthCount, 1);
    let endDate = DateUtils.safeCreateDateResolveOverflow(year, quarterNum * Constants.TrimesterMonthCount, 1);
    if (noSpecificYear) {
      if (endDate < referenceDate) {
        result.pastValue = [beginDate, endDate];
        let futureBeginDate = DateUtils.safeCreateDateResolveOverflow(year + 1, (quarterNum - 1) * Constants.TrimesterMonthCount, 1);
        let futureEndDate = DateUtils.safeCreateDateResolveOverflow(year + 1, quarterNum * Constants.TrimesterMonthCount, 1);
        result.futureValue = [futureBeginDate, futureEndDate];
      } else if (endDate > referenceDate) {
        result.futureValue = [beginDate, endDate];
        let pastBeginDate = DateUtils.safeCreateDateResolveOverflow(year - 1, (quarterNum - 1) * Constants.TrimesterMonthCount, 1);
        let pastEndDate = DateUtils.safeCreateDateResolveOverflow(year - 1, quarterNum * Constants.TrimesterMonthCount, 1);
        result.pastValue = [pastBeginDate, pastEndDate];
      } else {
        result.futureValue = [beginDate, endDate];
        result.pastValue = [beginDate, endDate];
      }
    } else {
      result.futureValue = [beginDate, endDate];
      result.pastValue = [beginDate, endDate];
    }
    result.timex = `(${FormatUtil.luisDateFromDate(beginDate)},${FormatUtil.luisDateFromDate(endDate)},P3M)`;
    result.success = true;
    return result;
  }
  parseSeason(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.seasonRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let swift = this.config.getSwiftYear(source);
    let yearStr = match.groups("year").value;
    let year = referenceDate.getFullYear();
    let seasonStr = match.groups("seas").value;
    let season = this.config.seasonMap.get(seasonStr);
    if (swift >= -1 || !recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
      if (recognizersText.StringUtility.isNullOrEmpty(yearStr)) yearStr = FormatUtil.toString(year + swift, 4);
      result.timex = `${yearStr}-${season}`;
    } else {
      result.timex = season;
    }
    result.success = true;
    return result;
  }
  parseWhichWeek(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.whichWeekRegex, source).pop();
    if (!match) return result;
    let num = Number.parseInt(match.groups("number").value, 10);
    let year = referenceDate.getFullYear();
    let firstDay = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, 0, 1);
    let firstWeekday = DateUtils.this(firstDay, 1 /* Monday */);
    let resultDate = DateUtils.addDays(firstWeekday, 7 * num);
    result.timex = `${FormatUtil.toString(year, 4)}-W${FormatUtil.toString(num, 2)}`;
    result.futureValue = [resultDate, DateUtils.addDays(resultDate, 7)];
    result.pastValue = [resultDate, DateUtils.addDays(resultDate, 7)];
    result.success = true;
    return result;
  }
  parseWeekOfDate(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.weekOfRegex, source).pop();
    let ers = this.config.dateExtractor.extract(source, referenceDate);
    if (!match || ers.length !== 1) return result;
    let dateResolution = this.config.dateParser.parse(ers[0], referenceDate).value;
    result.timex = dateResolution.timex;
    result.comment = this.weekOfComment;
    result.futureValue = this.getWeekRangeFromDate(dateResolution.futureValue);
    result.pastValue = this.getWeekRangeFromDate(dateResolution.pastValue);
    result.success = true;
    return result;
  }
  parseMonthOfDate(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.monthOfRegex, source).pop();
    let ers = this.config.dateExtractor.extract(source, referenceDate);
    if (!match || ers.length !== 1) return result;
    let dateResolution = this.config.dateParser.parse(ers[0], referenceDate).value;
    result.timex = dateResolution.timex;
    result.comment = this.monthOfComment;
    result.futureValue = this.getMonthRangeFromDate(dateResolution.futureValue);
    result.pastValue = this.getMonthRangeFromDate(dateResolution.pastValue);
    result.success = true;
    return result;
  }
  computeDate(cardinal, weekday, month, year) {
    let firstDay = new Date(year, month, 1);
    let firstWeekday = DateUtils.this(firstDay, weekday);
    if (weekday === 0) weekday = 7;
    let firstDayOfWeek = firstDay.getDay() !== 0 ? firstDay.getDay() : 7;
    if (weekday < firstDayOfWeek) firstWeekday = DateUtils.next(firstDay, weekday);
    firstWeekday.setDate(firstWeekday.getDate() + 7 * (cardinal - 1));
    return firstWeekday;
  }
  getWeekRangeFromDate(seedDate) {
    let beginDate = DateUtils.this(seedDate, 1 /* Monday */);
    let endDate = DateUtils.addDays(beginDate, this.inclusiveEndPeriod ? 6 : 7);
    return [beginDate, endDate];
  }
  getMonthRangeFromDate(seedDate) {
    let beginDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), seedDate.getFullYear(), seedDate.getMonth(), 1);
    let endDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), seedDate.getFullYear(), seedDate.getMonth() + 1, 1);
    endDate.setDate(endDate.getDate() + (this.inclusiveEndPeriod ? -1 : 0));
    return [beginDate, endDate];
  }
};
var BaseTimePeriodExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_TIMEPERIOD;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.matchSimpleCases(source)).concat(this.mergeTwoTimePoints(source, referenceDate)).concat(this.matchNight(source));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchSimpleCases(text) {
    let ret = [];
    this.config.simpleCasesRegex.forEach((regex) => {
      let matches = recognizersText.RegExpUtility.getMatches(regex, text);
      matches.forEach((match) => {
        let pmStr = match.groups("pm").value;
        let amStr = match.groups("am").value;
        let descStr = match.groups("desc").value;
        if (pmStr || amStr || descStr) {
          ret.push(new Token(match.index, match.index + match.length));
        }
      });
    });
    return ret;
  }
  mergeTwoTimePoints(text, refDate) {
    let ret = [];
    let ers = this.config.singleTimeExtractor.extract(text, refDate);
    let numErs = this.config.integerExtractor.extract(text);
    if (numErs.length > 0) {
      let timeNumbers = [];
      let endingNumber = false;
      let num = numErs[numErs.length - 1];
      if (num.start + num.length === text.length) {
        endingNumber = true;
      } else {
        let afterStr = text.substr(num.start + num.length);
        let endingMatch = afterStr.match(this.config.generalEndingRegex);
        if (endingMatch) {
          endingNumber = true;
        }
      }
      if (endingNumber) {
        timeNumbers.push(num);
      }
      let i = 0;
      let j = 0;
      while (i < numErs.length) {
        let numEndPoint = numErs[i].start + numErs[i].length;
        while (j < ers.length && ers[j].start <= numEndPoint) {
          j++;
        }
        if (j >= ers.length) {
          break;
        }
        let midStr = text.substr(numEndPoint, ers[j].start - numEndPoint);
        let match = midStr.match(this.config.tillRegex);
        if (match && match[0].length === midStr.trim().length) {
          timeNumbers.push(numErs[i]);
        }
        i++;
      }
      for (let timeNum of timeNumbers) {
        let overlap = false;
        for (let er of ers) {
          if (er.start <= timeNum.start && er.start + er.length >= timeNum.start) {
            overlap = true;
          }
        }
        if (!overlap) {
          ers.push(timeNum);
        }
      }
      ers = ers.sort((x, y) => x.start - y.start);
    }
    let idx = 0;
    while (idx < ers.length - 1) {
      let middleBegin = ers[idx].start + ers[idx].length || 0;
      let middleEnd = ers[idx + 1].start || 0;
      let middleStr = text.substring(middleBegin, middleEnd).trim().toLowerCase();
      let matches = recognizersText.RegExpUtility.getMatches(this.config.tillRegex, middleStr);
      if (matches.length > 0 && matches[0].index === 0 && matches[0].length === middleStr.length) {
        let periodBegin = ers[idx].start || 0;
        let periodEnd = (ers[idx + 1].start || 0) + (ers[idx + 1].length || 0);
        let beforeStr = text.substring(0, periodBegin).trim().toLowerCase();
        let fromIndex = this.config.getFromTokenIndex(beforeStr);
        if (fromIndex.matched) {
          periodBegin = fromIndex.index;
        }
        let betweenIndex = this.config.getBetweenTokenIndex(beforeStr);
        if (betweenIndex.matched) {
          periodBegin = betweenIndex.index;
        }
        ret.push(new Token(periodBegin, periodEnd));
        idx += 2;
        continue;
      }
      if (this.config.hasConnectorToken(middleStr)) {
        let periodBegin = ers[idx].start || 0;
        let periodEnd = (ers[idx + 1].start || 0) + (ers[idx + 1].length || 0);
        let beforeStr = text.substring(0, periodBegin).trim().toLowerCase();
        let betweenIndex = this.config.getBetweenTokenIndex(beforeStr);
        if (betweenIndex.matched) {
          periodBegin = betweenIndex.index;
          ret.push(new Token(periodBegin, periodEnd));
          idx += 2;
          continue;
        }
      }
      idx++;
    }
    return ret;
  }
  matchNight(source) {
    let ret = [];
    let matches = recognizersText.RegExpUtility.getMatches(this.config.timeOfDayRegex, source);
    matches.forEach((match) => {
      ret.push(new Token(match.index, match.index + match.length));
    });
    return ret;
  }
};
var _BaseTimePeriodParser = class _BaseTimePeriodParser {
  constructor(configuration) {
    this.config = configuration;
  }
  parse(er, refTime) {
    let referenceTime = refTime || /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === _BaseTimePeriodParser.ParserName) {
      let innerResult = this.parseSimpleCases(er.text, referenceTime);
      if (!innerResult.success) {
        innerResult = this.mergeTwoTimePoints(er.text, referenceTime);
      }
      if (!innerResult.success) {
        innerResult = this.parseTimeOfDay(er.text, referenceTime);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.START_TIME] = FormatUtil.formatTime(innerResult.futureValue.item1);
        innerResult.futureResolution[TimeTypeConstants.END_TIME] = FormatUtil.formatTime(innerResult.futureValue.item2);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.START_TIME] = FormatUtil.formatTime(innerResult.pastValue.item1);
        innerResult.pastResolution[TimeTypeConstants.END_TIME] = FormatUtil.formatTime(innerResult.pastValue.item2);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value;
    ret.timexStr = value === null ? "" : value.timex;
    ret.resolutionStr = "";
    return ret;
  }
  parseSimpleCases(source, reference) {
    let result = this.parsePureNumCases(source, reference);
    if (!result.success) {
      result = this.parseSpecificTimeCases(source, reference);
    }
    return result;
  }
  parsePureNumCases(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let year = referenceTime.getFullYear();
    let month = referenceTime.getMonth();
    let day = referenceTime.getDate();
    let trimmedText = text.trim().toLowerCase();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.pureNumberFromToRegex, trimmedText);
    if (!matches.length) {
      matches = recognizersText.RegExpUtility.getMatches(this.config.pureNumberBetweenAndRegex, trimmedText);
    }
    if (matches.length && matches[0].index === 0) {
      let isValid = false;
      let hourGroup = matches[0].groups("hour");
      let hourStr = hourGroup.captures[0];
      let afterHourIndex = hourGroup.index + hourGroup.length;
      if (afterHourIndex === trimmedText.length || !trimmedText.substr(afterHourIndex).trim().startsWith(":")) {
        let beginHour = this.config.numbers.get(hourStr);
        if (!beginHour) {
          beginHour = Number.parseInt(hourStr, 10);
        }
        hourStr = hourGroup.captures[1];
        afterHourIndex = trimmedText.indexOf(hourStr, hourGroup.index + 1) + hourStr.length;
        if (afterHourIndex === trimmedText.length || !trimmedText.substr(afterHourIndex).trim().startsWith(":")) {
          let endHour = this.config.numbers.get(hourStr);
          if (!endHour) {
            endHour = Number.parseInt(hourStr, 10);
          }
          let leftDesc = matches[0].groups("leftDesc").value;
          let rightDesc = matches[0].groups("rightDesc").value;
          let pmStr = matches[0].groups("pm").value;
          let amStr = matches[0].groups("am").value;
          if (recognizersText.StringUtility.isNullOrWhitespace(leftDesc)) {
            let rightAmValid = !recognizersText.StringUtility.isNullOrEmpty(rightDesc) && recognizersText.RegExpUtility.getMatches(this.config.utilityConfiguration.amDescRegex, rightDesc.toLowerCase()).length;
            let rightPmValid = !recognizersText.StringUtility.isNullOrEmpty(rightDesc) && recognizersText.RegExpUtility.getMatches(this.config.utilityConfiguration.pmDescRegex, rightDesc.toLowerCase()).length;
            if (!recognizersText.StringUtility.isNullOrEmpty(amStr) || rightAmValid) {
              if (endHour >= 12) {
                endHour -= 12;
              }
              if (beginHour >= 12 && beginHour - 12 < endHour) {
                beginHour -= 12;
              }
              if (beginHour < 12 && beginHour > endHour) {
                beginHour += 12;
              }
              isValid = true;
            } else if (!recognizersText.StringUtility.isNullOrEmpty(pmStr) || rightPmValid) {
              if (endHour < 12) {
                endHour += 12;
              }
              if (beginHour + 12 < endHour) {
                beginHour += 12;
              }
              isValid = true;
            }
          }
          if (isValid) {
            let beginStr = "T" + FormatUtil.toString(beginHour, 2);
            let endStr = "T" + FormatUtil.toString(endHour, 2);
            if (beginHour >= endHour) {
              endHour += 24;
            }
            ret.timex = `(${beginStr},${endStr},PT${endHour - beginHour}H)`;
            ret.futureValue = ret.pastValue = {
              item1: new Date(year, month, day, beginHour, 0, 0),
              item2: new Date(year, month, day, endHour, 0, 0)
            };
            ret.success = true;
            return ret;
          }
        }
      }
    }
    return ret;
  }
  parseSpecificTimeCases(source, reference) {
    let result = new DateTimeResolutionResult();
    let year = reference.getFullYear();
    let month = reference.getMonth();
    let day = reference.getDate();
    let trimmedText = source.trim().toLowerCase();
    let match = recognizersText.RegExpUtility.getMatches(this.config.specificTimeFromToRegex, source).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.specificTimeBetweenAndRegex, source).pop();
    }
    if (match && match.index === 0 && match.index + match.length === trimmedText.length) {
      if (match.groups("prefix").value !== "") {
        return result;
      }
      let beginHour;
      let invalidFlag = -1;
      let beginMinute = invalidFlag;
      let beginSecond = invalidFlag;
      let endHour;
      let endMinute = invalidFlag;
      let endSecond = invalidFlag;
      let hourGroup = match.groups("hour");
      let hourStr = hourGroup.captures[0];
      if (this.config.numbers.has(hourStr)) {
        beginHour = this.config.numbers[hourStr];
      } else {
        beginHour = parseInt(hourStr, 10);
      }
      hourStr = hourGroup.captures[1];
      if (this.config.numbers.has(hourStr)) {
        endHour = this.config.numbers[hourStr];
      } else {
        endHour = parseInt(hourStr, 10);
      }
      let time1StartIndex = match.groups("time1").index;
      let time1EndIndex = time1StartIndex + match.groups("time1").length;
      let time2StartIndex = match.groups("time2").index;
      let time2EndIndex = time2StartIndex + match.groups("time2").length;
      let lastGroupIndex = 0;
      for (let i = 0; i < match.groups("min").captures.length; i++) {
        let minuteCapture = match.groups("min").captures[i];
        let minuteCaptureIndex = source.indexOf(minuteCapture, lastGroupIndex);
        if (minuteCaptureIndex >= time1StartIndex && minuteCaptureIndex + minuteCapture.length <= time1EndIndex) {
          beginMinute = parseInt(minuteCapture, 10);
        } else if (minuteCaptureIndex >= time2StartIndex && minuteCaptureIndex + minuteCapture.length <= time2EndIndex) {
          endMinute = parseInt(minuteCapture, 10);
        }
        lastGroupIndex = minuteCaptureIndex + 1;
      }
      lastGroupIndex = 0;
      for (let i = 0; i < match.groups("sec").captures.length; i++) {
        let secondCapture = match.groups("sec").captures[i];
        let secondCaptureIndex = source.indexOf(secondCapture, lastGroupIndex);
        if (secondCaptureIndex >= time1StartIndex && secondCaptureIndex + secondCapture.length <= time1EndIndex) {
          beginSecond = parseInt(secondCapture, 10);
        } else if (secondCaptureIndex >= time2StartIndex && secondCaptureIndex + secondCapture.length <= time2EndIndex) {
          endSecond = parseInt(secondCapture, 10);
        }
        lastGroupIndex = secondCaptureIndex + 1;
      }
      lastGroupIndex = 0;
      let leftDesc = match.groups("leftDesc").value;
      let rightDesc = match.groups("rightDesc").value;
      for (let i = 0; i < match.groups("desc").captures.length; i++) {
        let descCapture = match.groups("desc").captures[i];
        let descCaptureIndex = source.indexOf(descCapture, lastGroupIndex);
        if (descCaptureIndex >= time1StartIndex && descCaptureIndex + descCapture.length <= time1EndIndex && recognizersText.StringUtility.isNullOrEmpty(leftDesc)) {
          leftDesc = descCapture;
        } else if (descCaptureIndex >= time2StartIndex && descCaptureIndex + descCapture.length <= time2EndIndex && recognizersText.StringUtility.isNullOrEmpty(rightDesc)) {
          rightDesc = descCapture;
        }
        lastGroupIndex = descCaptureIndex + 1;
      }
      let beginDateTime = DateUtils.safeCreateFromMinValue(year, month, day, beginHour, beginMinute >= 0 ? beginMinute : 0, beginSecond >= 0 ? beginSecond : 0);
      let endDateTime = DateUtils.safeCreateFromMinValue(year, month, day, endHour, endMinute >= 0 ? endMinute : 0, endSecond >= 0 ? endSecond : 0);
      let hasLeftAm = !recognizersText.StringUtility.isNullOrEmpty(leftDesc) && leftDesc.toLowerCase().startsWith("a");
      let hasLeftPm = !recognizersText.StringUtility.isNullOrEmpty(leftDesc) && leftDesc.toLowerCase().startsWith("p");
      let hasRightAm = !recognizersText.StringUtility.isNullOrEmpty(rightDesc) && rightDesc.toLowerCase().startsWith("a");
      let hasRightPm = !recognizersText.StringUtility.isNullOrEmpty(rightDesc) && rightDesc.toLowerCase().startsWith("p");
      let hasLeft = hasLeftAm || hasLeftPm;
      let hasRight = hasRightAm || hasRightPm;
      if (hasLeft && hasRight) {
        if (hasLeftAm) {
          if (beginHour >= 12) {
            beginDateTime = DateUtils.addHours(beginDateTime, -12);
          }
        } else if (hasLeftPm) {
          if (beginHour < 12) {
            beginDateTime = DateUtils.addHours(beginDateTime, 12);
          }
        }
        if (hasRightAm) {
          if (endHour >= 12) {
            endDateTime = DateUtils.addHours(endDateTime, -12);
          }
        } else if (hasRightPm) {
          if (endHour < 12) {
            endDateTime = DateUtils.addHours(endDateTime, 12);
          }
        }
      } else if (hasLeft || hasRight) {
        if (hasLeftAm) {
          if (beginHour >= 12) {
            beginDateTime = DateUtils.addHours(beginDateTime, -12);
          }
          if (endHour < 12) {
            if (endDateTime < beginDateTime) {
              endDateTime = DateUtils.addHours(endDateTime, 12);
            }
          }
        } else if (hasLeftPm) {
          if (beginHour < 12) {
            beginDateTime = DateUtils.addHours(beginDateTime, 12);
          }
          if (endHour < 12) {
            if (endDateTime.getTime() < beginDateTime.getTime()) {
              let span = DateUtils.totalHoursFloor(beginDateTime, endDateTime);
              if (span >= 12) {
                endDateTime = DateUtils.addHours(endDateTime, 24);
              } else {
                endDateTime = DateUtils.addHours(endDateTime, 12);
              }
            }
          }
        }
        if (hasRightAm) {
          if (endHour >= 12) {
            endDateTime = DateUtils.addHours(endDateTime, -12);
          }
          if (beginHour < 12) {
            if (endDateTime.getTime() < beginDateTime.getTime()) {
              beginDateTime = DateUtils.addHours(beginDateTime, -12);
            }
          }
        } else if (hasRightPm) {
          if (endHour < 12) {
            endDateTime = DateUtils.addHours(endDateTime, 12);
          }
          if (beginHour < 12) {
            if (endDateTime.getTime() < beginDateTime.getTime()) {
              beginDateTime = DateUtils.addHours(beginDateTime, -12);
            } else {
              let span = DateUtils.totalHoursFloor(endDateTime, beginDateTime);
              if (span > 12) {
                beginDateTime = DateUtils.addHours(beginDateTime, 12);
              }
            }
          }
        }
      } else if (!hasLeft && !hasRight && beginHour <= 12 && endHour <= 12) {
        if (beginHour > endHour) {
          if (beginHour === 12) {
            beginDateTime = DateUtils.addHours(beginDateTime, -12);
          } else {
            endDateTime = DateUtils.addHours(endDateTime, 12);
          }
        }
        result.comment = Constants.CommentAmPm;
      }
      if (endDateTime.getTime() < beginDateTime.getTime()) {
        endDateTime = DateUtils.addHours(endDateTime, 24);
      }
      let beginStr = FormatUtil.shortTime(beginDateTime.getHours(), beginMinute, beginSecond);
      let endStr = FormatUtil.shortTime(endDateTime.getHours(), endMinute, endSecond);
      result.success = true;
      result.timex = `(${beginStr},${endStr},${FormatUtil.luisTimeSpan(endDateTime, beginDateTime)})`;
      result.futureValue = result.pastValue = { item1: beginDateTime, item2: endDateTime };
      result.subDateTimeEntities = [];
      if (hasLeft || beginMinute !== invalidFlag || beginSecond !== invalidFlag) {
        let er = {
          start: time1StartIndex,
          length: time1EndIndex - time1StartIndex,
          text: source.substring(time1StartIndex, time1EndIndex),
          type: Constants.SYS_DATETIME_TIME
        };
        let pr = this.config.timeParser.parse(er, reference);
        result.subDateTimeEntities.push(pr);
      }
      if (hasRight || endMinute !== invalidFlag || endSecond !== invalidFlag) {
        let er = {
          start: time2StartIndex,
          length: time2EndIndex - time2StartIndex,
          text: source.substring(time2StartIndex, time2EndIndex),
          type: Constants.SYS_DATETIME_TIME
        };
        let pr = this.config.timeParser.parse(er, reference);
        result.subDateTimeEntities.push(pr);
      }
    }
    return result;
  }
  mergeTwoTimePoints(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let ers = this.config.timeExtractor.extract(text, referenceTime);
    let pr1 = null;
    let pr2 = null;
    let validTimeNumber = false;
    if (ers.length !== 2) {
      if (ers.length === 1) {
        let numErs = this.config.integerExtractor.extract(text);
        for (let num of numErs) {
          let midStrBegin = 0;
          let midStrEnd = 0;
          if (num.start > ers[0].start + ers[0].length) {
            midStrBegin = ers[0].start + ers[0].length;
            midStrEnd = num.start - midStrBegin;
          } else if (num.start + num.length < ers[0].start) {
            midStrBegin = num.start + num.length;
            midStrEnd = ers[0].start - midStrBegin;
          }
          let middleStr = text.substr(midStrBegin, midStrEnd);
          let tillMatch = middleStr.match(this.config.tillRegex);
          if (tillMatch) {
            num.type = Constants.SYS_DATETIME_TIME;
            ers.push(num);
            validTimeNumber = true;
            break;
          }
        }
        ers = ers.sort((x, y) => x.start - y.start);
      }
      if (!validTimeNumber) {
        return ret;
      }
    }
    if (ers.length !== 2) {
      return ret;
    }
    pr1 = this.config.timeParser.parse(ers[0], referenceTime);
    pr2 = this.config.timeParser.parse(ers[1], referenceTime);
    if (pr1.value === null || pr2.value === null) {
      return ret;
    }
    let ampmStr1 = pr1.value.comment;
    let ampmStr2 = pr2.value.comment;
    let beginTime = pr1.value.futureValue;
    let endTime = pr2.value.futureValue;
    if (!recognizersText.StringUtility.isNullOrEmpty(ampmStr2) && ampmStr2.endsWith("ampm") && endTime <= beginTime && DateUtils.addHours(endTime, 12) > beginTime) {
      endTime = DateUtils.addHours(endTime, 12);
      pr2.value.futureValue = endTime;
      pr2.timexStr = `T${endTime.getHours()}`;
      if (endTime.getMinutes() > 0) {
        pr2.timexStr = `${pr2.timexStr}:${endTime.getMinutes()}`;
      }
    }
    if (!recognizersText.StringUtility.isNullOrEmpty(ampmStr1) && ampmStr1.endsWith("ampm") && endTime > DateUtils.addHours(beginTime, 12)) {
      beginTime = DateUtils.addHours(beginTime, 12);
      pr1.value.futureValue = beginTime;
      pr1.timexStr = `T${beginTime.getHours()}`;
      if (beginTime.getMinutes() > 0) {
        pr1.timexStr = `${pr1.timexStr}:${beginTime.getMinutes()}`;
      }
    }
    if (endTime < beginTime) {
      endTime = DateUtils.addDays(endTime, 1);
    }
    let hours = DateUtils.totalHoursFloor(endTime, beginTime);
    let minutes = DateUtils.totalMinutesFloor(endTime, beginTime) % 60;
    ret.timex = `(${pr1.timexStr},${pr2.timexStr},PT` + (hours > 0 ? `${hours}H` : "") + (minutes > 0 ? `${minutes}M` : "") + ")";
    ret.futureValue = ret.pastValue = { item1: beginTime, item2: endTime };
    ret.success = true;
    if (ampmStr1 && ampmStr1.endsWith("ampm") && ampmStr2 && ampmStr2.endsWith("ampm")) {
      ret.comment = "ampm";
    }
    ret.subDateTimeEntities = [pr1, pr2];
    return ret;
  }
  // parse "morning", "afternoon", "night"
  parseTimeOfDay(text, referenceTime) {
    let day = referenceTime.getDate();
    let month = referenceTime.getMonth();
    let year = referenceTime.getFullYear();
    let ret = new DateTimeResolutionResult();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.timeOfDayRegex, text);
    let hasEarly = false;
    let hasLate = false;
    if (matches.length) {
      if (!recognizersText.StringUtility.isNullOrEmpty(matches[0].groups("early").value)) {
        let early = matches[0].groups("early").value;
        text = text.replace(early, "");
        hasEarly = true;
        ret.comment = "early";
      }
      if (!hasEarly && !recognizersText.StringUtility.isNullOrEmpty(matches[0].groups("late").value)) {
        let late = matches[0].groups("late").value;
        text = text.replace(late, "");
        hasLate = true;
        ret.comment = "late";
      }
    }
    let timexRange = this.config.getMatchedTimexRange(text);
    if (!timexRange.matched) {
      return new DateTimeResolutionResult();
    }
    if (hasEarly) {
      timexRange.endHour = timexRange.beginHour + 2;
      if (timexRange.endMin === 59) {
        timexRange.endMin = 0;
      }
    } else if (hasLate) {
      timexRange.beginHour = timexRange.beginHour + 2;
    }
    ret.timex = timexRange.timex;
    ret.futureValue = ret.pastValue = {
      item1: new Date(year, month, day, timexRange.beginHour, 0, 0),
      item2: new Date(year, month, day, timexRange.endHour, timexRange.endMin, timexRange.endMin)
    };
    ret.success = true;
    return ret;
  }
};
_BaseTimePeriodParser.ParserName = Constants.SYS_DATETIME_TIMEPERIOD;
var BaseTimePeriodParser = _BaseTimePeriodParser;
var BaseDateTimeExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DATETIME;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array();
    tokens = tokens.concat(this.mergeDateAndTime(source, referenceDate));
    tokens = tokens.concat(this.basicRegexMatch(source));
    tokens = tokens.concat(this.timeOfTodayBefore(source, referenceDate));
    tokens = tokens.concat(this.timeOfTodayAfter(source, referenceDate));
    tokens = tokens.concat(this.specialTimeOfDate(source, referenceDate));
    tokens = tokens.concat(this.durationWithBeforeAndAfter(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  mergeDateAndTime(source, refDate) {
    let tokens = new Array();
    let ers = this.config.datePointExtractor.extract(source, refDate);
    if (ers.length < 1) return tokens;
    ers = ers.concat(this.config.timePointExtractor.extract(source, refDate));
    if (ers.length < 2) return tokens;
    ers = ers.sort((erA, erB) => erA.start < erB.start ? -1 : erA.start === erB.start ? 0 : 1);
    let i = 0;
    while (i < ers.length - 1) {
      let j = i + 1;
      while (j < ers.length && recognizersText.ExtractResult.isOverlap(ers[i], ers[j])) {
        j++;
      }
      if (j >= ers.length) break;
      if (ers[i].type === Constants.SYS_DATETIME_DATE && ers[j].type === Constants.SYS_DATETIME_TIME || ers[i].type === Constants.SYS_DATETIME_TIME && ers[j].type === Constants.SYS_DATETIME_DATE) {
        let middleBegin = ers[i].start + ers[i].length;
        let middleEnd = ers[j].start;
        if (middleBegin > middleEnd) {
          i = j + 1;
          continue;
        }
        let middleStr = source.substr(middleBegin, middleEnd - middleBegin).trim().toLowerCase();
        if (this.config.isConnectorToken(middleStr)) {
          let begin = ers[i].start;
          let end = ers[j].start + ers[j].length;
          tokens.push(new Token(begin, end));
        }
        i = j + 1;
        continue;
      }
      i = j;
    }
    tokens.forEach((token, index) => {
      let afterStr = source.substr(token.end);
      let match = recognizersText.RegExpUtility.getMatches(this.config.suffixRegex, afterStr);
      if (match && match.length > 0) {
        token.end += match[0].length;
      }
    });
    return tokens;
  }
  basicRegexMatch(source) {
    let tokens = new Array();
    recognizersText.RegExpUtility.getMatches(this.config.nowRegex, source).forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    return tokens;
  }
  timeOfTodayBefore(source, refDate) {
    let tokens = new Array();
    let ers = this.config.timePointExtractor.extract(source, refDate);
    ers.forEach((er) => {
      let beforeStr = source.substr(0, er.start);
      let innerMatches = recognizersText.RegExpUtility.getMatches(this.config.nightRegex, er.text);
      if (innerMatches && innerMatches.length > 0 && innerMatches[0].index === 0) {
        beforeStr = source.substr(0, er.start + innerMatches[0].length);
      }
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) return;
      let matches = recognizersText.RegExpUtility.getMatches(this.config.timeOfTodayBeforeRegex, beforeStr);
      if (matches && matches.length > 0) {
        let begin = matches[0].index;
        let end = er.start + er.length;
        tokens.push(new Token(begin, end));
      }
    });
    recognizersText.RegExpUtility.getMatches(this.config.simpleTimeOfTodayBeforeRegex, source).forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    return tokens;
  }
  timeOfTodayAfter(source, refDate) {
    let tokens = new Array();
    let ers = this.config.timePointExtractor.extract(source, refDate);
    ers.forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      if (recognizersText.StringUtility.isNullOrWhitespace(afterStr)) return;
      let matches = recognizersText.RegExpUtility.getMatches(this.config.timeOfTodayAfterRegex, afterStr);
      if (matches && matches.length > 0) {
        let begin = er.start;
        let end = er.start + er.length + matches[0].length;
        tokens.push(new Token(begin, end));
      }
    });
    recognizersText.RegExpUtility.getMatches(this.config.simpleTimeOfTodayAfterRegex, source).forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    return tokens;
  }
  specialTimeOfDate(source, refDate) {
    let tokens = new Array();
    let ers = this.config.datePointExtractor.extract(source, refDate);
    ers.forEach((er) => {
      let beforeStr = source.substr(0, er.start);
      let beforeMatches = recognizersText.RegExpUtility.getMatches(this.config.theEndOfRegex, beforeStr);
      if (beforeMatches && beforeMatches.length > 0) {
        tokens.push(new Token(beforeMatches[0].index, er.start + er.length));
      } else {
        let afterStr = source.substr(er.start + er.length);
        let afterMatches = recognizersText.RegExpUtility.getMatches(this.config.theEndOfRegex, afterStr);
        if (afterMatches && afterMatches.length > 0) {
          tokens.push(new Token(er.start, er.start + er.length + afterMatches[0].index + afterMatches[0].length));
        }
      }
    });
    return tokens;
  }
  durationWithBeforeAndAfter(source, refDate) {
    let tokens = new Array();
    this.config.durationExtractor.extract(source, refDate).forEach((er) => {
      let matches = recognizersText.RegExpUtility.getMatches(this.config.unitRegex, er.text);
      if (matches && matches.length > 0) {
        tokens = AgoLaterUtil.extractorDurationWithBeforeAndAfter(source, er, tokens, this.config.utilityConfiguration);
      }
    });
    return tokens;
  }
};
var _BaseDateTimeParser = class _BaseDateTimeParser {
  constructor(configuration) {
    this.config = configuration;
  }
  parse(er, refTime) {
    if (!refTime) refTime = /* @__PURE__ */ new Date();
    let referenceTime = refTime;
    let value = null;
    if (er.type === _BaseDateTimeParser.ParserName) {
      let innerResult = this.mergeDateAndTime(er.text, referenceTime);
      if (!innerResult.success) {
        innerResult = this.parseBasicRegex(er.text, referenceTime);
      }
      if (!innerResult.success) {
        innerResult = this.parseTimeOfToday(er.text, referenceTime);
      }
      if (!innerResult.success) {
        innerResult = this.parseSpecialTimeOfDate(er.text, referenceTime);
      }
      if (!innerResult.success) {
        innerResult = this.parserDurationWithAgoAndLater(er.text, referenceTime);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    {
      ret.value = value, ret.timexStr = value === null ? "" : value.timex, ret.resolutionStr = "";
    }
    return ret;
  }
  parseBasicRegex(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let trimmedText = text.trim().toLowerCase();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.nowRegex, trimmedText);
    if (matches.length && matches[0].index === 0 && matches[0].length === trimmedText.length) {
      let getMatchedNowTimex = this.config.getMatchedNowTimex(trimmedText);
      ret.timex = getMatchedNowTimex.timex;
      ret.futureValue = ret.pastValue = referenceTime;
      ret.success = true;
      return ret;
    }
    return ret;
  }
  // merge a Date entity and a Time entity
  mergeDateAndTime(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let er1 = this.config.dateExtractor.extract(text, referenceTime);
    if (er1.length === 0) {
      er1 = this.config.dateExtractor.extract(this.config.tokenBeforeDate + text, referenceTime);
      if (er1.length === 1) {
        er1[0].start -= this.config.tokenBeforeDate.length;
      } else {
        return ret;
      }
    } else {
      if (this.config.haveAmbiguousToken(text, er1[0].text)) {
        return ret;
      }
    }
    let er2 = this.config.timeExtractor.extract(text, referenceTime);
    if (er2.length === 0) {
      er2 = this.config.timeExtractor.extract(this.config.tokenBeforeTime + text, referenceTime);
      if (er2.length === 1) {
        er2[0].start -= this.config.tokenBeforeTime.length;
      } else {
        return ret;
      }
    }
    let correctTimeIdx = 0;
    while (correctTimeIdx < er2.length && recognizersText.ExtractResult.isOverlap(er2[correctTimeIdx], er1[0])) {
      correctTimeIdx++;
    }
    if (correctTimeIdx >= er2.length) {
      return ret;
    }
    let pr1 = this.config.dateParser.parse(er1[0], new Date(referenceTime.toDateString()));
    let pr2 = this.config.timeParser.parse(er2[correctTimeIdx], referenceTime);
    if (pr1.value === null || pr2.value === null) {
      return ret;
    }
    let futureDate = pr1.value.futureValue;
    let pastDate = pr1.value.pastValue;
    let time = pr2.value.futureValue;
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    if (recognizersText.RegExpUtility.getMatches(this.config.pmTimeRegex, text).length && hour < 12) {
      hour += 12;
    } else if (recognizersText.RegExpUtility.getMatches(this.config.amTimeRegex, text).length && hour >= 12) {
      hour -= 12;
    }
    let timeStr = pr2.timexStr;
    if (timeStr.endsWith("ampm")) {
      timeStr = timeStr.substring(0, timeStr.length - 4);
    }
    timeStr = "T" + FormatUtil.toString(hour, 2) + timeStr.substring(3);
    ret.timex = pr1.timexStr + timeStr;
    let val = pr2.value;
    if (hour <= 12 && !recognizersText.RegExpUtility.getMatches(this.config.pmTimeRegex, text).length && !recognizersText.RegExpUtility.getMatches(this.config.amTimeRegex, text).length && val.comment) {
      ret.comment = "ampm";
    }
    ret.futureValue = new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), hour, min, sec);
    ret.pastValue = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), hour, min, sec);
    ret.success = true;
    pr2.timexStr = timeStr;
    if (!recognizersText.StringUtility.isNullOrEmpty(ret.comment)) {
      pr2.value.comment = ret.comment === "ampm" ? "ampm" : "";
    }
    ret.subDateTimeEntities = [pr1, pr2];
    return ret;
  }
  parseTimeOfToday(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let trimmedText = text.toLowerCase().trim();
    let hour = 0;
    let min = 0;
    let sec = 0;
    let timeStr;
    let wholeMatches = recognizersText.RegExpUtility.getMatches(this.config.simpleTimeOfTodayAfterRegex, trimmedText);
    if (!(wholeMatches.length && wholeMatches[0].length === trimmedText.length)) {
      wholeMatches = recognizersText.RegExpUtility.getMatches(this.config.simpleTimeOfTodayBeforeRegex, trimmedText);
    }
    if (wholeMatches.length && wholeMatches[0].length === trimmedText.length) {
      let hourStr = wholeMatches[0].groups("hour").value;
      if (!hourStr) {
        hourStr = wholeMatches[0].groups("hournum").value.toLowerCase();
        hour = this.config.numbers.get(hourStr);
      } else {
        hour = parseInt(hourStr, 10);
      }
      timeStr = "T" + FormatUtil.toString(hour, 2);
    } else {
      let ers = this.config.timeExtractor.extract(trimmedText, referenceTime);
      if (ers.length !== 1) {
        ers = this.config.timeExtractor.extract(this.config.tokenBeforeTime + trimmedText, referenceTime);
        if (ers.length === 1) {
          ers[0].start -= this.config.tokenBeforeTime.length;
        } else {
          return ret;
        }
      }
      let pr = this.config.timeParser.parse(ers[0], referenceTime);
      if (pr.value === null) {
        return ret;
      }
      let time = pr.value.futureValue;
      hour = time.getHours();
      min = time.getMinutes();
      sec = time.getSeconds();
      timeStr = pr.timexStr;
    }
    let matches = recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, trimmedText);
    if (matches.length) {
      let matchStr = matches[0].value.toLowerCase();
      let swift = this.config.getSwiftDay(matchStr);
      let date = new Date(referenceTime);
      date.setDate(date.getDate() + swift);
      hour = this.config.getHour(matchStr, hour);
      if (timeStr.endsWith("ampm")) {
        timeStr = timeStr.substring(0, timeStr.length - 4);
      }
      timeStr = "T" + FormatUtil.toString(hour, 2) + timeStr.substring(3);
      ret.timex = FormatUtil.formatDate(date) + timeStr;
      ret.futureValue = ret.pastValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min, sec);
      ret.success = true;
      return ret;
    }
    return ret;
  }
  parseSpecialTimeOfDate(text, refDateTime) {
    let ret = new DateTimeResolutionResult();
    let ers = this.config.dateExtractor.extract(text, refDateTime);
    if (ers.length !== 1) {
      return ret;
    }
    let beforeStr = text.substring(0, ers[0].start || 0);
    if (recognizersText.RegExpUtility.getMatches(this.config.theEndOfRegex, beforeStr).length) {
      let pr = this.config.dateParser.parse(ers[0], refDateTime);
      let futureDate = new Date(pr.value.futureValue);
      let pastDate = new Date(pr.value.pastValue);
      ret.timex = pr.timexStr + "T23:59";
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setMinutes(futureDate.getMinutes() - 1);
      ret.futureValue = futureDate;
      pastDate.setDate(pastDate.getDate() + 1);
      pastDate.setMinutes(pastDate.getMinutes() - 1);
      ret.pastValue = pastDate;
      ret.success = true;
      return ret;
    }
    return ret;
  }
  // handle like "two hours ago"
  parserDurationWithAgoAndLater(text, referenceTime) {
    return AgoLaterUtil.parseDurationWithAgoAndLater(
      text,
      referenceTime,
      this.config.durationExtractor,
      this.config.durationParser,
      this.config.unitMap,
      this.config.unitRegex,
      this.config.utilityConfiguration,
      1 /* DateTime */
    );
  }
};
_BaseDateTimeParser.ParserName = Constants.SYS_DATETIME_DATETIME;
var BaseDateTimeParser = _BaseDateTimeParser;
var BaseDateTimePeriodExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DATETIMEPERIOD;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.matchSimpleCases(source, referenceDate)).concat(this.mergeTwoTimePoints(source, referenceDate)).concat(this.matchDuration(source, referenceDate)).concat(this.matchNight(source, referenceDate)).concat(this.matchRelativeUnit(source));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchSimpleCases(source, refDate) {
    let tokens = new Array();
    this.config.simpleCasesRegexes.forEach((regexp) => {
      recognizersText.RegExpUtility.getMatches(regexp, source).forEach((match) => {
        let hasBeforeDate = false;
        let beforeStr = source.substr(0, match.index);
        if (!recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) {
          let ers = this.config.singleDateExtractor.extract(beforeStr, refDate);
          if (ers && ers.length > 0) {
            let er = ers[ers.length - 1];
            let begin = er.start;
            er.start + er.length;
            let middleStr = beforeStr.substr(begin + er.length).trim().toLowerCase();
            if (recognizersText.StringUtility.isNullOrWhitespace(middleStr) || recognizersText.RegExpUtility.getMatches(this.config.prepositionRegex, middleStr).length > 0) {
              tokens.push(new Token(begin, match.index + match.length));
              hasBeforeDate = true;
            }
          }
        }
        let followedStr = source.substr(match.index + match.length);
        if (!recognizersText.StringUtility.isNullOrWhitespace(followedStr) && !hasBeforeDate) {
          let ers = this.config.singleDateExtractor.extract(followedStr, refDate);
          if (ers && ers.length > 0) {
            let er = ers[0];
            let begin = er.start;
            let end = er.start + er.length;
            let middleStr = followedStr.substr(0, begin).trim().toLowerCase();
            if (recognizersText.StringUtility.isNullOrWhitespace(middleStr) || recognizersText.RegExpUtility.getMatches(this.config.prepositionRegex, middleStr).length > 0) {
              tokens.push(new Token(match.index, match.index + match.length + end));
            }
          }
        }
      });
    });
    return tokens;
  }
  mergeTwoTimePoints(source, refDate) {
    let tokens = new Array();
    let ersDateTime = this.config.singleDateTimeExtractor.extract(source, refDate);
    let ersTime = this.config.singleTimeExtractor.extract(source, refDate);
    let innerMarks = [];
    let j = 0;
    ersDateTime.forEach((erDateTime, index) => {
      innerMarks.push(erDateTime);
      while (j < ersTime.length && ersTime[j].start + ersTime[j].length < erDateTime.start) {
        innerMarks.push(ersTime[j++]);
      }
      while (j < ersTime.length && recognizersText.ExtractResult.isOverlap(ersTime[j], erDateTime)) {
        j++;
      }
    });
    while (j < ersTime.length) {
      innerMarks.push(ersTime[j++]);
    }
    innerMarks = innerMarks.sort((erA, erB) => erA.start < erB.start ? -1 : erA.start === erB.start ? 0 : 1);
    let idx = 0;
    while (idx < innerMarks.length - 1) {
      let currentMark = innerMarks[idx];
      let nextMark = innerMarks[idx + 1];
      if (currentMark.type === Constants.SYS_DATETIME_TIME && nextMark.type === Constants.SYS_DATETIME_TIME) {
        idx++;
        continue;
      }
      let middleBegin = currentMark.start + currentMark.length;
      let middleEnd = nextMark.start;
      let middleStr = source.substr(middleBegin, middleEnd - middleBegin).trim().toLowerCase();
      let matches = recognizersText.RegExpUtility.getMatches(this.config.tillRegex, middleStr);
      if (matches && matches.length > 0 && matches[0].index === 0 && matches[0].length === middleStr.length) {
        let periodBegin = currentMark.start;
        let periodEnd = nextMark.start + nextMark.length;
        let beforeStr = source.substr(0, periodBegin).trim().toLowerCase();
        let matchFrom = this.config.getFromTokenIndex(beforeStr);
        let fromTokenIndex = matchFrom.matched ? matchFrom : this.config.getBetweenTokenIndex(beforeStr);
        if (fromTokenIndex.matched) {
          periodBegin = fromTokenIndex.index;
        }
        tokens.push(new Token(periodBegin, periodEnd));
        idx += 2;
        continue;
      }
      if (this.config.hasConnectorToken(middleStr)) {
        let periodBegin = currentMark.start;
        let periodEnd = nextMark.start + nextMark.length;
        let beforeStr = source.substr(0, periodBegin).trim().toLowerCase();
        let betweenTokenIndex = this.config.getBetweenTokenIndex(beforeStr);
        if (betweenTokenIndex.matched) {
          periodBegin = betweenTokenIndex.index;
          tokens.push(new Token(periodBegin, periodEnd));
          idx += 2;
          continue;
        }
      }
      idx++;
    }
    return tokens;
  }
  matchDuration(source, refDate) {
    let tokens = new Array();
    let durations = new Array();
    this.config.durationExtractor.extract(source, refDate).forEach((duration) => {
      let match = recognizersText.RegExpUtility.getMatches(this.config.timeUnitRegex, duration.text).pop();
      if (match) {
        durations.push(new Token(duration.start, duration.start + duration.length));
      }
    });
    durations.forEach((duration) => {
      let beforeStr = source.substr(0, duration.start).toLowerCase();
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) return;
      let match = recognizersText.RegExpUtility.getMatches(this.config.pastPrefixRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
      match = recognizersText.RegExpUtility.getMatches(this.config.nextPrefixRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
      }
    });
    return tokens;
  }
  matchNight(source, refDate) {
    let tokens = new Array();
    recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, source).forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    this.config.singleDateExtractor.extract(source, refDate).forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      let match = recognizersText.RegExpUtility.getMatches(this.config.periodTimeOfDayWithDateRegex, afterStr).pop();
      if (match) {
        if (recognizersText.StringUtility.isNullOrWhitespace(afterStr.substr(0, match.index))) {
          tokens.push(new Token(er.start, er.start + er.length + match.index + match.length));
        } else {
          let pauseMatch = recognizersText.RegExpUtility.getMatches(this.config.middlePauseRegex, afterStr.substr(0, match.index)).pop();
          if (pauseMatch) {
            let suffix = afterStr.substr(match.index + match.length).trim();
            let endingMatch = recognizersText.RegExpUtility.getMatches(this.config.generalEndingRegex, suffix).pop();
            if (endingMatch) {
              tokens.push(new Token(er.start || 0, er.start + er.length + match.index + match.length || 0));
            }
          }
        }
      }
      let beforeStr = source.substr(0, er.start);
      match = recognizersText.RegExpUtility.getMatches(this.config.periodTimeOfDayWithDateRegex, beforeStr).pop();
      if (match) {
        if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
          let middleStr = source.substr(match.index + match.length, er.start - match.index - match.length);
          if (recognizersText.StringUtility.isWhitespace(middleStr)) {
            tokens.push(new Token(match.index, er.start + er.length));
          }
        } else {
          let pauseMatch = recognizersText.RegExpUtility.getMatches(this.config.middlePauseRegex, beforeStr.substr(match.index + match.length)).pop();
          if (pauseMatch) {
            let suffix = source.substr(er.start + er.length || 0).trim();
            let endingMatch = recognizersText.RegExpUtility.getMatches(this.config.generalEndingRegex, suffix).pop();
            if (endingMatch) {
              tokens.push(new Token(match.index, er.start + er.length || 0));
            }
          }
        }
      }
      for (let e of tokens) {
        if (e.start > 0) {
          let beforeStr2 = source.substr(0, e.start);
          if (!recognizersText.StringUtility.isNullOrWhitespace(beforeStr2)) {
            let timeErs = this.config.timePeriodExtractor.extract(beforeStr2);
            if (timeErs.length > 0) {
              for (let tp of timeErs) {
                let midStr = beforeStr2.substr(tp.start + tp.length || 0);
                if (recognizersText.StringUtility.isNullOrWhitespace(midStr)) {
                  tokens.push(new Token(tp.start || 0, tp.start + tp.length + midStr.length + e.length || 0));
                }
              }
            }
          }
        }
        if (e.start + e.length <= source.length) {
          let afterStr2 = source.substr(e.start + e.length);
          if (!recognizersText.StringUtility.isNullOrWhitespace(afterStr2)) {
            let timeErs = this.config.timePeriodExtractor.extract(afterStr2);
            if (timeErs.length > 0) {
              for (let tp of timeErs) {
                let midStr = afterStr2.substr(0, tp.start || 0);
                if (recognizersText.StringUtility.isNullOrWhitespace(midStr)) {
                  tokens.push(new Token(e.start, e.start + e.length + midStr.length + tp.length || 0));
                }
              }
            }
          }
        }
      }
    });
    return tokens;
  }
  matchRelativeUnit(source) {
    let tokens = new Array();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.relativeTimeUnitRegex, source);
    if (matches.length === 0) {
      matches = recognizersText.RegExpUtility.getMatches(this.config.restOfDateTimeRegex, source);
    }
    matches.forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    return tokens;
  }
};
var BaseDateTimePeriodParser = class {
  constructor(config) {
    this.parserName = Constants.SYS_DATETIME_DATETIMEPERIOD;
    this.config = config;
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.trim().toLowerCase();
      let innerResult = this.mergeDateAndTimePeriods(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.mergeTwoTimePoints(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseSpecificTimeOfDay(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseDuration(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseRelativeUnit(source, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.START_DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue[0]);
        innerResult.futureResolution[TimeTypeConstants.END_DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue[1]);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.START_DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue[0]);
        innerResult.pastResolution[TimeTypeConstants.END_DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue[1]);
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  mergeDateAndTimePeriods(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let trimedText = text.trim().toLowerCase();
    let er = this.config.timePeriodExtractor.extract(trimedText, referenceTime);
    if (er.length !== 1) {
      return this.parseSimpleCases(text, referenceTime);
    }
    let timePeriodParseResult = this.config.timePeriodParser.parse(er[0]);
    let timePeriodResolutionResult = timePeriodParseResult.value;
    if (!timePeriodResolutionResult) {
      return this.parseSimpleCases(text, referenceTime);
    }
    let timePeriodTimex = timePeriodResolutionResult.timex;
    if (!recognizersText.StringUtility.isNullOrEmpty(timePeriodTimex) && timePeriodTimex.startsWith("(")) {
      let dateResult = this.config.dateExtractor.extract(trimedText.replace(er[0].text, ""), referenceTime);
      let dateStr = "";
      let futureTime;
      let pastTime;
      if (dateResult.length === 1 && trimedText.replace(er[0].text, "").trim() === dateResult[0].text) {
        let pr = this.config.dateParser.parse(dateResult[0], referenceTime);
        if (pr.value) {
          futureTime = pr.value.futureValue;
          pastTime = pr.value.pastValue;
          dateStr = pr.timexStr;
        } else {
          return this.parseSimpleCases(text, referenceTime);
        }
        timePeriodTimex = timePeriodTimex.replace("(", "").replace(")", "");
        let timePeriodTimexArray = timePeriodTimex.split(",");
        let timePeriodFutureValue = timePeriodResolutionResult.futureValue;
        let beginTime = timePeriodFutureValue.item1;
        let endTime = timePeriodFutureValue.item2;
        if (timePeriodTimexArray.length === 3) {
          let beginStr = dateStr + timePeriodTimexArray[0];
          let endStr = dateStr + timePeriodTimexArray[1];
          ret.timex = `(${beginStr},${endStr},${timePeriodTimexArray[2]})`;
          ret.futureValue = [
            DateUtils.safeCreateFromMinValue(
              futureTime.getFullYear(),
              futureTime.getMonth(),
              futureTime.getDate(),
              beginTime.getHours(),
              beginTime.getMinutes(),
              beginTime.getSeconds()
            ),
            DateUtils.safeCreateFromMinValue(
              futureTime.getFullYear(),
              futureTime.getMonth(),
              futureTime.getDate(),
              endTime.getHours(),
              endTime.getMinutes(),
              endTime.getSeconds()
            )
          ];
          ret.pastValue = [
            DateUtils.safeCreateFromMinValue(
              pastTime.getFullYear(),
              pastTime.getMonth(),
              pastTime.getDate(),
              beginTime.getHours(),
              beginTime.getMinutes(),
              beginTime.getSeconds()
            ),
            DateUtils.safeCreateFromMinValue(
              pastTime.getFullYear(),
              pastTime.getMonth(),
              pastTime.getDate(),
              endTime.getHours(),
              endTime.getMinutes(),
              endTime.getSeconds()
            )
          ];
          if (!recognizersText.StringUtility.isNullOrEmpty(timePeriodResolutionResult.comment) && timePeriodResolutionResult.comment === "ampm") {
            ret.comment = "ampm";
          }
          ret.success = true;
          ret.subDateTimeEntities = [pr, timePeriodParseResult];
          return ret;
        }
      } else {
        return this.parseSimpleCases(text, referenceTime);
      }
    }
    return this.parseSimpleCases(text, referenceTime);
  }
  parseSimpleCases(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.pureNumberFromToRegex, source).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.pureNumberBetweenAndRegex, source).pop();
    }
    if (!match || match.index !== 0 && match.index + match.length !== source.length) return result;
    let hourGroup = match.groups("hour");
    let beginHour = this.config.numbers.get(hourGroup.captures[0]) || Number.parseInt(hourGroup.captures[0], 10) || 0;
    let endHour = this.config.numbers.get(hourGroup.captures[1]) || Number.parseInt(hourGroup.captures[1], 10) || 0;
    let er = this.config.dateExtractor.extract(source.replace(match.value, ""), referenceDate).pop();
    if (!er) return result;
    let pr = this.config.dateParser.parse(er, referenceDate);
    if (!pr) return result;
    let dateResult = pr.value;
    let futureDate = dateResult.futureValue;
    let pastDate = dateResult.pastValue;
    let dateStr = pr.timexStr;
    let hasAm = false;
    let hasPm = false;
    let pmStr = match.groups("pm").value;
    let amStr = match.groups("am").value;
    let descStr = match.groups("desc").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(amStr) || descStr.startsWith("a")) {
      if (beginHour >= 12) beginHour -= 12;
      if (endHour >= 12) endHour -= 12;
      hasAm = true;
    }
    if (!recognizersText.StringUtility.isNullOrEmpty(pmStr) || descStr.startsWith("p")) {
      if (beginHour < 12) beginHour += 12;
      if (endHour < 12) endHour += 12;
      hasPm = true;
    }
    if (!hasAm && !hasPm && beginHour <= 12 && endHour <= 12) {
      result.comment = "ampm";
    }
    let beginStr = `${dateStr}T${FormatUtil.toString(beginHour, 2)}`;
    let endStr = `${dateStr}T${FormatUtil.toString(endHour, 2)}`;
    result.timex = `(${beginStr},${endStr},PT${endHour - beginHour}H)`;
    result.futureValue = [
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), endHour, 0, 0)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), endHour, 0, 0)
    ];
    result.success = true;
    return result;
  }
  mergeTwoTimePoints(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let prs;
    let timeErs = this.config.timeExtractor.extract(source, referenceDate);
    let datetimeErs = this.config.dateTimeExtractor.extract(source, referenceDate);
    let bothHasDate = false;
    let beginHasDate = false;
    let endHasDate = false;
    if (datetimeErs.length === 2) {
      prs = this.getTwoPoints(datetimeErs[0], datetimeErs[1], this.config.dateTimeParser, this.config.dateTimeParser, referenceDate);
      bothHasDate = true;
    } else if (datetimeErs.length === 1 && timeErs.length === 2) {
      if (recognizersText.ExtractResult.isOverlap(datetimeErs[0], timeErs[0])) {
        prs = this.getTwoPoints(datetimeErs[0], timeErs[1], this.config.dateTimeParser, this.config.timeParser, referenceDate);
        beginHasDate = true;
      } else {
        prs = this.getTwoPoints(timeErs[0], datetimeErs[0], this.config.timeParser, this.config.dateTimeParser, referenceDate);
        endHasDate = true;
      }
    } else if (datetimeErs.length === 1 && timeErs.length === 1) {
      if (timeErs[0].start < datetimeErs[0].start) {
        prs = this.getTwoPoints(timeErs[0], datetimeErs[0], this.config.timeParser, this.config.dateTimeParser, referenceDate);
        endHasDate = true;
      } else {
        prs = this.getTwoPoints(datetimeErs[0], timeErs[0], this.config.dateTimeParser, this.config.timeParser, referenceDate);
        beginHasDate = true;
      }
    }
    if (!prs || !prs.begin.value || !prs.end.value) return result;
    let begin = prs.begin.value;
    let end = prs.end.value;
    let futureBegin = begin.futureValue;
    let futureEnd = end.futureValue;
    let pastBegin = begin.pastValue;
    let pastEnd = end.pastValue;
    if (bothHasDate) {
      if (futureBegin > futureEnd) futureBegin = pastBegin;
      if (pastEnd < pastBegin) pastEnd = futureEnd;
      result.timex = `(${prs.begin.timexStr},${prs.end.timexStr},PT${DateUtils.totalHours(futureEnd, futureBegin)}H)`;
    } else if (beginHasDate) {
      futureEnd = DateUtils.safeCreateFromMinValue(futureBegin.getFullYear(), futureBegin.getMonth(), futureBegin.getDate(), futureEnd.getHours(), futureEnd.getMinutes(), futureEnd.getSeconds());
      pastEnd = DateUtils.safeCreateFromMinValue(pastBegin.getFullYear(), pastBegin.getMonth(), pastBegin.getDate(), pastEnd.getHours(), pastEnd.getMinutes(), pastEnd.getSeconds());
      let dateStr = prs.begin.timexStr.split("T").pop();
      result.timex = `(${prs.begin.timexStr},${dateStr}${prs.end.timexStr},PT${DateUtils.totalHours(futureEnd, futureBegin)}H)`;
    } else if (endHasDate) {
      futureBegin = DateUtils.safeCreateFromMinValue(futureEnd.getFullYear(), futureEnd.getMonth(), futureEnd.getDate(), futureBegin.getHours(), futureBegin.getMinutes(), futureBegin.getSeconds());
      pastBegin = DateUtils.safeCreateFromMinValue(pastEnd.getFullYear(), pastEnd.getMonth(), pastEnd.getDate(), pastBegin.getHours(), pastBegin.getMinutes(), pastBegin.getSeconds());
      let dateStr = prs.end.timexStr.split("T")[0];
      result.timex = `(${dateStr}${prs.begin.timexStr},${prs.end.timexStr},PT${DateUtils.totalHours(futureEnd, futureBegin)}H)`;
    }
    if (!recognizersText.StringUtility.isNullOrEmpty(begin.comment) && begin.comment.endsWith("ampm") && !recognizersText.StringUtility.isNullOrEmpty(end.comment) && end.comment.endsWith("ampm")) {
      result.comment = "ampm";
    }
    result.futureValue = [futureBegin, futureEnd];
    result.pastValue = [pastBegin, pastEnd];
    result.success = true;
    result.subDateTimeEntities = [prs.begin, prs.end];
    return result;
  }
  getTwoPoints(beginEr, endEr, beginParser, endParser, referenceDate) {
    let beginPr = beginParser.parse(beginEr, referenceDate);
    let endPr = endParser.parse(endEr, referenceDate);
    return { begin: beginPr, end: endPr };
  }
  parseSpecificTimeOfDay(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let timeText = source;
    let hasEarly = false;
    let hasLate = false;
    let match = recognizersText.RegExpUtility.getMatches(this.config.periodTimeOfDayWithDateRegex, source).pop();
    if (match) {
      timeText = match.groups("timeOfDay").value;
      if (!recognizersText.StringUtility.isNullOrEmpty(match.groups("early").value)) {
        hasEarly = true;
        result.comment = "early";
      } else if (!recognizersText.StringUtility.isNullOrEmpty(match.groups("late").value)) {
        hasLate = true;
        result.comment = "late";
      }
    }
    let matched = this.config.getMatchedTimeRange(timeText);
    if (!matched || !matched.success) return result;
    if (hasEarly) {
      matched.endHour = matched.beginHour + 2;
      if (matched.endMin === 59) matched.endMin = 0;
    } else if (hasLate) {
      matched.beginHour += 2;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, source).pop();
    if (match && match.index === 0 && match.length === source.length) {
      let swift = this.config.getSwiftPrefix(source);
      let date = DateUtils.addDays(referenceDate, swift);
      result.timex = FormatUtil.formatDate(date) + matched.timeStr;
      result.futureValue = [
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), matched.beginHour, 0, 0),
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), matched.endHour, matched.endMin, matched.endMin)
      ];
      result.pastValue = [
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), matched.beginHour, 0, 0),
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), matched.endHour, matched.endMin, matched.endMin)
      ];
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.periodTimeOfDayWithDateRegex, source).pop();
    if (!match) return result;
    let beforeStr = source.substr(0, match.index).trim();
    let afterStr = source.substr(match.index + match.length).trim();
    let ers = this.config.dateExtractor.extract(beforeStr, referenceDate);
    let timePeriodErs = this.config.timePeriodExtractor.extract(beforeStr);
    if (timePeriodErs.length > 0) {
      beforeStr = beforeStr.slice(timePeriodErs[0].start || 0, timePeriodErs[0].start + timePeriodErs[0].length || 0).trim();
    } else {
      timePeriodErs = this.config.timePeriodExtractor.extract(afterStr);
      if (timePeriodErs.length > 0) {
        afterStr = afterStr.slice(timePeriodErs[0].start || 0, timePeriodErs[0].start + timePeriodErs[0].length || 0).trim();
      }
    }
    if (ers.length === 0 || ers[0].length !== beforeStr.length) {
      let valid = false;
      if (ers.length > 0 && ers[0].start === 0) {
        let midStr = beforeStr.substr(ers[0].start + ers[0].length || 0);
        if (recognizersText.StringUtility.isNullOrWhitespace(midStr.replace(",", " "))) {
          valid = true;
        }
      }
      if (!valid) {
        ers = this.config.dateExtractor.extract(afterStr);
        if (ers.length === 0 || ers[0].length !== afterStr.length) {
          if (ers.length > 0 && ers[0].start + ers[0].length === afterStr.length) {
            let midStr = afterStr.substr(0, ers[0].start || 0);
            if (recognizersText.StringUtility.isNullOrWhitespace(midStr.replace(",", " "))) {
              valid = true;
            }
          }
        } else {
          valid = true;
        }
        if (!valid) {
          return result;
        }
      }
    }
    let hasSpecificTimePeriod = false;
    if (timePeriodErs.length > 0) {
      let TimePr = this.config.timePeriodParser.parse(timePeriodErs[0], referenceDate);
      if (TimePr != null) {
        let periodFuture = TimePr.value.futureValue;
        let periodPast = TimePr.value.pastValue;
        if (periodFuture === periodPast) {
          matched.beginHour = periodFuture.item1.getHours();
          matched.endHour = periodFuture.item2.getHours();
        } else {
          if (periodFuture.item1.Hour >= matched.beginHour || periodFuture.item2.Hour <= matched.endHour) {
            matched.beginHour = periodFuture.item1.getHours();
            matched.endHour = periodFuture.item2.getHours();
          } else {
            matched.beginHour = periodPast.item1.getHours();
            matched.endHour = periodPast.item2.getHours();
          }
        }
        hasSpecificTimePeriod = true;
      }
    }
    let pr = this.config.dateParser.parse(ers[0], referenceDate);
    if (!pr) return result;
    let futureDate = pr.value.futureValue;
    let pastDate = pr.value.pastValue;
    if (!hasSpecificTimePeriod) {
      result.timex = pr.timexStr + matched.timeStr;
    } else {
      result.timex = `(${pr.timexStr}T${matched.beginHour},${pr.timexStr}T${matched.endHour},PT${matched.endHour - matched.beginHour}H)`;
    }
    result.futureValue = [
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), matched.beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), matched.endHour, matched.endMin, matched.endMin)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), matched.beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), matched.endHour, matched.endMin, matched.endMin)
    ];
    result.success = true;
    return result;
  }
  parseDuration(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let restOfDateTimeMatch = recognizersText.RegExpUtility.getMatches(this.config.restOfDateTimeRegex, source);
    if (restOfDateTimeMatch.length) {
      return result;
    }
    let ers = this.config.durationExtractor.extract(source, referenceDate);
    if (!ers || ers.length !== 1) return result;
    let pr = this.config.durationParser.parse(ers[0], referenceDate);
    if (!pr) return result;
    let beforeStr = source.substr(0, pr.start).trim();
    let durationResult = pr.value;
    let swiftSecond = 0;
    let mod;
    if (Number.isFinite(durationResult.pastValue) && Number.isFinite(durationResult.futureValue)) {
      swiftSecond = Math.round(durationResult.futureValue);
    }
    let beginTime = new Date(referenceDate);
    let endTime = new Date(referenceDate);
    let prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
    if (prefixMatch && prefixMatch.length === beforeStr.length) {
      mod = TimeTypeConstants.beforeMod;
      beginTime.setSeconds(referenceDate.getSeconds() - swiftSecond);
    }
    prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
    if (prefixMatch && prefixMatch.length === beforeStr.length) {
      mod = TimeTypeConstants.afterMod;
      endTime = new Date(beginTime);
      endTime.setSeconds(beginTime.getSeconds() + swiftSecond);
    }
    let luisDateBegin = FormatUtil.luisDateFromDate(beginTime);
    let luisTimeBegin = FormatUtil.luisTimeFromDate(beginTime);
    let luisDateEnd = FormatUtil.luisDateFromDate(endTime);
    let luisTimeEnd = FormatUtil.luisTimeFromDate(endTime);
    result.timex = `(${luisDateBegin}T${luisTimeBegin},${luisDateEnd}T${luisTimeEnd},${durationResult.timex})`;
    result.futureValue = [beginTime, endTime];
    result.pastValue = [beginTime, endTime];
    result.success = true;
    if (mod) {
      pr.value.mod = mod;
    }
    result.subDateTimeEntities = [pr];
    return result;
  }
  isFloat(value) {
    return Number.isFinite(value) && !Number.isInteger(value);
  }
  parseRelativeUnit(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.relativeTimeUnitRegex, source).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.restOfDateTimeRegex, source).pop();
    }
    if (!match) return result;
    let srcUnit = match.groups("unit").value;
    let unitStr = this.config.unitMap.get(srcUnit);
    if (!unitStr) return result;
    let swift = 1;
    let prefixMatch = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, source).pop();
    if (prefixMatch) swift = -1;
    let beginTime = new Date(referenceDate);
    let endTime = new Date(referenceDate);
    let ptTimex = "";
    switch (unitStr) {
      case "D":
        endTime = DateUtils.safeCreateFromMinValue(beginTime.getFullYear(), beginTime.getMonth(), beginTime.getDate());
        endTime.setDate(endTime.getDate() + 1);
        endTime.setSeconds(endTime.getSeconds() - 1);
        ptTimex = `PT${DateUtils.totalSeconds(endTime, beginTime)}S`;
        break;
      case "H":
        beginTime.setHours(beginTime.getHours() + (swift > 0 ? 0 : swift));
        endTime.setHours(endTime.getHours() + (swift > 0 ? swift : 0));
        ptTimex = `PT1H`;
        break;
      case "M":
        beginTime.setMinutes(beginTime.getMinutes() + (swift > 0 ? 0 : swift));
        endTime.setMinutes(endTime.getMinutes() + (swift > 0 ? swift : 0));
        ptTimex = `PT1M`;
        break;
      case "S":
        beginTime.setSeconds(beginTime.getSeconds() + (swift > 0 ? 0 : swift));
        endTime.setSeconds(endTime.getSeconds() + (swift > 0 ? swift : 0));
        ptTimex = `PT1S`;
        break;
      default:
        return result;
    }
    let luisDateBegin = FormatUtil.luisDateFromDate(beginTime);
    let luisTimeBegin = FormatUtil.luisTimeFromDate(beginTime);
    let luisDateEnd = FormatUtil.luisDateFromDate(endTime);
    let luisTimeEnd = FormatUtil.luisTimeFromDate(endTime);
    result.timex = `(${luisDateBegin}T${luisTimeBegin},${luisDateEnd}T${luisTimeEnd},${ptTimex})`;
    result.futureValue = [beginTime, endTime];
    result.pastValue = [beginTime, endTime];
    result.success = true;
    return result;
  }
};
var BaseDurationExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DURATION;
    this.config = config;
  }
  extract(source, refDate) {
    let baseTokens = this.numberWithUnit(source);
    let tokens = new Array().concat(baseTokens).concat(this.numberWithUnitAndSuffix(source, baseTokens)).concat(this.implicitDuration(source));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    this.resolveMoreThanOrLessThanPrefix(source, result);
    return result;
  }
  // handle cases look like: {more than | less than} {duration}?
  resolveMoreThanOrLessThanPrefix(text, ers) {
    for (let er of ers) {
      var beforeString = text.substr(0, er.start);
      let match = recognizersText.RegExpUtility.getMatches(this.config.moreThanRegex, beforeString);
      if (match && match.length) {
        er.data = TimeTypeConstants.moreThanMod;
      }
      if (!match || match.length === 0) {
        match = recognizersText.RegExpUtility.getMatches(this.config.lessThanRegex, beforeString);
        if (match && match.length) {
          er.data = TimeTypeConstants.lessThanMod;
        }
      }
      if (match && match.length) {
        er.length += er.start - match[0].index;
        er.start = match[0].index;
        er.text = text.substr(er.start, er.length);
      }
    }
  }
  numberWithUnit(source) {
    return this.config.cardinalExtractor.extract(source).map((o) => {
      let afterString = source.substring(o.start + o.length);
      let match = recognizersText.RegExpUtility.getMatches(this.config.followedUnit, afterString)[0];
      if (match && match.index === 0) {
        return new Token(o.start | 0, o.start + o.length + match.length);
      }
    }).filter((o) => o !== void 0).concat(this.getTokensFromRegex(this.config.numberCombinedWithUnit, source)).concat(this.getTokensFromRegex(this.config.anUnitRegex, source)).concat(this.getTokensFromRegex(this.config.inexactNumberUnitRegex, source));
  }
  numberWithUnitAndSuffix(source, ers) {
    return ers.map((o) => {
      let afterString = source.substring(o.start + o.length);
      let match = recognizersText.RegExpUtility.getMatches(this.config.suffixAndRegex, afterString)[0];
      if (match && match.index === 0) {
        return new Token(o.start | 0, o.start + o.length + match.length);
      }
    });
  }
  implicitDuration(source) {
    return this.getTokensFromRegex(this.config.allRegex, source).concat(this.getTokensFromRegex(this.config.halfRegex, source)).concat(this.getTokensFromRegex(this.config.relativeDurationUnitRegex, source));
  }
  getTokensFromRegex(regexp, source) {
    return recognizersText.RegExpUtility.getMatches(regexp, source).map((o) => new Token(o.index, o.index + o.length));
  }
};
var BaseDurationParser = class {
  constructor(config) {
    this.parserName = Constants.SYS_DATETIME_DURATION;
    this.config = config;
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.toLowerCase();
      let innerResult = this.parseNumberWithUnit(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.parseImplicitDuration(source, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DURATION] = innerResult.futureValue.toString();
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DURATION] = innerResult.pastValue.toString();
        resultValue = innerResult;
      }
    }
    var value = resultValue;
    if (value && extractorResult.data) {
      if (extractorResult.data === TimeTypeConstants.moreThanMod || extractorResult.data === TimeTypeConstants.lessThanMod) {
        value.mod = extractorResult.data;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  parseNumberWithUnit(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = this.parseNumberSpaceUnit(trimmedSource);
    if (!result.success) {
      result = this.parseNumberCombinedUnit(trimmedSource);
    }
    if (!result.success) {
      result = this.parseAnUnit(trimmedSource);
    }
    if (!result.success) {
      result = this.parseInexactNumberUnit(trimmedSource);
    }
    return result;
  }
  parseImplicitDuration(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = this.getResultFromRegex(this.config.allDateUnitRegex, trimmedSource, 1);
    if (!result.success) {
      result = this.getResultFromRegex(this.config.halfDateUnitRegex, trimmedSource, 0.5);
    }
    if (!result.success) {
      result = this.getResultFromRegex(this.config.followedUnit, trimmedSource, 1);
    }
    return result;
  }
  getResultFromRegex(regex, source, num) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(regex, source).pop();
    if (!match) return result;
    let sourceUnit = match.groups("unit").value;
    if (!this.config.unitMap.has(sourceUnit)) return result;
    let unitStr = this.config.unitMap.get(sourceUnit);
    result.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${num}${unitStr[0]}`;
    result.futureValue = num * this.config.unitValueMap.get(sourceUnit);
    result.pastValue = result.futureValue;
    result.success = true;
    return result;
  }
  parseNumberSpaceUnit(source) {
    let result = new DateTimeResolutionResult();
    let suffixStr = source;
    let ers = this.config.cardinalExtractor.extract(source);
    if (ers && ers.length === 1) {
      let er = ers[0];
      let sourceUnit = "";
      let pr = this.config.numberParser.parse(er);
      let noNumStr = source.substr(er.start + er.length).trim().toLowerCase();
      let match = recognizersText.RegExpUtility.getMatches(this.config.followedUnit, noNumStr).pop();
      if (match) {
        sourceUnit = match.groups("unit").value;
        suffixStr = match.groups("suffix").value;
      }
      if (this.config.unitMap.has(sourceUnit)) {
        let num = Number.parseFloat(pr.value) + this.parseNumberWithUnitAndSuffix(suffixStr);
        let unitStr = this.config.unitMap.get(sourceUnit);
        result.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${num}${unitStr[0]}`;
        result.futureValue = num * this.config.unitValueMap.get(sourceUnit);
        result.pastValue = result.futureValue;
        result.success = true;
        return result;
      }
    }
    return result;
  }
  parseNumberWithUnitAndSuffix(source) {
    let match = recognizersText.RegExpUtility.getMatches(this.config.suffixAndRegex, source).pop();
    if (match) {
      let numStr = match.groups("suffix_num").value;
      if (this.config.doubleNumbers.has(numStr)) {
        return this.config.doubleNumbers.get(numStr);
      }
    }
    return 0;
  }
  parseNumberCombinedUnit(source) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.numberCombinedWithUnit, source).pop();
    if (!match) return result;
    let num = Number.parseFloat(match.groups("num").value) + this.parseNumberWithUnitAndSuffix(source);
    let sourceUnit = match.groups("unit").value;
    if (this.config.unitMap.has(sourceUnit)) {
      let unitStr = this.config.unitMap.get(sourceUnit);
      if (num > 1e3 && (unitStr === "Y" || unitStr === "MON" || unitStr === "W")) {
        return result;
      }
      result.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${num}${unitStr[0]}`;
      result.futureValue = num * this.config.unitValueMap.get(sourceUnit);
      result.pastValue = result.futureValue;
      result.success = true;
      return result;
    }
    return result;
  }
  parseAnUnit(source) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.anUnitRegex, source).pop();
    if (!match) {
      match = recognizersText.RegExpUtility.getMatches(this.config.halfDateUnitRegex, source).pop();
    }
    if (!match) return result;
    let num = recognizersText.StringUtility.isNullOrEmpty(match.groups("half").value) ? 1 : 0.5;
    num += this.parseNumberWithUnitAndSuffix(source);
    let sourceUnit = match.groups("unit").value;
    if (this.config.unitMap.has(sourceUnit)) {
      let unitStr = this.config.unitMap.get(sourceUnit);
      result.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${num}${unitStr[0]}`;
      result.futureValue = num * this.config.unitValueMap.get(sourceUnit);
      result.pastValue = result.futureValue;
      result.success = true;
      return result;
    }
    return result;
  }
  parseInexactNumberUnit(source) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.inexactNumberUnitRegex, source).pop();
    if (!match) return result;
    let num;
    if (match.groups("NumTwoTerm").value) {
      num = 2;
    } else {
      num = 3;
    }
    let sourceUnit = match.groups("unit").value;
    if (this.config.unitMap.has(sourceUnit)) {
      let unitStr = this.config.unitMap.get(sourceUnit);
      if (num > 1e3 && (unitStr === "Y" || unitStr === "MON" || unitStr === "W")) {
        return result;
      }
      result.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${num}${unitStr[0]}`;
      result.futureValue = num * this.config.unitValueMap.get(sourceUnit);
      result.pastValue = result.futureValue;
      result.success = true;
      return result;
    }
    return result;
  }
  isLessThanDay(source) {
    return source === "S" || source === "M" || source === "H";
  }
};
var EnglishDurationExtractorConfiguration = class {
  constructor() {
    this.allRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AllRegex);
    this.halfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HalfRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DurationFollowedUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NumberCombinedWithDurationUnit);
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AnUnitRegex);
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.InexactNumberUnitRegex);
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SuffixAndRegex);
    this.relativeDurationUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeDurationUnitRegex);
    this.moreThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MoreThanRegex);
    this.lessThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LessThanRegex);
    this.cardinalExtractor = new recognizersTextNumber.EnglishCardinalExtractor();
  }
};
var EnglishDurationParserConfiguration = class {
  constructor(config) {
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DurationFollowedUnit);
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SuffixAndRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NumberCombinedWithDurationUnit);
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AnUnitRegex);
    this.allDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AllRegex);
    this.halfDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HalfRegex);
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.InexactNumberUnitRegex);
    this.unitMap = config.unitMap;
    this.unitValueMap = config.unitValueMap;
    this.doubleNumbers = config.doubleNumbers;
  }
};
var _EnglishTimeExtractorConfiguration = class _EnglishTimeExtractorConfiguration {
  constructor() {
    this.timeRegexList = _EnglishTimeExtractorConfiguration.timeRegexList;
    this.atRegex = _EnglishTimeExtractorConfiguration.atRegex;
    this.ishRegex = _EnglishTimeExtractorConfiguration.ishRegex;
  }
};
_EnglishTimeExtractorConfiguration.timeRegexList = [
  // (three min past)? seven|7|(seven thirty) pm
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex1, "gis"),
  // (three min past)? 3:00(:00)? (pm)?
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex2, "gis"),
  // (three min past)? 3.00 (pm)
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex3, "gis"),
  // (three min past) (five thirty|seven|7|7:00(:00)?) (pm)? (in the night)
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex4, "gis"),
  // (three min past) (five thirty|seven|7|7:00(:00)?) (pm)?
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex5, "gis"),
  // (five thirty|seven|7|7:00(:00)?) (pm)? (in the night)
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex6, "gis"),
  // (in the night) at (five thirty|seven|7|7:00(:00)?) (pm)?
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex7, "gis"),
  // (in the night) (five thirty|seven|7|7:00(:00)?) (pm)?
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex8, "gis"),
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex9, "gis"),
  // (three min past)? 3h00 (pm)?
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex10, "gis"),
  // at 2.30, before 6.30pm. 'at' prefix or 'am/pm' suffix is required here
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeRegex11, "gis"),
  // 340pm
  recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ConnectNumRegex, "gis")
];
_EnglishTimeExtractorConfiguration.atRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AtRegex, "gis");
_EnglishTimeExtractorConfiguration.lessThanOneHour = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LessThanOneHour, "gis");
_EnglishTimeExtractorConfiguration.timeSuffix = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeSuffix, "gis");
_EnglishTimeExtractorConfiguration.timeSuffixFull = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeSuffixFull, "gis");
_EnglishTimeExtractorConfiguration.ishRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.IshRegex, "gis");
var EnglishTimeExtractorConfiguration = _EnglishTimeExtractorConfiguration;
var EnglishTimeParserConfiguration = class {
  constructor(config) {
    this.timeTokenPrefix = exports.EnglishDateTime.TimeTokenPrefix;
    this.atRegex = EnglishTimeExtractorConfiguration.atRegex;
    this.timeRegexes = EnglishTimeExtractorConfiguration.timeRegexList;
    this.numbers = config.numbers;
    this.lunchRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LunchRegex);
    this.timeSuffixFull = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeSuffixFull);
    this.nightRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NightRegex);
    this.utilityConfiguration = config.utilityConfiguration;
  }
  adjustByPrefix(prefix, adjust) {
    let deltaMin = 0;
    let trimmedPrefix = prefix.trim().toLowerCase();
    if (trimmedPrefix.startsWith("half")) {
      deltaMin = 30;
    } else if (trimmedPrefix.startsWith("a quarter") || trimmedPrefix.startsWith("quarter")) {
      deltaMin = 15;
    } else if (trimmedPrefix.startsWith("three quarter")) {
      deltaMin = 45;
    } else {
      let match = recognizersText.RegExpUtility.getMatches(EnglishTimeExtractorConfiguration.lessThanOneHour, trimmedPrefix);
      let minStr = match[0].groups("deltamin").value;
      if (minStr) {
        deltaMin = Number.parseInt(minStr, 10);
      } else {
        minStr = match[0].groups("deltaminnum").value.toLowerCase();
        deltaMin = this.numbers.get(minStr);
      }
    }
    if (trimmedPrefix.endsWith("to")) {
      deltaMin = -deltaMin;
    }
    adjust.min += deltaMin;
    if (adjust.min < 0) {
      adjust.min += 60;
      adjust.hour -= 1;
    }
    adjust.hasMin = true;
  }
  adjustBySuffix(suffix, adjust) {
    let trimmedSuffix = suffix.trim().toLowerCase();
    let deltaHour = 0;
    let matches = recognizersText.RegExpUtility.getMatches(EnglishTimeExtractorConfiguration.timeSuffixFull, trimmedSuffix);
    if (matches.length > 0 && matches[0].index === 0 && matches[0].length === trimmedSuffix.length) {
      let oclockStr = matches[0].groups("oclock").value;
      if (!oclockStr) {
        let amStr = matches[0].groups("am").value;
        if (amStr) {
          if (adjust.hour >= 12) {
            deltaHour = -12;
          } else {
            adjust.hasAm = true;
          }
        }
        let pmStr = matches[0].groups("pm").value;
        if (pmStr) {
          if (adjust.hour < 12) {
            deltaHour = 12;
          }
          if (recognizersText.RegExpUtility.getMatches(this.lunchRegex, pmStr).length > 0) {
            if (adjust.hour >= 10 && adjust.hour <= 12) {
              deltaHour = 0;
              if (adjust.hour === 12) {
                adjust.hasPm = true;
              } else {
                adjust.hasAm = true;
              }
            } else {
              adjust.hasPm = true;
            }
          } else if (recognizersText.RegExpUtility.getMatches(this.nightRegex, pmStr).length > 0) {
            if (adjust.hour <= 3 || adjust.hour === 12) {
              if (adjust.hour === 12) {
                adjust.hour = 0;
              }
              deltaHour = 0;
              adjust.hasAm = true;
            } else {
              adjust.hasPm = true;
            }
          } else {
            adjust.hasPm = true;
          }
        }
      }
    }
    adjust.hour = (adjust.hour + deltaHour) % 24;
  }
};
var EnglishDateExtractorConfiguration = class {
  constructor() {
    this.dateRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor1),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor2),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor3),
      exports.EnglishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_MDY ? recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor4) : recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor5),
      exports.EnglishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_MDY ? recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor5) : recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor4),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor6),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor7),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor8),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractor9),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateExtractorA)
    ];
    this.implicitDateList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OnRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelaxedOnRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecialDayRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecialDayWithNumRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ThisRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LastDateRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextDateRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SingleWeekDayRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecialDate),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeWeekDayRegex)
    ];
    this.monthEnd = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthEnd);
    this.ofMonth = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OfMonth);
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateUnitRegex);
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ForTheRegex);
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayAndDayOfMonthRegex);
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeMonthRegex);
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayRegex);
    this.dayOfWeek = exports.EnglishDateTime.DayOfWeek;
    this.ordinalExtractor = new recognizersTextNumber.EnglishOrdinalExtractor();
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.EnglishNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.utilityConfiguration = new EnglishDateTimeUtilityConfiguration();
  }
};
var _EnglishDateParserConfiguration = class _EnglishDateParserConfiguration {
  constructor(config) {
    this.ordinalExtractor = config.ordinalExtractor;
    this.integerExtractor = config.integerExtractor;
    this.cardinalExtractor = config.cardinalExtractor;
    this.durationExtractor = config.durationExtractor;
    this.numberParser = config.numberParser;
    this.durationParser = config.durationParser;
    this.monthOfYear = config.monthOfYear;
    this.dayOfMonth = config.dayOfMonth;
    this.dayOfWeek = config.dayOfWeek;
    this.unitMap = config.unitMap;
    this.cardinalMap = config.cardinalMap;
    this.dateRegex = new EnglishDateExtractorConfiguration().dateRegexList;
    this.onRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OnRegex);
    this.specialDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecialDayRegex);
    this.specialDayWithNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecialDayWithNumRegex);
    this.nextRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextDateRegex);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateUnitRegex);
    this.monthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthRegex);
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayRegex);
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LastDateRegex);
    this.thisRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ThisRegex);
    this.weekDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayOfMonthRegex);
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ForTheRegex);
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekDayAndDayOfMonthRegex);
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeMonthRegex);
    this.relativeWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeWeekDayRegex);
    this.utilityConfiguration = config.utilityConfiguration;
    this.dateTokenPrefix = exports.EnglishDateTime.DateTokenPrefix;
  }
  getSwiftDay(source) {
    let trimmedText = source.trim().toLowerCase();
    let swift = 0;
    let matches = recognizersText.RegExpUtility.getMatches(_EnglishDateParserConfiguration.relativeDayRegex, source);
    if (trimmedText === "today") {
      swift = 0;
    } else if (trimmedText === "tomorrow" || trimmedText === "tmr") {
      swift = 1;
    } else if (trimmedText === "yesterday") {
      swift = -1;
    } else if (trimmedText.endsWith("day after tomorrow") || trimmedText.endsWith("day after tmr")) {
      swift = 2;
    } else if (trimmedText.endsWith("day before yesterday")) {
      swift = -2;
    } else if (matches.length) {
      swift = this.getSwift(source);
    }
    return swift;
  }
  getSwiftMonth(source) {
    return this.getSwift(source);
  }
  getSwift(source) {
    let trimmedText = source.trim().toLowerCase();
    let swift = 0;
    let nextPrefixMatches = recognizersText.RegExpUtility.getMatches(_EnglishDateParserConfiguration.nextPrefixRegex, trimmedText);
    let pastPrefixMatches = recognizersText.RegExpUtility.getMatches(_EnglishDateParserConfiguration.pastPrefixRegex, trimmedText);
    if (nextPrefixMatches.length) {
      swift = 1;
    } else if (pastPrefixMatches.length) {
      swift = -1;
    }
    return swift;
  }
  isCardinalLast(source) {
    let trimmedText = source.trim().toLowerCase();
    return trimmedText === "last";
  }
};
// The following three regexes only used in this configuration
// They are not used in the base parser, therefore they are not extracted
// If the spanish date parser need the same regexes, they should be extracted
_EnglishDateParserConfiguration.relativeDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeDayRegex);
_EnglishDateParserConfiguration.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
_EnglishDateParserConfiguration.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
var EnglishDateParserConfiguration = _EnglishDateParserConfiguration;
var EnglishDateTimeExtractorConfiguration = class {
  constructor() {
    this.datePointExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.timePointExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.suffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SuffixRegex);
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NowRegex);
    this.timeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeOfTodayAfterRegex);
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleTimeOfTodayAfterRegex);
    this.nightRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeOfDayRegex);
    this.timeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeOfTodayBeforeRegex);
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleTimeOfTodayBeforeRegex);
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TheEndOfRegex);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeUnitRegex);
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PrepositionRegex);
    this.connectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ConnectorRegex);
    this.utilityConfiguration = new EnglishDateTimeUtilityConfiguration();
  }
  isConnectorToken(source) {
    return recognizersText.StringUtility.isNullOrWhitespace(source) || recognizersText.RegExpUtility.getMatches(this.connectorRegex, source).length > 0 || recognizersText.RegExpUtility.getMatches(this.prepositionRegex, source).length > 0;
  }
};
var EnglishDateTimeParserConfiguration = class {
  constructor(config) {
    this.tokenBeforeDate = exports.EnglishDateTime.TokenBeforeDate;
    this.tokenBeforeTime = exports.EnglishDateTime.TokenBeforeTime;
    this.dateExtractor = config.dateExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NowRegex);
    this.amTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AMTimeRegex);
    this.pmTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PMTimeRegex);
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleTimeOfTodayAfterRegex);
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleTimeOfTodayBeforeRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecificTimeOfDayRegex);
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TheEndOfRegex);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeUnitRegex);
    this.numbers = config.numbers;
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.durationExtractor = config.durationExtractor;
    this.durationParser = config.durationParser;
    this.unitMap = config.unitMap;
    this.utilityConfiguration = config.utilityConfiguration;
  }
  getHour(text, hour) {
    let trimmedText = text.trim().toLowerCase();
    let result = hour;
    if (trimmedText.endsWith("morning") && hour >= 12) {
      result -= 12;
    } else if (!trimmedText.endsWith("morning") && hour < 12) {
      result += 12;
    }
    return result;
  }
  getMatchedNowTimex(text) {
    let trimmedText = text.trim().toLowerCase();
    let timex;
    if (trimmedText.endsWith("now")) {
      timex = "PRESENT_REF";
    } else if (trimmedText === "recently" || trimmedText === "previously") {
      timex = "PAST_REF";
    } else if (trimmedText === "as soon as possible" || trimmedText === "asap") {
      timex = "FUTURE_REF";
    } else {
      timex = null;
      return { matched: false, timex };
    }
    return { matched: true, timex };
  }
  getSwiftDay(text) {
    let trimmedText = text.trim().toLowerCase();
    let swift = 0;
    if (trimmedText.startsWith("next")) {
      swift = 1;
    } else if (trimmedText.startsWith("last")) {
      swift = -1;
    }
    return swift;
  }
  haveAmbiguousToken(text, matchedText) {
    return false;
  }
};
var EnglishTimePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegex = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumFromTo, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumBetweenAnd, "gis")
    ];
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TillRegex, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeOfDayRegex, "gis");
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.GeneralEndingRegex, "gis");
    this.singleTimeExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
  }
  getFromTokenIndex(source) {
    let index = -1;
    if (source.endsWith("from")) {
      index = source.lastIndexOf("from");
      return { matched: true, index };
    }
    return { matched: false, index };
  }
  getBetweenTokenIndex(source) {
    let index = -1;
    if (source.endsWith("between")) {
      index = source.lastIndexOf("between");
      return { matched: true, index };
    }
    return { matched: false, index };
  }
  hasConnectorToken(source) {
    return source === "and";
  }
};
var EnglishTimePeriodParserConfiguration = class {
  constructor(config) {
    this.timeExtractor = config.timeExtractor;
    this.timeParser = config.timeParser;
    this.integerExtractor = config.integerExtractor;
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumFromTo);
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumBetweenAnd);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeOfDayRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TillRegex, "gis");
    this.numbers = config.numbers;
    this.utilityConfiguration = config.utilityConfiguration;
    this.specificTimeFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecificTimeFromTo);
    this.specificTimeBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecificTimeBetweenAnd);
  }
  getMatchedTimexRange(text) {
    let trimmedText = text.trim().toLowerCase();
    if (trimmedText.endsWith("s")) {
      trimmedText = trimmedText.substring(0, trimmedText.length - 1);
    }
    let result = {
      matched: false,
      timex: "",
      beginHour: 0,
      endHour: 0,
      endMin: 0
    };
    if (trimmedText.endsWith("morning")) {
      result.timex = "TMO";
      result.beginHour = 8;
      result.endHour = 12;
    } else if (trimmedText.endsWith("afternoon")) {
      result.timex = "TAF";
      result.beginHour = 12;
      result.endHour = 16;
    } else if (trimmedText.endsWith("evening")) {
      result.timex = "TEV";
      result.beginHour = 16;
      result.endHour = 20;
    } else if (trimmedText === "daytime") {
      result.timex = "TDT";
      result.beginHour = 8;
      result.endHour = 18;
    } else if (trimmedText.endsWith("night")) {
      result.timex = "TNI";
      result.beginHour = 20;
      result.endHour = 23;
      result.endMin = 59;
    } else {
      result.timex = null;
      result.matched = false;
      return result;
    }
    result.matched = true;
    return result;
  }
};
var EnglishDatePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.BetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OneWordPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthWithYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthNumWithYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.YearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthFrontBetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthFrontSimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.QuarterRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.QuarterRegexYearFront),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AllHalfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SeasonRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WhichWeekRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RestOfDateRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LaterEarlyPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekWithWeekDayRangeRegex)
    ];
    this.illegalYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.BaseDateTime.IllegalYearRegex);
    this.YearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.YearRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TillRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.FollowedDateUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NumberCombinedWithDateUnit);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthOfRegex);
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.DateUnitRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RangeUnitRegex);
    this.datePointExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.EnglishNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.rangeConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RangeConnectorRegex);
  }
  getFromTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("from")) {
      result.index = source.lastIndexOf("from");
      result.matched = true;
    }
    return result;
  }
  getBetweenTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("between")) {
      result.index = source.lastIndexOf("between");
      result.matched = true;
    }
    return result;
  }
  hasConnectorToken(source) {
    let match = recognizersText.RegExpUtility.getMatches(this.rangeConnectorRegex, source).pop();
    return match && match.length === source.length;
  }
};
var EnglishDatePeriodParserConfiguration = class {
  constructor(config) {
    this.dateExtractor = config.dateExtractor;
    this.dateParser = config.dateParser;
    this.durationExtractor = config.durationExtractor;
    this.durationParser = config.durationParser;
    this.monthFrontBetweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthFrontBetweenRegex);
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.BetweenRegex);
    this.monthFrontSimpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthFrontSimpleCasesRegex);
    this.simpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SimpleCasesRegex);
    this.oneWordPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OneWordPeriodRegex);
    this.monthWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthWithYear);
    this.monthNumWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthNumWithYear);
    this.yearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.YearRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
    this.inConnectorRegex = config.utilityConfiguration.inConnectorRegex;
    this.weekOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfMonthRegex);
    this.weekOfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfYearRegex);
    this.quarterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.QuarterRegex);
    this.quarterRegexYearFront = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.QuarterRegexYearFront);
    this.allHalfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AllHalfYearRegex);
    this.seasonRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SeasonRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MonthOfRegex);
    this.whichWeekRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WhichWeekRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.ThisPrefixRegex);
    this.restOfDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RestOfDateRegex);
    this.laterEarlyPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LaterEarlyPeriodRegex);
    this.weekWithWeekDayRangeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.WeekWithWeekDayRangeRegex);
    this.tokenBeforeDate = exports.EnglishDateTime.TokenBeforeDate;
    this.dayOfMonth = config.dayOfMonth;
    this.monthOfYear = config.monthOfYear;
    this.cardinalMap = config.cardinalMap;
    this.seasonMap = config.seasonMap;
    this.unitMap = config.unitMap;
  }
  getSwiftDayOrMonth(source) {
    let trimmedSource = source.trim().toLowerCase();
    let swift = 0;
    if (recognizersText.RegExpUtility.getMatches(this.nextPrefixRegex, trimmedSource).length > 0) {
      swift = 1;
    } else if (recognizersText.RegExpUtility.getMatches(this.pastPrefixRegex, trimmedSource).length > 0) {
      swift = -1;
    }
    return swift;
  }
  getSwiftYear(source) {
    let trimmedSource = source.trim().toLowerCase();
    let swift = -10;
    if (recognizersText.RegExpUtility.getMatches(this.nextPrefixRegex, trimmedSource).length > 0) {
      swift = 1;
    } else if (recognizersText.RegExpUtility.getMatches(this.pastPrefixRegex, trimmedSource).length > 0) {
      swift = -1;
    } else if (recognizersText.RegExpUtility.getMatches(this.thisPrefixRegex, trimmedSource).length > 0) {
      swift = 0;
    }
    return swift;
  }
  isFuture(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.startsWith("this") || trimmedSource.startsWith("next");
  }
  isYearToDate(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource === "year to date";
  }
  isMonthToDate(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource === "month to date";
  }
  isWeekOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("week");
  }
  isWeekend(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("weekend");
  }
  isMonthOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("month");
  }
  isYearOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("year");
  }
  isLastCardinal(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource === "last";
  }
};
var EnglishDateTimePeriodExtractorConfiguration = class {
  constructor() {
    this.cardinalExtractor = new recognizersTextNumber.EnglishCardinalExtractor();
    this.singleDateExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.singleTimeExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.singleDateTimeExtractor = new BaseDateTimeExtractor(new EnglishDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new EnglishTimePeriodExtractorConfiguration());
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumFromTo),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumBetweenAnd)
    ];
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PrepositionRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TillRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodSpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodTimeOfDayRegex);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodTimeOfDayWithDateRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeFollowedUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeNumberCombinedWithUnit);
    this.timeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.TimeUnitRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
    this.rangeConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RangeConnectorRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeTimeUnitRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RestOfDateTimeRegex);
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.GeneralEndingRegex);
    this.middlePauseRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MiddlePauseRegex);
  }
  getFromTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("from")) {
      result.index = source.lastIndexOf("from");
      result.matched = true;
    }
    return result;
  }
  getBetweenTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("between")) {
      result.index = source.lastIndexOf("between");
      result.matched = true;
    }
    return result;
  }
  hasConnectorToken(source) {
    return recognizersText.RegExpUtility.getMatches(this.rangeConnectorRegex, source).length > 0;
  }
};
var EnglishDateTimePeriodParserConfiguration = class {
  constructor(config) {
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumFromTo);
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PureNumBetweenAnd);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodTimeOfDayWithDateRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SpecificTimeOfDayRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PastPrefixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NextPrefixRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RelativeTimeUnitRegex);
    this.numbers = config.numbers;
    this.unitMap = config.unitMap;
    this.dateExtractor = config.dateExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.durationExtractor = config.durationExtractor;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.dateTimeParser = config.dateTimeParser;
    this.timePeriodParser = config.timePeriodParser;
    this.durationParser = config.durationParser;
    this.morningStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.MorningStartEndRegex);
    this.afternoonStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AfternoonStartEndRegex);
    this.eveningStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EveningStartEndRegex);
    this.nightStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NightStartEndRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RestOfDateTimeRegex);
  }
  getMatchedTimeRange(source) {
    let timeStr;
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    let success = false;
    if (recognizersText.RegExpUtility.getMatches(this.morningStartEndRegex, source).length > 0) {
      timeStr = "TMO";
      beginHour = 8;
      endHour = 12;
      success = true;
    } else if (recognizersText.RegExpUtility.getMatches(this.afternoonStartEndRegex, source).length > 0) {
      timeStr = "TAF";
      beginHour = 12;
      endHour = 16;
      success = true;
    } else if (recognizersText.RegExpUtility.getMatches(this.eveningStartEndRegex, source).length > 0) {
      timeStr = "TEV";
      beginHour = 16;
      endHour = 20;
      success = true;
    } else if (recognizersText.RegExpUtility.getMatches(this.nightStartEndRegex, source).length > 0) {
      timeStr = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
      success = true;
    }
    return { timeStr, beginHour, endHour, endMin, success };
  }
  getSwiftPrefix(source) {
    let swift = 0;
    if (source.startsWith("next")) swift = 1;
    else if (source.startsWith("last")) swift = -1;
    return swift;
  }
};
var EnglishTimeParser = class extends BaseTimeParser {
  constructor(configuration) {
    super(configuration);
  }
  internalParse(text, referenceTime) {
    let innerResult = super.internalParse(text, referenceTime);
    if (!innerResult.success) {
      innerResult = this.parseIsh(text, referenceTime);
    }
    return innerResult;
  }
  // parse "noonish", "11-ish"
  parseIsh(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let trimmedText = text.toLowerCase().trim();
    let matches = recognizersText.RegExpUtility.getMatches(EnglishTimeExtractorConfiguration.ishRegex, trimmedText);
    if (matches.length > 0 && matches[0].length === trimmedText.length) {
      let hourStr = matches[0].groups("hour").value;
      let hour = 12;
      if (hourStr) {
        hour = Number.parseInt(hourStr, 10);
      }
      ret.timex = "T" + FormatUtil.toString(hour, 2);
      ret.futureValue = ret.pastValue = new Date(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), hour, 0, 0);
      ret.success = true;
      return ret;
    }
    return ret;
  }
};

// recognizers/recognizers-date-time/src/dateTime/english/baseConfiguration.ts
var EnglishDateTimeUtilityConfiguration = class {
  constructor() {
    this.laterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.LaterRegex);
    this.agoRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AgoRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.RangeUnitRegex);
    this.amDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AmDescRegex);
    this.pmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PmDescRegex);
    this.amPmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AmPmDescRegex);
  }
};
var EnglishCommonDateTimeParserConfiguration2 = class extends BaseDateParserConfiguration {
  constructor() {
    super();
    this.utilityConfiguration = new EnglishDateTimeUtilityConfiguration();
    this.unitMap = exports.EnglishDateTime.UnitMap;
    this.unitValueMap = exports.EnglishDateTime.UnitValueMap;
    this.seasonMap = exports.EnglishDateTime.SeasonMap;
    this.cardinalMap = exports.EnglishDateTime.CardinalMap;
    this.dayOfWeek = exports.EnglishDateTime.DayOfWeek;
    this.monthOfYear = exports.EnglishDateTime.MonthOfYear;
    this.numbers = exports.EnglishDateTime.Numbers;
    this.doubleNumbers = exports.EnglishDateTime.DoubleNumbers;
    this.cardinalExtractor = new recognizersTextNumber.EnglishCardinalExtractor();
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.ordinalExtractor = new recognizersTextNumber.EnglishOrdinalExtractor();
    this.dayOfMonth = new Map([...exports.BaseDateTime.DayOfMonthDictionary, ...exports.EnglishDateTime.DayOfMonth]);
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.EnglishNumberParserConfiguration());
    this.dateExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new EnglishDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new EnglishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new EnglishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new EnglishDateTimePeriodExtractorConfiguration());
    this.durationParser = new BaseDurationParser(new EnglishDurationParserConfiguration(this));
    this.dateParser = new BaseDateParser(new EnglishDateParserConfiguration(this));
    this.timeParser = new EnglishTimeParser(new EnglishTimeParserConfiguration(this));
    this.dateTimeParser = new BaseDateTimeParser(new EnglishDateTimeParserConfiguration(this));
    this.datePeriodParser = new BaseDatePeriodParser(new EnglishDatePeriodParserConfiguration(this));
    this.timePeriodParser = new BaseTimePeriodParser(new EnglishTimePeriodParserConfiguration(this));
    this.dateTimePeriodParser = new BaseDateTimePeriodParser(new EnglishDateTimePeriodParserConfiguration(this));
  }
};
var BaseSetExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_SET;
    this.config = config;
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.matchEachUnit(source)).concat(this.matchPeriodic(source)).concat(this.matchEachDuration(source, referenceDate)).concat(this.timeEveryday(source, referenceDate)).concat(this.matchEach(this.config.dateExtractor, source, referenceDate)).concat(this.matchEach(this.config.timeExtractor, source, referenceDate)).concat(this.matchEach(this.config.dateTimeExtractor, source, referenceDate)).concat(this.matchEach(this.config.datePeriodExtractor, source, referenceDate)).concat(this.matchEach(this.config.timePeriodExtractor, source, referenceDate)).concat(this.matchEach(this.config.dateTimePeriodExtractor, source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchEachUnit(source) {
    let ret = [];
    recognizersText.RegExpUtility.getMatches(this.config.eachUnitRegex, source).forEach((match) => {
      ret.push(new Token(match.index, match.index + match.length));
    });
    return ret;
  }
  matchPeriodic(source) {
    let ret = [];
    recognizersText.RegExpUtility.getMatches(this.config.periodicRegex, source).forEach((match) => {
      ret.push(new Token(match.index, match.index + match.length));
    });
    return ret;
  }
  matchEachDuration(source, refDate) {
    let ret = [];
    this.config.durationExtractor.extract(source, refDate).forEach((er) => {
      if (recognizersText.RegExpUtility.getMatches(this.config.lastRegex, er.text).length > 0) return;
      let beforeStr = source.substr(0, er.start);
      let matches = recognizersText.RegExpUtility.getMatches(this.config.eachPrefixRegex, beforeStr);
      if (matches && matches.length > 0) {
        ret.push(new Token(matches[0].index, er.start + er.length));
      }
    });
    return ret;
  }
  timeEveryday(source, refDate) {
    let ret = [];
    this.config.timeExtractor.extract(source, refDate).forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      if (recognizersText.StringUtility.isNullOrWhitespace(afterStr) && this.config.beforeEachDayRegex) {
        let beforeStr = source.substr(0, er.start);
        let beforeMatches = recognizersText.RegExpUtility.getMatches(this.config.beforeEachDayRegex, beforeStr);
        if (beforeMatches && beforeMatches.length > 0) {
          ret.push(new Token(beforeMatches[0].index, er.start + er.length));
        }
      } else {
        let afterMatches = recognizersText.RegExpUtility.getMatches(this.config.eachDayRegex, afterStr);
        if (afterMatches && afterMatches.length > 0) {
          ret.push(new Token(er.start, er.start + er.length + afterMatches[0].length));
        }
      }
    });
    return ret;
  }
  matchEach(extractor, source, refDate) {
    let ret = [];
    recognizersText.RegExpUtility.getMatches(this.config.setEachRegex, source).forEach((match) => {
      let trimmedSource = source.substr(0, match.index) + source.substr(match.index + match.length);
      extractor.extract(trimmedSource, refDate).forEach((er) => {
        if (er.start <= match.index && er.start + er.length > match.index) {
          ret.push(new Token(er.start, er.start + match.length + er.length));
        }
      });
    });
    recognizersText.RegExpUtility.getMatches(this.config.setWeekDayRegex, source).forEach((match) => {
      let trimmedSource = source.substr(0, match.index) + match.groups("weekday").value + source.substr(match.index + match.length);
      extractor.extract(trimmedSource, refDate).forEach((er) => {
        if (er.start <= match.index && er.text.includes(match.groups("weekday").value)) {
          let length = er.length + 1;
          if (!recognizersText.StringUtility.isNullOrEmpty(match.groups("prefix").value)) {
            length += match.groups("prefix").value.length;
          }
          ret.push(new Token(er.start, er.start + length));
        }
      });
    });
    return ret;
  }
};
var _BaseSetParser = class _BaseSetParser {
  constructor(configuration) {
    this.config = configuration;
  }
  parse(er, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === _BaseSetParser.ParserName) {
      let innerResult = this.parseEachUnit(er.text);
      if (!innerResult.success) {
        innerResult = this.parseEachDuration(er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parserTimeEveryday(er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.dateTimePeriodExtractor, this.config.dateTimePeriodParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.datePeriodExtractor, this.config.datePeriodParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.timePeriodExtractor, this.config.timePeriodParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.dateTimeExtractor, this.config.dateTimeParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.dateExtractor, this.config.dateParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.timeExtractor, this.config.timeParser, er.text, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.SET] = innerResult.futureValue;
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.SET] = innerResult.pastValue;
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value, ret.timexStr = value === null ? "" : value.timex, ret.resolutionStr = "";
    return ret;
  }
  parseEachDuration(text, refDate) {
    let ret = new DateTimeResolutionResult();
    let ers = this.config.durationExtractor.extract(text, refDate);
    if (ers.length !== 1 || text.substring(ers[0].start + ers[0].length || 0)) {
      return ret;
    }
    let beforeStr = text.substring(0, ers[0].start || 0);
    let matches = recognizersText.RegExpUtility.getMatches(this.config.eachPrefixRegex, beforeStr);
    if (matches.length) {
      let pr = this.config.durationParser.parse(ers[0], /* @__PURE__ */ new Date());
      ret.timex = pr.timexStr;
      ret.futureValue = ret.pastValue = "Set: " + pr.timexStr;
      ret.success = true;
      return ret;
    }
    return ret;
  }
  parseEachUnit(text) {
    let ret = new DateTimeResolutionResult();
    let matches = recognizersText.RegExpUtility.getMatches(this.config.periodicRegex, text);
    if (matches.length) {
      let getMatchedDailyTimex = this.config.getMatchedDailyTimex(text);
      if (!getMatchedDailyTimex.matched) {
        return ret;
      }
      ret.timex = getMatchedDailyTimex.timex;
      ret.futureValue = ret.pastValue = "Set: " + ret.timex;
      ret.success = true;
      return ret;
    }
    matches = recognizersText.RegExpUtility.getMatches(this.config.eachUnitRegex, text);
    if (matches.length && matches[0].length === text.length) {
      let sourceUnit = matches[0].groups("unit").value;
      if (sourceUnit && this.config.unitMap.has(sourceUnit)) {
        let getMatchedUnitTimex = this.config.getMatchedUnitTimex(sourceUnit);
        if (!getMatchedUnitTimex.matched) {
          return ret;
        }
        if (!recognizersText.StringUtility.isNullOrEmpty(matches[0].groups("other").value)) {
          getMatchedUnitTimex.timex = getMatchedUnitTimex.timex.replace("1", "2");
        }
        ret.timex = getMatchedUnitTimex.timex;
        ret.futureValue = ret.pastValue = "Set: " + ret.timex;
        ret.success = true;
        return ret;
      }
    }
    return ret;
  }
  parserTimeEveryday(text, refDate) {
    let ret = new DateTimeResolutionResult();
    let ers = this.config.timeExtractor.extract(text, refDate);
    if (ers.length !== 1) {
      return ret;
    }
    let afterStr = text.replace(ers[0].text, "");
    let matches = recognizersText.RegExpUtility.getMatches(this.config.eachDayRegex, afterStr);
    if (matches.length) {
      let pr = this.config.timeParser.parse(ers[0], /* @__PURE__ */ new Date());
      ret.timex = pr.timexStr;
      ret.futureValue = ret.pastValue = "Set: " + ret.timex;
      ret.success = true;
      return ret;
    }
    return ret;
  }
  parseEach(extractor, parser, text, refDate) {
    let ret = new DateTimeResolutionResult();
    let success = false;
    let er;
    let match = recognizersText.RegExpUtility.getMatches(this.config.setEachRegex, text).pop();
    if (match) {
      let trimmedText = text.substr(0, match.index) + text.substr(match.index + match.length);
      er = extractor.extract(trimmedText, refDate);
      if (er.length === 1 && er[0].length === trimmedText.length) {
        success = true;
      }
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.setWeekDayRegex, text).pop();
    if (match) {
      let trimmedText = text.substr(0, match.index) + match.groups("weekday").value + text.substr(match.index + match.length);
      er = extractor.extract(trimmedText, refDate);
      if (er.length === 1 && er[0].length === trimmedText.length) {
        success = true;
      }
    }
    if (success) {
      let pr = parser.parse(er[0]);
      ret.timex = pr.timexStr;
      ret.futureValue = `Set: ${pr.timexStr}`;
      ret.pastValue = `Set: ${pr.timexStr}`;
      ret.success = true;
      return ret;
    }
    return ret;
  }
};
_BaseSetParser.ParserName = Constants.SYS_DATETIME_SET;
var BaseSetParser = _BaseSetParser;
var BaseHolidayExtractor = class {
  constructor(config) {
    this.extractorName = Constants.SYS_DATETIME_DATE;
    this.config = config;
  }
  extract(source, refDate) {
    let tokens = new Array().concat(this.holidayMatch(source));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  holidayMatch(source) {
    let ret = [];
    this.config.holidayRegexes.forEach((regex) => {
      recognizersText.RegExpUtility.getMatches(regex, source).forEach((match) => {
        ret.push(new Token(match.index, match.index + match.length));
      });
    });
    return ret;
  }
};
var _BaseHolidayParser = class _BaseHolidayParser {
  constructor(config) {
    this.config = config;
  }
  parse(er, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === _BaseHolidayParser.ParserName) {
      let innerResult = this.parseHolidayRegexMatch(er.text, referenceDate);
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.pastValue);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value;
    ret.timexStr = value === null ? "" : value.timex;
    ret.resolutionStr = "";
    return ret;
  }
  parseHolidayRegexMatch(text, referenceDate) {
    let trimmedText = text.trim();
    for (let regex of this.config.holidayRegexList) {
      let offset = 0;
      let matches = recognizersText.RegExpUtility.getMatches(regex, trimmedText);
      if (matches.length && matches[0].index === offset && matches[0].length === trimmedText.length) {
        let ret = this.match2Date(matches[0], referenceDate);
        return ret;
      }
    }
    return new DateTimeResolutionResult();
  }
  match2Date(match, referenceDate) {
    let ret = new DateTimeResolutionResult();
    let holidayStr = this.config.sanitizeHolidayToken(match.groups("holiday").value.toLowerCase());
    let yearStr = match.groups("year").value.toLowerCase();
    let orderStr = match.groups("order").value.toLowerCase();
    let year;
    let hasYear = false;
    if (yearStr) {
      year = parseInt(yearStr, 10);
      hasYear = true;
    } else if (orderStr) {
      let swift = this.config.getSwiftYear(orderStr);
      if (swift < -1) {
        return ret;
      }
      year = referenceDate.getFullYear() + swift;
      hasYear = true;
    } else {
      year = referenceDate.getFullYear();
    }
    let holidayKey;
    for (holidayKey of this.config.holidayNames.keys()) {
      if (this.config.holidayNames.get(holidayKey).indexOf(holidayStr) > -1) {
        break;
      }
    }
    if (holidayKey) {
      let timexStr;
      let value = referenceDate;
      let func = this.config.holidayFuncDictionary.get(holidayKey);
      if (func) {
        value = func(year);
        timexStr = this.config.variableHolidaysTimexDictionary.get(holidayKey);
        if (!timexStr) {
          timexStr = `-${FormatUtil.toString(value.getMonth() + 1, 2)}-${FormatUtil.toString(value.getDate(), 2)}`;
        }
      } else {
        return ret;
      }
      if (value.getTime() === DateUtils.minValue().getTime()) {
        ret.timex = "";
        ret.futureValue = DateUtils.minValue();
        ret.pastValue = DateUtils.minValue();
        ret.success = true;
        return ret;
      }
      if (hasYear) {
        ret.timex = FormatUtil.toString(year, 4) + timexStr;
        ret.futureValue = ret.pastValue = new Date(year, value.getMonth(), value.getDate());
        ret.success = true;
        return ret;
      }
      ret.timex = "XXXX" + timexStr;
      ret.futureValue = this.getFutureValue(value, referenceDate, holidayKey);
      ret.pastValue = this.getPastValue(value, referenceDate, holidayKey);
      ret.success = true;
      return ret;
    }
    return ret;
  }
  getFutureValue(value, referenceDate, holiday) {
    if (value < referenceDate) {
      let func = this.config.holidayFuncDictionary.get(holiday);
      if (func) {
        return func(value.getFullYear() + 1);
      }
    }
    return value;
  }
  getPastValue(value, referenceDate, holiday) {
    if (value >= referenceDate) {
      let func = this.config.holidayFuncDictionary.get(holiday);
      if (func) {
        return func(value.getFullYear() - 1);
      }
    }
    return value;
  }
};
_BaseHolidayParser.ParserName = Constants.SYS_DATETIME_DATE;
var BaseHolidayParser = _BaseHolidayParser;
var BaseHolidayParserConfiguration = class _BaseHolidayParserConfiguration {
  constructor() {
    this.variableHolidaysTimexDictionary = exports.BaseDateTime.VariableHolidaysTimexDictionary;
    this.holidayFuncDictionary = this.initHolidayFuncs();
  }
  // TODO auto-generate from YAML
  initHolidayFuncs() {
    return /* @__PURE__ */ new Map(
      [
        ["fathers", _BaseHolidayParserConfiguration.FathersDay],
        ["mothers", _BaseHolidayParserConfiguration.MothersDay],
        ["thanksgivingday", _BaseHolidayParserConfiguration.ThanksgivingDay],
        ["thanksgiving", _BaseHolidayParserConfiguration.ThanksgivingDay],
        ["martinlutherking", _BaseHolidayParserConfiguration.MartinLutherKingDay],
        ["washingtonsbirthday", _BaseHolidayParserConfiguration.WashingtonsBirthday],
        ["canberra", _BaseHolidayParserConfiguration.CanberraDay],
        ["labour", _BaseHolidayParserConfiguration.LabourDay],
        ["columbus", _BaseHolidayParserConfiguration.ColumbusDay],
        ["memorial", _BaseHolidayParserConfiguration.MemorialDay]
      ]
    );
  }
  // All months are zero-based (-1)
  // TODO auto-generate from YAML
  static MothersDay(year) {
    return new Date(year, 5 - 1, _BaseHolidayParserConfiguration.getDay(year, 5 - 1, 1, 0 /* Sunday */));
  }
  static FathersDay(year) {
    return new Date(year, 6 - 1, _BaseHolidayParserConfiguration.getDay(year, 6 - 1, 2, 0 /* Sunday */));
  }
  static MartinLutherKingDay(year) {
    return new Date(year, 1 - 1, _BaseHolidayParserConfiguration.getDay(year, 1 - 1, 2, 1 /* Monday */));
  }
  static WashingtonsBirthday(year) {
    return new Date(year, 2 - 1, _BaseHolidayParserConfiguration.getDay(year, 2 - 1, 2, 1 /* Monday */));
  }
  static CanberraDay(year) {
    return new Date(year, 3 - 1, _BaseHolidayParserConfiguration.getDay(year, 3 - 1, 0, 1 /* Monday */));
  }
  static MemorialDay(year) {
    return new Date(year, 5 - 1, _BaseHolidayParserConfiguration.getLastDay(year, 5 - 1, 1 /* Monday */));
  }
  static LabourDay(year) {
    return new Date(year, 9 - 1, _BaseHolidayParserConfiguration.getDay(year, 9 - 1, 0, 1 /* Monday */));
  }
  static ColumbusDay(year) {
    return new Date(year, 10 - 1, _BaseHolidayParserConfiguration.getDay(year, 10 - 1, 1, 1 /* Monday */));
  }
  static ThanksgivingDay(year) {
    return new Date(year, 11 - 1, _BaseHolidayParserConfiguration.getDay(year, 11 - 1, 3, 4 /* Thursday */));
  }
  static getDay(year, month, week, dayOfWeek) {
    let days = Array.apply(null, new Array(new Date(year, month, 0).getDate())).map(function(x, i) {
      return i + 1;
    });
    days = days.filter(function(day) {
      return new Date(year, month, day).getDay() === dayOfWeek;
    });
    return days[week];
  }
  static getLastDay(year, month, dayOfWeek) {
    let days = Array.apply(null, new Array(new Date(year, month, 0).getDate())).map(function(x, i) {
      return i + 1;
    });
    days = days.filter(function(day) {
      return new Date(year, month, day).getDay() === dayOfWeek;
    });
    return days[days.length - 1];
  }
};
var EnglishSetExtractorConfiguration = class {
  constructor() {
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.dateExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new EnglishDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new EnglishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new EnglishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new EnglishDateTimePeriodExtractorConfiguration());
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SetLastRegex);
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachPrefixRegex);
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodicRegex);
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachUnitRegex);
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachDayRegex);
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SetWeekDayRegex);
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SetEachRegex);
    this.beforeEachDayRegex = null;
  }
};
var EnglishSetParserConfiguration = class {
  constructor(config) {
    this.durationExtractor = config.durationExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateExtractor = config.dateExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.datePeriodExtractor = config.datePeriodExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.dateTimePeriodExtractor = config.dateTimePeriodExtractor;
    this.durationParser = config.durationParser;
    this.timeParser = config.timeParser;
    this.dateParser = config.dateParser;
    this.dateTimeParser = config.dateTimeParser;
    this.datePeriodParser = config.datePeriodParser;
    this.timePeriodParser = config.timePeriodParser;
    this.dateTimePeriodParser = config.dateTimePeriodParser;
    this.unitMap = config.unitMap;
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachPrefixRegex);
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PeriodicRegex);
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachUnitRegex);
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.EachDayRegex);
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SetWeekDayRegex);
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SetEachRegex);
  }
  getMatchedDailyTimex(text) {
    let timex = "";
    let trimmedText = text.trim().toLowerCase();
    if (trimmedText === "daily") {
      timex = "P1D";
    } else if (trimmedText === "weekly") {
      timex = "P1W";
    } else if (trimmedText === "biweekly") {
      timex = "P2W";
    } else if (trimmedText === "monthly") {
      timex = "P1M";
    } else if (trimmedText === "yearly" || trimmedText === "annually" || trimmedText === "annual") {
      timex = "P1Y";
    } else {
      timex = null;
      return { matched: false, timex };
    }
    return { matched: true, timex };
  }
  getMatchedUnitTimex(text) {
    let timex = "";
    let trimmedText = text.trim().toLowerCase();
    if (trimmedText === "day") {
      timex = "P1D";
    } else if (trimmedText === "week") {
      timex = "P1W";
    } else if (trimmedText === "month") {
      timex = "P1M";
    } else if (trimmedText === "year") {
      timex = "P1Y";
    } else {
      timex = null;
      return { matched: false, timex };
    }
    return { matched: true, timex };
  }
};
var EnglishHolidayExtractorConfiguration = class {
  constructor() {
    this.holidayRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex3, "gis")
    ];
  }
};
var EnglishHolidayParserConfiguration = class _EnglishHolidayParserConfiguration extends BaseHolidayParserConfiguration {
  constructor() {
    super();
    this.holidayRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.HolidayRegex3, "gis")
    ];
    this.holidayNames = exports.EnglishDateTime.HolidayNames;
    this.holidayFuncDictionary = this.initHolidayFuncs();
  }
  initHolidayFuncs() {
    return new Map(
      [
        ...super.initHolidayFuncs(),
        ["maosbirthday", _EnglishHolidayParserConfiguration.MaoBirthday],
        ["yuandan", _EnglishHolidayParserConfiguration.NewYear],
        ["teachersday", _EnglishHolidayParserConfiguration.TeacherDay],
        ["singleday", _EnglishHolidayParserConfiguration.SinglesDay],
        ["allsaintsday", _EnglishHolidayParserConfiguration.HalloweenDay],
        ["youthday", _EnglishHolidayParserConfiguration.YouthDay],
        ["childrenday", _EnglishHolidayParserConfiguration.ChildrenDay],
        ["femaleday", _EnglishHolidayParserConfiguration.FemaleDay],
        ["treeplantingday", _EnglishHolidayParserConfiguration.TreePlantDay],
        ["arborday", _EnglishHolidayParserConfiguration.TreePlantDay],
        ["girlsday", _EnglishHolidayParserConfiguration.GirlsDay],
        ["whiteloverday", _EnglishHolidayParserConfiguration.WhiteLoverDay],
        ["loverday", _EnglishHolidayParserConfiguration.ValentinesDay],
        ["christmas", _EnglishHolidayParserConfiguration.ChristmasDay],
        ["xmas", _EnglishHolidayParserConfiguration.ChristmasDay],
        ["newyear", _EnglishHolidayParserConfiguration.NewYear],
        ["newyearday", _EnglishHolidayParserConfiguration.NewYear],
        ["newyearsday", _EnglishHolidayParserConfiguration.NewYear],
        ["inaugurationday", _EnglishHolidayParserConfiguration.InaugurationDay],
        ["groundhougday", _EnglishHolidayParserConfiguration.GroundhogDay],
        ["valentinesday", _EnglishHolidayParserConfiguration.ValentinesDay],
        ["stpatrickday", _EnglishHolidayParserConfiguration.StPatrickDay],
        ["aprilfools", _EnglishHolidayParserConfiguration.FoolDay],
        ["stgeorgeday", _EnglishHolidayParserConfiguration.StGeorgeDay],
        ["mayday", _EnglishHolidayParserConfiguration.Mayday],
        ["cincodemayoday", _EnglishHolidayParserConfiguration.CincoDeMayoday],
        ["baptisteday", _EnglishHolidayParserConfiguration.BaptisteDay],
        ["usindependenceday", _EnglishHolidayParserConfiguration.UsaIndependenceDay],
        ["independenceday", _EnglishHolidayParserConfiguration.UsaIndependenceDay],
        ["bastilleday", _EnglishHolidayParserConfiguration.BastilleDay],
        ["halloweenday", _EnglishHolidayParserConfiguration.HalloweenDay],
        ["allhallowday", _EnglishHolidayParserConfiguration.AllHallowDay],
        ["allsoulsday", _EnglishHolidayParserConfiguration.AllSoulsday],
        ["guyfawkesday", _EnglishHolidayParserConfiguration.GuyFawkesDay],
        ["veteransday", _EnglishHolidayParserConfiguration.Veteransday],
        ["christmaseve", _EnglishHolidayParserConfiguration.ChristmasEve],
        ["newyeareve", _EnglishHolidayParserConfiguration.NewYearEve],
        ["easterday", _EnglishHolidayParserConfiguration.EasterDay]
      ]
    );
  }
  // All JavaScript dates are zero-based (-1)
  static NewYear(year) {
    return new Date(year, 1 - 1, 1);
  }
  static NewYearEve(year) {
    return new Date(year, 12 - 1, 31);
  }
  static ChristmasDay(year) {
    return new Date(year, 12 - 1, 25);
  }
  static ChristmasEve(year) {
    return new Date(year, 12 - 1, 24);
  }
  static ValentinesDay(year) {
    return new Date(year, 2 - 1, 14);
  }
  static WhiteLoverDay(year) {
    return new Date(year, 3 - 1, 14);
  }
  static FoolDay(year) {
    return new Date(year, 4 - 1, 1);
  }
  static GirlsDay(year) {
    return new Date(year, 3 - 1, 7);
  }
  static TreePlantDay(year) {
    return new Date(year, 3 - 1, 12);
  }
  static FemaleDay(year) {
    return new Date(year, 3 - 1, 8);
  }
  static ChildrenDay(year) {
    return new Date(year, 6 - 1, 1);
  }
  static YouthDay(year) {
    return new Date(year, 5 - 1, 4);
  }
  static TeacherDay(year) {
    return new Date(year, 9 - 1, 10);
  }
  static SinglesDay(year) {
    return new Date(year, 11 - 1, 11);
  }
  static MaoBirthday(year) {
    return new Date(year, 12 - 1, 26);
  }
  static InaugurationDay(year) {
    return new Date(year, 1 - 1, 20);
  }
  static GroundhogDay(year) {
    return new Date(year, 2 - 1, 2);
  }
  static StPatrickDay(year) {
    return new Date(year, 3 - 1, 17);
  }
  static StGeorgeDay(year) {
    return new Date(year, 4 - 1, 23);
  }
  static Mayday(year) {
    return new Date(year, 5 - 1, 1);
  }
  static CincoDeMayoday(year) {
    return new Date(year, 5 - 1, 5);
  }
  static BaptisteDay(year) {
    return new Date(year, 6 - 1, 24);
  }
  static UsaIndependenceDay(year) {
    return new Date(year, 7 - 1, 4);
  }
  static BastilleDay(year) {
    return new Date(year, 7 - 1, 14);
  }
  static HalloweenDay(year) {
    return new Date(year, 10 - 1, 31);
  }
  static AllHallowDay(year) {
    return new Date(year, 11 - 1, 1);
  }
  static AllSoulsday(year) {
    return new Date(year, 11 - 1, 2);
  }
  static GuyFawkesDay(year) {
    return new Date(year, 11 - 1, 5);
  }
  static Veteransday(year) {
    return new Date(year, 11 - 1, 11);
  }
  static EasterDay(year) {
    return DateUtils.minValue();
  }
  getSwiftYear(text) {
    let trimmedText = text.trim().toLowerCase();
    let swift = -10;
    if (trimmedText.startsWith("next")) {
      swift = 1;
    } else if (trimmedText.startsWith("last")) {
      swift = -1;
    } else if (trimmedText.startsWith("this")) {
      swift = 0;
    }
    return swift;
  }
  sanitizeHolidayToken(holiday) {
    return holiday.replace(/[ ']/g, "");
  }
};

// recognizers/recognizers-date-time/src/dateTime/english/mergedConfiguration.ts
var EnglishMergedExtractorConfiguration = class {
  constructor() {
    this.dateExtractor = new BaseDateExtractor(new EnglishDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new EnglishTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new EnglishDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new EnglishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new EnglishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new EnglishDateTimePeriodExtractorConfiguration());
    this.holidayExtractor = new BaseHolidayExtractor(new EnglishHolidayExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new EnglishDurationExtractorConfiguration());
    this.setExtractor = new BaseSetExtractor(new EnglishSetExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SinceRegex);
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.BeforeRegex);
    this.fromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.FromToRegex);
    this.singleAmbiguousMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SingleAmbiguousMonthRegex);
    this.prepositionSuffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.PrepositionSuffixRegex);
    this.numberEndingPattern = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.NumberEndingPattern);
    this.filterWordRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.OneOnOneRegex)
    ];
  }
};
var EnglishMergedParserConfiguration = class {
  constructor(config) {
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.BeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.EnglishDateTime.SinceRegex);
    this.holidayParser = new BaseHolidayParser(new EnglishHolidayParserConfiguration());
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.dateTimeParser = config.dateTimeParser;
    this.datePeriodParser = config.datePeriodParser;
    this.timePeriodParser = config.timePeriodParser;
    this.dateTimePeriodParser = config.dateTimePeriodParser;
    this.durationParser = config.durationParser;
    this.setParser = new BaseSetParser(new EnglishSetParserConfiguration(config));
  }
};

// recognizers/recognizers-date-time/src/resources/spanishDateTime.ts
exports.SpanishDateTime = void 0;
((SpanishDateTime2) => {
  SpanishDateTime2.TillRegex = `(?<till>hasta|al|a|--|-|\u2014|\u2014\u2014)(\\s+(el|la(s)?))?`;
  SpanishDateTime2.AndRegex = `(?<and>y|y\\s*el|--|-|\u2014|\u2014\u2014)`;
  SpanishDateTime2.DayRegex = `(?<day>01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|1|20|21|22|23|24|25|26|27|28|29|2|30|31|3|4|5|6|7|8|9)(?=\\b|t)`;
  SpanishDateTime2.MonthNumRegex = `(?<month>01|02|03|04|05|06|07|08|09|10|11|12|1|2|3|4|5|6|7|8|9)\\b`;
  SpanishDateTime2.DescRegex = `(?<desc>pm\\b|am\\b|p\\.m\\.|a\\.m\\.)`;
  SpanishDateTime2.AmDescRegex = `(am\\b|a\\.m\\.|a m\\b|a\\. m\\.\\b|a\\.m\\b|a\\. m\\b)`;
  SpanishDateTime2.PmDescRegex = `(pm\\b|p\\.m\\.|p\\b|p m\\b|p\\. m\\.\\b|p\\.m\\b|p\\. m\\b)`;
  SpanishDateTime2.AmPmDescRegex = `(ampm)`;
  SpanishDateTime2.TwoDigitYearRegex = `\\b(?<![$])(?<year>([0-27-9]\\d))(?!(\\s*((\\:)|${SpanishDateTime2.AmDescRegex}|${SpanishDateTime2.PmDescRegex}|\\.\\d)))\\b`;
  SpanishDateTime2.FullTextYearRegex = `^[\\*]`;
  SpanishDateTime2.YearRegex = `(${exports.BaseDateTime.FourDigitYearRegex}|${SpanishDateTime2.FullTextYearRegex})`;
  SpanishDateTime2.RelativeMonthRegex = `(?<relmonth>(este|pr[o\xF3]ximo|[u\xFA]ltimo)\\s+mes)\\b`;
  SpanishDateTime2.MonthRegex = `(?<month>Abril|Abr|Agosto|Ago|Diciembre|Dic|Febrero|Feb|Enero|Ene|Julio|Jul|Junio|Jun|Marzo|Mar|Mayo|May|Noviembre|Nov|Octubre|Oct|Septiembre|Setiembre|Sept|Set)`;
  SpanishDateTime2.MonthSuffixRegex = `(?<msuf>(en\\s+|del\\s+|de\\s+)?(${SpanishDateTime2.RelativeMonthRegex}|${SpanishDateTime2.MonthRegex}))`;
  SpanishDateTime2.DateUnitRegex = `(?<unit>a\xF1os|a\xF1o|meses|mes|semanas|semana|d[i\xED]a(s)?)\\b`;
  SpanishDateTime2.PastRegex = `(?<past>\\b(pasad(a|o)(s)?|[u\xFA]ltim[oa](s)?|anterior(es)?|previo(s)?)\\b)`;
  SpanishDateTime2.FutureRegex = `(?<past>\\b(siguiente(s)?|pr[o\xF3]xim[oa](s)?|dentro\\s+de|en)\\b)`;
  SpanishDateTime2.SimpleCasesRegex = `\\b((desde\\s+el|desde|del)\\s+)?(${SpanishDateTime2.DayRegex})\\s*${SpanishDateTime2.TillRegex}\\s*(${SpanishDateTime2.DayRegex})\\s+${SpanishDateTime2.MonthSuffixRegex}((\\s+|\\s*,\\s*)${SpanishDateTime2.YearRegex})?\\b`;
  SpanishDateTime2.MonthFrontSimpleCasesRegex = `\\b${SpanishDateTime2.MonthSuffixRegex}\\s+((desde\\s+el|desde|del)\\s+)?(${SpanishDateTime2.DayRegex})\\s*${SpanishDateTime2.TillRegex}\\s*(${SpanishDateTime2.DayRegex})((\\s+|\\s*,\\s*)${SpanishDateTime2.YearRegex})?\\b`;
  SpanishDateTime2.MonthFrontBetweenRegex = `\\b${SpanishDateTime2.MonthSuffixRegex}\\s+((entre|entre\\s+el)\\s+)(${SpanishDateTime2.DayRegex})\\s*${SpanishDateTime2.AndRegex}\\s*(${SpanishDateTime2.DayRegex})((\\s+|\\s*,\\s*)${SpanishDateTime2.YearRegex})?\\b`;
  SpanishDateTime2.DayBetweenRegex = `\\b((entre|entre\\s+el)\\s+)(${SpanishDateTime2.DayRegex})\\s*${SpanishDateTime2.AndRegex}\\s*(${SpanishDateTime2.DayRegex})\\s+${SpanishDateTime2.MonthSuffixRegex}((\\s+|\\s*,\\s*)${SpanishDateTime2.YearRegex})?\\b`;
  SpanishDateTime2.OneWordPeriodRegex = `\\b(((pr[o\xF3]xim[oa]?|est[ea]|[u\xFA]ltim[oa]?|en)\\s+)?(?<month>Abril|Abr|Agosto|Ago|Diciembre|Dic|Enero|Ene|Febrero|Feb|Julio|Jul|Junio|Jun|Marzo|Mar|Mayo|May|Noviembre|Nov|Octubre|Oct|Septiembre|Setiembre|Sept|Set)|(?<=\\b(del|de la|el|la)\\s+)?(pr[o\xF3]xim[oa](s)?|[u\xFA]ltim[oa]?|est(e|a))\\s+(fin de semana|semana|mes|a\xF1o)|fin de semana|(mes|a\xF1os)? a la fecha)\\b`;
  SpanishDateTime2.MonthWithYearRegex = `\\b(((pr[o\xF3]xim[oa](s)?|este|esta|[u\xFA]ltim[oa]?|en)\\s+)?(?<month>Abril|Abr|Agosto|Ago|Diciembre|Dic|Enero|Ene|Febrero|Feb|Julio|Jul|Junio|Jun|Marzo|Mar|Mayo|May|Noviembre|Nov|Octubre|Oct|Septiembre|Setiembre|Sept|Set)\\s+((de|del|de la)\\s+)?(${SpanishDateTime2.YearRegex}|(?<order>pr[o\xF3]ximo(s)?|[u\xFA]ltimo?|este)\\s+a\xF1o))\\b`;
  SpanishDateTime2.MonthNumWithYearRegex = `(${SpanishDateTime2.YearRegex}(\\s*?)[/\\-\\.](\\s*?)${SpanishDateTime2.MonthNumRegex})|(${SpanishDateTime2.MonthNumRegex}(\\s*?)[/\\-](\\s*?)${SpanishDateTime2.YearRegex})`;
  SpanishDateTime2.WeekOfMonthRegex = `(?<wom>(la\\s+)?(?<cardinal>primera?|1ra|segunda|2da|tercera?|3ra|cuarta|4ta|quinta|5ta|[u\xFA]ltima)\\s+semana\\s+${SpanishDateTime2.MonthSuffixRegex})`;
  SpanishDateTime2.WeekOfYearRegex = `(?<woy>(la\\s+)?(?<cardinal>primera?|1ra|segunda|2da|tercera?|3ra|cuarta|4ta|quinta|5ta|[u\xFA]ltima?)\\s+semana(\\s+del?)?\\s+(${SpanishDateTime2.YearRegex}|(?<order>pr[o\xF3]ximo|[u\xFA]ltimo|este)\\s+a\xF1o))`;
  SpanishDateTime2.FollowedDateUnit = `^\\s*${SpanishDateTime2.DateUnitRegex}`;
  SpanishDateTime2.NumberCombinedWithDateUnit = `\\b(?<num>\\d+(\\.\\d*)?)${SpanishDateTime2.DateUnitRegex}`;
  SpanishDateTime2.QuarterRegex = `(el\\s+)?(?<cardinal>primer|1er|segundo|2do|tercer|3ro|cuarto|4to)\\s+cuatrimestre(\\s+de|\\s*,\\s*)?\\s+(${SpanishDateTime2.YearRegex}|(?<order>pr[o\xF3]ximo(s)?|[u\xFA]ltimo?|este)\\s+a\xF1o)`;
  SpanishDateTime2.QuarterRegexYearFront = `(${SpanishDateTime2.YearRegex}|(?<order>pr[o\xF3]ximo(s)?|[u\xFA]ltimo?|este)\\s+a\xF1o)\\s+(el\\s+)?(?<cardinal>(primer|primero)|1er|segundo|2do|(tercer|terceo)|3ro|cuarto|4to)\\s+cuatrimestre`;
  SpanishDateTime2.AllHalfYearRegex = `^[.]`;
  SpanishDateTime2.PrefixDayRegex = `^[.]`;
  SpanishDateTime2.CenturySuffixRegex = `^[.]`;
  SpanishDateTime2.SeasonRegex = `\\b(?<season>(([u\xFA]ltim[oa]|est[ea]|el|la|(pr[o\xF3]xim[oa]s?|siguiente))\\s+)?(?<seas>primavera|verano|oto\xF1o|invierno)((\\s+del?|\\s*,\\s*)?\\s+(${SpanishDateTime2.YearRegex}|(?<order>pr[o\xF3]ximo|[u\xFA]ltimo|este)\\s+a\xF1o))?)\\b`;
  SpanishDateTime2.WhichWeekRegex = `(semana)(\\s*)(?<number>\\d\\d|\\d|0\\d)`;
  SpanishDateTime2.WeekOfRegex = `(semana)(\\s*)((do|da|de))`;
  SpanishDateTime2.MonthOfRegex = `(mes)(\\s*)((do|da|de))`;
  SpanishDateTime2.RangeUnitRegex = `\\b(?<unit>a\xF1os|a\xF1o|meses|mes|semanas|semana)\\b`;
  SpanishDateTime2.InConnectorRegex = `\\b(in)\\b`;
  SpanishDateTime2.WithinNextPrefixRegex = `^[.]`;
  SpanishDateTime2.FromRegex = `((desde|de)(\\s*la(s)?)?)$`;
  SpanishDateTime2.ConnectorAndRegex = `(y\\s*(la(s)?)?)$`;
  SpanishDateTime2.BetweenRegex = `(entre\\s*(la(s)?)?)`;
  SpanishDateTime2.WeekDayRegex = `\\b(?<weekday>Domingos?|Lunes|Martes|Mi[e\xE9]rcoles|Jueves|Viernes|S[a\xE1]bados?|Lu|Ma|Mi|Ju|Vi|Sa|Do)\\b`;
  SpanishDateTime2.OnRegex = `(?<=\\ben\\s+)(${SpanishDateTime2.DayRegex}s?)\\b`;
  SpanishDateTime2.RelaxedOnRegex = `(?<=\\b(en|el|del)\\s+)((?<day>10|11|12|13|14|15|16|17|18|19|1st|20|21|22|23|24|25|26|27|28|29|2|30|31|3|4|5|6|7|8|9)s?)\\b`;
  SpanishDateTime2.ThisRegex = `\\b((este\\s*)${SpanishDateTime2.WeekDayRegex})|(${SpanishDateTime2.WeekDayRegex}\\s*((de\\s+)?esta\\s+semana))\\b`;
  SpanishDateTime2.LastDateRegex = `\\b(([u\xFA]ltimo)\\s*${SpanishDateTime2.WeekDayRegex})|(${SpanishDateTime2.WeekDayRegex}(\\s+((de\\s+)?(esta|la)\\s+([u\xFA]ltima\\s+)?semana)))\\b`;
  SpanishDateTime2.NextDateRegex = `\\b(((pr[o\xF3]ximo|siguiente)\\s*)${SpanishDateTime2.WeekDayRegex})|(${SpanishDateTime2.WeekDayRegex}(\\s+(de\\s+)?(la\\s+)?(pr[o\xF3]xima|siguiente)(\\s*semana)))\\b`;
  SpanishDateTime2.SpecialDayRegex = `\\b((el\\s+)?(d[i\xED]a\\s+antes\\s+de\\s+ayer|anteayer)|((el\\s+)?d[i\xED]a\\s+(despu[e\xE9]s\\s+)?de\\s+ma\xF1ana|pasado\\s+ma\xF1ana)|(el\\s)?d[i\xED]a siguiente|(el\\s)?pr[o\xF3]ximo\\s+d[i\xED]a|(el\\s+)?[u\xFA]ltimo d[i\xED]a|(d)?el d[i\xED]a|ayer|ma\xF1ana|hoy)\\b`;
  SpanishDateTime2.SpecialDayWithNumRegex = `^[.]`;
  SpanishDateTime2.ForTheRegex = `^[.]`;
  SpanishDateTime2.WeekDayAndDayOfMonthRegex = `^[.]`;
  SpanishDateTime2.WeekDayOfMonthRegex = `(?<wom>(el\\s+)?(?<cardinal>primer|1er|segundo|2do|tercer|3er|cuarto|4to|quinto|5to|[u\xFA]ltimo)\\s+${SpanishDateTime2.WeekDayRegex}\\s+${SpanishDateTime2.MonthSuffixRegex})`;
  SpanishDateTime2.RelativeWeekDayRegex = `^[.]`;
  SpanishDateTime2.NumberEndingPattern = `^[.]`;
  SpanishDateTime2.SpecialDateRegex = `(?<=\\b(en)\\s+el\\s+)${SpanishDateTime2.DayRegex}\\b`;
  SpanishDateTime2.OfMonthRegex = `^\\s*de\\s*${SpanishDateTime2.MonthSuffixRegex}`;
  SpanishDateTime2.MonthEndRegex = `(${SpanishDateTime2.MonthRegex}\\s*(el)?\\s*$)`;
  SpanishDateTime2.WeekDayEnd = `${SpanishDateTime2.WeekDayRegex}\\s*,?\\s*$`;
  SpanishDateTime2.DateYearRegex = `(?<year>${SpanishDateTime2.YearRegex}|${SpanishDateTime2.TwoDigitYearRegex})`;
  SpanishDateTime2.DateExtractor1 = `\\b(${SpanishDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${SpanishDateTime2.DayRegex}?((\\s*(de)|[/\\\\\\.\\-])\\s*)?${SpanishDateTime2.MonthRegex}\\b`;
  SpanishDateTime2.DateExtractor2 = `\\b(${SpanishDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${SpanishDateTime2.DayRegex}\\s*([\\.\\-]|de)\\s*${SpanishDateTime2.MonthRegex}(\\s*,\\s*|\\s*(del?)\\s*)${SpanishDateTime2.DateYearRegex}\\b`;
  SpanishDateTime2.DateExtractor3 = `\\b(${SpanishDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${SpanishDateTime2.DayRegex}(\\s+|\\s*,\\s*|\\s+de\\s+|\\s*-\\s*)${SpanishDateTime2.MonthRegex}((\\s+|\\s*,\\s*)${SpanishDateTime2.DateYearRegex})?\\b`;
  SpanishDateTime2.DateExtractor4 = `\\b${SpanishDateTime2.MonthNumRegex}\\s*[/\\\\\\-]\\s*${SpanishDateTime2.DayRegex}\\s*[/\\\\\\-]\\s*${SpanishDateTime2.DateYearRegex}`;
  SpanishDateTime2.DateExtractor5 = `\\b${SpanishDateTime2.DayRegex}\\s*[/\\\\\\-\\.]\\s*${SpanishDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${SpanishDateTime2.DateYearRegex}`;
  SpanishDateTime2.DateExtractor6 = `(?<=\\b(en|el)\\s+)${SpanishDateTime2.MonthNumRegex}[\\-\\.]${SpanishDateTime2.DayRegex}\\b`;
  SpanishDateTime2.DateExtractor7 = `\\b${SpanishDateTime2.MonthNumRegex}\\s*/\\s*${SpanishDateTime2.DayRegex}((\\s+|\\s*,\\s*|\\s+de\\s+)${SpanishDateTime2.DateYearRegex})?\\b`;
  SpanishDateTime2.DateExtractor8 = `(?<=\\b(en|el)\\s+)${SpanishDateTime2.DayRegex}[\\\\\\-]${SpanishDateTime2.MonthNumRegex}\\b`;
  SpanishDateTime2.DateExtractor9 = `\\b${SpanishDateTime2.DayRegex}\\s*/\\s*${SpanishDateTime2.MonthNumRegex}((\\s+|\\s*,\\s*|\\s+de\\s+)${SpanishDateTime2.DateYearRegex})?\\b`;
  SpanishDateTime2.DateExtractor10 = `\\b${SpanishDateTime2.YearRegex}\\s*[/\\\\\\-\\.]\\s*${SpanishDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${SpanishDateTime2.DayRegex}`;
  SpanishDateTime2.HourNumRegex = `\\b(?<hournum>cero|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\\b`;
  SpanishDateTime2.MinuteNumRegex = `(?<minnum>un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte|treinta|cuarenta|cincuenta)`;
  SpanishDateTime2.DeltaMinuteNumRegex = `(?<deltaminnum>un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte|treinta|cuarenta|cincuenta)`;
  SpanishDateTime2.OclockRegex = `(?<oclock>en\\s+punto)`;
  SpanishDateTime2.PmRegex = `(?<pm>((por|de|a|en)\\s+la)\\s+(tarde|noche))`;
  SpanishDateTime2.AmRegex = `(?<am>((por|de|a|en)\\s+la)\\s+(ma\xF1ana|madrugada))`;
  SpanishDateTime2.AmTimeRegex = `(?<am>(esta|(por|de|a|en)\\s+la)\\s+(ma\xF1ana|madrugada))`;
  SpanishDateTime2.PmTimeRegex = `(?<pm>(esta|(por|de|a|en)\\s+la)\\s+(tarde|noche))`;
  SpanishDateTime2.LessThanOneHour = `(?<lth>((\\s+y\\s+)?cuarto|(\\s*)menos cuarto|(\\s+y\\s+)media|${exports.BaseDateTime.DeltaMinuteRegex}(\\s+(minuto|minutos|min|mins))|${SpanishDateTime2.DeltaMinuteNumRegex}(\\s+(minuto|minutos|min|mins))))`;
  SpanishDateTime2.TensTimeRegex = `(?<tens>diez|veint(i|e)|treinta|cuarenta|cincuenta)`;
  SpanishDateTime2.WrittenTimeRegex = `(?<writtentime>${SpanishDateTime2.HourNumRegex}\\s*((y|menos)\\s+)?(${SpanishDateTime2.MinuteNumRegex}|(${SpanishDateTime2.TensTimeRegex}((\\s*y\\s+)?${SpanishDateTime2.MinuteNumRegex})?)))`;
  SpanishDateTime2.TimePrefix = `(?<prefix>${SpanishDateTime2.LessThanOneHour}(\\s+(pasad[ao]s)\\s+(de\\s+las|las)?|\\s+(para|antes\\s+de)?\\s+(las?))?)`;
  SpanishDateTime2.TimeSuffix = `(?<suffix>(${SpanishDateTime2.LessThanOneHour}\\s+)?(${SpanishDateTime2.AmRegex}|${SpanishDateTime2.PmRegex}|${SpanishDateTime2.OclockRegex}))`;
  SpanishDateTime2.BasicTime = `(?<basictime>${SpanishDateTime2.WrittenTimeRegex}|${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}:${exports.BaseDateTime.MinuteRegex}(:${exports.BaseDateTime.SecondRegex})?|${exports.BaseDateTime.HourRegex})`;
  SpanishDateTime2.AtRegex = `\\b(?<=\\b(a las?)\\s+)(${SpanishDateTime2.WrittenTimeRegex}|${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\b`;
  SpanishDateTime2.ConnectNumRegex = `(${exports.BaseDateTime.HourRegex}(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59)\\s*${SpanishDateTime2.DescRegex})`;
  SpanishDateTime2.TimeRegex1 = `(\\b${SpanishDateTime2.TimePrefix}\\s+)?(${SpanishDateTime2.WrittenTimeRegex}|${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*(${SpanishDateTime2.DescRegex})`;
  SpanishDateTime2.TimeRegex2 = `(\\b${SpanishDateTime2.TimePrefix}\\s+)?(T)?${exports.BaseDateTime.HourRegex}(\\s*)?:(\\s*)?${exports.BaseDateTime.MinuteRegex}((\\s*)?:(\\s*)?${exports.BaseDateTime.SecondRegex})?((\\s*${SpanishDateTime2.DescRegex})|\\b)`;
  SpanishDateTime2.TimeRegex3 = `(\\b${SpanishDateTime2.TimePrefix}\\s+)?${exports.BaseDateTime.HourRegex}\\.${exports.BaseDateTime.MinuteRegex}(\\s*${SpanishDateTime2.DescRegex})`;
  SpanishDateTime2.TimeRegex4 = `\\b((${SpanishDateTime2.DescRegex}?)|(${SpanishDateTime2.BasicTime}?)(${SpanishDateTime2.DescRegex}?))(${SpanishDateTime2.TimePrefix}\\s*)(${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})?(\\s+${SpanishDateTime2.TensTimeRegex}(\\s+y\\s+)?${SpanishDateTime2.MinuteNumRegex}?)?(${SpanishDateTime2.OclockRegex})?\\b`;
  SpanishDateTime2.TimeRegex5 = `\\b(${SpanishDateTime2.TimePrefix}|${SpanishDateTime2.BasicTime}${SpanishDateTime2.TimePrefix})\\s+(\\s*${SpanishDateTime2.DescRegex})?${SpanishDateTime2.BasicTime}?\\s*${SpanishDateTime2.TimeSuffix}\\b`;
  SpanishDateTime2.TimeRegex6 = `(${SpanishDateTime2.BasicTime}(\\s*${SpanishDateTime2.DescRegex})?\\s+${SpanishDateTime2.TimeSuffix}\\b)`;
  SpanishDateTime2.TimeRegex7 = `\\b${SpanishDateTime2.TimeSuffix}\\s+a\\s+las\\s+${SpanishDateTime2.BasicTime}((\\s*${SpanishDateTime2.DescRegex})|\\b)`;
  SpanishDateTime2.TimeRegex8 = `\\b${SpanishDateTime2.TimeSuffix}\\s+${SpanishDateTime2.BasicTime}((\\s*${SpanishDateTime2.DescRegex})|\\b)`;
  SpanishDateTime2.TimeRegex9 = `\\b(?<writtentime>${SpanishDateTime2.HourNumRegex}\\s+(${SpanishDateTime2.TensTimeRegex}\\s*)?(y\\s+)?${SpanishDateTime2.MinuteNumRegex}?)\\b`;
  SpanishDateTime2.TimeRegex10 = `(a\\s+la|al)\\s+(madrugada|ma\xF1ana|medio\\s*d[i\xED]a|tarde|noche)`;
  SpanishDateTime2.TimeRegex11 = `\\b(${SpanishDateTime2.WrittenTimeRegex})(${SpanishDateTime2.DescRegex}?)\\b`;
  SpanishDateTime2.TimeRegex12 = `(\\b${SpanishDateTime2.TimePrefix}\\s+)?${exports.BaseDateTime.HourRegex}(\\s*h\\s*)${exports.BaseDateTime.MinuteRegex}(\\s*${SpanishDateTime2.DescRegex})?`;
  SpanishDateTime2.PrepositionRegex = `(?<prep>(a(l)?|en|de(l)?)?(\\s*(la(s)?|el|los))?$)`;
  SpanishDateTime2.NowRegex = `\\b(?<now>(justo\\s+)?ahora(\\s+mismo)?|en\\s+este\\s+momento|tan\\s+pronto\\s+como\\s+sea\\s+posible|tan\\s+pronto\\s+como\\s+(pueda|puedas|podamos|puedan)|lo\\s+m[a\xE1]s\\s+pronto\\s+posible|recientemente|previamente)\\b`;
  SpanishDateTime2.SuffixRegex = `^\\s*(((y|a|en|por)\\s+la|al)\\s+)?(ma\xF1ana|madrugada|medio\\s*d[i\xED]a|tarde|noche)\\b`;
  SpanishDateTime2.TimeOfDayRegex = `\\b(?<timeOfDay>ma\xF1ana|madrugada|(pasado\\s+(el\\s+)?)?medio\\s?d[i\xED]a|tarde|noche|anoche)\\b`;
  SpanishDateTime2.SpecificTimeOfDayRegex = `\\b(((((a)?\\s+la|esta|siguiente|pr[o\xF3]xim[oa]|[u\xFA]ltim[oa])\\s+)?${SpanishDateTime2.TimeOfDayRegex}))\\b`;
  SpanishDateTime2.TimeOfTodayAfterRegex = `^\\s*(,\\s*)?(en|de(l)?\\s+)?${SpanishDateTime2.SpecificTimeOfDayRegex}`;
  SpanishDateTime2.TimeOfTodayBeforeRegex = `(${SpanishDateTime2.SpecificTimeOfDayRegex}(\\s*,)?(\\s+(a\\s+la(s)?|para))?\\s*)`;
  SpanishDateTime2.SimpleTimeOfTodayAfterRegex = `(${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*(,\\s*)?((en|de(l)?)?\\s+)?${SpanishDateTime2.SpecificTimeOfDayRegex}`;
  SpanishDateTime2.SimpleTimeOfTodayBeforeRegex = `(${SpanishDateTime2.SpecificTimeOfDayRegex}(\\s*,)?(\\s+(a\\s+la|para))?\\s*(${SpanishDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}))`;
  SpanishDateTime2.TheEndOfRegex = `((a|e)l\\s+)?fin(alizar|al)?(\\s+(el|de(l)?)(\\s+d[i\xED]a)?(\\s+de)?)?\\s*$`;
  SpanishDateTime2.UnitRegex = `(?<unit>a\xF1os|a\xF1o|meses|mes|semanas|semana|d[i\xED]as|d[i\xED]a|horas|hora|h|hr|hrs|hs|minutos|minuto|mins|min|segundos|segundo|segs|seg)\\b`;
  SpanishDateTime2.ConnectorRegex = `^(,|t|para la|para las|cerca de la|cerca de las)$`;
  SpanishDateTime2.TimeHourNumRegex = `(?<hour>veintiuno|veintidos|veintitres|veinticuatro|cero|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|diecis([e\xE9])is|diecisiete|dieciocho|diecinueve|veinte)`;
  SpanishDateTime2.PureNumFromTo = `((desde|de)\\s+(la(s)?\\s+)?)?(${exports.BaseDateTime.HourRegex}|${SpanishDateTime2.TimeHourNumRegex})(\\s*(?<leftDesc>${SpanishDateTime2.DescRegex}))?\\s*${SpanishDateTime2.TillRegex}\\s*(${exports.BaseDateTime.HourRegex}|${SpanishDateTime2.TimeHourNumRegex})\\s*(?<rightDesc>${SpanishDateTime2.PmRegex}|${SpanishDateTime2.AmRegex}|${SpanishDateTime2.DescRegex})?`;
  SpanishDateTime2.PureNumBetweenAnd = `(entre\\s+(la(s)?\\s+)?)(${exports.BaseDateTime.HourRegex}|${SpanishDateTime2.TimeHourNumRegex})(\\s*(?<leftDesc>${SpanishDateTime2.DescRegex}))?\\s*y\\s*(la(s)?\\s+)?(${exports.BaseDateTime.HourRegex}|${SpanishDateTime2.TimeHourNumRegex})\\s*(?<rightDesc>${SpanishDateTime2.PmRegex}|${SpanishDateTime2.AmRegex}|${SpanishDateTime2.DescRegex})?`;
  SpanishDateTime2.SpecificTimeFromTo = `^[.]`;
  SpanishDateTime2.SpecificTimeBetweenAnd = `^[.]`;
  SpanishDateTime2.TimeUnitRegex = `(?<unit>horas|hora|h|minutos|minuto|mins|min|segundos|segundo|secs|sec)\\b`;
  SpanishDateTime2.TimeFollowedUnit = `^\\s*${SpanishDateTime2.TimeUnitRegex}`;
  SpanishDateTime2.TimeNumberCombinedWithUnit = `\\b(?<num>\\d+(\\,\\d*)?)\\s*${SpanishDateTime2.TimeUnitRegex}`;
  SpanishDateTime2.DateTimePeriodNumberCombinedWithUnit = `\\b(?<num>\\d+(\\.\\d*)?)\\s*${SpanishDateTime2.TimeUnitRegex}`;
  SpanishDateTime2.PeriodTimeOfDayWithDateRegex = `\\b(((y|a|en|por)\\s+la|al)\\s+)?(?<timeOfDay>ma\xF1ana|madrugada|(pasado\\s+(el\\s+)?)?medio\\s?d[i\xED]a|tarde|noche|anoche)\\b`;
  SpanishDateTime2.RelativeTimeUnitRegex = `(${SpanishDateTime2.PastRegex}|${SpanishDateTime2.FutureRegex})\\s+${SpanishDateTime2.UnitRegex}`;
  SpanishDateTime2.LessThanRegex = `^[.]`;
  SpanishDateTime2.MoreThanRegex = `^[.]`;
  SpanishDateTime2.SuffixAndRegex = `(?<suffix>\\s*(y)\\s+((un|uno|una)\\s+)?(?<suffix_num>media|cuarto))`;
  SpanishDateTime2.FollowedUnit = `^\\s*${SpanishDateTime2.UnitRegex}`;
  SpanishDateTime2.DurationNumberCombinedWithUnit = `\\b(?<num>\\d+(\\,\\d*)?)${SpanishDateTime2.UnitRegex}`;
  SpanishDateTime2.AnUnitRegex = `\\b(un(a)?)\\s+${SpanishDateTime2.UnitRegex}`;
  SpanishDateTime2.DuringRegex = `^[.]`;
  SpanishDateTime2.AllRegex = `\\b(?<all>tod[oa]?\\s+(el|la)\\s+(?<unit>a\xF1o|mes|semana|d[i\xED]a))\\b`;
  SpanishDateTime2.HalfRegex = `\\b(?<half>medi[oa]\\s+(?<unit>ano|mes|semana|d[\xEDi]a|hora))\\b`;
  SpanishDateTime2.ConjunctionRegex = `^[.]`;
  SpanishDateTime2.InexactNumberRegex = `\\b(pocos|poco|algo|varios)\\b`;
  SpanishDateTime2.InexactNumberUnitRegex = `\\b(pocos|poco|algo|varios)\\s+${SpanishDateTime2.UnitRegex}`;
  SpanishDateTime2.HolidayRegex1 = `\\b(?<holiday>viernes santo|mi[e\xE9]rcoles de ceniza|martes de carnaval|d[i\xED]a (de|de los) presidentes?|clebraci[o\xF3]n de mao|a\xF1o nuevo chino|a\xF1o nuevo|noche vieja|(festividad de )?los mayos|d[i\xED]a de los inocentes|navidad|noche buena|d[i\xED]a de acci[o\xF3]n de gracias|acci[o\xF3]n de gracias|yuandan|halloween|noches de brujas|pascuas)(\\s+(del?\\s+)?(${SpanishDateTime2.YearRegex}|(?<order>(pr[o\xF3]xim[oa]?|est[ea]|[u\xFA]ltim[oa]?|en))\\s+a\xF1o))?\\b`;
  SpanishDateTime2.HolidayRegex2 = `\\b(?<holiday>(d[i\xED]a( del?( la)?)? )?(martin luther king|todos los santos|blanco|san patricio|san valent[i\xED]n|san jorge|cinco de mayo|independencia|raza|trabajador))(\\s+(del?\\s+)?(${SpanishDateTime2.YearRegex}|(?<order>(pr[o\xF3]xim[oa]?|est[ea]|[u\xFA]ltim[oa]?|en))\\s+a\xF1o))?\\b`;
  SpanishDateTime2.HolidayRegex3 = `\\b(?<holiday>(d[i\xED]a( del?( las?)?)? )(trabajador|madres?|padres?|[a\xE1]rbol|mujer(es)?|solteros?|ni\xF1os?|marmota|san valent[i\xED]n|maestro))(\\s+(del?\\s+)?(${SpanishDateTime2.YearRegex}|(?<order>(pr[o\xF3]xim[oa]?|est[ea]|[u\xFA]ltim[oa]?|en))\\s+a\xF1o))?\\b`;
  SpanishDateTime2.BeforeRegex = `(antes(\\s+del?(\\s+las?)?)?)`;
  SpanishDateTime2.AfterRegex = `(despues(\\s*del?(\\s+las?)?)?)`;
  SpanishDateTime2.SinceRegex = `(desde(\\s+(las?|el))?)`;
  SpanishDateTime2.AroundRegex = `^[.]`;
  SpanishDateTime2.PeriodicRegex = `\\b(?<periodic>a\\s*diario|diariamente|mensualmente|semanalmente|quincenalmente|anualmente)\\b`;
  SpanishDateTime2.EachExpression = `cada|tod[oa]s\\s*(l[oa]s)?`;
  SpanishDateTime2.EachUnitRegex = `(?<each>(${SpanishDateTime2.EachExpression})\\s*${SpanishDateTime2.UnitRegex})`;
  SpanishDateTime2.EachPrefixRegex = `(?<each>(${SpanishDateTime2.EachExpression})\\s*$)`;
  SpanishDateTime2.EachDayRegex = `\\s*(${SpanishDateTime2.EachExpression})\\s*d[i\xED]as\\s*\\b`;
  SpanishDateTime2.BeforeEachDayRegex = `(${SpanishDateTime2.EachExpression})\\s*d[i\xED]as(\\s+a\\s+las?)?\\s*\\b`;
  SpanishDateTime2.SetEachRegex = `(?<each>(${SpanishDateTime2.EachExpression})\\s*)`;
  SpanishDateTime2.LaterEarlyPeriodRegex = `^[.]`;
  SpanishDateTime2.WeekWithWeekDayRangeRegex = `^[.]`;
  SpanishDateTime2.GeneralEndingRegex = `^[.]`;
  SpanishDateTime2.MiddlePauseRegex = `^[.]`;
  SpanishDateTime2.PrefixArticleRegex = `^[\\.]`;
  SpanishDateTime2.OrRegex = `^[.]`;
  SpanishDateTime2.YearPlusNumberRegex = `^[.]`;
  SpanishDateTime2.NumberAsTimeRegex = `^[.]`;
  SpanishDateTime2.TimeBeforeAfterRegex = `^[.]`;
  SpanishDateTime2.DateNumberConnectorRegex = `^[.]`;
  SpanishDateTime2.CenturyRegex = `^[.]`;
  SpanishDateTime2.DecadeRegex = `^[.]`;
  SpanishDateTime2.DecadeWithCenturyRegex = `^[.]`;
  SpanishDateTime2.RelativeDecadeRegex = `^[.]`;
  SpanishDateTime2.ComplexDatePeriodRegex = `^[.]`;
  SpanishDateTime2.YearSuffix = `(,?\\s*(${SpanishDateTime2.YearRegex}|${SpanishDateTime2.FullTextYearRegex}))`;
  SpanishDateTime2.AgoRegex = `\\b(antes)\\b`;
  SpanishDateTime2.LaterRegex = `\\b(despu[e\xE9]s|desde ahora)\\b`;
  SpanishDateTime2.Tomorrow = "ma\xF1ana";
  SpanishDateTime2.UnitMap = /* @__PURE__ */ new Map([["a\xF1os", "Y"], ["a\xF1o", "Y"], ["meses", "MON"], ["mes", "MON"], ["semanas", "W"], ["semana", "W"], ["dias", "D"], ["dia", "D"], ["d\xEDas", "D"], ["d\xEDa", "D"], ["horas", "H"], ["hora", "H"], ["hrs", "H"], ["hr", "H"], ["h", "H"], ["minutos", "M"], ["minuto", "M"], ["mins", "M"], ["min", "M"], ["segundos", "S"], ["segundo", "S"], ["segs", "S"], ["seg", "S"]]);
  SpanishDateTime2.UnitValueMap = /* @__PURE__ */ new Map([["a\xF1os", 31536e3], ["a\xF1o", 31536e3], ["meses", 2592e3], ["mes", 2592e3], ["semanas", 604800], ["semana", 604800], ["dias", 86400], ["dia", 86400], ["d\xEDas", 86400], ["d\xEDa", 86400], ["horas", 3600], ["hora", 3600], ["hrs", 3600], ["hr", 3600], ["h", 3600], ["minutos", 60], ["minuto", 60], ["mins", 60], ["min", 60], ["segundos", 1], ["segundo", 1], ["segs", 1], ["seg", 1]]);
  SpanishDateTime2.SeasonMap = /* @__PURE__ */ new Map([["primavera", "SP"], ["verano", "SU"], ["oto\xF1o", "FA"], ["invierno", "WI"]]);
  SpanishDateTime2.SeasonValueMap = /* @__PURE__ */ new Map([["SP", 3], ["SU", 6], ["FA", 9], ["WI", 12]]);
  SpanishDateTime2.CardinalMap = /* @__PURE__ */ new Map([["primer", 1], ["primero", 1], ["primera", 1], ["1er", 1], ["1ro", 1], ["1ra", 1], ["segundo", 2], ["segunda", 2], ["2do", 2], ["2da", 2], ["tercer", 3], ["tercero", 3], ["tercera", 3], ["3er", 3], ["3ro", 3], ["3ra", 3], ["cuarto", 4], ["cuarta", 4], ["4to", 4], ["4ta", 4], ["quinto", 5], ["quinta", 5], ["5to", 5], ["5ta", 5]]);
  SpanishDateTime2.DayOfWeek = /* @__PURE__ */ new Map([["lunes", 1], ["martes", 2], ["miercoles", 3], ["mi\xE9rcoles", 3], ["jueves", 4], ["viernes", 5], ["sabado", 6], ["domingo", 0], ["lu", 1], ["ma", 2], ["mi", 3], ["ju", 4], ["vi", 5], ["sa", 6], ["do", 0]]);
  SpanishDateTime2.MonthOfYear = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["enero", 1], ["febrero", 2], ["marzo", 3], ["abril", 4], ["mayo", 5], ["junio", 6], ["julio", 7], ["agosto", 8], ["septiembre", 9], ["setiembre", 9], ["octubre", 10], ["noviembre", 11], ["diciembre", 12], ["ene", 1], ["feb", 2], ["mar", 3], ["abr", 4], ["may", 5], ["jun", 6], ["jul", 7], ["ago", 8], ["sept", 9], ["set", 9], ["oct", 10], ["nov", 11], ["dic", 12], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9]]);
  SpanishDateTime2.Numbers = /* @__PURE__ */ new Map([["cero", 0], ["un", 1], ["una", 1], ["uno", 1], ["dos", 2], ["tres", 3], ["cuatro", 4], ["cinco", 5], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9], ["diez", 10], ["once", 11], ["doce", 12], ["docena", 12], ["docenas", 12], ["trece", 13], ["catorce", 14], ["quince", 15], ["dieciseis", 16], ["diecis\xE9is", 16], ["diecisiete", 17], ["dieciocho", 18], ["diecinueve", 19], ["veinte", 20], ["ventiuna", 21], ["ventiuno", 21], ["veintiun", 21], ["veinti\xFAn", 21], ["veintiuno", 21], ["veintiuna", 21], ["veintidos", 22], ["veintid\xF3s", 22], ["veintitres", 23], ["veintitr\xE9s", 23], ["veinticuatro", 24], ["veinticinco", 25], ["veintiseis", 26], ["veintis\xE9is", 26], ["veintisiete", 27], ["veintiocho", 28], ["veintinueve", 29], ["treinta", 30]]);
  SpanishDateTime2.HolidayNames = /* @__PURE__ */ new Map([["padres", ["diadelpadre"]], ["madres", ["diadelamadre"]], ["acciondegracias", ["diadegracias", "diadeacciondegracias", "acciondegracias"]], ["trabajador", ["diadeltrabajador"]], ["delaraza", ["diadelaraza", "diadeladiversidadcultural"]], ["memoria", ["diadelamemoria"]], ["pascuas", ["diadepascuas", "pascuas"]], ["navidad", ["navidad", "diadenavidad"]], ["nochebuena", ["diadenochebuena", "nochebuena"]], ["a\xF1onuevo", ["a\xF1onuevo", "diadea\xF1onuevo"]], ["nochevieja", ["nochevieja", "diadenochevieja"]], ["yuandan", ["yuandan"]], ["maestro", ["diadelmaestro"]], ["todoslossantos", ["todoslossantos"]], ["ni\xF1o", ["diadelni\xF1o"]], ["mujer", ["diadelamujer"]]]);
  SpanishDateTime2.VariableHolidaysTimexDictionary = /* @__PURE__ */ new Map([["padres", "-06-WXX-7-3"], ["madres", "-05-WXX-7-2"], ["acciondegracias", "-11-WXX-4-4"], ["trabajador", "-05-WXX-1-1"], ["delaraza", "-10-WXX-1-2"], ["memoria", "-03-WXX-2-4"]]);
  SpanishDateTime2.DoubleNumbers = /* @__PURE__ */ new Map([["mitad", 0.5], ["cuarto", 0.25]]);
  SpanishDateTime2.DateTokenPrefix = "en ";
  SpanishDateTime2.TimeTokenPrefix = "a las ";
  SpanishDateTime2.TokenBeforeDate = "el ";
  SpanishDateTime2.TokenBeforeTime = "la ";
  SpanishDateTime2.NextPrefixRegex = `(pr[o\xF3]xim[oa]|siguiente)\\b`;
  SpanishDateTime2.PastPrefixRegex = `([u\xFA]ltim[oa])\\b`;
  SpanishDateTime2.ThisPrefixRegex = `(est[ea])\\b`;
  SpanishDateTime2.RelativeDayRegex = `^[\\.]`;
  SpanishDateTime2.RestOfDateRegex = `^[\\.]`;
  SpanishDateTime2.RelativeDurationUnitRegex = `^[\\.]`;
  SpanishDateTime2.ReferenceDatePeriodRegex = `^[.]`;
  SpanishDateTime2.FromToRegex = `\\b(from).+(to)\\b.+`;
  SpanishDateTime2.SingleAmbiguousMonthRegex = `^(the\\s+)?(may|march)$`;
  SpanishDateTime2.UnspecificDatePeriodRegex = `^[.]`;
  SpanishDateTime2.PrepositionSuffixRegex = `\\b(on|in|at|around|for|during|since|from|to)$`;
  SpanishDateTime2.RestOfDateTimeRegex = `^[\\.]`;
  SpanishDateTime2.SetWeekDayRegex = `^[\\.]`;
  SpanishDateTime2.NightRegex = `\\b(medionoche|noche)\\b`;
  SpanishDateTime2.CommonDatePrefixRegex = `^[\\.]`;
  SpanishDateTime2.DurationUnitRegex = `^[\\.]`;
  SpanishDateTime2.DurationConnectorRegex = `^[.]`;
  SpanishDateTime2.YearAfterRegex = `^[.]`;
  SpanishDateTime2.YearPeriodRegex = `^[.]`;
  SpanishDateTime2.FutureSuffixRegex = `^[.]`;
  SpanishDateTime2.WrittenDecades = /* @__PURE__ */ new Map([["", 0]]);
  SpanishDateTime2.SpecialDecadeCases = /* @__PURE__ */ new Map([["", 0]]);
  SpanishDateTime2.DefaultLanguageFallback = "DMY";
  SpanishDateTime2.DurationDateRestrictions = [];
})(exports.SpanishDateTime || (exports.SpanishDateTime = {}));
var SpanishDurationExtractorConfiguration = class {
  constructor() {
    this.allRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AllRegex, "gis");
    this.halfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HalfRegex, "gis");
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FollowedUnit, "gis");
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DurationNumberCombinedWithUnit, "gis");
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AnUnitRegex, "gis");
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.InexactNumberUnitRegex, "gis");
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SuffixAndRegex, "gis");
    this.relativeDurationUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeDurationUnitRegex, "gis");
    this.moreThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MoreThanRegex, "gis");
    this.lessThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LessThanOneHour, "gis");
    this.cardinalExtractor = new recognizersTextNumber.SpanishCardinalExtractor();
  }
};
var SpanishDurationParserConfiguration = class {
  constructor(config) {
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FollowedUnit);
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SuffixAndRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DurationNumberCombinedWithUnit);
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AnUnitRegex);
    this.allDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AllRegex);
    this.halfDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HalfRegex);
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.InexactNumberUnitRegex);
    this.unitMap = config.unitMap;
    this.unitValueMap = config.unitValueMap;
    this.doubleNumbers = config.doubleNumbers;
  }
};
var SpanishTimeExtractorConfiguration = class _SpanishTimeExtractorConfiguration {
  constructor() {
    this.atRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AtRegex, "gis");
    this.ishRegex = null;
    this.timeRegexList = _SpanishTimeExtractorConfiguration.getTimeRegexList();
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
  }
  static getTimeRegexList() {
    return [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex3, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex4, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex5, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex6, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex7, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex8, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex9, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex10, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex11, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeRegex12, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ConnectNumRegex, "gis")
    ];
  }
};
var SpanishTimeParserConfiguration = class {
  constructor(config) {
    this.timeTokenPrefix = exports.SpanishDateTime.TimeTokenPrefix;
    this.atRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AtRegex, "gis");
    this.timeRegexes = SpanishTimeExtractorConfiguration.getTimeRegexList();
    this.lessThanOneHour = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LessThanOneHour, "gis");
    this.timeSuffix = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeSuffix, "gis");
    this.utilityConfiguration = config.utilityConfiguration;
    this.numbers = config.numbers;
  }
  adjustByPrefix(prefix, adjust) {
    let deltaMin = 0;
    let trimedPrefix = prefix.trim().toLowerCase();
    if (trimedPrefix.startsWith("cuarto") || trimedPrefix.startsWith("y cuarto")) {
      deltaMin = 15;
    } else if (trimedPrefix.startsWith("menos cuarto")) {
      deltaMin = -15;
    } else if (trimedPrefix.startsWith("media") || trimedPrefix.startsWith("y media")) {
      deltaMin = 30;
    } else {
      let matches = recognizersText.RegExpUtility.getMatches(this.lessThanOneHour, trimedPrefix);
      if (matches.length) {
        let match = matches[0];
        let minStr = match.groups("deltamin").value;
        if (minStr) {
          deltaMin = parseInt(minStr, 10);
        } else {
          minStr = match.groups("deltaminnum").value.toLowerCase();
          if (this.numbers.has(minStr)) {
            deltaMin = this.numbers.get(minStr);
          }
        }
      }
    }
    if (trimedPrefix.endsWith("pasadas") || trimedPrefix.endsWith("pasados") || trimedPrefix.endsWith("pasadas las") || trimedPrefix.endsWith("pasados las") || trimedPrefix.endsWith("pasadas de las") || trimedPrefix.endsWith("pasados de las")) ; else if (trimedPrefix.endsWith("para la") || trimedPrefix.endsWith("para las") || trimedPrefix.endsWith("antes de la") || trimedPrefix.endsWith("antes de las")) {
      deltaMin = -deltaMin;
    }
    adjust.min += deltaMin;
    if (adjust.min < 0) {
      adjust.min += 60;
      adjust.hour -= 1;
    }
    adjust.hasMin = adjust.hasMin || adjust.min !== 0;
  }
  adjustBySuffix(suffix, adjust) {
    let trimedSuffix = suffix.trim().toLowerCase();
    this.adjustByPrefix(trimedSuffix, adjust);
    let deltaHour = 0;
    let matches = recognizersText.RegExpUtility.getMatches(this.timeSuffix, trimedSuffix);
    if (matches.length) {
      let match = matches[0];
      if (match.index === 0 && match.length === trimedSuffix.length) {
        let oclockStr = match.groups("oclock").value;
        if (!oclockStr) {
          let amStr = match.groups("am").value;
          if (amStr) {
            if (adjust.hour >= 12) {
              deltaHour = -12;
            }
            adjust.hasAm = true;
          }
          let pmStr = match.groups("pm").value;
          if (pmStr) {
            if (adjust.hour < 12) {
              deltaHour = 12;
            }
            adjust.hasPm = true;
          }
        }
      }
    }
    adjust.hour = (adjust.hour + deltaHour) % 24;
  }
};

// recognizers/recognizers-date-time/src/dateTime/spanish/dateTimeConfiguration.ts
var SpanishDateTimeExtractorConfiguration = class {
  constructor() {
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PrepositionRegex, "gis");
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NowRegex, "gis");
    this.suffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SuffixRegex, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex, "gis");
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeOfDayRegex, "gis");
    this.timeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfTodayAfterRegex, "gis");
    this.timeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfTodayBeforeRegex, "gis");
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleTimeOfTodayAfterRegex, "gis");
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleTimeOfTodayBeforeRegex, "gis");
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TheEndOfRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.UnitRegex, "gis");
    this.connectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ConnectorRegex, "gis");
    this.nightRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NightRegex, "gis");
    this.datePointExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.timePointExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.utilityConfiguration = new SpanishDateTimeUtilityConfiguration();
  }
  isConnectorToken(source) {
    let trimmed = source.trim();
    return trimmed === "" || recognizersText.RegExpUtility.getFirstMatchIndex(this.prepositionRegex, source).matched || recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorRegex, source).matched;
  }
};
var SpanishDateTimeParserConfiguration = class {
  constructor(config) {
    this.tokenBeforeDate = exports.SpanishDateTime.TokenBeforeDate;
    this.tokenBeforeTime = exports.SpanishDateTime.TokenBeforeTime;
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NowRegex, "gis");
    this.amTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AmTimeRegex, "gis");
    this.pmTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PmTimeRegex, "gis");
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleTimeOfTodayAfterRegex, "gis");
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleTimeOfTodayBeforeRegex, "gis");
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeOfDayRegex, "gis");
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TheEndOfRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.UnitRegex, "gis");
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextPrefixRegex, "gis");
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastPrefixRegex, "gis");
    this.dateExtractor = config.dateExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.numbers = config.numbers;
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.durationExtractor = config.durationExtractor;
    this.durationParser = config.durationParser;
    this.unitMap = config.unitMap;
    this.utilityConfiguration = config.utilityConfiguration;
  }
  haveAmbiguousToken(text, matchedText) {
    return text.toLowerCase().includes("esta ma\xF1ana") && matchedText.toLocaleLowerCase().includes("ma\xF1ana");
  }
  getMatchedNowTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText.endsWith("ahora") || trimedText.endsWith("mismo") || trimedText.endsWith("momento")) {
      timex = "PRESENT_REF";
    } else if (trimedText.endsWith("posible") || trimedText.endsWith("pueda") || trimedText.endsWith("puedas") || trimedText.endsWith("podamos") || trimedText.endsWith("puedan")) {
      timex = "FUTURE_REF";
    } else if (trimedText.endsWith("mente")) {
      timex = "PAST_REF";
    } else {
      return {
        matched: false,
        timex: null
      };
    }
    return {
      matched: true,
      timex
    };
  }
  getSwiftDay(text) {
    let trimedText = text.trim().toLowerCase();
    let swift = 0;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched) {
      swift = -1;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched) {
      swift = 1;
    }
    return swift;
  }
  getHour(text, hour) {
    let trimedText = text.trim().toLowerCase();
    let result = hour;
    if ((trimedText.endsWith("ma\xF1ana") || trimedText.endsWith("madrugada")) && hour >= 12) {
      result -= 12;
    } else if (!(trimedText.endsWith("ma\xF1ana") || trimedText.endsWith("madrugada")) && hour < 12) {
      result += 12;
    }
    return result;
  }
};
var SpanishDatePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DayBetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DayBetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.OneWordPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthWithYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthNumWithYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.YearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthFrontBetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthFrontSimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.QuarterRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.QuarterRegexYearFront),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AllHalfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SeasonRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RestOfDateRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LaterEarlyPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekWithWeekDayRangeRegex)
    ];
    this.illegalYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.BaseDateTime.IllegalYearRegex);
    this.YearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.YearRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TillRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FollowedDateUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NumberCombinedWithDateUnit);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FutureRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthOfRegex);
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateUnitRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RangeUnitRegex);
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FromRegex);
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ConnectorAndRegex);
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BetweenRegex);
    this.datePointExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.SpanishIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.SpanishNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
  }
  getFromTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, source);
  }
  getBetweenTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.betweenRegex, source);
  }
  hasConnectorToken(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, source).matched;
  }
};
var SpanishDatePeriodParserConfiguration = class {
  constructor(config) {
    this.tokenBeforeDate = exports.SpanishDateTime.TokenBeforeDate;
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.durationExtractor = config.durationExtractor;
    this.dateExtractor = config.dateExtractor;
    this.durationParser = config.durationParser;
    this.dateParser = config.dateParser;
    this.monthFrontBetweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthFrontBetweenRegex);
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DayBetweenRegex);
    this.monthFrontSimpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthFrontSimpleCasesRegex);
    this.simpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SimpleCasesRegex);
    this.oneWordPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.OneWordPeriodRegex);
    this.monthWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthWithYearRegex);
    this.monthNumWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthNumWithYearRegex);
    this.yearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.YearRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FutureRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DurationNumberCombinedWithUnit);
    this.weekOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfMonthRegex);
    this.weekOfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfYearRegex);
    this.quarterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.QuarterRegex);
    this.quarterRegexYearFront = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.QuarterRegexYearFront);
    this.allHalfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AllHalfYearRegex);
    this.seasonRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SeasonRegex);
    this.whichWeekRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WhichWeekRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthOfRegex);
    this.restOfDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RestOfDateRegex);
    this.laterEarlyPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LaterEarlyPeriodRegex);
    this.weekWithWeekDayRangeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekWithWeekDayRangeRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextPrefixRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastPrefixRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ThisPrefixRegex);
    this.inConnectorRegex = config.utilityConfiguration.inConnectorRegex;
    this.unitMap = config.unitMap;
    this.cardinalMap = config.cardinalMap;
    this.dayOfMonth = config.dayOfMonth;
    this.monthOfYear = config.monthOfYear;
    this.seasonMap = config.seasonMap;
  }
  getSwiftDayOrMonth(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched) {
      swift = 1;
    }
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched) {
      swift = -1;
    }
    return swift;
  }
  getSwiftYear(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = -10;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched) {
      swift = 1;
    }
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched) {
      swift = -1;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.thisPrefixRegex, trimedText).matched) {
      swift = 0;
    }
    return swift;
  }
  isFuture(source) {
    let trimedText = source.trim().toLowerCase();
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.thisPrefixRegex, trimedText).matched || recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched;
  }
  isYearToDate(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText === "a\xF1o a la fecha" || trimedText === "a\xF1os a la fecha";
  }
  isMonthToDate(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText === "mes a la fecha" || trimedText === "meses a la fecha";
  }
  isWeekOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("semana") && !trimedText.endsWith("fin de semana");
  }
  isWeekend(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("fin de semana");
  }
  isMonthOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("mes") || trimedText.endsWith("meses");
  }
  isYearOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("a\xF1o") || trimedText.endsWith("a\xF1os");
  }
  isLastCardinal(source) {
    let trimedText = source.trim().toLowerCase();
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched;
  }
};
var SpanishTimePeriodExtractorConfiguration = class {
  constructor() {
    this.singleTimeExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.utilityConfiguration = new SpanishDateTimeUtilityConfiguration();
    this.simpleCasesRegex = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumFromTo, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumBetweenAnd, "gis")
    ];
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TillRegex, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex, "gis");
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.GeneralEndingRegex, "gis");
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FromRegex, "gis");
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ConnectorAndRegex, "gis");
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BetweenRegex, "gis");
  }
  getFromTokenIndex(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, text);
  }
  hasConnectorToken(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, text).matched;
  }
  getBetweenTokenIndex(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.betweenRegex, text);
  }
};
var SpanishTimePeriodParserConfiguration = class {
  constructor(config) {
    this.timeExtractor = config.timeExtractor;
    this.timeParser = config.timeParser;
    this.integerExtractor = config.integerExtractor;
    this.numbers = config.numbers;
    this.utilityConfiguration = config.utilityConfiguration;
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumFromTo, "gis");
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumBetweenAnd, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex, "gis");
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TillRegex, "gis");
    this.specificTimeFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeFromTo);
    this.specificTimeBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeBetweenAnd);
  }
  getMatchedTimexRange(text) {
    let trimedText = text.trim().toLowerCase();
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    let timex = "";
    if (trimedText.endsWith("madrugada")) {
      timex = "TDA";
      beginHour = 4;
      endHour = 8;
    } else if (trimedText.endsWith("ma\xF1ana")) {
      timex = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (trimedText.includes("pasado mediodia") || trimedText.includes("pasado el mediodia")) {
      timex = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (trimedText.endsWith("tarde")) {
      timex = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (trimedText.endsWith("noche")) {
      timex = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      timex = null;
      return {
        matched: false,
        timex,
        beginHour,
        endHour,
        endMin
      };
    }
    return {
      matched: true,
      timex,
      beginHour,
      endHour,
      endMin
    };
  }
};
var SpanishDateTimePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumFromTo),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumBetweenAnd)
    ];
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PrepositionRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TillRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FollowedUnit);
    this.timeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.UnitRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FutureRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateTimePeriodNumberCombinedWithUnit);
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayRegex);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PeriodTimeOfDayWithDateRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeTimeUnitRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RestOfDateTimeRegex);
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.GeneralEndingRegex);
    this.middlePauseRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MiddlePauseRegex);
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FromRegex);
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ConnectorAndRegex);
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BetweenRegex);
    this.cardinalExtractor = new recognizersTextNumber.SpanishCardinalExtractor();
    this.singleDateExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.singleTimeExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.singleDateTimeExtractor = new BaseDateTimeExtractor(new SpanishDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new SpanishTimePeriodExtractorConfiguration());
  }
  getFromTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, source);
  }
  getBetweenTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.betweenRegex, source);
  }
  hasConnectorToken(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, source).matched;
  }
};
var SpanishDateTimePeriodParserConfiguration = class {
  constructor(config) {
    this.dateExtractor = config.dateExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.cardinalExtractor = config.cardinalExtractor;
    this.durationExtractor = config.durationExtractor;
    this.numberParser = config.numberParser;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.dateTimeParser = config.dateTimeParser;
    this.timePeriodParser = config.timePeriodParser;
    this.durationParser = config.durationParser;
    this.unitMap = config.unitMap;
    this.numbers = config.numbers;
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextPrefixRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastPrefixRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ThisPrefixRegex);
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumFromTo);
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PureNumBetweenAnd);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FutureRegex);
    this.numberCombinedWithUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateTimePeriodNumberCombinedWithUnit);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.UnitRegex);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PeriodTimeOfDayWithDateRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeTimeUnitRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RestOfDateTimeRegex);
  }
  getMatchedTimeRange(source) {
    let trimedText = source.trim().toLowerCase();
    let timeStr = "";
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    if (trimedText.endsWith("madrugada")) {
      timeStr = "TDA";
      beginHour = 4;
      endHour = 8;
    } else if (trimedText.endsWith("ma\xF1ana")) {
      timeStr = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (trimedText.includes("pasado mediodia") || trimedText.includes("pasado el mediodia")) {
      timeStr = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (trimedText.endsWith("tarde")) {
      timeStr = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (trimedText.endsWith("noche")) {
      timeStr = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      timeStr = null;
      return {
        success: false,
        timeStr,
        beginHour,
        endHour,
        endMin
      };
    }
    return {
      success: true,
      timeStr,
      beginHour,
      endHour,
      endMin
    };
  }
  getSwiftPrefix(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched || trimedText === "anoche") {
      swift = -1;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched) {
      swift = 1;
    }
    return swift;
  }
};

// recognizers/recognizers-date-time/src/dateTime/spanish/baseConfiguration.ts
var SpanishDateTimeUtilityConfiguration = class {
  constructor() {
    this.laterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LaterRegex);
    this.agoRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AgoRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RangeUnitRegex);
    this.amDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AmDescRegex);
    this.pmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PmDescRegex);
    this.amPmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AmPmDescRegex);
  }
};
var SpanishCommonDateTimeParserConfiguration = class extends BaseDateParserConfiguration {
  constructor() {
    super();
    this.utilityConfiguration = new SpanishDateTimeUtilityConfiguration();
    this.unitMap = exports.SpanishDateTime.UnitMap;
    this.unitValueMap = exports.SpanishDateTime.UnitValueMap;
    this.seasonMap = exports.SpanishDateTime.SeasonMap;
    this.cardinalMap = exports.SpanishDateTime.CardinalMap;
    this.dayOfWeek = exports.SpanishDateTime.DayOfWeek;
    this.monthOfYear = exports.SpanishDateTime.MonthOfYear;
    this.numbers = exports.SpanishDateTime.Numbers;
    this.doubleNumbers = exports.SpanishDateTime.DoubleNumbers;
    this.cardinalExtractor = new recognizersTextNumber.SpanishCardinalExtractor();
    this.integerExtractor = new recognizersTextNumber.SpanishIntegerExtractor();
    this.ordinalExtractor = new recognizersTextNumber.SpanishOrdinalExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.SpanishNumberParserConfiguration());
    this.dateExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new SpanishDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new SpanishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new SpanishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new SpanishDateTimePeriodExtractorConfiguration());
    this.durationParser = new BaseDurationParser(new SpanishDurationParserConfiguration(this));
    this.dateParser = new BaseDateParser(new SpanishDateParserConfiguration(this));
    this.timeParser = new BaseTimeParser(new SpanishTimeParserConfiguration(this));
    this.dateTimeParser = new BaseDateTimeParser(new SpanishDateTimeParserConfiguration(this));
    this.datePeriodParser = new BaseDatePeriodParser(new SpanishDatePeriodParserConfiguration(this));
    this.timePeriodParser = new BaseTimePeriodParser(new SpanishTimePeriodParserConfiguration(this));
    this.dateTimePeriodParser = new BaseDateTimePeriodParser(new SpanishDateTimePeriodParserConfiguration(this));
  }
};

// recognizers/recognizers-date-time/src/dateTime/spanish/dateConfiguration.ts
var SpanishDateExtractorConfiguration = class {
  constructor() {
    this.dateRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor3, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor5, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor4, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor4, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor5, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor8, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor6, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor6, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor8, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor9, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor7, "gis"),
      exports.SpanishDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor7, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor9, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateExtractor10, "gis")
    ];
    this.implicitDateList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.OnRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelaxedOnRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecialDayRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ThisRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LastDateRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextDateRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayOfMonthRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecialDateRegex, "gis")
    ];
    this.monthEnd = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthEndRegex, "gis");
    this.ofMonth = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.OfMonthRegex, "gis");
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateUnitRegex, "gis");
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ForTheRegex, "gis");
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayAndDayOfMonthRegex, "gis");
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeMonthRegex, "gis");
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayRegex, "gis");
    this.dayOfWeek = exports.SpanishDateTime.DayOfWeek;
    this.ordinalExtractor = new recognizersTextNumber.SpanishOrdinalExtractor();
    this.integerExtractor = new recognizersTextNumber.SpanishIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.SpanishNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.utilityConfiguration = new SpanishDateTimeUtilityConfiguration();
  }
};
var _SpanishDateParserConfiguration = class _SpanishDateParserConfiguration {
  constructor(config) {
    this.ordinalExtractor = config.ordinalExtractor;
    this.integerExtractor = config.integerExtractor;
    this.cardinalExtractor = config.cardinalExtractor;
    this.durationExtractor = config.durationExtractor;
    this.numberParser = config.numberParser;
    this.durationParser = config.durationParser;
    this.monthOfYear = config.monthOfYear;
    this.dayOfMonth = config.dayOfMonth;
    this.dayOfWeek = config.dayOfWeek;
    this.unitMap = config.unitMap;
    this.cardinalMap = config.cardinalMap;
    this.dateRegex = new SpanishDateExtractorConfiguration().dateRegexList;
    this.onRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.OnRegex, "gis");
    this.specialDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecialDayRegex, "gis");
    this.specialDayWithNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SpecialDayWithNumRegex, "gis");
    this.nextRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextDateRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.DateUnitRegex, "gis");
    this.monthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.MonthRegex, "gis");
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayRegex, "gis");
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LastDateRegex, "gis");
    this.thisRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ThisRegex, "gis");
    this.weekDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayOfMonthRegex, "gis");
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ForTheRegex, "gis");
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.WeekDayAndDayOfMonthRegex, "gis");
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeMonthRegex, "gis");
    this.relativeWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeWeekDayRegex, "gis");
    this.utilityConfiguration = config.utilityConfiguration;
    this.dateTokenPrefix = exports.SpanishDateTime.DateTokenPrefix;
  }
  getSwiftDay(source) {
    let trimedText = _SpanishDateParserConfiguration.normalize(source.trim().toLowerCase());
    let swift = 0;
    if (trimedText === "hoy" || trimedText === "el dia") {
      swift = 0;
    } else if (trimedText === "ma\xF1ana" || trimedText.endsWith("dia siguiente") || trimedText.endsWith("el dia de ma\xF1ana") || trimedText.endsWith("proximo dia")) {
      swift = 1;
    } else if (trimedText === "ayer") {
      swift = -1;
    } else if (trimedText.endsWith("pasado ma\xF1ana") || trimedText.endsWith("dia despues de ma\xF1ana")) {
      swift = 2;
    } else if (trimedText.endsWith("anteayer") || trimedText.endsWith("dia antes de ayer")) {
      swift = -2;
    } else if (trimedText.endsWith("ultimo dia")) {
      swift = -1;
    }
    return swift;
  }
  getSwiftMonth(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (recognizersText.RegExpUtility.getMatches(_SpanishDateParserConfiguration.nextPrefixRegex, trimedText).length) {
      swift = 1;
    }
    if (recognizersText.RegExpUtility.getMatches(_SpanishDateParserConfiguration.pastPrefixRegex, trimedText).length) {
      swift = -1;
    }
    return swift;
  }
  isCardinalLast(source) {
    let trimedText = source.trim().toLowerCase();
    return recognizersText.RegExpUtility.getMatches(_SpanishDateParserConfiguration.pastPrefixRegex, trimedText).length > 0;
  }
  static normalize(source) {
    return source.replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u");
  }
};
// TODO: implement the relative day regex if needed. If yes, they should be abstracted
_SpanishDateParserConfiguration.relativeDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.RelativeDayRegex);
_SpanishDateParserConfiguration.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextPrefixRegex);
_SpanishDateParserConfiguration.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastPrefixRegex);
var SpanishDateParserConfiguration = _SpanishDateParserConfiguration;
var SpanishHolidayExtractorConfiguration = class {
  constructor() {
    this.holidayRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex3, "gis")
    ];
  }
};
var SpanishHolidayParserConfiguration = class _SpanishHolidayParserConfiguration extends BaseHolidayParserConfiguration {
  constructor() {
    super();
    this.holidayRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.HolidayRegex3, "gis")
    ];
    this.holidayNames = exports.SpanishDateTime.HolidayNames;
    this.holidayFuncDictionary = this.initHolidayFuncs();
    this.variableHolidaysTimexDictionary = exports.SpanishDateTime.VariableHolidaysTimexDictionary;
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NextPrefixRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PastPrefixRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.ThisPrefixRegex);
  }
  initHolidayFuncs() {
    return new Map(
      [
        ...super.initHolidayFuncs(),
        ["padres", _SpanishHolidayParserConfiguration.FathersDay],
        ["madres", _SpanishHolidayParserConfiguration.MothersDay],
        ["acciondegracias", _SpanishHolidayParserConfiguration.ThanksgivingDay],
        ["trabajador", _SpanishHolidayParserConfiguration.LabourDay],
        ["delaraza", _SpanishHolidayParserConfiguration.ColumbusDay],
        ["memoria", _SpanishHolidayParserConfiguration.MemorialDay],
        ["pascuas", _SpanishHolidayParserConfiguration.EasterDay],
        ["navidad", _SpanishHolidayParserConfiguration.ChristmasDay],
        ["nochebuena", _SpanishHolidayParserConfiguration.ChristmasEve],
        ["a\xF1onuevo", _SpanishHolidayParserConfiguration.NewYear],
        ["nochevieja", _SpanishHolidayParserConfiguration.NewYearEve],
        ["yuandan", _SpanishHolidayParserConfiguration.NewYear],
        ["maestro", _SpanishHolidayParserConfiguration.TeacherDay],
        ["todoslossantos", _SpanishHolidayParserConfiguration.HalloweenDay],
        ["ni\xF1o", _SpanishHolidayParserConfiguration.ChildrenDay],
        ["mujer", _SpanishHolidayParserConfiguration.FemaleDay]
      ]
    );
  }
  // All JavaScript dates are zero-based (-1)
  static NewYear(year) {
    return new Date(year, 1 - 1, 1);
  }
  static NewYearEve(year) {
    return new Date(year, 12 - 1, 31);
  }
  static ChristmasDay(year) {
    return new Date(year, 12 - 1, 25);
  }
  static ChristmasEve(year) {
    return new Date(year, 12 - 1, 24);
  }
  static FemaleDay(year) {
    return new Date(year, 3 - 1, 8);
  }
  static ChildrenDay(year) {
    return new Date(year, 6 - 1, 1);
  }
  static HalloweenDay(year) {
    return new Date(year, 10 - 1, 31);
  }
  static TeacherDay(year) {
    return new Date(year, 9 - 1, 11);
  }
  static EasterDay(year) {
    return DateUtils.minValue();
  }
  getSwiftYear(text) {
    let trimedText = text.trim().toLowerCase();
    let swift = -10;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nextPrefixRegex, trimedText).matched) {
      swift = 1;
    }
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.pastPrefixRegex, trimedText).matched) {
      swift = -1;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.thisPrefixRegex, trimedText).matched) {
      swift = 0;
    }
    return swift;
  }
  sanitizeHolidayToken(holiday) {
    return holiday.replace(/ /g, "").replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u");
  }
};
var SpanishSetExtractorConfiguration = class {
  constructor() {
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.LastDateRegex, "gis");
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PeriodicRegex, "gis");
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachUnitRegex, "gis");
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachPrefixRegex, "gis");
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachDayRegex, "gis");
    this.beforeEachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BeforeEachDayRegex, "gis");
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SetEachRegex, "gis");
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SetWeekDayRegex, "gis");
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.dateExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new SpanishDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new SpanishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new SpanishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new SpanishDateTimePeriodExtractorConfiguration());
  }
};
var SpanishSetParserConfiguration = class {
  constructor(config) {
    this.durationExtractor = config.durationExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateExtractor = config.dateExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.datePeriodExtractor = config.datePeriodExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.dateTimePeriodExtractor = config.dateTimePeriodExtractor;
    this.durationParser = config.durationParser;
    this.timeParser = config.timeParser;
    this.dateParser = config.dateParser;
    this.dateTimeParser = config.dateTimeParser;
    this.datePeriodParser = config.datePeriodParser;
    this.timePeriodParser = config.timePeriodParser;
    this.dateTimePeriodParser = config.dateTimePeriodParser;
    this.unitMap = config.unitMap;
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachPrefixRegex, "gis");
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PeriodicRegex, "gis");
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachUnitRegex, "gis");
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.EachDayRegex, "gis");
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SetWeekDayRegex, "gis");
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SetEachRegex, "gis");
  }
  getMatchedDailyTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText.endsWith("diario") || trimedText.endsWith("diariamente")) {
      timex = "P1D";
    } else if (trimedText === "semanalmente") {
      timex = "P1W";
    } else if (trimedText === "quincenalmente") {
      timex = "P2W";
    } else if (trimedText === "mensualmente") {
      timex = "P1M";
    } else if (trimedText === "anualmente") {
      timex = "P1Y";
    } else {
      timex = null;
      return {
        timex,
        matched: false
      };
    }
    return {
      timex,
      matched: true
    };
  }
  getMatchedUnitTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText === "d\xEDa" || trimedText === "dia" || trimedText === "d\xEDas" || trimedText === "dias") {
      timex = "P1D";
    } else if (trimedText === "semana" || trimedText === "semanas") {
      timex = "P1W";
    } else if (trimedText === "mes" || trimedText === "meses") {
      timex = "P1M";
    } else if (trimedText === "a\xF1o" || trimedText === "a\xF1os") {
      timex = "P1Y";
    } else {
      timex = null;
      return {
        matched: false,
        timex
      };
    }
    return {
      matched: true,
      timex
    };
  }
};
var SpanishDateTimePeriodParser = class extends BaseDateTimePeriodParser {
  constructor(config) {
    super(config);
  }
  parseSpecificTimeOfDay(source, referenceDate) {
    let ret = new DateTimeResolutionResult();
    let trimedText = source.trim().toLowerCase();
    let match = this.config.getMatchedTimeRange(trimedText);
    let beginHour = match.beginHour;
    let endHour = match.endHour;
    let endMin = match.endMin;
    let timeStr = match.timeStr;
    if (!match.success) {
      return ret;
    }
    let matches = recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, trimedText);
    if (matches.length && matches[0].index === 0 && matches[0].length === trimedText.length) {
      let swift = this.config.getSwiftPrefix(trimedText);
      let date = DateUtils.addDays(referenceDate, swift);
      date.setHours(0, 0, 0, 0);
      let day = date.getDate();
      let month = date.getMonth();
      let year = date.getFullYear();
      ret.timex = FormatUtil.formatDate(date) + timeStr;
      ret.pastValue = ret.futureValue = [
        DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, day, beginHour, 0, 0),
        DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, day, endHour, endMin, endMin)
      ];
      ret.success = true;
      return ret;
    }
    let startIndex = trimedText.indexOf(exports.SpanishDateTime.Tomorrow) === 0 ? exports.SpanishDateTime.Tomorrow.length : 0;
    matches = recognizersText.RegExpUtility.getMatches(recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.TimeOfDayRegex), trimedText.substring(startIndex));
    if (matches.length) {
      let match2 = matches[0];
      let beforeStr = trimedText.substring(0, match2.index + startIndex).trim();
      let ers = this.config.dateExtractor.extract(beforeStr, referenceDate);
      if (ers.length === 0) {
        return ret;
      }
      let pr = this.config.dateParser.parse(ers[0], referenceDate);
      let futureDate = pr.value.futureValue;
      let pastDate = pr.value.pastValue;
      ret.timex = pr.timexStr + timeStr;
      ret.futureValue = [
        DateUtils.safeCreateFromValue(DateUtils.minValue(), futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), beginHour, 0, 0),
        DateUtils.safeCreateFromValue(DateUtils.minValue(), futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), endHour, endMin, endMin)
      ];
      ret.pastValue = [
        DateUtils.safeCreateFromValue(DateUtils.minValue(), pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), beginHour, 0, 0),
        DateUtils.safeCreateFromValue(DateUtils.minValue(), pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), endHour, endMin, endMin)
      ];
      ret.success = true;
      return ret;
    }
    return ret;
  }
};

// recognizers/recognizers-date-time/src/dateTime/spanish/mergedConfiguration.ts
var SpanishMergedExtractorConfiguration = class {
  constructor() {
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SinceRegex);
    this.fromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.FromToRegex);
    this.singleAmbiguousMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SingleAmbiguousMonthRegex);
    this.prepositionSuffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.PrepositionSuffixRegex);
    this.numberEndingPattern = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.NumberEndingPattern);
    this.dateExtractor = new BaseDateExtractor(new SpanishDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new SpanishTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new SpanishDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new SpanishDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new SpanishTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new SpanishDateTimePeriodExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new SpanishDurationExtractorConfiguration());
    this.setExtractor = new BaseSetExtractor(new SpanishSetExtractorConfiguration());
    this.holidayExtractor = new BaseHolidayExtractor(new SpanishHolidayExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.SpanishIntegerExtractor();
    this.filterWordRegexList = [];
  }
};
var SpanishMergedParserConfiguration = class extends SpanishCommonDateTimeParserConfiguration {
  constructor() {
    super();
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.BeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.SpanishDateTime.SinceRegex);
    this.datePeriodParser = new BaseDatePeriodParser(new SpanishDatePeriodParserConfiguration(this));
    this.timePeriodParser = new BaseTimePeriodParser(new SpanishTimePeriodParserConfiguration(this));
    this.dateTimePeriodParser = new SpanishDateTimePeriodParser(new SpanishDateTimePeriodParserConfiguration(this));
    this.setParser = new BaseSetParser(new SpanishSetParserConfiguration(this));
    this.holidayParser = new BaseHolidayParser(new SpanishHolidayParserConfiguration());
  }
};

// recognizers/recognizers-date-time/src/resources/frenchDateTime.ts
exports.FrenchDateTime = void 0;
((FrenchDateTime2) => {
  FrenchDateTime2.TillRegex = `(?<till>au|[a\xE0]|et|jusqu'[a\xE0]|avant|--|-|\u2014|\u2014\u2014)`;
  FrenchDateTime2.RangeConnectorRegex = `(?<and>et|de la|au|[a\xE0]|et\\s*la|--|-|\u2014|\u2014\u2014)`;
  FrenchDateTime2.RelativeRegex = `(?<order>prochain|prochaine|de|du|ce|cette|l[ae]|derni[e\xE8]re|pr[e\xE9]c[e\xE9]dente|au\\s+cours+(de|du\\s*))`;
  FrenchDateTime2.NextSuffixRegex = `(?<order>prochain|prochaine|prochaines|suivante)\\b`;
  FrenchDateTime2.PastSuffixRegex = `(?<order>dernier|derni[e\xE8]re|pr[e\xE9]c[e\xE9]dente)\\b`;
  FrenchDateTime2.ThisPrefixRegex = `(?<order>ce|cette|au\\s+cours+(du|de))\\b`;
  FrenchDateTime2.DayRegex = `(?<day>01|02|03|04|05|06|07|08|09|10|11|11e|12|12e|13|13e|14|14e|15|15e|16|16e|17|17e|18|18e|19|19e|1er|1|21|21e|20|20e|22|22e|23|23e|24|24e|25|25e|26|26e|27|27e|28|28e|29|29e|2|2e|30|30e|31|31e|3|3e|4|4e|5|5e|6|6e|7|7e|8|8e|9|9e)(?=\\b|t)`;
  FrenchDateTime2.MonthNumRegex = `(?<month>01|02|03|04|05|06|07|08|09|10|11|12|1|2|3|4|5|6|7|8|9)\\b`;
  FrenchDateTime2.DescRegex = `(?<desc>h|ampm|am\\b|a\\.m\\.|a m\\b|a\\. m\\.|a\\.m\\b|a\\. m\\b|pm\\b|p\\.m\\.|p m\\b|p\\. m\\.|p\\.m\\b|p\\. m\\b|p\\b\\b)`;
  FrenchDateTime2.AmDescRegex = `(h|am\\b|a\\.m\\.|a m\\b|a\\. m\\.|a\\.m\\b|a\\. m\\b)`;
  FrenchDateTime2.PmDescRegex = `(h|pm\\b|p\\.m\\.|p\\b|p m\\b|p\\. m\\.|p\\.m\\b|p\\. m\\b)`;
  FrenchDateTime2.AmPmDescRegex = `(h|ampm)`;
  FrenchDateTime2.TwoDigitYearRegex = `\\b(?<![$])(?<year>([0-27-9]\\d))(?!(\\s*((\\:)|${FrenchDateTime2.AmDescRegex}|${FrenchDateTime2.PmDescRegex}|\\.\\d)))\\b`;
  FrenchDateTime2.FullTextYearRegex = `^[\\*]`;
  FrenchDateTime2.YearRegex = `(${exports.BaseDateTime.FourDigitYearRegex}|${FrenchDateTime2.FullTextYearRegex})`;
  FrenchDateTime2.WeekDayRegex = `(?<weekday>Dimanche|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Lun|Mar|Mer|Jeu|Ven|Sam|Dim)\\b`;
  FrenchDateTime2.RelativeMonthRegex = `(?<relmonth>(${FrenchDateTime2.ThisPrefixRegex}\\s+mois)|(mois\\s+${FrenchDateTime2.PastSuffixRegex})|(mois\\s+${FrenchDateTime2.NextSuffixRegex}))\\b`;
  FrenchDateTime2.WrittenMonthRegex = `(?<month>Avril|Avr\\.|Avr|Ao\xFBt|D[e\xE9]cembre|D[e\xE9]c|D[e\xE9]c\\.|F[e\xE9]vrier|F[e\xE9]v|F[e\xE9]vr\\.|F[e\xE9]vr|Javier|Jan|Janv\\.|Janv|Juillet|Jul|Juil|Juil\\.|Juin|Jun|Mars|Mar|Mai|Novembre|Nov|Nov\\.|Octobre|Oct|Oct\\.|Septembre|Sep|Sept|Sept\\.)`;
  FrenchDateTime2.MonthSuffixRegex = `(?<msuf>(en\\s*|le\\s*|de\\s*|dans\\s*)?(${FrenchDateTime2.RelativeMonthRegex}|${FrenchDateTime2.WrittenMonthRegex}))`;
  FrenchDateTime2.DateUnitRegex = `(?<unit>l'ann[e\xE9]e|ann[e\xE9]es|an|mois|semaines|semaine|jours|jour|journ[e\xE9]e|journ[e\xE9]es)\\b`;
  FrenchDateTime2.SimpleCasesRegex = `\\b((d[ue])|entre\\s+)?(${FrenchDateTime2.DayRegex})\\s*${FrenchDateTime2.TillRegex}\\s*(${FrenchDateTime2.DayRegex})\\s+${FrenchDateTime2.MonthSuffixRegex}((\\s+|\\s*,\\s*)${FrenchDateTime2.YearRegex})?\\b`;
  FrenchDateTime2.MonthFrontSimpleCasesRegex = `\\b((d[ue]|entre)\\s+)?${FrenchDateTime2.MonthSuffixRegex}\\s+((d[ue]|entre)\\s+)?(${FrenchDateTime2.DayRegex})\\s*${FrenchDateTime2.TillRegex}\\s*(${FrenchDateTime2.DayRegex})((\\s+|\\s*,\\s*)${FrenchDateTime2.YearRegex})?\\b`;
  FrenchDateTime2.MonthFrontBetweenRegex = `\\b${FrenchDateTime2.MonthSuffixRegex}\\s+(entre|d[ue]\\s+)(${FrenchDateTime2.DayRegex})\\s*${FrenchDateTime2.RangeConnectorRegex}\\s*(${FrenchDateTime2.DayRegex})((\\s+|\\s*,\\s*)${FrenchDateTime2.YearRegex})?\\b`;
  FrenchDateTime2.BetweenRegex = `\\b(entre\\s+)(${FrenchDateTime2.DayRegex})\\s*${FrenchDateTime2.RangeConnectorRegex}\\s*(${FrenchDateTime2.DayRegex})\\s+${FrenchDateTime2.MonthSuffixRegex}((\\s+|\\s*,\\s*)${FrenchDateTime2.YearRegex})?\\b`;
  FrenchDateTime2.YearWordRegex = `\\b(?<year>l'ann[\xE9e]e)\\b`;
  FrenchDateTime2.MonthWithYear = `\\b((?<month>Avril|Avr\\.|Avr|Ao\xFBt|Aout|D[\xE9e]cembre|D[e\xE9]c|Dec\\.|F[e\xE9]v|F[e\xE9]vr|Fev|F[e\xE9]vrier|F[e\xE9]v\\.|Janvier|Jan|Janv|Janv\\.|Jan\\.|Jul|Juillet|Juil\\.|Jun|Juin|Mar|Mars|Mai|Novembre|Nov|Nov\\.|Octobre|Oct|Oct\\.|Septembre|Sep|Sept|Sept\\.)(\\s*),?(\\s+de)?(\\s*)(${FrenchDateTime2.YearRegex}|(?<order>cette)\\s*${FrenchDateTime2.YearWordRegex})|${FrenchDateTime2.YearWordRegex}\\s*(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex}))`;
  FrenchDateTime2.OneWordPeriodRegex = `\\b((${FrenchDateTime2.RelativeRegex}\\s+)?(?<month>Avril|Avr\\.|Avr|Ao\xFBt|Aout|D[e\xE9]cembre|D[\xE9e]c|D[e\xE9]c\\.|F[e\xE9]vrier|Fev|F[e\xE9]v\\.|F[e\xE9]vr|Janvier|Janv\\.|Janv|Jan|Jan\\.|Jul|Juillet|Juil\\.|Jun|Juin|Mar|Mars|Mai|Nov|Novembre|Nov\\.|Oct|Octobre|Oct\\.|Sep|Septembre|Sept\\.)|${FrenchDateTime2.RelativeRegex}\\s+(weekend|fin de semaine|week-end|semaine|mois|ans|l'ann\xE9e)|weekend|week-end|(mois|l'ann\xE9e))\\b`;
  FrenchDateTime2.MonthNumWithYear = `(${FrenchDateTime2.YearRegex}(\\s*)[/\\-\\.](\\s*)${FrenchDateTime2.MonthNumRegex})|(${FrenchDateTime2.MonthNumRegex}(\\s*)[/\\-](\\s*)${FrenchDateTime2.YearRegex})`;
  FrenchDateTime2.WeekOfMonthRegex = `(?<wom>(le\\s+)?(?<cardinal>premier|1er|duexi[\xE8e]me|2|troisi[\xE8e]me|3|quatri[\xE8e]me|4|cinqi[\xE8e]me|5)\\s+semaine\\s+${FrenchDateTime2.MonthSuffixRegex})`;
  FrenchDateTime2.WeekOfYearRegex = `(?<woy>(le\\s+)?(?<cardinal>premier|1er|duexi[\xE8e]me|2|troisi[\xE8e]me|3|quatri[\xE8e]me|4|cinqi[\xE8e]me|5)\\s+semaine(\\s+de)?\\s+(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.RelativeRegex}\\s+ann[\xE9e]e))`;
  FrenchDateTime2.FollowedDateUnit = `^\\s*${FrenchDateTime2.DateUnitRegex}`;
  FrenchDateTime2.NumberCombinedWithDateUnit = `\\b(?<num>\\d+(\\.\\d*)?)${FrenchDateTime2.DateUnitRegex}`;
  FrenchDateTime2.QuarterRegex = `(le\\s+)?(?<cardinal>premier|1er|duexi[\xE8e]me|2|troisi[\xE8e]me|3|quatri[\xE8e]me|4)\\s+quart(\\s+de|\\s*,\\s*)?\\s+(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.RelativeRegex}\\s+l'ann[e\xE9]e)`;
  FrenchDateTime2.QuarterRegexYearFront = `(${FrenchDateTime2.YearRegex}|l'ann\xE9e\\s+(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex})|${FrenchDateTime2.RelativeRegex}\\s+ann[e\xE9]e)\\s+(le\\s+)?(?<cardinal>premier|1er|duexi[\xE8e]me|2|troisi[\xE8e]me|3|quatri[\xE8e]me|4)\\s+quarts`;
  FrenchDateTime2.AllHalfYearRegex = `^[.]`;
  FrenchDateTime2.PrefixDayRegex = `^[.]`;
  FrenchDateTime2.CenturySuffixRegex = `^[.]`;
  FrenchDateTime2.SeasonRegex = `\\b((<seas>printemps|\xE9t\xE9|automne|hiver)+\\s*(${FrenchDateTime2.NextSuffixRegex}|${FrenchDateTime2.PastSuffixRegex}))|(?<season>(${FrenchDateTime2.RelativeRegex}\\s+)?(?<seas>printemps|[\xE9e]t[\xE9e]|automne|hiver)((\\s+de|\\s*,\\s*)?\\s+(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.RelativeRegex}\\s+l'ann[e\xE9]e))?)\\b`;
  FrenchDateTime2.WhichWeekRegex = `(semaine)(\\s*)(?<number>\\d\\d|\\d|0\\d)`;
  FrenchDateTime2.WeekOfRegex = `(semaine)(\\s*)(de)`;
  FrenchDateTime2.MonthOfRegex = `(mois)(\\s*)(de)`;
  FrenchDateTime2.MonthRegex = `(?<month>Avril|Avr|Avr\\.|Ao\xFBt|Aout|D[\xE9e]cembre|D[e\xE9]c|Dec\\.|F[e\xE9]vrier|F[e\xE9]vr|Fev|F[e\xE9]v|F[e\xE9]v\\.|Janvier|Janv\\.|Janv|Jan|Jan\\.|Juillet|Juil|Juil\\.|Juin|Mars|Mai|Novembre|Nov|Nov\\.|Octobre|Oct|Oct\\.|Septembre|Sep|Sept|Sept\\.)`;
  FrenchDateTime2.OnRegex = `(?<=\\b(en|sur\\s*l[ea]|sur)\\s+)(${FrenchDateTime2.DayRegex}s?)\\b`;
  FrenchDateTime2.RelaxedOnRegex = `(?<=\\b(en|le|dans|sur\\s*l[ea]|du|sur)\\s+)((?<day>10e|11e|12e|13e|14e|15e|16e|17e|18e|19e|1er|20e|21e|22e|23e|24e|25e|26e|27e|28e|29e|2e|30e|31e|3e|4e|5e|6e|7e|8e|9e)s?)\\b`;
  FrenchDateTime2.ThisRegex = `\\b((cette(\\s*semaine)?\\s+)${FrenchDateTime2.WeekDayRegex})|(${FrenchDateTime2.WeekDayRegex}(\\s+cette\\s*semaine))\\b`;
  FrenchDateTime2.LastDateRegex = `\\b((${FrenchDateTime2.WeekDayRegex}(\\s*(de)?\\s*la\\s*semaine\\s+${FrenchDateTime2.PastSuffixRegex}))|(${FrenchDateTime2.WeekDayRegex}(\\s+${FrenchDateTime2.PastSuffixRegex})))\\b`;
  FrenchDateTime2.NextDateRegex = `\\b((${FrenchDateTime2.WeekDayRegex}(\\s+${FrenchDateTime2.NextSuffixRegex}))|(${FrenchDateTime2.WeekDayRegex}(\\s*(de)?\\s*la\\s*semaine\\s+${FrenchDateTime2.NextSuffixRegex})))\\b`;
  FrenchDateTime2.SpecialDayRegex = `\\b(avant[\\s|-]hier|apr[e\xE8]s(-demain|\\s*demain)|(le\\s)?jour suivant|(le\\s+)?dernier jour|hier|lendemain|demain|de la journ[\xE9e]e|aujourd'hui)\\b`;
  FrenchDateTime2.SpecialDayWithNumRegex = `^[.]`;
  FrenchDateTime2.StrictWeekDay = `\\b(?<weekday>Dimanche|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Lun|Mar|Mer|Jeu|Ven|Sam|Dim)s?\\b`;
  FrenchDateTime2.SetWeekDayRegex = `\\b(?<prefix>le\\s+)?(?<weekday>matin|matin[\xE9e]e|apres-midi|soir[\xE9e]e|soir|Dimanche|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi)s\\b`;
  FrenchDateTime2.WeekDayOfMonthRegex = `(?<wom>(le\\s+)?(?<cardinal>premier|1er|duexi[\xE8e]me|2|troisi[\xE8e]me|3|quatri[\xE8e]me|4|cinqi[\xE8e]me|5)\\s+${FrenchDateTime2.WeekDayRegex}\\s+${FrenchDateTime2.MonthSuffixRegex})`;
  FrenchDateTime2.RelativeWeekDayRegex = `^[.]`;
  FrenchDateTime2.NumberEndingPattern = `^[.]`;
  FrenchDateTime2.SpecialDate = `(?<=\\b([\xE0a]|au|le)\\s+)${FrenchDateTime2.DayRegex}\\b`;
  FrenchDateTime2.DateYearRegex = `(?<year>${FrenchDateTime2.YearRegex}|${FrenchDateTime2.TwoDigitYearRegex})`;
  FrenchDateTime2.DateExtractor1 = `\\b(${FrenchDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${FrenchDateTime2.MonthRegex}\\s*[/\\\\\\.\\-]?\\s*${FrenchDateTime2.DayRegex}\\b`;
  FrenchDateTime2.DateExtractor2 = `\\b(${FrenchDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${FrenchDateTime2.DayRegex}(\\s+|\\s*,\\s*|\\s+)${FrenchDateTime2.MonthRegex}\\s*[\\.\\-]?\\s*${FrenchDateTime2.DateYearRegex}\\b`;
  FrenchDateTime2.DateExtractor3 = `\\b(${FrenchDateTime2.WeekDayRegex}(\\s+|\\s*,\\s*))?${FrenchDateTime2.DayRegex}(\\s+|\\s*,\\s*|\\s*-\\s*)${FrenchDateTime2.MonthRegex}((\\s+|\\s*,\\s*)${FrenchDateTime2.DateYearRegex})?\\b`;
  FrenchDateTime2.DateExtractor4 = `\\b${FrenchDateTime2.MonthNumRegex}\\s*[/\\\\\\-]\\s*${FrenchDateTime2.DayRegex}\\s*[/\\\\\\-]\\s*${FrenchDateTime2.DateYearRegex}`;
  FrenchDateTime2.DateExtractor5 = `\\b${FrenchDateTime2.DayRegex}\\s*[/\\\\\\-\\.]\\s*${FrenchDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${FrenchDateTime2.DateYearRegex}`;
  FrenchDateTime2.DateExtractor6 = `(?<=\\b(le|sur|sur l[ae])\\s+)${FrenchDateTime2.MonthNumRegex}[\\-\\.\\/]${FrenchDateTime2.DayRegex}\\b`;
  FrenchDateTime2.DateExtractor7 = `\\b${FrenchDateTime2.DayRegex}\\s*/\\s*${FrenchDateTime2.MonthNumRegex}((\\s+|\\s*,\\s*)${FrenchDateTime2.DateYearRegex})?\\b`;
  FrenchDateTime2.DateExtractor8 = `(?<=\\b(le)\\s+)${FrenchDateTime2.DayRegex}[\\\\\\-]${FrenchDateTime2.MonthNumRegex}\\b`;
  FrenchDateTime2.DateExtractor9 = `\\b${FrenchDateTime2.DayRegex}\\s*/\\s*${FrenchDateTime2.MonthNumRegex}((\\s+|\\s*,\\s*)${FrenchDateTime2.DateYearRegex})?\\b`;
  FrenchDateTime2.DateExtractorA = `\\b${FrenchDateTime2.DateYearRegex}\\s*[/\\\\\\-\\.]\\s*${FrenchDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${FrenchDateTime2.DayRegex}`;
  FrenchDateTime2.OfMonth = `^\\s*de\\s*${FrenchDateTime2.MonthRegex}`;
  FrenchDateTime2.MonthEnd = `${FrenchDateTime2.MonthRegex}\\s*(le)?\\s*$`;
  FrenchDateTime2.WeekDayEnd = `${FrenchDateTime2.WeekDayRegex}\\s*,?\\s*$`;
  FrenchDateTime2.RangeUnitRegex = `\\b(?<unit>l'ann\xE9e|ann[e\xE9]e(s)?|mois|semaines|semaine)\\b`;
  FrenchDateTime2.HourNumRegex = `\\b(?<hournum>zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|dix-six|dix-sept|dix-huit|dix-neuf|vingt|vingt-et-un|vingt-deux|vingt-trois)\\b`;
  FrenchDateTime2.MinuteNumRegex = `(?<minnum>un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|vingt|trente|quarante|cinquante)`;
  FrenchDateTime2.DeltaMinuteNumRegex = `(?<deltaminnum>un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|vingt|trente|quarante|cinquante)`;
  FrenchDateTime2.OclockRegex = `(?<oclock>heure|heures|h)`;
  FrenchDateTime2.PmRegex = `(?<pm>(dans l'\\s*)?apr[e\xE8]s(\\s*|-)midi|(du|ce|de|le)\\s*(soir[\xE9e]e|soir)|(dans l[ea]\\s+)?(nuit|soir[e\xE9]e))`;
  FrenchDateTime2.AmRegex = `(?<am>(du|de|ce|(du|de|dans)\\s*l[ea]|le)?\\s*matin[\xE9e]e|(du|de|ce|dans l[ea]|le)?\\s*matin)`;
  FrenchDateTime2.LessThanOneHour = `(?<lth>(une\\s+)?quart|trois quart(s)?|demie( heure)?|${exports.BaseDateTime.DeltaMinuteRegex}(\\s+(minute|minutes|min|mins))|${FrenchDateTime2.DeltaMinuteNumRegex}(\\s+(minute|minutes|min|mins)))`;
  FrenchDateTime2.WrittenTimeRegex = `(?<writtentime>${FrenchDateTime2.HourNumRegex}\\s+(${FrenchDateTime2.MinuteNumRegex}|(?<tens>vingt|trente|quarante|cinquante)\\s+${FrenchDateTime2.MinuteNumRegex}))`;
  FrenchDateTime2.TimePrefix = `(?<prefix>(heures\\s*et\\s+${FrenchDateTime2.LessThanOneHour}|et ${FrenchDateTime2.LessThanOneHour}|${FrenchDateTime2.LessThanOneHour} [\xE0a]))`;
  FrenchDateTime2.TimeSuffix = `(?<suffix>${FrenchDateTime2.AmRegex}|${FrenchDateTime2.PmRegex}|${FrenchDateTime2.OclockRegex})`;
  FrenchDateTime2.BasicTime = `(?<basictime>${FrenchDateTime2.WrittenTimeRegex}|${FrenchDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}:${exports.BaseDateTime.MinuteRegex}(:${exports.BaseDateTime.SecondRegex})?|${exports.BaseDateTime.HourRegex})`;
  FrenchDateTime2.MidnightRegex = `(?<midnight>minuit)`;
  FrenchDateTime2.CommonDatePrefixRegex = `^[\\.]`;
  FrenchDateTime2.MorningRegex = `(?<morning>matin[\xE9e]e|matin)`;
  FrenchDateTime2.AfternoonRegex = `(?<afternoon>(d'|l')?apr[e\xE8]s(-|\\s*)midi)`;
  FrenchDateTime2.MidmorningRegex = `(?<midmorning>milieu\\s*d[ue]\\s*${FrenchDateTime2.MorningRegex})`;
  FrenchDateTime2.MiddayRegex = `(?<midday>milieu(\\s*|-)d[eu]\\s*(jour|midi)|apr[e\xE8]s(-|\\s*)midi)`;
  FrenchDateTime2.MidafternoonRegex = `(?<midafternoon>milieu\\s*d'+${FrenchDateTime2.AfternoonRegex})`;
  FrenchDateTime2.MidTimeRegex = `(?<mid>(${FrenchDateTime2.MidnightRegex}|${FrenchDateTime2.MidmorningRegex}|${FrenchDateTime2.MidafternoonRegex}|${FrenchDateTime2.MiddayRegex}))`;
  FrenchDateTime2.AtRegex = `\\b(((?<=\\b[\xE0a]\\s+)(${FrenchDateTime2.WrittenTimeRegex}|${FrenchDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex}|${FrenchDateTime2.MidTimeRegex}))|${FrenchDateTime2.MidTimeRegex})\\b`;
  FrenchDateTime2.IshRegex = `\\b(peu\\s*pr[\xE8e]s\\s*${exports.BaseDateTime.HourRegex}|peu\\s*pr[\xE8e]s\\s*${FrenchDateTime2.WrittenTimeRegex}|peu\\s*pr[\xE8e]s\\s*[\xE0a]\\s*${exports.BaseDateTime.HourRegex}|peu pr[\xE8e]s midi)\\b`;
  FrenchDateTime2.TimeUnitRegex = `(?<unit>heures|heure|hrs|hr|h|minutes|minute|mins|min|secondes|seconde|secs|sec)\\b`;
  FrenchDateTime2.RestrictedTimeUnitRegex = `(?<unit>huere|minute)\\b`;
  FrenchDateTime2.ConnectNumRegex = `${exports.BaseDateTime.HourRegex}(?<min>00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59)\\s*${FrenchDateTime2.DescRegex}`;
  FrenchDateTime2.FivesRegex = `(?<tens>(quinze|vingt(\\s*|-*(cinq))?|trente(\\s*|-*(cinq))?|quarante(\\s*|-*(cinq))??|cinquante(\\s*|-*(cinq))?|dix|cinq))\\b`;
  FrenchDateTime2.PeriodHourNumRegex = `(?<hour>vingt-et-un|vingt-deux|vingt-trois|vingt-quatre|zero|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|vingt)`;
  FrenchDateTime2.TimeRegex1 = `\\b(${FrenchDateTime2.WrittenTimeRegex}|${FrenchDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*${FrenchDateTime2.DescRegex}(\\s+${FrenchDateTime2.TimePrefix})?`;
  FrenchDateTime2.TimeRegex2 = `(\\b${FrenchDateTime2.TimePrefix}\\s+)?(T)?${exports.BaseDateTime.HourRegex}(\\s*)?:(\\s*)?${exports.BaseDateTime.MinuteRegex}((\\s*)?:(\\s*)?${exports.BaseDateTime.SecondRegex})?((\\s*${FrenchDateTime2.DescRegex})|\\b)`;
  FrenchDateTime2.TimeRegex3 = `\\b${exports.BaseDateTime.HourRegex}\\.${exports.BaseDateTime.MinuteRegex}(\\s*${FrenchDateTime2.DescRegex})(\\s+${FrenchDateTime2.TimePrefix})?`;
  FrenchDateTime2.TimeRegex4 = `\\b${FrenchDateTime2.BasicTime}(\\s*${FrenchDateTime2.DescRegex})?(\\s+${FrenchDateTime2.TimePrefix})?\\s+${FrenchDateTime2.TimeSuffix}\\b`;
  FrenchDateTime2.TimeRegex5 = `\\b${FrenchDateTime2.BasicTime}((\\s*${FrenchDateTime2.DescRegex})|\\b)(\\s+${FrenchDateTime2.TimePrefix})?`;
  FrenchDateTime2.TimeRegex6 = `${FrenchDateTime2.BasicTime}(\\s*${FrenchDateTime2.DescRegex})?\\s+${FrenchDateTime2.TimeSuffix}\\b`;
  FrenchDateTime2.TimeRegex7 = `\\b${FrenchDateTime2.TimeSuffix}\\s+[\xE0a]\\s+${FrenchDateTime2.BasicTime}((\\s*${FrenchDateTime2.DescRegex})|\\b)`;
  FrenchDateTime2.TimeRegex8 = `\\b${FrenchDateTime2.TimeSuffix}\\s+${FrenchDateTime2.BasicTime}((\\s*${FrenchDateTime2.DescRegex})|\\b)`;
  FrenchDateTime2.TimeRegex9 = `\\b${FrenchDateTime2.PeriodHourNumRegex}\\s+${FrenchDateTime2.FivesRegex}((\\s*${FrenchDateTime2.DescRegex})|\\b)`;
  FrenchDateTime2.TimeRegex10 = `\\b${exports.BaseDateTime.HourRegex}(\\s*h\\s*)${exports.BaseDateTime.MinuteRegex}(\\s*${FrenchDateTime2.DescRegex})?(\\s+${FrenchDateTime2.TimePrefix})?`;
  FrenchDateTime2.HourRegex = `\\b${exports.BaseDateTime.HourRegex}`;
  FrenchDateTime2.PeriodDescRegex = `(?<desc>pm|am|p\\.m\\.|a\\.m\\.|p)`;
  FrenchDateTime2.PeriodPmRegex = `(?<pm>dans l'apr[e\xE8]s-midi|ce soir|d[eu] soir|dans l[ea] soir[e\xE9]e|dans la nuit|d[eu] soir[\xE9e]e)s?`;
  FrenchDateTime2.PeriodAmRegex = `(?<am>matin|d[eu] matin|matin[\xE9e]e)s?`;
  FrenchDateTime2.PureNumFromTo = `((du|de|des|depuis)\\s+)?(${FrenchDateTime2.HourRegex}|${FrenchDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${FrenchDateTime2.PeriodDescRegex}))?\\s*${FrenchDateTime2.TillRegex}\\s*(${FrenchDateTime2.HourRegex}|${FrenchDateTime2.PeriodHourNumRegex})\\s*(?<rightDesc>${FrenchDateTime2.PmRegex}|${FrenchDateTime2.AmRegex}|${FrenchDateTime2.PeriodDescRegex})?`;
  FrenchDateTime2.PureNumBetweenAnd = `(entre\\s+)(${FrenchDateTime2.HourRegex}|${FrenchDateTime2.PeriodHourNumRegex})(\\s*(?<leftDesc>${FrenchDateTime2.PeriodDescRegex}))?\\s*${FrenchDateTime2.RangeConnectorRegex}\\s*(${FrenchDateTime2.HourRegex}|${FrenchDateTime2.PeriodHourNumRegex})\\s*(?<rightDesc>${FrenchDateTime2.PmRegex}|${FrenchDateTime2.AmRegex}|${FrenchDateTime2.PeriodDescRegex})?`;
  FrenchDateTime2.SpecificTimeFromTo = `^[.]`;
  FrenchDateTime2.SpecificTimeBetweenAnd = `^[.]`;
  FrenchDateTime2.PrepositionRegex = `(?<prep>^([a\xE0] la|en|sur\\s*l[ea]|sur|de)$)`;
  FrenchDateTime2.TimeOfDayRegex = `\\b(?<timeOfDay>((((dans\\s+(l[ea])?\\s+)?((?<early>d[e\xE9]but(\\s+|-)|t[o\xF4]t(\\s+|-)(l[ea]\\s*)?)|(?<late>fin\\s*|fin de(\\s+(la)?)|tard\\s*))?(matin[\xE9e]e|matin|((d|l)?'?)apr[e\xE8]s[-|\\s*]midi|nuit|soir[e\xE9]e|soir)))|(((\\s+(l[ea])?\\s+)?)(jour|journ[e\xE9]e)))s?)\\b`;
  FrenchDateTime2.SpecificTimeOfDayRegex = `\\b((${FrenchDateTime2.RelativeRegex}\\s+${FrenchDateTime2.TimeOfDayRegex})|(${FrenchDateTime2.TimeOfDayRegex}\\s*(${FrenchDateTime2.NextSuffixRegex}))\\b|\\bsoir|\\bdu soir)s?\\b`;
  FrenchDateTime2.TimeFollowedUnit = `^\\s*${FrenchDateTime2.TimeUnitRegex}`;
  FrenchDateTime2.TimeNumberCombinedWithUnit = `\\b(?<num>\\d+(\\.\\d*)?)${FrenchDateTime2.TimeUnitRegex}`;
  FrenchDateTime2.NowRegex = `\\b(?<now>(ce\\s+)?moment|maintenant|d[e\xE8]s que possible|dqp|r[e\xE9]cemment|auparavant)\\b`;
  FrenchDateTime2.SuffixRegex = `^\\s*(dans\\s+l[ea]\\s+)|(en\\s+)|(du)?(matin|matin([e\xE9]e)?|apr[e\xE8]s-midi|soir[e\xE9]e|nuit)\\b`;
  FrenchDateTime2.DateTimeTimeOfDayRegex = `\\b(?<timeOfDay>matin[\xE9e]e|matin|apr[e\xE8]s-midi|nuit|soir)\\b`;
  FrenchDateTime2.DateTimeSpecificTimeOfDayRegex = `\\b((${FrenchDateTime2.RelativeRegex}\\s+${FrenchDateTime2.DateTimeTimeOfDayRegex})\\b|\\b(ce|cette\\s+)(soir|nuit))\\b`;
  FrenchDateTime2.TimeOfTodayAfterRegex = `^\\s*(,\\s*)?(en|dans|du\\s+)?${FrenchDateTime2.DateTimeSpecificTimeOfDayRegex}`;
  FrenchDateTime2.TimeOfTodayBeforeRegex = `${FrenchDateTime2.DateTimeSpecificTimeOfDayRegex}(\\s*,)?(\\s+([\xE0a]|pour))?\\s*$`;
  FrenchDateTime2.SimpleTimeOfTodayAfterRegex = `(${FrenchDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})\\s*(,\\s*)?(en|[\xE0a]\\s+)?${FrenchDateTime2.DateTimeSpecificTimeOfDayRegex}`;
  FrenchDateTime2.SimpleTimeOfTodayBeforeRegex = `${FrenchDateTime2.DateTimeSpecificTimeOfDayRegex}(\\s*,)?(\\s+([\xE0a]|vers))?\\s*(${FrenchDateTime2.HourNumRegex}|${exports.BaseDateTime.HourRegex})`;
  FrenchDateTime2.TheEndOfRegex = `(la\\s+)?fin(\\s+de\\s*|\\s*de*l[ea])?\\s*$`;
  FrenchDateTime2.PeriodTimeOfDayRegex = `\\b((dans\\s+(le)?\\s+)?((?<early>d[e\xE9]but(\\s+|-|d[ue]|de la)|t[o\xF4]t)|(?<late>tard\\s*|fin(\\s+|-|d[eu])?))?(?<timeOfDay>matin|((d|l)?'?)apr[e\xE8]s-midi|nuit|soir[e\xE9]e|soir))\\b`;
  FrenchDateTime2.PeriodSpecificTimeOfDayRegex = `\\b((${FrenchDateTime2.RelativeRegex}\\s+${FrenchDateTime2.PeriodTimeOfDayRegex})\\b|\\b(ce|cette\\s+)(soir|nuit))\\b`;
  FrenchDateTime2.PeriodTimeOfDayWithDateRegex = `\\b((${FrenchDateTime2.TimeOfDayRegex}))\\b`;
  FrenchDateTime2.LessThanRegex = `^[.]`;
  FrenchDateTime2.MoreThanRegex = `^[.]`;
  FrenchDateTime2.DurationUnitRegex = `(?<unit>ans|ann[e\xE9]e|mois|semaines|semaine|jour|jours|heures|heure|hrs|hr|h|minutes|minute|mins|min|secondes|seconde|secs|sec|ann[e\xE9]es|journ[e\xE9]e)\\b`;
  FrenchDateTime2.SuffixAndRegex = `(?<suffix>\\s*(et)\\s+((un|une)\\s+)?(?<suffix_num>demi|quart))`;
  FrenchDateTime2.PeriodicRegex = `\\b(?<periodic>quotidienne|quotidien|journellement|mensuel|mensuelle|jour|jours|hebdomadaire|bihebdomadaire|annuellement|annuel)\\b`;
  FrenchDateTime2.EachUnitRegex = `(?<each>(chaque|toutes les|tous les)(?<other>\\s+autres)?\\s*${FrenchDateTime2.DurationUnitRegex})`;
  FrenchDateTime2.EachPrefixRegex = `\\b(?<each>(chaque|tous les|(toutes les))\\s*$)`;
  FrenchDateTime2.SetEachRegex = `\\b(?<each>(chaque|tous les|(toutes les))\\s*)`;
  FrenchDateTime2.SetLastRegex = `(?<last>prochain|dernier|derni[e\xE8]re|pass[\xE9e]s|pr[e\xE9]c[e\xE9]dent|courant|en\\s*cours)`;
  FrenchDateTime2.EachDayRegex = `^\\s*(chaque|tous les)\\s*(jour|jours)\\b`;
  FrenchDateTime2.DurationFollowedUnit = `^\\s*${FrenchDateTime2.SuffixAndRegex}?(\\s+|-)?${FrenchDateTime2.DurationUnitRegex}`;
  FrenchDateTime2.NumberCombinedWithDurationUnit = `\\b(?<num>\\d+(\\.\\d*)?)(-)?${FrenchDateTime2.DurationUnitRegex}`;
  FrenchDateTime2.AnUnitRegex = `\\b(((?<half>demi\\s+)?(-)\\s+${FrenchDateTime2.DurationUnitRegex}))`;
  FrenchDateTime2.DuringRegex = `^[.]`;
  FrenchDateTime2.AllRegex = `\\b(?<all>toute\\s(l['ea])\\s?(?<unit>ann[e\xE9]e|mois|semaine|semaines|jour|jours|journ[e\xE9]e))\\b`;
  FrenchDateTime2.HalfRegex = `(((un|une)\\s*)|\\b)(?<half>demi?(\\s*|-)+(?<unit>ann[e\xE9]e|ans|mois|semaine|jour|heure))\\b`;
  FrenchDateTime2.ConjunctionRegex = `\\b((et(\\s+de|pour)?)|avec)\\b`;
  FrenchDateTime2.HolidayRegex1 = `\\b(?<holiday>vendredi saint|mercredi des cendres|p[a\xE2]ques|l'action de gr[\xE2a]ce|mardi gras|la saint-sylvestre|la saint sylvestre|la Saint-Valentin|la saint valentin|nouvel an chinois|nouvel an|r[e\xE9]veillon de Nouvel an|jour de l'an|premier-mai|ler-mai|1-mai|poisson d'avril|r[e\xE9]veillon de No[e\xEB]l|veille de no[e\xEB]l|no\xEBl|noel|thanksgiving|halloween|yuandan)(\\s+((d[ue]\\s+|d'))?(${FrenchDateTime2.YearRegex}|(${FrenchDateTime2.ThisPrefixRegex}\\s+)ann[e\xE9]e|ann[e\xE9]e\\s+(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex})))?\\b`;
  FrenchDateTime2.HolidayRegex2 = `\\b(?<holiday>martin luther king|martin luther king jr|toussaint|st patrick|st george|cinco de mayo|l'ind[e\xE9]pendance|guy fawkes)(\\s+(de\\s+)?(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.ThisPrefixRegex}\\s+ann[e\xE9]e|ann[e\xE9]e\\s+(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex})))?\\b`;
  FrenchDateTime2.HolidayRegex3 = `(?<holiday>(jour\\s*(d[eu]|des)\\s*(canberra|p[a\xE2]ques|colomb|bastille|la prise de la bastille|l'ind[e\xE9]pendance|l'ind[e\xE9]pendance am[e\xE9]ricaine|thanks\\s*giving|bapt[\xEAe]me|nationale|d'armistice|inaugueration|marmotte|assomption|femme|comm[\xE9e]moratif)))(\\s+(de\\s+)?(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.ThisPrefixRegex}\\s+ann[e\xE9]e|ann[e\xE9]e\\s+(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex})))?`;
  FrenchDateTime2.HolidayRegex4 = `(?<holiday>(F[e\xEA]te\\s*(d[eu]|des)\\s*)(travail|m[e\xE8]re|m[e\xE8]res|p[e\xE8]re|p[e\xE8]res))(\\s+(de\\s+)?(${FrenchDateTime2.YearRegex}|${FrenchDateTime2.ThisPrefixRegex}\\s+ann[e\xE9]e|ann[e\xE9]e\\s+(${FrenchDateTime2.PastSuffixRegex}|${FrenchDateTime2.NextSuffixRegex})))?\\b`;
  FrenchDateTime2.DateTokenPrefix = "le ";
  FrenchDateTime2.TimeTokenPrefix = "\xE0 ";
  FrenchDateTime2.TokenBeforeDate = "le ";
  FrenchDateTime2.TokenBeforeTime = "\xE0 ";
  FrenchDateTime2.AMTimeRegex = `(?<am>matin[\xE9e]e|matin)`;
  FrenchDateTime2.PMTimeRegex = `\\b(?<pm>(d'|l')?apr[e\xE8]s-midi|soir|nuit|\\s*ce soir|du soir)\\b`;
  FrenchDateTime2.BeforeRegex = `\\b(avant)\\b`;
  FrenchDateTime2.BeforeRegex2 = `\\b(entre\\s*(le|la(s)?)?)\\b`;
  FrenchDateTime2.AfterRegex = `\\b(apres)\\b`;
  FrenchDateTime2.SinceRegex = `\\b(depuis)\\b`;
  FrenchDateTime2.AroundRegex = `^[.]`;
  FrenchDateTime2.AgoPrefixRegex = `\\b(y a)\\b`;
  FrenchDateTime2.LaterRegex = `\\b(plus tard)\\b`;
  FrenchDateTime2.AgoRegex = `^[.]`;
  FrenchDateTime2.InConnectorRegex = `\\b(dans|en|sur)\\b`;
  FrenchDateTime2.WithinNextPrefixRegex = `^[.]`;
  FrenchDateTime2.MorningStartEndRegex = `(^(matin))|((matin)$)`;
  FrenchDateTime2.AfternoonStartEndRegex = `(^((d'|l')?apr[e\xE8]s-midi))|(((d'|l')?apr[e\xE8]s-midi)$)`;
  FrenchDateTime2.EveningStartEndRegex = `(^(soir[\xE9e]e|soir))|((soir[\xE9e]e|soir)$)`;
  FrenchDateTime2.NightStartEndRegex = `(^(nuit))|((nuit)$)`;
  FrenchDateTime2.InexactNumberRegex = `\\b(quelque|quel qu[\xE9e]s|quelqu[\xE9e]s|plusieur|plusieurs|divers)\\b`;
  FrenchDateTime2.InexactNumberUnitRegex = `(${FrenchDateTime2.InexactNumberRegex})\\s+(${FrenchDateTime2.DurationUnitRegex})`;
  FrenchDateTime2.RelativeTimeUnitRegex = `((((${FrenchDateTime2.ThisPrefixRegex})?)\\s+(${FrenchDateTime2.TimeUnitRegex}(\\s*${FrenchDateTime2.NextSuffixRegex}|${FrenchDateTime2.PastSuffixRegex})?))|((le))\\s+(${FrenchDateTime2.RestrictedTimeUnitRegex}))`;
  FrenchDateTime2.RelativeDurationUnitRegex = `(((?<=(${FrenchDateTime2.ThisPrefixRegex})\\s+)?\\b(${FrenchDateTime2.DurationUnitRegex})(\\s+${FrenchDateTime2.NextSuffixRegex}|${FrenchDateTime2.PastSuffixRegex})?)|((le|my))\\s+(${FrenchDateTime2.RestrictedTimeUnitRegex}))`;
  FrenchDateTime2.ReferenceDatePeriodRegex = `^[.]`;
  FrenchDateTime2.ConnectorRegex = `^(,|pour|t|vers)$`;
  FrenchDateTime2.ConnectorAndRegex = `\\b(et\\s*(le|la(s)?)?)\\b.+`;
  FrenchDateTime2.FromRegex = `((de|du)?)$`;
  FrenchDateTime2.FromRegex2 = `((depuis|de)(\\s*la(s)?)?)$`;
  FrenchDateTime2.FromToRegex = `\\b(du|de|des|depuis).+(\xE0|a|au)\\b.+`;
  FrenchDateTime2.SingleAmbiguousMonthRegex = `^(le\\s+)?(may|march)$`;
  FrenchDateTime2.UnspecificDatePeriodRegex = `^[.]`;
  FrenchDateTime2.PrepositionSuffixRegex = `\\b(du|de|[\xE0a]|vers|dans)$`;
  FrenchDateTime2.FlexibleDayRegex = `(?<DayOfMonth>([A-Za-z]+\\s)?[A-Za-z\\d]+)`;
  FrenchDateTime2.ForTheRegex = `\\b(((pour le ${FrenchDateTime2.FlexibleDayRegex})|(dans (le\\s+)?${FrenchDateTime2.FlexibleDayRegex}(?<=(st|nd|rd|th))))(?<end>\\s*(,|\\.|!|\\?|$)))`;
  FrenchDateTime2.WeekDayAndDayOfMonthRegex = `\\b${FrenchDateTime2.WeekDayRegex}\\s+(le\\s+${FrenchDateTime2.FlexibleDayRegex})\\b`;
  FrenchDateTime2.RestOfDateRegex = `\\b(Reste|fin)\\s+(d[eu]\\s+)?((le|cette|ce)\\s+)?(?<duration>semaine|mois|l'ann[\xE9e]e)\\b`;
  FrenchDateTime2.RestOfDateTimeRegex = `\\b(Reste|fin)\\s+(d[eu]\\s+)?((le|cette|ce)\\s+)?(?<unit>jour)\\b`;
  FrenchDateTime2.LaterEarlyPeriodRegex = `^[.]`;
  FrenchDateTime2.WeekWithWeekDayRangeRegex = `^[.]`;
  FrenchDateTime2.GeneralEndingRegex = `^[.]`;
  FrenchDateTime2.MiddlePauseRegex = `^[.]`;
  FrenchDateTime2.DurationConnectorRegex = `^[.]`;
  FrenchDateTime2.PrefixArticleRegex = `^[\\.]`;
  FrenchDateTime2.OrRegex = `^[.]`;
  FrenchDateTime2.YearPlusNumberRegex = `^[.]`;
  FrenchDateTime2.NumberAsTimeRegex = `^[.]`;
  FrenchDateTime2.TimeBeforeAfterRegex = `^[.]`;
  FrenchDateTime2.DateNumberConnectorRegex = `^[.]`;
  FrenchDateTime2.CenturyRegex = `^[.]`;
  FrenchDateTime2.DecadeRegex = `^[.]`;
  FrenchDateTime2.DecadeWithCenturyRegex = `^[.]`;
  FrenchDateTime2.RelativeDecadeRegex = `^[.]`;
  FrenchDateTime2.YearSuffix = `(,?\\s*(${FrenchDateTime2.DateYearRegex}|${FrenchDateTime2.FullTextYearRegex}))`;
  FrenchDateTime2.YearAfterRegex = `^[.]`;
  FrenchDateTime2.YearPeriodRegex = `^[.]`;
  FrenchDateTime2.FutureSuffixRegex = `^[.]`;
  FrenchDateTime2.ComplexDatePeriodRegex = `^[.]`;
  FrenchDateTime2.UnitMap = /* @__PURE__ */ new Map([["annees", "Y"], ["annee", "Y"], ["ans", "Y"], ["mois", "MON"], ["semaines", "W"], ["semaine", "W"], ["journees", "D"], ["journee", "D"], ["jour", "D"], ["jours", "D"], ["heures", "H"], ["heure", "H"], ["hrs", "H"], ["hr", "H"], ["h", "H"], ["minutes", "M"], ["minute", "M"], ["mins", "M"], ["min", "M"], ["secondes", "S"], ["seconde", "S"], ["secs", "S"], ["sec", "S"]]);
  FrenchDateTime2.UnitValueMap = /* @__PURE__ */ new Map([["annees", 31536e3], ["annee", 31536e3], ["l'annees", 31536e3], ["l'annee", 31536e3], ["ans", 31536e3], ["mois", 2592e3], ["semaines", 604800], ["semaine", 604800], ["journees", 86400], ["journee", 86400], ["jour", 86400], ["jours", 86400], ["heures", 3600], ["heure", 3600], ["hrs", 3600], ["hr", 3600], ["h", 3600], ["minutes", 60], ["minute", 60], ["mins", 60], ["min", 60], ["secondes", 1], ["seconde", 1], ["secs", 1], ["sec", 1]]);
  FrenchDateTime2.SeasonMap = /* @__PURE__ */ new Map([["printemps", "SP"], ["\xE9t\xE9", "SU"], ["automne", "FA"], ["hiver", "WI"]]);
  FrenchDateTime2.SeasonValueMap = /* @__PURE__ */ new Map([["SP", 3], ["SU", 6], ["FA", 9], ["WI", 12]]);
  FrenchDateTime2.CardinalMap = /* @__PURE__ */ new Map([["premier", 1], ["1er", 1], ["deuxi\xE8me", 2], ["2e", 2], ["troisi\xE8me", 3], ["troisieme", 3], ["3e", 3], ["quatri\xE8me", 4], ["4e", 4], ["cinqi\xE8me", 5], ["5e", 5]]);
  FrenchDateTime2.DayOfWeek = /* @__PURE__ */ new Map([["lundi", 1], ["mardi", 2], ["mercredi", 3], ["jeudi", 4], ["vendredi", 5], ["samedi", 6], ["dimanche", 0], ["lun", 1], ["mar", 2], ["mer", 3], ["jeu", 4], ["ven", 5], ["sam", 6], ["dim", 0]]);
  FrenchDateTime2.MonthOfYear = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["janvier", 1], ["fevrier", 2], ["f\xE9vrier", 2], ["mars", 3], ["mar", 3], ["avril", 4], ["avr", 4], ["mai", 5], ["juin", 6], ["jun", 6], ["juillet", 7], ["aout", 8], ["ao\xFBt", 8], ["septembre", 9], ["octobre", 10], ["novembre", 11], ["decembre", 12], ["d\xE9cembre", 12], ["janv", 1], ["janv.", 1], ["jan", 1], ["fevr", 2], ["fevr.", 2], ["f\xE9vr.", 2], ["f\xE9vr", 2], ["fev", 2], ["juil", 7], ["jul", 7], ["sep", 9], ["sept.", 9], ["sept", 9], ["oct", 10], ["oct.", 10], ["nov", 11], ["nov.", 11], ["dec", 12], ["d\xE9c.", 12], ["d\xE9c", 12], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9]]);
  FrenchDateTime2.Numbers = /* @__PURE__ */ new Map([["zero", 0], ["un", 1], ["une", 1], ["a", 1], ["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5], ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10], ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15], ["seize", 16], ["dix-sept", 17], ["dix-huit", 18], ["dix-neuf", 19], ["vingt-et-un", 21], ["vingt et un", 21], ["vingt", 20], ["vingt deux", 22], ["vingt-deux", 22], ["vingt trois", 23], ["vingt-trois", 23], ["vingt quatre", 24], ["vingt-quatre", 24], ["vingt cinq", 25], ["vingt-cinq", 25], ["vingt six", 26], ["vingt-six", 26], ["vingt sept", 27], ["vingt-sept", 27], ["vingt huit", 28], ["vingt-huit", 28], ["vingt neuf", 29], ["vingt-neuf", 29], ["trente", 30], ["trente et un", 31], ["trente-et-un", 31], ["trente deux", 32], ["trente-deux", 32], ["trente trois", 33], ["trente-trois", 33], ["trente quatre", 34], ["trente-quatre", 34], ["trente cinq", 35], ["trente-cinq", 35], ["trente six", 36], ["trente-six", 36], ["trente sept", 37], ["trente-sept", 37], ["trente huit", 38], ["trente-huit", 38], ["trente neuf", 39], ["trente-neuf", 39], ["quarante", 40], ["quarante et un", 41], ["quarante-et-un", 41], ["quarante deux", 42], ["quarante-duex", 42], ["quarante trois", 43], ["quarante-trois", 43], ["quarante quatre", 44], ["quarante-quatre", 44], ["quarante cinq", 45], ["quarante-cinq", 45], ["quarante six", 46], ["quarante-six", 46], ["quarante sept", 47], ["quarante-sept", 47], ["quarante huit", 48], ["quarante-huit", 48], ["quarante neuf", 49], ["quarante-neuf", 49], ["cinquante", 50], ["cinquante et un", 51], ["cinquante-et-un", 51], ["cinquante deux", 52], ["cinquante-deux", 52], ["cinquante trois", 53], ["cinquante-trois", 53], ["cinquante quatre", 54], ["cinquante-quatre", 54], ["cinquante cinq", 55], ["cinquante-cinq", 55], ["cinquante six", 56], ["cinquante-six", 56], ["cinquante sept", 57], ["cinquante-sept", 57], ["cinquante huit", 58], ["cinquante-huit", 58], ["cinquante neuf", 59], ["cinquante-neuf", 59], ["soixante", 60], ["soixante et un", 61], ["soixante-et-un", 61], ["soixante deux", 62], ["soixante-deux", 62], ["soixante trois", 63], ["soixante-trois", 63], ["soixante quatre", 64], ["soixante-quatre", 64], ["soixante cinq", 65], ["soixante-cinq", 65], ["soixante six", 66], ["soixante-six", 66], ["soixante sept", 67], ["soixante-sept", 67], ["soixante huit", 68], ["soixante-huit", 68], ["soixante neuf", 69], ["soixante-neuf", 69], ["soixante dix", 70], ["soixante-dix", 70], ["soixante et onze", 71], ["soixante-et-onze", 71], ["soixante douze", 72], ["soixante-douze", 72], ["soixante treize", 73], ["soixante-treize", 73], ["soixante quatorze", 74], ["soixante-quatorze", 74], ["soixante quinze", 75], ["soixante-quinze", 75], ["soixante seize", 76], ["soixante-seize", 76], ["soixante dix sept", 77], ["soixante-dix-sept", 77], ["soixante dix huit", 78], ["soixante-dix-huit", 78], ["soixante dix neuf", 79], ["soixante-dix-neuf", 79], ["quatre vingt", 80], ["quatre-vingt", 80], ["quatre vingt un", 81], ["quatre-vingt-un", 81], ["quatre vingt deux", 82], ["quatre-vingt-duex", 82], ["quatre vingt trois", 83], ["quatre-vingt-trois", 83], ["quatre vingt quatre", 84], ["quatre-vingt-quatre", 84], ["quatre vingt cinq", 85], ["quatre-vingt-cinq", 85], ["quatre vingt six", 86], ["quatre-vingt-six", 86], ["quatre vingt sept", 87], ["quatre-vingt-sept", 87], ["quatre vingt huit", 88], ["quatre-vingt-huit", 88], ["quatre vingt neuf", 89], ["quatre-vingt-neuf", 89], ["quatre vingt dix", 90], ["quatre-vingt-dix", 90], ["quatre vingt onze", 91], ["quatre-vingt-onze", 91], ["quatre vingt douze", 92], ["quatre-vingt-douze", 92], ["quatre vingt treize", 93], ["quatre-vingt-treize", 93], ["quatre vingt quatorze", 94], ["quatre-vingt-quatorze", 94], ["quatre vingt quinze", 95], ["quatre-vingt-quinze", 95], ["quatre vingt seize", 96], ["quatre-vingt-seize", 96], ["quatre vingt dix sept", 97], ["quatre-vingt-dix-sept", 97], ["quatre vingt dix huit", 98], ["quatre-vingt-dix-huit", 98], ["quatre vingt dix neuf", 99], ["quatre-vingt-dix-neuf", 99], ["cent", 100]]);
  FrenchDateTime2.DayOfMonth = /* @__PURE__ */ new Map([["1er", 1], ["2e", 2], ["3e", 3], ["4e", 4], ["5e", 5], ["6e", 6], ["7e", 7], ["8e", 8], ["9e", 9], ["10e", 10], ["11e", 11], ["12e", 12], ["13e", 13], ["14e", 14], ["15e", 15], ["16e", 16], ["17e", 17], ["18e", 18], ["19e", 19], ["20e", 20], ["21e", 21], ["22e", 22], ["23e", 23], ["24e", 24], ["25e", 25], ["26e", 26], ["27e", 27], ["28e", 28], ["29e", 29], ["30e", 30], ["31e", 31]]);
  FrenchDateTime2.DoubleNumbers = /* @__PURE__ */ new Map([["demi", 0.5], ["quart", 0.25]]);
  FrenchDateTime2.HolidayNames = /* @__PURE__ */ new Map([["fathers", ["peres", "p\xE8res", "f\xEAtedesp\xE8res", "fetedesperes"]], ["mothers", ["f\xEAtedesm\xE8res", "fetedesmeres"]], ["thanksgiving", ["lactiondegrace", "lactiondegr\xE2ce", "jourdethanksgiving", "thanksgiving"]], ["martinlutherking", ["journeemartinlutherking", "martinlutherkingjr"]], ["washingtonsbirthday", ["washingtonsbirthday", "washingtonbirthday"]], ["canberra", ["canberraday"]], ["labour", ["fetedetravail", "travail", "fetedutravail"]], ["columbus", ["columbusday"]], ["memorial", ["jourcomm\xE9moratif", "jourcommemoratif"]], ["yuandan", ["yuandan", "nouvelanchinois"]], ["maosbirthday", ["maosbirthday"]], ["teachersday", ["teachersday", "teacherday"]], ["singleday", ["singleday"]], ["allsaintsday", ["allsaintsday"]], ["youthday", ["youthday"]], ["childrenday", ["childrenday", "childday"]], ["femaleday", ["femaleday"]], ["treeplantingday", ["treeplantingday"]], ["arborday", ["arborday"]], ["girlsday", ["girlsday"]], ["whiteloverday", ["whiteloverday"]], ["loverday", ["loverday"]], ["christmas", ["noel", "no\xEBl"]], ["xmas", ["xmas"]], ["newyear", ["nouvellesannees", "nouvelan"]], ["newyearday", ["jourdunouvelan"]], ["newyearsday", ["jourdel'an", "jourpremierdelannee", "jourpremierdelann\xE9e"]], ["inaugurationday", ["jourd'inaugueration", "inaugueration"]], ["groundhougday", ["marmotte"]], ["valentinesday", ["lasaint-valentin", "lasaintvalentin"]], ["stpatrickday", ["stpatrickday"]], ["aprilfools", ["poissond'avril"]], ["stgeorgeday", ["stgeorgeday"]], ["mayday", ["premier-mai", "ler-mai", "1-mai"]], ["cincodemayoday", ["cincodemayo"]], ["baptisteday", ["bapteme", "bapt\xEAme"]], ["usindependenceday", ["l'independanceamericaine", "lind\xE9pendanceam\xE9ricaine"]], ["independenceday", ["l'ind\xE9pendance", "lindependance"]], ["bastilleday", ["laprisedelabastille", "bastille"]], ["halloweenday", ["halloween"]], ["allhallowday", ["allhallowday"]], ["allsoulsday", ["allsoulsday"]], ["guyfawkesday", ["guyfawkesday"]], ["veteransday", ["veteransday"]], ["christmaseve", ["reveillondenoel", "r\xE9veillondeno\xEBl", "veilledenoel", "veilledeno\xEBl"]], ["newyeareve", ["r\xE9veillondenouvelan", "reveillondenouvelan", "lasaint-sylvestre", "lasaintsylvestre"]]]);
  FrenchDateTime2.NightRegex = `\\b(minuit|nuit)\\b`;
  FrenchDateTime2.WrittenDecades = /* @__PURE__ */ new Map([["", 0]]);
  FrenchDateTime2.SpecialDecadeCases = /* @__PURE__ */ new Map([["", 0]]);
  FrenchDateTime2.DefaultLanguageFallback = "DMY";
  FrenchDateTime2.DurationDateRestrictions = [];
})(exports.FrenchDateTime || (exports.FrenchDateTime = {}));
var FrenchDurationExtractorConfiguration = class {
  constructor() {
    this.allRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AllRegex, "gis");
    this.halfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HalfRegex, "gis");
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DurationFollowedUnit, "gis");
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NumberCombinedWithDurationUnit, "gis");
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AnUnitRegex, "gis");
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.InexactNumberUnitRegex, "gis");
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SuffixAndRegex, "gis");
    this.relativeDurationUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeDurationUnitRegex, "gis");
    this.moreThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MoreThanRegex, "gis");
    this.lessThanRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LessThanOneHour, "gis");
    this.cardinalExtractor = new recognizersTextNumber.FrenchCardinalExtractor();
  }
};
var FrenchDurationParserConfiguration = class {
  constructor(config) {
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DurationFollowedUnit);
    this.suffixAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SuffixAndRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NumberCombinedWithDurationUnit);
    this.anUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AnUnitRegex);
    this.allDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AllRegex);
    this.halfDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HalfRegex);
    this.inexactNumberUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.InexactNumberUnitRegex);
    this.unitMap = config.unitMap;
    this.unitValueMap = config.unitValueMap;
    this.doubleNumbers = config.doubleNumbers;
  }
};
var FrenchTimeExtractorConfiguration = class _FrenchTimeExtractorConfiguration {
  constructor() {
    this.atRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AtRegex, "gis");
    this.ishRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.IshRegex, "gis");
    this.timeRegexList = _FrenchTimeExtractorConfiguration.getTimeRegexList();
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
  }
  static getTimeRegexList() {
    return [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex3, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex4, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex5, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex6, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex7, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex8, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex9, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeRegex10, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ConnectNumRegex, "gis")
    ];
  }
};
var FrenchTimeParserConfiguration = class {
  constructor(config) {
    this.timeTokenPrefix = exports.FrenchDateTime.TimeTokenPrefix;
    this.atRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AtRegex, "gis");
    this.timeRegexes = FrenchTimeExtractorConfiguration.getTimeRegexList();
    this.lessThanOneHour = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LessThanOneHour, "gis");
    this.timeSuffix = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeSuffix, "gis");
    this.utilityConfiguration = config.utilityConfiguration;
    this.numbers = config.numbers;
  }
  adjustByPrefix(prefix, adjust) {
    let deltaMin = 0;
    let trimedPrefix = prefix.trim().toLowerCase();
    if (trimedPrefix.endsWith("demie")) {
      deltaMin = 30;
    } else if (trimedPrefix.endsWith("un quart") || trimedPrefix.endsWith("quart")) {
      deltaMin = 15;
    } else if (trimedPrefix.endsWith("trois quarts")) {
      deltaMin = 45;
    } else {
      let matches = recognizersText.RegExpUtility.getMatches(this.lessThanOneHour, trimedPrefix);
      if (matches.length) {
        let match = matches[0];
        let minStr = match.groups("deltamin").value;
        if (minStr) {
          deltaMin = parseInt(minStr, 10);
        } else {
          minStr = match.groups("deltaminnum").value.toLowerCase();
          if (this.numbers.has(minStr)) {
            deltaMin = this.numbers.get(minStr);
          }
        }
      }
    }
    if (trimedPrefix.endsWith("\xE0")) {
      deltaMin = -deltaMin;
    }
    adjust.min += deltaMin;
    if (adjust.min < 0) {
      adjust.min += 60;
      adjust.hour -= 1;
    }
    adjust.hasMin = true;
  }
  adjustBySuffix(suffix, adjust) {
    let trimedSuffix = suffix.trim().toLowerCase();
    let deltaHour = 0;
    let matches = recognizersText.RegExpUtility.getMatches(this.timeSuffix, trimedSuffix);
    if (matches.length) {
      let match = matches[0];
      if (match.index === 0 && match.length === trimedSuffix.length) {
        let oclockStr = match.groups("heures").value;
        if (!oclockStr) {
          let amStr = match.groups("am").value;
          if (amStr) {
            if (adjust.hour >= 12) {
              deltaHour = -12;
            }
            adjust.hasAm = true;
          }
          let pmStr = match.groups("pm").value;
          if (pmStr) {
            if (adjust.hour < 12) {
              deltaHour = 12;
            }
            adjust.hasPm = true;
          }
        }
      }
    }
    adjust.hour = (adjust.hour + deltaHour) % 24;
  }
};

// recognizers/recognizers-date-time/src/dateTime/french/dateTimeConfiguration.ts
var FrenchDateTimeExtractorConfiguration = class {
  constructor() {
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PrepositionRegex, "gis");
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NowRegex, "gis");
    this.suffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SuffixRegex, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfDayRegex, "gis");
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeOfDayRegex, "gis");
    this.timeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfTodayAfterRegex, "gis");
    this.timeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfTodayBeforeRegex, "gis");
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleTimeOfTodayAfterRegex, "gis");
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleTimeOfTodayBeforeRegex, "gis");
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TheEndOfRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeUnitRegex, "gis");
    this.connectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ConnectorRegex, "gis");
    this.nightRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NightRegex, "gis");
    this.datePointExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.timePointExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.utilityConfiguration = new FrenchDateTimeUtilityConfiguration();
  }
  isConnectorToken(source) {
    return source === "" || source === "," || recognizersText.RegExpUtility.getFirstMatchIndex(this.prepositionRegex, source).matched || source === "t" || source === "pour" || source === "vers";
  }
};
var FrenchDateTimeParserConfiguration = class {
  constructor(config) {
    this.tokenBeforeDate = exports.FrenchDateTime.TokenBeforeDate;
    this.tokenBeforeTime = exports.FrenchDateTime.TokenBeforeTime;
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NowRegex, "gis");
    this.amTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AMTimeRegex, "gis");
    this.pmTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PMTimeRegex, "gis");
    this.simpleTimeOfTodayAfterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleTimeOfTodayAfterRegex, "gis");
    this.simpleTimeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleTimeOfTodayBeforeRegex, "gis");
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeOfDayRegex, "gis");
    this.theEndOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TheEndOfRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeUnitRegex, "gis");
    this.dateExtractor = config.dateExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.numbers = config.numbers;
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.durationExtractor = config.durationExtractor;
    this.durationParser = config.durationParser;
    this.unitMap = config.unitMap;
    this.utilityConfiguration = config.utilityConfiguration;
  }
  haveAmbiguousToken(text, matchedText) {
    return false;
  }
  getMatchedNowTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText.endsWith("maintenant")) {
      timex = "PRESENT_REF";
    } else if (trimedText === "r\xE9cemment" || trimedText === "pr\xE9c\xE9demment" || trimedText === "auparavant") {
      timex = "PAST_REF";
    } else if (trimedText === "d\xE8s que possible" || trimedText === "dqp") {
      timex = "FUTURE_REF";
    } else {
      return {
        matched: false,
        timex: null
      };
    }
    return {
      matched: true,
      timex
    };
  }
  getSwiftDay(text) {
    let trimedText = text.trim().toLowerCase();
    let swift = 0;
    if (trimedText.startsWith("prochain") || trimedText.endsWith("prochain") || trimedText.startsWith("prochaine") || trimedText.endsWith("prochaine")) {
      swift = 1;
    } else if (trimedText.startsWith("dernier") || trimedText.startsWith("derni\xE8re") || trimedText.endsWith("dernier") || trimedText.endsWith("derni\xE8re")) {
      swift = -1;
    }
    return swift;
  }
  getHour(text, hour) {
    let trimedText = text.trim().toLowerCase();
    let result = hour;
    if (trimedText.endsWith("matin") && hour >= 12) {
      result -= 12;
    } else if (!trimedText.endsWith("matin") && hour < 12) {
      result += 12;
    }
    return result;
  }
};
var FrenchDatePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.OneWordPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthWithYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthNumWithYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.YearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekOfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthFrontBetweenRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthFrontSimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.QuarterRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.QuarterRegexYearFront),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AllHalfYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SeasonRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ThisPrefixRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LaterEarlyPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekWithWeekDayRangeRegex)
    ];
    this.illegalYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.BaseDateTime.IllegalYearRegex);
    this.YearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.YearRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TillRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.FollowedDateUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NumberCombinedWithDateUnit);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthOfRegex);
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateUnitRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RangeUnitRegex);
    this.weekDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayOfMonthRegex);
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.FromRegex);
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ConnectorAndRegex);
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BeforeRegex2);
    this.datePointExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.FrenchIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.FrenchNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
  }
  getFromTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, source);
  }
  getBetweenTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.beforeRegex, source);
  }
  hasConnectorToken(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, source).matched;
  }
};
var FrenchDatePeriodParserConfiguration = class {
  constructor(config) {
    this.tokenBeforeDate = exports.FrenchDateTime.TokenBeforeDate;
    this.cardinalExtractor = config.cardinalExtractor;
    this.numberParser = config.numberParser;
    this.durationExtractor = config.durationExtractor;
    this.dateExtractor = config.dateExtractor;
    this.durationParser = config.durationParser;
    this.dateParser = config.dateParser;
    this.monthFrontBetweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthFrontBetweenRegex);
    this.betweenRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BetweenRegex);
    this.monthFrontSimpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthFrontSimpleCasesRegex);
    this.simpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SimpleCasesRegex);
    this.oneWordPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.OneWordPeriodRegex);
    this.monthWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthWithYear);
    this.monthNumWithYear = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthNumWithYear);
    this.yearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.YearRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NumberCombinedWithDurationUnit);
    this.weekOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekOfMonthRegex);
    this.weekOfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekOfYearRegex);
    this.quarterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.QuarterRegex);
    this.quarterRegexYearFront = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.QuarterRegexYearFront);
    this.allHalfYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AllHalfYearRegex);
    this.seasonRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SeasonRegex);
    this.whichWeekRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WhichWeekRegex);
    this.weekOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekOfRegex);
    this.monthOfRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthOfRegex);
    this.restOfDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RestOfDateRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp("(prochain|prochaine)\b");
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp("(dernier)\b");
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp("(ce|cette)\b");
    this.inConnectorRegex = config.utilityConfiguration.inConnectorRegex;
    this.unitMap = config.unitMap;
    this.cardinalMap = config.cardinalMap;
    this.dayOfMonth = config.dayOfMonth;
    this.monthOfYear = config.monthOfYear;
    this.seasonMap = config.seasonMap;
  }
  getSwiftDayOrMonth(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (trimedText.endsWith("prochain") || trimedText.endsWith("prochaine")) {
      swift = 1;
    }
    if (trimedText.endsWith("derni\xE8re") || trimedText.endsWith("derni\xE8res") || trimedText.endsWith("derniere") || trimedText.endsWith("dernieres")) {
      swift = -1;
    }
    return swift;
  }
  getSwiftYear(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = -10;
    if (trimedText.endsWith("prochain") || trimedText.endsWith("prochaine")) {
      swift = 1;
    }
    if (trimedText.endsWith("derni\xE8res") || trimedText.endsWith("derni\xE8re") || trimedText.endsWith("dernieres") || trimedText.endsWith("derniere") || trimedText.endsWith("dernier")) {
      swift = -1;
    } else if (trimedText.startsWith("cette")) {
      swift = 0;
    }
    return swift;
  }
  isFuture(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.startsWith("cette") || trimedText.endsWith("prochaine") || trimedText.endsWith("prochain");
  }
  isYearToDate(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText === "ann\xE9e \xE0 ce jour" || trimedText === "an \xE0 ce jour";
  }
  isMonthToDate(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText === "mois \xE0 ce jour";
  }
  isWeekOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("semaine") && !trimedText.endsWith("fin de semaine");
  }
  isWeekend(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("fin de semaine") || trimedText.endsWith("le weekend");
  }
  isMonthOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("mois");
  }
  isYearOnly(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("ann\xE9es") || trimedText.endsWith("ans") || (trimedText.endsWith("l'annees") || trimedText.endsWith("l'annee"));
  }
  isLastCardinal(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText === "derni\xE8res" || trimedText === "derni\xE8re" || trimedText === "dernieres" || trimedText === "derniere" || trimedText === "dernier";
  }
};
var FrenchTimePeriodExtractorConfiguration = class {
  constructor() {
    this.singleTimeExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
    this.utilityConfiguration = new FrenchDateTimeUtilityConfiguration();
    this.simpleCasesRegex = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumFromTo, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumBetweenAnd, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PmRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AmRegex, "gis")
    ];
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TillRegex, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfDayRegex, "gis");
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.GeneralEndingRegex, "gis");
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.FromRegex2, "gis");
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ConnectorAndRegex, "gis");
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BeforeRegex2, "gis");
  }
  getFromTokenIndex(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, text);
  }
  hasConnectorToken(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, text).matched;
  }
  getBetweenTokenIndex(text) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.beforeRegex, text);
  }
};
var FrenchTimePeriodParserConfiguration = class {
  constructor(config) {
    this.timeExtractor = config.timeExtractor;
    this.timeParser = config.timeParser;
    this.integerExtractor = config.integerExtractor;
    this.numbers = config.numbers;
    this.utilityConfiguration = config.utilityConfiguration;
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumFromTo, "gis");
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumBetweenAnd, "gis");
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfDayRegex, "gis");
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TillRegex, "gis");
    this.specificTimeFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeFromTo);
    this.specificTimeBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeBetweenAnd);
  }
  getMatchedTimexRange(text) {
    let trimedText = text.trim().toLowerCase();
    if (trimedText.endsWith("s")) {
      trimedText = trimedText.substring(0, trimedText.length - 1);
    }
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    let timex = "";
    if (trimedText.endsWith("matinee") || trimedText.endsWith("matin") || trimedText.endsWith("matin\xE9e")) {
      timex = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (trimedText.endsWith("apres-midi") || trimedText.endsWith("apres midi") || trimedText.endsWith("apr\xE8s midi") || trimedText.endsWith("apr\xE8s-midi")) {
      timex = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (trimedText.endsWith("soir") || trimedText.endsWith("soiree") || trimedText.endsWith("soir\xE9e")) {
      timex = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (trimedText === "jour" || trimedText.endsWith("journee") || trimedText.endsWith("journ\xE9e")) {
      timex = "TDT";
      beginHour = 8;
      endHour = 18;
    } else if (trimedText.endsWith("nuit")) {
      timex = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      timex = null;
      return {
        matched: false,
        timex,
        beginHour,
        endHour,
        endMin
      };
    }
    return {
      matched: true,
      timex,
      beginHour,
      endHour,
      endMin
    };
  }
};
var FrenchDateTimePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumFromTo),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumBetweenAnd),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeOfDayRegex)
    ];
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PrepositionRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TillRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodSpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodTimeOfDayRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeFollowedUnit);
    this.timeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeUnitRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeNumberCombinedWithUnit);
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayRegex);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodTimeOfDayWithDateRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeTimeUnitRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RestOfDateTimeRegex);
    this.generalEndingRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.GeneralEndingRegex);
    this.middlePauseRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MiddlePauseRegex);
    this.fromRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.FromRegex2);
    this.connectorAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ConnectorAndRegex);
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BeforeRegex);
    this.cardinalExtractor = new recognizersTextNumber.FrenchCardinalExtractor();
    this.singleDateExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.singleTimeExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.singleDateTimeExtractor = new BaseDateTimeExtractor(new FrenchDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new FrenchTimePeriodExtractorConfiguration());
  }
  getFromTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.fromRegex, source);
  }
  getBetweenTokenIndex(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.beforeRegex, source);
  }
  hasConnectorToken(source) {
    return recognizersText.RegExpUtility.getFirstMatchIndex(this.connectorAndRegex, source).matched;
  }
};
var FrenchDateTimePeriodParserConfiguration = class {
  constructor(config) {
    this.dateExtractor = config.dateExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.cardinalExtractor = config.cardinalExtractor;
    this.durationExtractor = config.durationExtractor;
    this.numberParser = config.numberParser;
    this.dateParser = config.dateParser;
    this.timeParser = config.timeParser;
    this.dateTimeParser = config.dateTimeParser;
    this.timePeriodParser = config.timePeriodParser;
    this.durationParser = config.durationParser;
    this.unitMap = config.unitMap;
    this.numbers = config.numbers;
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ThisPrefixRegex);
    this.morningStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MorningStartEndRegex);
    this.afternoonStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AfternoonStartEndRegex);
    this.eveningStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EveningStartEndRegex);
    this.nightStartEndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NightStartEndRegex);
    this.pureNumberFromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumFromTo);
    this.pureNumberBetweenAndRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PureNumBetweenAnd);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeOfDayRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PastSuffixRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextSuffixRegex);
    this.numberCombinedWithUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeNumberCombinedWithUnit);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.TimeUnitRegex);
    this.periodTimeOfDayWithDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodTimeOfDayWithDateRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeTimeUnitRegex);
    this.restOfDateTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RestOfDateTimeRegex);
  }
  getMatchedTimeRange(source) {
    let trimedText = source.trim().toLowerCase();
    let timeStr = "";
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    if (recognizersText.RegExpUtility.getFirstMatchIndex(this.morningStartEndRegex, trimedText).matched) {
      timeStr = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.afternoonStartEndRegex, trimedText).matched) {
      timeStr = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.eveningStartEndRegex, trimedText).matched) {
      timeStr = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (recognizersText.RegExpUtility.getFirstMatchIndex(this.nightStartEndRegex, trimedText).matched) {
      timeStr = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      timeStr = null;
      return {
        success: false,
        timeStr,
        beginHour,
        endHour,
        endMin
      };
    }
    return {
      success: true,
      timeStr,
      beginHour,
      endHour,
      endMin
    };
  }
  getSwiftPrefix(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (trimedText.startsWith("prochain") || trimedText.endsWith("prochain") || trimedText.startsWith("prochaine") || trimedText.endsWith("prochaine")) {
      swift = 1;
    } else if (trimedText.startsWith("derniere") || trimedText.startsWith("dernier") || trimedText.endsWith("derniere") || trimedText.endsWith("dernier")) {
      swift = -1;
    }
    return swift;
  }
};

// recognizers/recognizers-date-time/src/dateTime/french/baseConfiguration.ts
var FrenchDateTimeUtilityConfiguration = class {
  constructor() {
    this.laterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LaterRegex);
    this.agoRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AgoPrefixRegex);
    this.inConnectorRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.InConnectorRegex);
    this.rangeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RangeUnitRegex);
    this.amDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AmDescRegex);
    this.pmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PmDescRegex);
    this.amPmDescRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AmPmDescRegex);
  }
};
var FrenchCommonDateTimeParserConfiguration = class extends BaseDateParserConfiguration {
  constructor() {
    super();
    this.utilityConfiguration = new FrenchDateTimeUtilityConfiguration();
    this.unitMap = exports.FrenchDateTime.UnitMap;
    this.unitValueMap = exports.FrenchDateTime.UnitValueMap;
    this.seasonMap = exports.FrenchDateTime.SeasonMap;
    this.cardinalMap = exports.FrenchDateTime.CardinalMap;
    this.dayOfWeek = exports.FrenchDateTime.DayOfWeek;
    this.monthOfYear = exports.FrenchDateTime.MonthOfYear;
    this.numbers = exports.FrenchDateTime.Numbers;
    this.doubleNumbers = exports.FrenchDateTime.DoubleNumbers;
    this.cardinalExtractor = new recognizersTextNumber.FrenchCardinalExtractor();
    this.integerExtractor = new recognizersTextNumber.FrenchIntegerExtractor();
    this.ordinalExtractor = new recognizersTextNumber.FrenchOrdinalExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.FrenchNumberParserConfiguration());
    this.dateExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new FrenchDateTimeExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new FrenchDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new FrenchTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new FrenchDateTimePeriodExtractorConfiguration());
    this.durationParser = new BaseDurationParser(new FrenchDurationParserConfiguration(this));
    this.dateParser = new BaseDateParser(new FrenchDateParserConfiguration(this));
    this.timeParser = new BaseTimeParser(new FrenchTimeParserConfiguration(this));
    this.dateTimeParser = new BaseDateTimeParser(new FrenchDateTimeParserConfiguration(this));
    this.datePeriodParser = new BaseDatePeriodParser(new FrenchDatePeriodParserConfiguration(this));
    this.timePeriodParser = new BaseTimePeriodParser(new FrenchTimePeriodParserConfiguration(this));
    this.dateTimePeriodParser = new BaseDateTimePeriodParser(new FrenchDateTimePeriodParserConfiguration(this));
    this.dayOfMonth = new Map([...exports.BaseDateTime.DayOfMonthDictionary, ...exports.FrenchDateTime.DayOfMonth]);
  }
};

// recognizers/recognizers-date-time/src/dateTime/french/dateConfiguration.ts
var FrenchDateExtractorConfiguration = class {
  constructor() {
    this.dateRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor3, "gis"),
      exports.FrenchDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor5, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor4, "gis"),
      exports.FrenchDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor4, "gis") : recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor5, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor6, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor7, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor8, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractor9, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateExtractorA, "gis")
    ];
    this.implicitDateList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.OnRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelaxedOnRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecialDayRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ThisRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LastDateRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextDateRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.StrictWeekDay, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayOfMonthRegex, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecialDate, "gis")
    ];
    this.monthEnd = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthEnd, "gis");
    this.ofMonth = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.OfMonth, "gis");
    this.dateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateUnitRegex, "gis");
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ForTheRegex, "gis");
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayAndDayOfMonthRegex, "gis");
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeMonthRegex, "gis");
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayRegex, "gis");
    this.dayOfWeek = exports.FrenchDateTime.DayOfWeek;
    this.ordinalExtractor = new recognizersTextNumber.FrenchOrdinalExtractor();
    this.integerExtractor = new recognizersTextNumber.FrenchIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.FrenchNumberParserConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.utilityConfiguration = new FrenchDateTimeUtilityConfiguration();
    this.nonDateUnitRegex = recognizersText.RegExpUtility.getSafeRegExp("(?<unit>heure|heures|hrs|secondes|seconde|secs|sec|minutes|minute|mins)\b", "gis");
  }
};
var FrenchDateParserConfiguration = class {
  constructor(config) {
    this.ordinalExtractor = config.ordinalExtractor;
    this.integerExtractor = config.integerExtractor;
    this.cardinalExtractor = config.cardinalExtractor;
    this.durationExtractor = config.durationExtractor;
    this.numberParser = config.numberParser;
    this.durationParser = config.durationParser;
    this.monthOfYear = config.monthOfYear;
    this.dayOfMonth = config.dayOfMonth;
    this.dayOfWeek = config.dayOfWeek;
    this.unitMap = config.unitMap;
    this.cardinalMap = config.cardinalMap;
    this.dateRegex = new FrenchDateExtractorConfiguration().dateRegexList;
    this.onRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.OnRegex, "gis");
    this.specialDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecialDayRegex, "gis");
    this.specialDayWithNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SpecialDayWithNumRegex, "gis");
    this.nextRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NextDateRegex, "gis");
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.DateUnitRegex, "gis");
    this.monthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.MonthRegex, "gis");
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayRegex, "gis");
    this.strictWeekDay = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.StrictWeekDay, "gis");
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.LastDateRegex, "gis");
    this.thisRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ThisRegex, "gis");
    this.weekDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayOfMonthRegex, "gis");
    this.forTheRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.ForTheRegex, "gis");
    this.weekDayAndDayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.WeekDayAndDayOfMonthRegex, "gis");
    this.relativeMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeMonthRegex, "gis");
    this.relativeWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.RelativeWeekDayRegex, "gis");
    this.utilityConfiguration = config.utilityConfiguration;
    this.dateTokenPrefix = exports.FrenchDateTime.DateTokenPrefix;
  }
  getSwiftDay(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (trimedText === "aujourd'hui" || trimedText === "auj") {
      swift = 0;
    } else if (trimedText === "demain" || trimedText.endsWith("a2m1") || trimedText.endsWith("lendemain") || trimedText.endsWith("jour suivant")) {
      swift = 1;
    } else if (trimedText === "hier") {
      swift = -1;
    } else if (trimedText.endsWith("apr\xE8s demain") || trimedText.endsWith("apr\xE8s-demain")) {
      swift = 2;
    } else if (trimedText.endsWith("avant-hier") || trimedText.endsWith("avant hier")) {
      swift = -2;
    } else if (trimedText.endsWith("dernier")) {
      swift = -1;
    }
    return swift;
  }
  getSwiftMonth(source) {
    let trimedText = source.trim().toLowerCase();
    let swift = 0;
    if (trimedText.endsWith("prochaine") || trimedText.endsWith("prochain")) {
      swift = 1;
    } else if (trimedText === "derni\xE8re" || trimedText.endsWith("derni\xE8res") || trimedText.endsWith("derniere") || trimedText.endsWith("dernieres")) {
      swift = -1;
    }
    return swift;
  }
  isCardinalLast(source) {
    let trimedText = source.trim().toLowerCase();
    return trimedText.endsWith("derni\xE8re") || trimedText.endsWith("derni\xE8res") || trimedText.endsWith("derniere") || trimedText.endsWith("dernieres");
  }
};
var FrenchHolidayExtractorConfiguration = class {
  constructor() {
    this.holidayRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex3, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex4, "gis")
    ];
  }
};
var FrenchHolidayParserConfiguration = class _FrenchHolidayParserConfiguration extends BaseHolidayParserConfiguration {
  constructor() {
    super();
    this.holidayRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex1, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex2, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex3, "gis"),
      recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.HolidayRegex4, "gis")
    ];
    this.holidayNames = exports.FrenchDateTime.HolidayNames;
    this.holidayFuncDictionary = this.initHolidayFuncs();
  }
  initHolidayFuncs() {
    return new Map(
      [
        ...super.initHolidayFuncs(),
        ["maosbirthday", _FrenchHolidayParserConfiguration.MaoBirthday],
        ["yuandan", _FrenchHolidayParserConfiguration.NewYear],
        ["teachersday", _FrenchHolidayParserConfiguration.TeacherDay],
        ["singleday", _FrenchHolidayParserConfiguration.SinglesDay],
        ["allsaintsday", _FrenchHolidayParserConfiguration.HalloweenDay],
        ["youthday", _FrenchHolidayParserConfiguration.YouthDay],
        ["childrenday", _FrenchHolidayParserConfiguration.ChildrenDay],
        ["femaleday", _FrenchHolidayParserConfiguration.FemaleDay],
        ["treeplantingday", _FrenchHolidayParserConfiguration.TreePlantDay],
        ["arborday", _FrenchHolidayParserConfiguration.TreePlantDay],
        ["girlsday", _FrenchHolidayParserConfiguration.GirlsDay],
        ["whiteloverday", _FrenchHolidayParserConfiguration.WhiteLoverDay],
        ["loverday", _FrenchHolidayParserConfiguration.ValentinesDay],
        ["christmas", _FrenchHolidayParserConfiguration.ChristmasDay],
        ["xmas", _FrenchHolidayParserConfiguration.ChristmasDay],
        ["newyear", _FrenchHolidayParserConfiguration.NewYear],
        ["newyearday", _FrenchHolidayParserConfiguration.NewYear],
        ["newyearsday", _FrenchHolidayParserConfiguration.NewYear],
        ["inaugurationday", _FrenchHolidayParserConfiguration.InaugurationDay],
        ["groundhougday", _FrenchHolidayParserConfiguration.GroundhogDay],
        ["valentinesday", _FrenchHolidayParserConfiguration.ValentinesDay],
        ["stpatrickday", _FrenchHolidayParserConfiguration.StPatrickDay],
        ["aprilfools", _FrenchHolidayParserConfiguration.FoolDay],
        ["stgeorgeday", _FrenchHolidayParserConfiguration.StGeorgeDay],
        ["mayday", _FrenchHolidayParserConfiguration.Mayday],
        ["cincodemayoday", _FrenchHolidayParserConfiguration.CincoDeMayoday],
        ["baptisteday", _FrenchHolidayParserConfiguration.BaptisteDay],
        ["usindependenceday", _FrenchHolidayParserConfiguration.UsaIndependenceDay],
        ["independenceday", _FrenchHolidayParserConfiguration.UsaIndependenceDay],
        ["bastilleday", _FrenchHolidayParserConfiguration.BastilleDay],
        ["halloweenday", _FrenchHolidayParserConfiguration.HalloweenDay],
        ["allhallowday", _FrenchHolidayParserConfiguration.AllHallowDay],
        ["allsoulsday", _FrenchHolidayParserConfiguration.AllSoulsday],
        ["guyfawkesday", _FrenchHolidayParserConfiguration.GuyFawkesDay],
        ["veteransday", _FrenchHolidayParserConfiguration.Veteransday],
        ["christmaseve", _FrenchHolidayParserConfiguration.ChristmasEve],
        ["newyeareve", _FrenchHolidayParserConfiguration.NewYearEve],
        ["fathersday", _FrenchHolidayParserConfiguration.FathersDay],
        ["mothersday", _FrenchHolidayParserConfiguration.MothersDay],
        ["labourday", _FrenchHolidayParserConfiguration.LabourDay]
      ]
    );
  }
  // All JavaScript dates are zero-based (-1)
  static NewYear(year) {
    return new Date(year, 1 - 1, 1);
  }
  static NewYearEve(year) {
    return new Date(year, 12 - 1, 31);
  }
  static ChristmasDay(year) {
    return new Date(year, 12 - 1, 25);
  }
  static ChristmasEve(year) {
    return new Date(year, 12 - 1, 24);
  }
  static FemaleDay(year) {
    return new Date(year, 3 - 1, 8);
  }
  static ChildrenDay(year) {
    return new Date(year, 6 - 1, 1);
  }
  static HalloweenDay(year) {
    return new Date(year, 10 - 1, 31);
  }
  static EasterDay(year) {
    return DateUtils.minValue();
  }
  static ValentinesDay(year) {
    return new Date(year, 2, 14);
  }
  static WhiteLoverDay(year) {
    return new Date(year, 3, 14);
  }
  static FoolDay(year) {
    return new Date(year, 4, 1);
  }
  static GirlsDay(year) {
    return new Date(year, 3, 7);
  }
  static TreePlantDay(year) {
    return new Date(year, 3, 12);
  }
  static YouthDay(year) {
    return new Date(year, 5, 4);
  }
  static TeacherDay(year) {
    return new Date(year, 9, 10);
  }
  static SinglesDay(year) {
    return new Date(year, 11, 11);
  }
  static MaoBirthday(year) {
    return new Date(year, 12, 26);
  }
  static InaugurationDay(year) {
    return new Date(year, 1, 20);
  }
  static GroundhogDay(year) {
    return new Date(year, 2, 2);
  }
  static StPatrickDay(year) {
    return new Date(year, 3, 17);
  }
  static StGeorgeDay(year) {
    return new Date(year, 4, 23);
  }
  static Mayday(year) {
    return new Date(year, 5, 1);
  }
  static CincoDeMayoday(year) {
    return new Date(year, 5, 5);
  }
  static BaptisteDay(year) {
    return new Date(year, 6, 24);
  }
  static UsaIndependenceDay(year) {
    return new Date(year, 7, 4);
  }
  static BastilleDay(year) {
    return new Date(year, 7, 14);
  }
  static AllHallowDay(year) {
    return new Date(year, 11, 1);
  }
  static AllSoulsday(year) {
    return new Date(year, 11, 2);
  }
  static GuyFawkesDay(year) {
    return new Date(year, 11, 5);
  }
  static Veteransday(year) {
    return new Date(year, 11, 11);
  }
  static FathersDay(year) {
    return new Date(year, 6, 17);
  }
  static MothersDay(year) {
    return new Date(year, 5, 27);
  }
  static LabourDay(year) {
    return new Date(year, 5, 1);
  }
  getSwiftYear(text) {
    let trimedText = text.trim().toLowerCase();
    let swift = -10;
    if (trimedText.endsWith("prochain")) {
      swift = 1;
    } else if (trimedText.endsWith("dernier")) {
      swift = -1;
    } else if (trimedText.startsWith("cette")) {
      swift = 0;
    }
    return swift;
  }
  sanitizeHolidayToken(holiday) {
    return holiday.replace(/ /g, "").replace(/'/g, "");
  }
};
var FrenchSetExtractorConfiguration = class {
  constructor() {
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SetLastRegex, "gis");
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodicRegex, "gis");
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachUnitRegex, "gis");
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachPrefixRegex, "gis");
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachDayRegex, "gis");
    this.beforeEachDayRegex = null;
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SetEachRegex, "gis");
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SetWeekDayRegex, "gis");
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.dateExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new FrenchDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new FrenchDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new FrenchTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new FrenchDateTimePeriodExtractorConfiguration());
  }
};
var FrenchSetParserConfiguration = class {
  constructor(config) {
    this.durationExtractor = config.durationExtractor;
    this.timeExtractor = config.timeExtractor;
    this.dateExtractor = config.dateExtractor;
    this.dateTimeExtractor = config.dateTimeExtractor;
    this.datePeriodExtractor = config.datePeriodExtractor;
    this.timePeriodExtractor = config.timePeriodExtractor;
    this.dateTimePeriodExtractor = config.dateTimePeriodExtractor;
    this.durationParser = config.durationParser;
    this.timeParser = config.timeParser;
    this.dateParser = config.dateParser;
    this.dateTimeParser = config.dateTimeParser;
    this.datePeriodParser = config.datePeriodParser;
    this.timePeriodParser = config.timePeriodParser;
    this.dateTimePeriodParser = config.dateTimePeriodParser;
    this.unitMap = config.unitMap;
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachPrefixRegex, "gis");
    this.periodicRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PeriodicRegex, "gis");
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachUnitRegex, "gis");
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.EachDayRegex, "gis");
    this.setWeekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SetWeekDayRegex, "gis");
    this.setEachRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SetEachRegex, "gis");
  }
  getMatchedDailyTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText === "quotidien" || trimedText === "quotidienne" || trimedText === "jours" || trimedText === "journellement") {
      timex = "P1D";
    } else if (trimedText === "hebdomadaire") {
      timex = "P1W";
    } else if (trimedText === "bihebdomadaire") {
      timex = "P2W";
    } else if (trimedText === "mensuel" || trimedText === "mensuelle") {
      timex = "P1M";
    } else if (trimedText === "annuel" || trimedText === "annuellement") {
      timex = "P1Y";
    } else {
      timex = null;
      return {
        timex,
        matched: false
      };
    }
    return {
      timex,
      matched: true
    };
  }
  getMatchedUnitTimex(text) {
    let trimedText = text.trim().toLowerCase();
    let timex = "";
    if (trimedText === "jour" || trimedText === "journee") {
      timex = "P1D";
    } else if (trimedText === "semaine") {
      timex = "P1W";
    } else if (trimedText === "mois") {
      timex = "P1M";
    } else if (trimedText === "an" || trimedText === "annee") {
      timex = "P1Y";
    } else {
      timex = null;
      return {
        matched: false,
        timex
      };
    }
    return {
      matched: true,
      timex
    };
  }
};

// recognizers/recognizers-date-time/src/dateTime/french/mergedConfiguration.ts
var FrenchMergedExtractorConfiguration = class {
  constructor() {
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SinceRegex);
    this.fromToRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.FromToRegex);
    this.singleAmbiguousMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SingleAmbiguousMonthRegex);
    this.prepositionSuffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.PrepositionSuffixRegex);
    this.numberEndingPattern = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.NumberEndingPattern);
    this.dateExtractor = new BaseDateExtractor(new FrenchDateExtractorConfiguration());
    this.timeExtractor = new BaseTimeExtractor(new FrenchTimeExtractorConfiguration());
    this.dateTimeExtractor = new BaseDateTimeExtractor(new FrenchDateTimeExtractorConfiguration());
    this.datePeriodExtractor = new BaseDatePeriodExtractor(new FrenchDatePeriodExtractorConfiguration());
    this.timePeriodExtractor = new BaseTimePeriodExtractor(new FrenchTimePeriodExtractorConfiguration());
    this.dateTimePeriodExtractor = new BaseDateTimePeriodExtractor(new FrenchDateTimePeriodExtractorConfiguration());
    this.durationExtractor = new BaseDurationExtractor(new FrenchDurationExtractorConfiguration());
    this.setExtractor = new BaseSetExtractor(new FrenchSetExtractorConfiguration());
    this.holidayExtractor = new BaseHolidayExtractor(new FrenchHolidayExtractorConfiguration());
    this.integerExtractor = new recognizersTextNumber.FrenchIntegerExtractor();
    this.filterWordRegexList = [];
  }
};
var FrenchMergedParserConfiguration = class extends FrenchCommonDateTimeParserConfiguration {
  constructor() {
    super();
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.BeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.AfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.SinceRegex);
    this.datePeriodParser = new BaseDatePeriodParser(new FrenchDatePeriodParserConfiguration(this));
    this.timePeriodParser = new BaseTimePeriodParser(new FrenchTimePeriodParserConfiguration(this));
    this.setParser = new BaseSetParser(new FrenchSetParserConfiguration(this));
    this.holidayParser = new BaseHolidayParser(new FrenchHolidayParserConfiguration());
  }
};

// recognizers/recognizers-date-time/src/resources/chineseDateTime.ts
exports.ChineseDateTime = void 0;
((ChineseDateTime2) => {
  ChineseDateTime2.MonthRegex = `(?<month>\u6B63\u6708|\u4E00\u6708|\u4E8C\u6708|\u4E09\u6708|\u56DB\u6708|\u4E94\u6708|\u516D\u6708|\u4E03\u6708|\u516B\u6708|\u4E5D\u6708|\u5341\u6708|\u5341\u4E00\u6708|\u5341\u4E8C\u6708|01\u6708|02\u6708|03\u6708|04\u6708|05\u6708|06\u6708|07\u6708|08\u6708|09\u6708|10\u6708|11\u6708|12\u6708|1\u6708|2\u6708|3\u6708|4\u6708|5\u6708|6\u6708|7\u6708|8\u6708|9\u6708|\u5927\u5E74)`;
  ChineseDateTime2.DayRegex = `(?<day>01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|1|2|3|4|5|6|7|8|9)`;
  ChineseDateTime2.DateDayRegexInChinese = `(?<day>\u521D\u4E00|\u4E09\u5341|\u4E00\u65E5|\u5341\u4E00\u65E5|\u4E8C\u5341\u4E00\u65E5|\u4E09\u5341\u4E00\u65E5|\u4E8C\u65E5|\u4E09\u65E5|\u56DB\u65E5|\u4E94\u65E5|\u516D\u65E5|\u4E03\u65E5|\u516B\u65E5|\u4E5D\u65E5|\u5341\u4E8C\u65E5|\u5341\u4E09\u65E5|\u5341\u56DB\u65E5|\u5341\u4E94\u65E5|\u5341\u516D\u65E5|\u5341\u4E03\u65E5|\u5341\u516B\u65E5|\u5341\u4E5D\u65E5|\u4E8C\u5341\u4E8C\u65E5|\u4E8C\u5341\u4E09\u65E5|\u4E8C\u5341\u56DB\u65E5|\u4E8C\u5341\u4E94\u65E5|\u4E8C\u5341\u516D\u65E5|\u4E8C\u5341\u4E03\u65E5|\u4E8C\u5341\u516B\u65E5|\u4E8C\u5341\u4E5D\u65E5|\u4E00\u65E5|\u5341\u4E00\u65E5|\u5341\u65E5|\u4E8C\u5341\u4E00\u65E5|\u4E8C\u5341\u65E5|\u4E09\u5341\u4E00\u65E5|\u4E09\u5341\u65E5|\u4E8C\u65E5|\u4E09\u65E5|\u56DB\u65E5|\u4E94\u65E5|\u516D\u65E5|\u4E03\u65E5|\u516B\u65E5|\u4E5D\u65E5|\u5341\u4E8C\u65E5|\u5341\u4E09\u65E5|\u5341\u56DB\u65E5|\u5341\u4E94\u65E5|\u5341\u516D\u65E5|\u5341\u4E03\u65E5|\u5341\u516B\u65E5|\u5341\u4E5D\u65E5|\u4E8C\u5341\u4E8C\u65E5|\u4E8C\u5341\u4E09\u65E5|\u4E8C\u5341\u56DB\u65E5|\u4E8C\u5341\u4E94\u65E5|\u4E8C\u5341\u516D\u65E5|\u4E8C\u5341\u4E03\u65E5|\u4E8C\u5341\u516B\u65E5|\u4E8C\u5341\u4E5D\u65E5|\u5341\u65E5|\u4E8C\u5341\u65E5|\u4E09\u5341\u65E5|10\u65E5|11\u65E5|12\u65E5|13\u65E5|14\u65E5|15\u65E5|16\u65E5|17\u65E5|18\u65E5|19\u65E5|1\u65E5|20\u65E5|21\u65E5|22\u65E5|23\u65E5|24\u65E5|25\u65E5|26\u65E5|27\u65E5|28\u65E5|29\u65E5|2\u65E5|30\u65E5|31\u65E5|3\u65E5|4\u65E5|5\u65E5|6\u65E5|7\u65E5|8\u65E5|9\u65E5|\u4E00\u53F7|\u5341\u4E00\u53F7|\u4E8C\u5341\u4E00\u53F7|\u4E09\u5341\u4E00\u53F7|\u4E8C\u53F7|\u4E09\u53F7|\u56DB\u53F7|\u4E94\u53F7|\u516D\u53F7|\u4E03\u53F7|\u516B\u53F7|\u4E5D\u53F7|\u5341\u4E8C\u53F7|\u5341\u4E09\u53F7|\u5341\u56DB\u53F7|\u5341\u4E94\u53F7|\u5341\u516D\u53F7|\u5341\u4E03\u53F7|\u5341\u516B\u53F7|\u5341\u4E5D\u53F7|\u4E8C\u5341\u4E8C\u53F7|\u4E8C\u5341\u4E09\u53F7|\u4E8C\u5341\u56DB\u53F7|\u4E8C\u5341\u4E94\u53F7|\u4E8C\u5341\u516D\u53F7|\u4E8C\u5341\u4E03\u53F7|\u4E8C\u5341\u516B\u53F7|\u4E8C\u5341\u4E5D\u53F7|\u4E00\u53F7|\u5341\u4E00\u53F7|\u5341\u53F7|\u4E8C\u5341\u4E00\u53F7|\u4E8C\u5341\u53F7|\u4E09\u5341\u4E00\u53F7|\u4E09\u5341\u53F7|\u4E8C\u53F7|\u4E09\u53F7|\u56DB\u53F7|\u4E94\u53F7|\u516D\u53F7|\u4E03\u53F7|\u516B\u53F7|\u4E5D\u53F7|\u5341\u4E8C\u53F7|\u5341\u4E09\u53F7|\u5341\u56DB\u53F7|\u5341\u4E94\u53F7|\u5341\u516D\u53F7|\u5341\u4E03\u53F7|\u5341\u516B\u53F7|\u5341\u4E5D\u53F7|\u4E8C\u5341\u4E8C\u53F7|\u4E8C\u5341\u4E09\u53F7|\u4E8C\u5341\u56DB\u53F7|\u4E8C\u5341\u4E94\u53F7|\u4E8C\u5341\u516D\u53F7|\u4E8C\u5341\u4E03\u53F7|\u4E8C\u5341\u516B\u53F7|\u4E8C\u5341\u4E5D\u53F7|\u5341\u53F7|\u4E8C\u5341\u53F7|\u4E09\u5341\u53F7|10\u53F7|11\u53F7|12\u53F7|13\u53F7|14\u53F7|15\u53F7|16\u53F7|17\u53F7|18\u53F7|19\u53F7|1\u53F7|20\u53F7|21\u53F7|22\u53F7|23\u53F7|24\u53F7|25\u53F7|26\u53F7|27\u53F7|28\u53F7|29\u53F7|2\u53F7|30\u53F7|31\u53F7|3\u53F7|4\u53F7|5\u53F7|6\u53F7|7\u53F7|8\u53F7|9\u53F7)`;
  ChineseDateTime2.DayRegexNumInChinese = `(?<day>\u4E00|\u5341\u4E00|\u4E8C\u5341\u4E00|\u4E09\u5341\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D|\u5341\u4E8C|\u5341\u4E09|\u5341\u56DB|\u5341\u4E94|\u5341\u516D|\u5341\u4E03|\u5341\u516B|\u5341\u4E5D|\u4E8C\u5341\u4E8C|\u4E8C\u5341\u4E09|\u4E8C\u5341\u56DB|\u4E8C\u5341\u4E94|\u4E8C\u5341\u516D|\u4E8C\u5341\u4E03|\u4E8C\u5341\u516B|\u4E8C\u5341\u4E5D|\u4E00|\u5341\u4E00|\u5341|\u4E8C\u5341\u4E00|\u4E8C\u5341|\u4E09\u5341\u4E00|\u4E09\u5341|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D|\u5341\u4E8C|\u5341\u4E09|\u5341\u56DB|\u5341\u4E94|\u5341\u516D|\u5341\u4E03|\u5341\u516B|\u5341\u4E5D|\u4E8C\u5341\u4E8C|\u4E8C\u5341\u4E09|\u4E8C\u5341\u56DB|\u4E8C\u5341\u4E94|\u4E8C\u5341\u516D|\u4E8C\u5341\u4E03|\u4E8C\u5341\u516B|\u4E8C\u5341\u4E5D|\u5341|\u4E8C\u5341|\u5EFF|\u5345)`;
  ChineseDateTime2.MonthNumRegex = `(?<month>01|02|03|04|05|06|07|08|09|10|11|12|1|2|3|4|5|6|7|8|9)`;
  ChineseDateTime2.TwoNumYear = "50";
  ChineseDateTime2.YearNumRegex = `(?<year>((1[5-9]|20)\\d{2})|2100)`;
  ChineseDateTime2.YearRegex = `(?<year>(\\d{2,4}))`;
  ChineseDateTime2.ZeroToNineIntegerRegexChs = `[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u96F6\u58F9\u8D30\u53C1\u8086\u4F0D\u9646\u67D2\u634C\u7396\u3007\u4E24\u5343\u4FE9\u5006\u4EE8]`;
  ChineseDateTime2.DateYearInChineseRegex = `(?<yearchs>(${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}|${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}|${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}))`;
  ChineseDateTime2.WeekDayRegex = `(?<weekday>\u5468\u65E5|\u5468\u5929|\u5468\u4E00|\u5468\u4E8C|\u5468\u4E09|\u5468\u56DB|\u5468\u4E94|\u5468\u516D|\u661F\u671F\u4E00|\u661F\u671F\u4E8C|\u661F\u671F\u4E09|\u661F\u671F\u56DB|\u661F\u671F\u4E94|\u661F\u671F\u516D|\u661F\u671F\u65E5|\u661F\u671F\u5929|\u793C\u62DC\u4E00|\u793C\u62DC\u4E8C|\u793C\u62DC\u4E09|\u793C\u62DC\u56DB|\u793C\u62DC\u4E94|\u793C\u62DC\u516D|\u793C\u62DC\u65E5|\u793C\u62DC\u5929|\u79AE\u62DC\u4E00|\u79AE\u62DC\u4E8C|\u79AE\u62DC\u4E09|\u79AE\u62DC\u56DB|\u79AE\u62DC\u4E94|\u79AE\u62DC\u516D|\u79AE\u62DC\u65E5|\u79AE\u62DC\u5929|\u9031\u65E5|\u9031\u5929|\u9031\u4E00|\u9031\u4E8C|\u9031\u4E09|\u9031\u56DB|\u9031\u4E94|\u9031\u516D)`;
  ChineseDateTime2.LunarRegex = `(\u519C\u5386|\u521D\u4E00|\u6B63\u6708|\u5927\u5E74)`;
  ChineseDateTime2.DateThisRegex = `(\u8FD9\u4E2A|\u8FD9\u4E00\u4E2A|\u8FD9|\u8FD9\u4E00|\u672C)${ChineseDateTime2.WeekDayRegex}`;
  ChineseDateTime2.DateLastRegex = `(\u4E0A\u4E00\u4E2A|\u4E0A\u4E2A|\u4E0A\u4E00|\u4E0A|\u6700\u540E\u4E00\u4E2A|\u6700\u540E)(\u7684)?${ChineseDateTime2.WeekDayRegex}`;
  ChineseDateTime2.DateNextRegex = `(\u4E0B\u4E00\u4E2A|\u4E0B\u4E2A|\u4E0B\u4E00|\u4E0B)(\u7684)?${ChineseDateTime2.WeekDayRegex}`;
  ChineseDateTime2.SpecialDayRegex = `(\u6700\u8FD1|\u524D\u5929|\u540E\u5929|\u6628\u5929|\u660E\u5929|\u4ECA\u5929|\u4ECA\u65E5|\u660E\u65E5|\u6628\u65E5|\u5927\u540E\u5929|\u5927\u524D\u5929|\u5F8C\u5929|\u5927\u5F8C\u5929)`;
  ChineseDateTime2.SpecialDayWithNumRegex = `^[.]`;
  ChineseDateTime2.WeekDayOfMonthRegex = `(((${ChineseDateTime2.MonthRegex}|${ChineseDateTime2.MonthNumRegex})\u7684\\s*)(?<cardinal>\u7B2C\u4E00\u4E2A|\u7B2C\u4E8C\u4E2A|\u7B2C\u4E09\u4E2A|\u7B2C\u56DB\u4E2A|\u7B2C\u4E94\u4E2A|\u6700\u540E\u4E00\u4E2A)\\s*${ChineseDateTime2.WeekDayRegex})`;
  ChineseDateTime2.DateThisRe = `\u8FD9\u4E2A|\u8FD9\u4E00\u4E2A|\u8FD9|\u8FD9\u4E00|\u672C|\u4ECA`;
  ChineseDateTime2.DateLastRe = `\u4E0A\u4E2A|\u4E0A\u4E00\u4E2A|\u4E0A|\u4E0A\u4E00|\u53BB`;
  ChineseDateTime2.DateNextRe = `\u4E0B\u4E2A|\u4E0B\u4E00\u4E2A|\u4E0B|\u4E0B\u4E00|\u660E`;
  ChineseDateTime2.SpecialDate = `(?<thisyear>(${ChineseDateTime2.DateThisRe}|${ChineseDateTime2.DateLastRe}|${ChineseDateTime2.DateNextRe})\u5E74)?(?<thismonth>(${ChineseDateTime2.DateThisRe}|${ChineseDateTime2.DateLastRe}|${ChineseDateTime2.DateNextRe})\u6708)?${ChineseDateTime2.DateDayRegexInChinese}`;
  ChineseDateTime2.DateUnitRegex = `(?<unit>\u5E74|\u4E2A\u6708|\u5468|\u65E5|\u5929)`;
  ChineseDateTime2.BeforeRegex = `\u4EE5\u524D|\u4E4B\u524D|\u524D`;
  ChineseDateTime2.AfterRegex = `\u4EE5\u540E|\u4EE5\u5F8C|\u4E4B\u540E|\u4E4B\u5F8C|\u540E|\u5F8C`;
  ChineseDateTime2.DateRegexList1 = `(${ChineseDateTime2.LunarRegex}(\\s*))?(((${ChineseDateTime2.YearRegex}|${ChineseDateTime2.DateYearInChineseRegex})\u5E74)(\\s*))?${ChineseDateTime2.MonthRegex}(\\s*)${ChineseDateTime2.DateDayRegexInChinese}((\\s*|,|\uFF0C)${ChineseDateTime2.WeekDayRegex})?(${ChineseDateTime2.BeforeRegex}|${ChineseDateTime2.AfterRegex})?`;
  ChineseDateTime2.DateRegexList2 = `(((${ChineseDateTime2.YearRegex}|${ChineseDateTime2.DateYearInChineseRegex})\u5E74)(\\s*))?(${ChineseDateTime2.LunarRegex}(\\s*))?${ChineseDateTime2.MonthRegex}(\\s*)${ChineseDateTime2.DateDayRegexInChinese}((\\s*|,|\uFF0C)${ChineseDateTime2.WeekDayRegex})?(${ChineseDateTime2.BeforeRegex}|${ChineseDateTime2.AfterRegex})?`;
  ChineseDateTime2.DateRegexList3 = `(((${ChineseDateTime2.YearRegex}|${ChineseDateTime2.DateYearInChineseRegex})\u5E74)(\\s*))?(${ChineseDateTime2.LunarRegex}(\\s*))?${ChineseDateTime2.MonthRegex}(\\s*)(${ChineseDateTime2.DayRegexNumInChinese}|${ChineseDateTime2.DayRegex})((\\s*|,|\uFF0C)${ChineseDateTime2.WeekDayRegex})?(${ChineseDateTime2.BeforeRegex}|${ChineseDateTime2.AfterRegex})?`;
  ChineseDateTime2.DateRegexList4 = `${ChineseDateTime2.MonthNumRegex}\\s*/\\s*${ChineseDateTime2.DayRegex}((\\s+|\\s*,\\s*)${ChineseDateTime2.YearRegex})?`;
  ChineseDateTime2.DateRegexList5 = `${ChineseDateTime2.DayRegex}\\s*/\\s*${ChineseDateTime2.MonthNumRegex}((\\s+|\\s*,\\s*)${ChineseDateTime2.YearRegex})?`;
  ChineseDateTime2.DateRegexList6 = `${ChineseDateTime2.MonthNumRegex}\\s*[/\\\\\\-]\\s*${ChineseDateTime2.DayRegex}\\s*[/\\\\\\-]\\s*${ChineseDateTime2.YearRegex}`;
  ChineseDateTime2.DateRegexList7 = `${ChineseDateTime2.DayRegex}\\s*[/\\\\\\-\\.]\\s*${ChineseDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\.]\\s*${ChineseDateTime2.YearNumRegex}`;
  ChineseDateTime2.DateRegexList8 = `${ChineseDateTime2.YearNumRegex}\\s*[/\\\\\\-\\. ]\\s*${ChineseDateTime2.MonthNumRegex}\\s*[/\\\\\\-\\. ]\\s*${ChineseDateTime2.DayRegex}`;
  ChineseDateTime2.DatePeriodTillRegex = `(?<till>\u5230|\u81F3|--|-|\u2014|\u2014\u2014|~|\u2013)`;
  ChineseDateTime2.DatePeriodTillSuffixRequiredRegex = `(?<till>\u4E0E|\u548C)`;
  ChineseDateTime2.DatePeriodDayRegexInChinese = `(?<day>\u521D\u4E00|\u4E09\u5341|\u4E00\u65E5|\u5341\u4E00\u65E5|\u4E8C\u5341\u4E00\u65E5|\u4E09\u5341\u4E00\u65E5|\u4E8C\u65E5|\u4E09\u65E5|\u56DB\u65E5|\u4E94\u65E5|\u516D\u65E5|\u4E03\u65E5|\u516B\u65E5|\u4E5D\u65E5|\u5341\u4E8C\u65E5|\u5341\u4E09\u65E5|\u5341\u56DB\u65E5|\u5341\u4E94\u65E5|\u5341\u516D\u65E5|\u5341\u4E03\u65E5|\u5341\u516B\u65E5|\u5341\u4E5D\u65E5|\u4E8C\u5341\u4E8C\u65E5|\u4E8C\u5341\u4E09\u65E5|\u4E8C\u5341\u56DB\u65E5|\u4E8C\u5341\u4E94\u65E5|\u4E8C\u5341\u516D\u65E5|\u4E8C\u5341\u4E03\u65E5|\u4E8C\u5341\u516B\u65E5|\u4E8C\u5341\u4E5D\u65E5|\u4E00\u65E5|\u5341\u4E00\u65E5|\u5341\u65E5|\u4E8C\u5341\u4E00\u65E5|\u4E8C\u5341\u65E5|\u4E09\u5341\u4E00\u65E5|\u4E09\u5341\u65E5|\u4E8C\u65E5|\u4E09\u65E5|\u56DB\u65E5|\u4E94\u65E5|\u516D\u65E5|\u4E03\u65E5|\u516B\u65E5|\u4E5D\u65E5|\u5341\u4E8C\u65E5|\u5341\u4E09\u65E5|\u5341\u56DB\u65E5|\u5341\u4E94\u65E5|\u5341\u516D\u65E5|\u5341\u4E03\u65E5|\u5341\u516B\u65E5|\u5341\u4E5D\u65E5|\u4E8C\u5341\u4E8C\u65E5|\u4E8C\u5341\u4E09\u65E5|\u4E8C\u5341\u56DB\u65E5|\u4E8C\u5341\u4E94\u65E5|\u4E8C\u5341\u516D\u65E5|\u4E8C\u5341\u4E03\u65E5|\u4E8C\u5341\u516B\u65E5|\u4E8C\u5341\u4E5D\u65E5|\u5341\u65E5|\u4E8C\u5341\u65E5|\u4E09\u5341\u65E5|10\u65E5|11\u65E5|12\u65E5|13\u65E5|14\u65E5|15\u65E5|16\u65E5|17\u65E5|18\u65E5|19\u65E5|1\u65E5|20\u65E5|21\u65E5|22\u65E5|23\u65E5|24\u65E5|25\u65E5|26\u65E5|27\u65E5|28\u65E5|29\u65E5|2\u65E5|30\u65E5|31\u65E5|3\u65E5|4\u65E5|5\u65E5|6\u65E5|7\u65E5|8\u65E5|9\u65E5|\u4E00\u53F7|\u5341\u4E00\u53F7|\u4E8C\u5341\u4E00\u53F7|\u4E09\u5341\u4E00\u53F7|\u4E8C\u53F7|\u4E09\u53F7|\u56DB\u53F7|\u4E94\u53F7|\u516D\u53F7|\u4E03\u53F7|\u516B\u53F7|\u4E5D\u53F7|\u5341\u4E8C\u53F7|\u5341\u4E09\u53F7|\u5341\u56DB\u53F7|\u5341\u4E94\u53F7|\u5341\u516D\u53F7|\u5341\u4E03\u53F7|\u5341\u516B\u53F7|\u5341\u4E5D\u53F7|\u4E8C\u5341\u4E8C\u53F7|\u4E8C\u5341\u4E09\u53F7|\u4E8C\u5341\u56DB\u53F7|\u4E8C\u5341\u4E94\u53F7|\u4E8C\u5341\u516D\u53F7|\u4E8C\u5341\u4E03\u53F7|\u4E8C\u5341\u516B\u53F7|\u4E8C\u5341\u4E5D\u53F7|\u4E00\u53F7|\u5341\u4E00\u53F7|\u5341\u53F7|\u4E8C\u5341\u4E00\u53F7|\u4E8C\u5341\u53F7|\u4E09\u5341\u4E00\u53F7|\u4E09\u5341\u53F7|\u4E8C\u53F7|\u4E09\u53F7|\u56DB\u53F7|\u4E94\u53F7|\u516D\u53F7|\u4E03\u53F7|\u516B\u53F7|\u4E5D\u53F7|\u5341\u4E8C\u53F7|\u5341\u4E09\u53F7|\u5341\u56DB\u53F7|\u5341\u4E94\u53F7|\u5341\u516D\u53F7|\u5341\u4E03\u53F7|\u5341\u516B\u53F7|\u5341\u4E5D\u53F7|\u4E8C\u5341\u4E8C\u53F7|\u4E8C\u5341\u4E09\u53F7|\u4E8C\u5341\u56DB\u53F7|\u4E8C\u5341\u4E94\u53F7|\u4E8C\u5341\u516D\u53F7|\u4E8C\u5341\u4E03\u53F7|\u4E8C\u5341\u516B\u53F7|\u4E8C\u5341\u4E5D\u53F7|\u5341\u53F7|\u4E8C\u5341\u53F7|\u4E09\u5341\u53F7|10\u53F7|11\u53F7|12\u53F7|13\u53F7|14\u53F7|15\u53F7|16\u53F7|17\u53F7|18\u53F7|19\u53F7|1\u53F7|20\u53F7|21\u53F7|22\u53F7|23\u53F7|24\u53F7|25\u53F7|26\u53F7|27\u53F7|28\u53F7|29\u53F7|2\u53F7|30\u53F7|31\u53F7|3\u53F7|4\u53F7|5\u53F7|6\u53F7|7\u53F7|8\u53F7|9\u53F7|\u4E00|\u5341\u4E00|\u4E8C\u5341\u4E00|\u4E09\u5341\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D|\u5341\u4E8C|\u5341\u4E09|\u5341\u56DB|\u5341\u4E94|\u5341\u516D|\u5341\u4E03|\u5341\u516B|\u5341\u4E5D|\u4E8C\u5341\u4E8C|\u4E8C\u5341\u4E09|\u4E8C\u5341\u56DB|\u4E8C\u5341\u4E94|\u4E8C\u5341\u516D|\u4E8C\u5341\u4E03|\u4E8C\u5341\u516B|\u4E8C\u5341\u4E5D|\u4E00|\u5341\u4E00|\u5341|\u4E8C\u5341\u4E00|\u4E8C\u5341|\u4E09\u5341\u4E00|\u4E09\u5341|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D|\u5341\u4E8C|\u5341\u4E09|\u5341\u56DB|\u5341\u4E94|\u5341\u516D|\u5341\u4E03|\u5341\u516B|\u5341\u4E5D|\u4E8C\u5341\u4E8C|\u4E8C\u5341\u4E09|\u4E8C\u5341\u56DB|\u4E8C\u5341\u4E94|\u4E8C\u5341\u516D|\u4E8C\u5341\u4E03|\u4E8C\u5341\u516B|\u4E8C\u5341\u4E5D|\u5341|\u4E8C\u5341|\u4E09\u5341||\u5EFF|\u5345)`;
  ChineseDateTime2.DatePeriodThisRegex = `\u8FD9\u4E2A|\u8FD9\u4E00\u4E2A|\u8FD9|\u8FD9\u4E00|\u672C`;
  ChineseDateTime2.DatePeriodLastRegex = `\u4E0A\u4E2A|\u4E0A\u4E00\u4E2A|\u4E0A|\u4E0A\u4E00`;
  ChineseDateTime2.DatePeriodNextRegex = `\u4E0B\u4E2A|\u4E0B\u4E00\u4E2A|\u4E0B|\u4E0B\u4E00`;
  ChineseDateTime2.RelativeMonthRegex = `(?<relmonth>(${ChineseDateTime2.DatePeriodThisRegex}|${ChineseDateTime2.DatePeriodLastRegex}|${ChineseDateTime2.DatePeriodNextRegex})\\s*\u6708)`;
  ChineseDateTime2.DatePeriodYearRegex = `((${ChineseDateTime2.YearNumRegex})(\\s*\u5E74)?|(${ChineseDateTime2.YearRegex})\\s*\u5E74)(?=[\\u4E00-\\u9FFF]|\\s|$|\\W)`;
  ChineseDateTime2.StrictYearRegex = `${ChineseDateTime2.DatePeriodYearRegex}`;
  ChineseDateTime2.YearRegexInNumber = `(?<year>(\\d{3,4}))`;
  ChineseDateTime2.DatePeriodYearInChineseRegex = `(?<yearchs>(${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}|${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}|${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}${ChineseDateTime2.ZeroToNineIntegerRegexChs}))\u5E74`;
  ChineseDateTime2.MonthSuffixRegex = `(?<msuf>(${ChineseDateTime2.RelativeMonthRegex}|${ChineseDateTime2.MonthRegex}))`;
  ChineseDateTime2.SimpleCasesRegex = `((\u4ECE)\\s*)?((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex})\\s*)?${ChineseDateTime2.MonthSuffixRegex}(${ChineseDateTime2.DatePeriodDayRegexInChinese}|${ChineseDateTime2.DayRegex})\\s*${ChineseDateTime2.DatePeriodTillRegex}\\s*(${ChineseDateTime2.DatePeriodDayRegexInChinese}|${ChineseDateTime2.DayRegex})((\\s+|\\s*,\\s*)${ChineseDateTime2.DatePeriodYearRegex})?`;
  ChineseDateTime2.YearAndMonth = `(${ChineseDateTime2.DatePeriodYearInChineseRegex}|${ChineseDateTime2.DatePeriodYearRegex})${ChineseDateTime2.MonthRegex}`;
  ChineseDateTime2.PureNumYearAndMonth = `(${ChineseDateTime2.YearRegexInNumber}\\s*[-\\.\\/]\\s*${ChineseDateTime2.MonthNumRegex})|(${ChineseDateTime2.MonthNumRegex}\\s*\\/\\s*${ChineseDateTime2.YearRegexInNumber})`;
  ChineseDateTime2.OneWordPeriodRegex = `(((\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74)\\s*)?${ChineseDateTime2.MonthRegex}|(${ChineseDateTime2.DatePeriodThisRegex}|${ChineseDateTime2.DatePeriodLastRegex}|${ChineseDateTime2.DatePeriodNextRegex})\\s*(\u5468\u672B|\u5468|\u6708|\u5E74)|\u5468\u672B|\u4ECA\u5E74|\u660E\u5E74|\u53BB\u5E74|\u524D\u5E74|\u540E\u5E74)`;
  ChineseDateTime2.WeekOfMonthRegex = `(?<wom>${ChineseDateTime2.MonthSuffixRegex}\u7684(?<cardinal>\u7B2C\u4E00|\u7B2C\u4E8C|\u7B2C\u4E09|\u7B2C\u56DB|\u7B2C\u4E94|\u6700\u540E\u4E00)\\s*\u5468\\s*)`;
  ChineseDateTime2.UnitRegex = `(?<unit>\u5E74|(\u4E2A)?\u6708|\u5468|\u65E5|\u5929)`;
  ChineseDateTime2.FollowedUnit = `^\\s*${ChineseDateTime2.UnitRegex}`;
  ChineseDateTime2.NumberCombinedWithUnit = `(?<num>\\d+(\\.\\d*)?)${ChineseDateTime2.UnitRegex}`;
  ChineseDateTime2.DateRangePrepositions = `((\u4ECE|\u5728|\u81EA)\\s*)?`;
  ChineseDateTime2.YearToYear = `(${ChineseDateTime2.DateRangePrepositions})(${ChineseDateTime2.DatePeriodYearInChineseRegex}|${ChineseDateTime2.DatePeriodYearRegex})\\s*(${ChineseDateTime2.DatePeriodTillRegex}|\u540E|\u5F8C|\u4E4B\u540E|\u4E4B\u5F8C)\\s*(${ChineseDateTime2.DatePeriodYearInChineseRegex}|${ChineseDateTime2.DatePeriodYearRegex})(\\s*((\u4E4B\u95F4|\u4E4B\u5185|\u671F\u95F4|\u4E2D\u95F4|\u95F4)|\u524D|\u4E4B\u524D))?`;
  ChineseDateTime2.YearToYearSuffixRequired = `(${ChineseDateTime2.DateRangePrepositions})(${ChineseDateTime2.DatePeriodYearInChineseRegex}|${ChineseDateTime2.DatePeriodYearRegex})\\s*(${ChineseDateTime2.DatePeriodTillSuffixRequiredRegex})\\s*(${ChineseDateTime2.DatePeriodYearInChineseRegex}|${ChineseDateTime2.DatePeriodYearRegex})\\s*(\u4E4B\u95F4|\u4E4B\u5185|\u671F\u95F4|\u4E2D\u95F4|\u95F4)`;
  ChineseDateTime2.MonthToMonth = `(${ChineseDateTime2.DateRangePrepositions})(${ChineseDateTime2.MonthRegex})${ChineseDateTime2.DatePeriodTillRegex}(${ChineseDateTime2.MonthRegex})`;
  ChineseDateTime2.MonthToMonthSuffixRequired = `(${ChineseDateTime2.DateRangePrepositions})(${ChineseDateTime2.MonthRegex})${ChineseDateTime2.DatePeriodTillSuffixRequiredRegex}(${ChineseDateTime2.MonthRegex})\\s*(\u4E4B\u95F4|\u4E4B\u5185|\u671F\u95F4|\u4E2D\u95F4|\u95F4)`;
  ChineseDateTime2.PastRegex = `(?<past>(\u524D|\u4E0A|\u4E4B\u524D|\u8FD1|\u8FC7\u53BB))`;
  ChineseDateTime2.FutureRegex = `(?<future>(\u540E|\u5F8C|(?<![\u4E00\u4E24\u51E0]\\s*)\u4E0B|\u4E4B\u540E|\u4E4B\u5F8C|\u672A\u6765(\u7684)?))`;
  ChineseDateTime2.SeasonRegex = `(?<season>\u6625|\u590F|\u79CB|\u51AC)(\u5929|\u5B63)?`;
  ChineseDateTime2.SeasonWithYear = `((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex}|(?<yearrel>\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74))(\u7684)?)?${ChineseDateTime2.SeasonRegex}`;
  ChineseDateTime2.QuarterRegex = `((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex}|(?<yearrel>\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74))(\u7684)?)?(\u7B2C(?<cardinal>1|2|3|4|\u4E00|\u4E8C|\u4E09|\u56DB)\u5B63\u5EA6)`;
  ChineseDateTime2.CenturyRegex = `(?<century>\\d|1\\d|2\\d)\u4E16\u7EAA`;
  ChineseDateTime2.CenturyRegexInChinese = `(?<century>\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D|\u5341|\u5341\u4E00|\u5341\u4E8C|\u5341\u4E09|\u5341\u56DB|\u5341\u4E94|\u5341\u516D|\u5341\u4E03|\u5341\u516B|\u5341\u4E5D|\u4E8C\u5341|\u4E8C\u5341\u4E00|\u4E8C\u5341\u4E8C)\u4E16\u7EAA`;
  ChineseDateTime2.RelativeCenturyRegex = `(?<relcentury>(${ChineseDateTime2.DatePeriodLastRegex}|${ChineseDateTime2.DatePeriodThisRegex}|${ChineseDateTime2.DatePeriodNextRegex}))\u4E16\u7EAA`;
  ChineseDateTime2.DecadeRegexInChinese = `(?<decade>\u5341|\u4E00\u5341|\u4E8C\u5341|\u4E09\u5341|\u56DB\u5341|\u4E94\u5341|\u516D\u5341|\u4E03\u5341|\u516B\u5341|\u4E5D\u5341)`;
  ChineseDateTime2.DecadeRegex = `(?<centurysuf>(${ChineseDateTime2.CenturyRegex}|${ChineseDateTime2.CenturyRegexInChinese}|${ChineseDateTime2.RelativeCenturyRegex}))?(?<decade>(\\d0|${ChineseDateTime2.DecadeRegexInChinese}))\u5E74\u4EE3`;
  ChineseDateTime2.PrepositionRegex = `(?<prep>^\u7684|\u5728$)`;
  ChineseDateTime2.NowRegex = `(?<now>\u73B0\u5728|\u9A6C\u4E0A|\u7ACB\u523B|\u521A\u521A\u624D|\u521A\u521A|\u521A\u624D)`;
  ChineseDateTime2.NightRegex = `(?<night>\u65E9|\u665A)`;
  ChineseDateTime2.TimeOfTodayRegex = `(\u4ECA\u665A|\u4ECA\u65E9|\u4ECA\u6668|\u660E\u665A|\u660E\u65E9|\u660E\u6668|\u6628\u665A)(\u7684|\u5728)?`;
  ChineseDateTime2.DateTimePeriodTillRegex = `(?<till>\u5230|\u76F4\u5230|--|-|\u2014|\u2014\u2014)`;
  ChineseDateTime2.DateTimePeriodPrepositionRegex = `(?<prep>^\\s*\u7684|\u5728\\s*$)`;
  ChineseDateTime2.HourRegex = `\\b${exports.BaseDateTime.HourRegex}`;
  ChineseDateTime2.HourNumRegex = `(?<hour>[\u96F6\u3007\u4E00\u4E8C\u4E24\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]|\u4E8C\u5341[\u4E00\u4E8C\u4E09\u56DB]?|\u5341[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]?)`;
  ChineseDateTime2.ZhijianRegex = `^\\s*(\u4E4B\u95F4|\u4E4B\u5185|\u671F\u95F4|\u4E2D\u95F4|\u95F4)`;
  ChineseDateTime2.DateTimePeriodThisRegex = `\u8FD9\u4E2A|\u8FD9\u4E00\u4E2A|\u8FD9|\u8FD9\u4E00`;
  ChineseDateTime2.DateTimePeriodLastRegex = `\u4E0A\u4E2A|\u4E0A\u4E00\u4E2A|\u4E0A|\u4E0A\u4E00`;
  ChineseDateTime2.DateTimePeriodNextRegex = `\u4E0B\u4E2A|\u4E0B\u4E00\u4E2A|\u4E0B|\u4E0B\u4E00`;
  ChineseDateTime2.AmPmDescRegex = `(?<daydesc>(am|a\\.m\\.|a m|a\\. m\\.|a\\.m|a\\. m|a m|pm|p\\.m\\.|p m|p\\. m\\.|p\\.m|p\\. m|p m))`;
  ChineseDateTime2.TimeOfDayRegex = `(?<timeOfDay>\u51CC\u6668|\u6E05\u6668|\u65E9\u4E0A|\u65E9|\u4E0A\u5348|\u4E2D\u5348|\u4E0B\u5348|\u5348\u540E|\u665A\u4E0A|\u591C\u91CC|\u591C\u665A|\u534A\u591C|\u591C\u95F4|\u6DF1\u591C|\u508D\u665A|\u665A)`;
  ChineseDateTime2.SpecificTimeOfDayRegex = `(((${ChineseDateTime2.DateTimePeriodThisRegex}|${ChineseDateTime2.DateTimePeriodNextRegex}|${ChineseDateTime2.DateTimePeriodLastRegex})\\s+${ChineseDateTime2.TimeOfDayRegex})|(\u4ECA\u665A|\u4ECA\u65E9|\u4ECA\u6668|\u660E\u665A|\u660E\u65E9|\u660E\u6668|\u6628\u665A))`;
  ChineseDateTime2.DateTimePeriodUnitRegex = `(\u4E2A)?(?<unit>(\u5C0F\u65F6|\u5206\u949F|\u79D2\u949F|\u65F6|\u5206|\u79D2))`;
  ChineseDateTime2.DateTimePeriodFollowedUnit = `^\\s*${ChineseDateTime2.DateTimePeriodUnitRegex}`;
  ChineseDateTime2.DateTimePeriodNumberCombinedWithUnit = `\\b(?<num>\\d+(\\.\\d*)?)${ChineseDateTime2.DateTimePeriodUnitRegex}`;
  ChineseDateTime2.DurationYearRegex = `((\\d{3,4})|0\\d|\u4E24\u5343)\\s*\u5E74`;
  ChineseDateTime2.DurationHalfSuffixRegex = `\u534A`;
  ChineseDateTime2.DurationSuffixList = /* @__PURE__ */ new Map([["M", "\u5206\u949F"], ["S", "\u79D2\u949F|\u79D2"], ["H", "\u4E2A\u5C0F\u65F6|\u5C0F\u65F6"], ["D", "\u5929"], ["W", "\u661F\u671F|\u4E2A\u661F\u671F|\u5468"], ["Mon", "\u4E2A\u6708"], ["Y", "\u5E74"]]);
  ChineseDateTime2.DurationAmbiguousUnits = ["\u5206\u949F", "\u79D2\u949F", "\u79D2", "\u4E2A\u5C0F\u65F6", "\u5C0F\u65F6", "\u5929", "\u661F\u671F", "\u4E2A\u661F\u671F", "\u5468", "\u4E2A\u6708", "\u5E74"];
  ChineseDateTime2.LunarHolidayRegex = `((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex}|(?<yearrel>\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74))(\u7684)?)?(?<holiday>\u9664\u5915|\u6625\u8282|\u4E2D\u79CB\u8282|\u4E2D\u79CB|\u5143\u5BB5\u8282|\u7AEF\u5348\u8282|\u7AEF\u5348|\u91CD\u9633\u8282)`;
  ChineseDateTime2.HolidayRegexList1 = `((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex}|(?<yearrel>\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74))(\u7684)?)?(?<holiday>\u65B0\u5E74|\u4E94\u4E00|\u52B3\u52A8\u8282|\u5143\u65E6\u8282|\u5143\u65E6|\u611A\u4EBA\u8282|\u5723\u8BDE\u8282|\u690D\u6811\u8282|\u56FD\u5E86\u8282|\u60C5\u4EBA\u8282|\u6559\u5E08\u8282|\u513F\u7AE5\u8282|\u5987\u5973\u8282|\u9752\u5E74\u8282|\u5EFA\u519B\u8282|\u5973\u751F\u8282|\u5149\u68CD\u8282|\u53CC\u5341\u4E00|\u6E05\u660E\u8282|\u6E05\u660E)`;
  ChineseDateTime2.HolidayRegexList2 = `((${ChineseDateTime2.DatePeriodYearRegex}|${ChineseDateTime2.DatePeriodYearInChineseRegex}|(?<yearrel>\u660E\u5E74|\u4ECA\u5E74|\u53BB\u5E74))(\u7684)?)?(?<holiday>\u6BCD\u4EB2\u8282|\u7236\u4EB2\u8282|\u611F\u6069\u8282|\u4E07\u5723\u8282)`;
  ChineseDateTime2.SetUnitRegex = `(?<unit>\u5E74|\u6708|\u5468|\u661F\u671F|\u65E5|\u5929|\u5C0F\u65F6|\u65F6|\u5206\u949F|\u5206|\u79D2\u949F|\u79D2)`;
  ChineseDateTime2.SetEachUnitRegex = `(?<each>(\u6BCF\u4E2A|\u6BCF\u4E00|\u6BCF)\\s*${ChineseDateTime2.SetUnitRegex})`;
  ChineseDateTime2.SetEachPrefixRegex = `(?<each>(\u6BCF)\\s*$)`;
  ChineseDateTime2.SetLastRegex = `(?<last>last|this|next)`;
  ChineseDateTime2.SetEachDayRegex = `(\u6BCF|\u6BCF\u4E00)(\u5929|\u65E5)\\s*$`;
  ChineseDateTime2.TimeHourNumRegex = `(00|01|02|03|04|05|06|07|08|09|0|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|1|2|3|4|5|6|7|8|9)`;
  ChineseDateTime2.TimeMinuteNumRegex = `(00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
  ChineseDateTime2.TimeSecondNumRegex = `(00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|0|1|2|3|4|5|6|7|8|9)`;
  ChineseDateTime2.TimeHourChsRegex = `([\u96F6\u3007\u4E00\u4E8C\u4E24\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]|\u4E8C\u5341[\u4E00\u4E8C\u4E09\u56DB]?|\u5341[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]?)`;
  ChineseDateTime2.TimeMinuteChsRegex = `([\u4E8C\u4E09\u56DB\u4E94]?\u5341[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D]?|\u516D\u5341|[\u96F6\u3007\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D])`;
  ChineseDateTime2.TimeSecondChsRegex = `${ChineseDateTime2.TimeMinuteChsRegex}`;
  ChineseDateTime2.TimeClockDescRegex = `(\u70B9\\s*\u6574|\u70B9\\s*\u949F|\u70B9|\u65F6)`;
  ChineseDateTime2.TimeMinuteDescRegex = `(\u5206\u949F|\u5206|)`;
  ChineseDateTime2.TimeSecondDescRegex = `(\u79D2\u949F|\u79D2)`;
  ChineseDateTime2.TimeBanHourPrefixRegex = `(\u7B2C)`;
  ChineseDateTime2.TimeHourRegex = `(?<!${ChineseDateTime2.TimeBanHourPrefixRegex})(?<hour>${ChineseDateTime2.TimeHourChsRegex}|${ChineseDateTime2.TimeHourNumRegex})${ChineseDateTime2.TimeClockDescRegex}`;
  ChineseDateTime2.TimeMinuteRegex = `(?<min>${ChineseDateTime2.TimeMinuteChsRegex}|${ChineseDateTime2.TimeMinuteNumRegex})${ChineseDateTime2.TimeMinuteDescRegex}`;
  ChineseDateTime2.TimeSecondRegex = `(?<sec>${ChineseDateTime2.TimeSecondChsRegex}|${ChineseDateTime2.TimeSecondNumRegex})${ChineseDateTime2.TimeSecondDescRegex}`;
  ChineseDateTime2.TimeHalfRegex = `(?<half>\u8FC7\u534A|\u534A)`;
  ChineseDateTime2.TimeQuarterRegex = `(?<quarter>[\u4E00\u4E24\u4E8C\u4E09\u56DB1-4])\\s*(\u523B\u949F|\u523B)`;
  ChineseDateTime2.TimeChineseTimeRegex = `${ChineseDateTime2.TimeHourRegex}(${ChineseDateTime2.TimeQuarterRegex}|${ChineseDateTime2.TimeHalfRegex}|((\u8FC7|\u53C8)?${ChineseDateTime2.TimeMinuteRegex})(${ChineseDateTime2.TimeSecondRegex})?)?`;
  ChineseDateTime2.TimeDigitTimeRegex = `(?<hour>${ChineseDateTime2.TimeHourNumRegex}):(?<min>${ChineseDateTime2.TimeMinuteNumRegex})(:(?<sec>${ChineseDateTime2.TimeSecondNumRegex}))?`;
  ChineseDateTime2.TimeDayDescRegex = `(?<daydesc>\u51CC\u6668|\u6E05\u6668|\u65E9\u4E0A|\u65E9|\u4E0A\u5348|\u4E2D\u5348|\u4E0B\u5348|\u5348\u540E|\u665A\u4E0A|\u591C\u91CC|\u591C\u665A|\u534A\u591C|\u5348\u591C|\u591C\u95F4|\u6DF1\u591C|\u508D\u665A|\u665A)`;
  ChineseDateTime2.TimeApproximateDescPreffixRegex = `(\u5927[\u7EA6\u6982]|\u5DEE\u4E0D\u591A|\u53EF\u80FD|\u4E5F\u8BB8|\u7EA6|\u4E0D\u8D85\u8FC7|\u4E0D\u591A[\u4E8E\u8FC7]|\u6700[\u591A\u957F\u5C11]|\u5C11\u4E8E|[\u8D85\u77ED\u957F\u591A]\u8FC7|\u51E0\u4E4E\u8981|\u5C06\u8FD1|\u5DEE\u70B9|\u5FEB\u8981|\u63A5\u8FD1|\u81F3\u5C11|\u8D77\u7801|\u8D85\u51FA|\u4E0D\u5230)`;
  ChineseDateTime2.TimeApproximateDescSuffixRegex = `(\u4E4B\u524D|\u4EE5\u524D|\u4EE5\u540E|\u4EE5\u5F8C|\u4E4B\u540E|\u4E4B\u5F8C|\u524D|\u540E|\u5F8C|\u5DE6\u53F3)`;
  ChineseDateTime2.TimeRegexes1 = `${ChineseDateTime2.TimeApproximateDescPreffixRegex}?${ChineseDateTime2.TimeDayDescRegex}?${ChineseDateTime2.TimeChineseTimeRegex}${ChineseDateTime2.TimeApproximateDescSuffixRegex}?`;
  ChineseDateTime2.TimeRegexes2 = `${ChineseDateTime2.TimeApproximateDescPreffixRegex}?${ChineseDateTime2.TimeDayDescRegex}?${ChineseDateTime2.TimeDigitTimeRegex}${ChineseDateTime2.TimeApproximateDescSuffixRegex}?(\\s*${ChineseDateTime2.AmPmDescRegex}?)`;
  ChineseDateTime2.TimeRegexes3 = `\u5DEE${ChineseDateTime2.TimeMinuteRegex}${ChineseDateTime2.TimeChineseTimeRegex}`;
  ChineseDateTime2.TimePeriodTimePeriodConnectWords = `(\u8D77|\u81F3|\u5230|\u2013|-|\u2014|~|\uFF5E)`;
  ChineseDateTime2.TimePeriodLeftChsTimeRegex = `(\u4ECE)?(?<left>${ChineseDateTime2.TimeDayDescRegex}?(${ChineseDateTime2.TimeChineseTimeRegex}))`;
  ChineseDateTime2.TimePeriodRightChsTimeRegex = `${ChineseDateTime2.TimePeriodTimePeriodConnectWords}(?<right>${ChineseDateTime2.TimeDayDescRegex}?${ChineseDateTime2.TimeChineseTimeRegex})(\u4E4B\u95F4)?`;
  ChineseDateTime2.TimePeriodLeftDigitTimeRegex = `(\u4ECE)?(?<left>${ChineseDateTime2.TimeDayDescRegex}?(${ChineseDateTime2.TimeDigitTimeRegex}))`;
  ChineseDateTime2.TimePeriodRightDigitTimeRegex = `${ChineseDateTime2.TimePeriodTimePeriodConnectWords}(?<right>${ChineseDateTime2.TimeDayDescRegex}?${ChineseDateTime2.TimeDigitTimeRegex})(\u4E4B\u95F4)?`;
  ChineseDateTime2.TimePeriodShortLeftChsTimeRegex = `(\u4ECE)?(?<left>${ChineseDateTime2.TimeDayDescRegex}?(${ChineseDateTime2.TimeHourChsRegex}))`;
  ChineseDateTime2.TimePeriodShortLeftDigitTimeRegex = `(\u4ECE)?(?<left>${ChineseDateTime2.TimeDayDescRegex}?(${ChineseDateTime2.TimeHourNumRegex}))`;
  ChineseDateTime2.TimePeriodRegexes1 = `(${ChineseDateTime2.TimePeriodLeftDigitTimeRegex}${ChineseDateTime2.TimePeriodRightDigitTimeRegex}|${ChineseDateTime2.TimePeriodLeftChsTimeRegex}${ChineseDateTime2.TimePeriodRightChsTimeRegex})`;
  ChineseDateTime2.TimePeriodRegexes2 = `(${ChineseDateTime2.TimePeriodShortLeftDigitTimeRegex}${ChineseDateTime2.TimePeriodRightDigitTimeRegex}|${ChineseDateTime2.TimePeriodShortLeftChsTimeRegex}${ChineseDateTime2.TimePeriodRightChsTimeRegex})`;
  ChineseDateTime2.ParserConfigurationBefore = `(\u4E4B\u524D|\u4EE5\u524D|\u524D)`;
  ChineseDateTime2.ParserConfigurationAfter = `(\u4E4B\u540E|\u4E4B\u5F8C|\u4EE5\u540E|\u4EE5\u5F8C|\u540E|\u5F8C)`;
  ChineseDateTime2.ParserConfigurationUntil = `(\u76F4\u5230|\u76F4\u81F3|\u622A\u81F3|\u622A\u6B62(\u5230)?)`;
  ChineseDateTime2.ParserConfigurationSincePrefix = `(\u81EA\u4ECE|\u81EA|\u81EA\u6253|\u6253)`;
  ChineseDateTime2.ParserConfigurationSinceSuffix = `(\u4EE5\u6765|\u5F00\u59CB)`;
  ChineseDateTime2.ParserConfigurationLastWeekDayToken = "\u6700\u540E\u4E00\u4E2A";
  ChineseDateTime2.ParserConfigurationNextMonthToken = "\u4E0B\u4E00\u4E2A";
  ChineseDateTime2.ParserConfigurationLastMonthToken = "\u4E0A\u4E00\u4E2A";
  ChineseDateTime2.ParserConfigurationDatePrefix = " ";
  ChineseDateTime2.ParserConfigurationUnitMap = /* @__PURE__ */ new Map([["\u5E74", "Y"], ["\u6708", "MON"], ["\u4E2A\u6708", "MON"], ["\u65E5", "D"], ["\u5468", "W"], ["\u5929", "D"], ["\u5C0F\u65F6", "H"], ["\u65F6", "H"], ["\u5206\u949F", "M"], ["\u5206", "M"], ["\u79D2\u949F", "S"], ["\u79D2", "S"], ["\u661F\u671F", "W"]]);
  ChineseDateTime2.ParserConfigurationUnitValueMap = /* @__PURE__ */ new Map([["years", 31536e3], ["year", 31536e3], ["months", 2592e3], ["month", 2592e3], ["weeks", 604800], ["week", 604800], ["days", 86400], ["day", 86400], ["hours", 3600], ["hour", 3600], ["hrs", 3600], ["hr", 3600], ["h", 3600], ["minutes", 60], ["minute", 60], ["mins", 60], ["min", 60], ["seconds", 1], ["second", 1], ["secs", 1], ["sec", 1]]);
  ChineseDateTime2.ParserConfigurationSeasonMap = /* @__PURE__ */ new Map([["\u6625", "SP"], ["\u590F", "SU"], ["\u79CB", "FA"], ["\u51AC", "WI"]]);
  ChineseDateTime2.ParserConfigurationSeasonValueMap = /* @__PURE__ */ new Map([["SP", 3], ["SU", 6], ["FA", 9], ["WI", 12]]);
  ChineseDateTime2.ParserConfigurationCardinalMap = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["\u4E00", 1], ["\u4E8C", 2], ["\u4E09", 3], ["\u56DB", 4], ["\u4E94", 5], ["\u7B2C\u4E00\u4E2A", 1], ["\u7B2C\u4E8C\u4E2A", 2], ["\u7B2C\u4E09\u4E2A", 3], ["\u7B2C\u56DB\u4E2A", 4], ["\u7B2C\u4E94\u4E2A", 5], ["\u7B2C\u4E00", 1], ["\u7B2C\u4E8C", 2], ["\u7B2C\u4E09", 3], ["\u7B2C\u56DB", 4], ["\u7B2C\u4E94", 5]]);
  ChineseDateTime2.ParserConfigurationDayOfMonth = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["13", 13], ["14", 14], ["15", 15], ["16", 16], ["17", 17], ["18", 18], ["19", 19], ["20", 20], ["21", 21], ["22", 22], ["23", 23], ["24", 24], ["25", 25], ["26", 26], ["27", 27], ["28", 28], ["29", 29], ["30", 30], ["31", 31], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9], ["1\u65E5", 1], ["2\u65E5", 2], ["3\u65E5", 3], ["4\u65E5", 4], ["5\u65E5", 5], ["6\u65E5", 6], ["7\u65E5", 7], ["8\u65E5", 8], ["9\u65E5", 9], ["10\u65E5", 10], ["11\u65E5", 11], ["12\u65E5", 12], ["13\u65E5", 13], ["14\u65E5", 14], ["15\u65E5", 15], ["16\u65E5", 16], ["17\u65E5", 17], ["18\u65E5", 18], ["19\u65E5", 19], ["20\u65E5", 20], ["21\u65E5", 21], ["22\u65E5", 22], ["23\u65E5", 23], ["24\u65E5", 24], ["25\u65E5", 25], ["26\u65E5", 26], ["27\u65E5", 27], ["28\u65E5", 28], ["29\u65E5", 29], ["30\u65E5", 30], ["31\u65E5", 31], ["\u4E00\u65E5", 1], ["\u5341\u4E00\u65E5", 11], ["\u4E8C\u5341\u65E5", 20], ["\u5341\u65E5", 10], ["\u4E8C\u5341\u4E00\u65E5", 21], ["\u4E09\u5341\u4E00\u65E5", 31], ["\u4E8C\u65E5", 2], ["\u4E09\u65E5", 3], ["\u56DB\u65E5", 4], ["\u4E94\u65E5", 5], ["\u516D\u65E5", 6], ["\u4E03\u65E5", 7], ["\u516B\u65E5", 8], ["\u4E5D\u65E5", 9], ["\u5341\u4E8C\u65E5", 12], ["\u5341\u4E09\u65E5", 13], ["\u5341\u56DB\u65E5", 14], ["\u5341\u4E94\u65E5", 15], ["\u5341\u516D\u65E5", 16], ["\u5341\u4E03\u65E5", 17], ["\u5341\u516B\u65E5", 18], ["\u5341\u4E5D\u65E5", 19], ["\u4E8C\u5341\u4E8C\u65E5", 22], ["\u4E8C\u5341\u4E09\u65E5", 23], ["\u4E8C\u5341\u56DB\u65E5", 24], ["\u4E8C\u5341\u4E94\u65E5", 25], ["\u4E8C\u5341\u516D\u65E5", 26], ["\u4E8C\u5341\u4E03\u65E5", 27], ["\u4E8C\u5341\u516B\u65E5", 28], ["\u4E8C\u5341\u4E5D\u65E5", 29], ["\u4E09\u5341\u65E5", 30], ["1\u53F7", 1], ["2\u53F7", 2], ["3\u53F7", 3], ["4\u53F7", 4], ["5\u53F7", 5], ["6\u53F7", 6], ["7\u53F7", 7], ["8\u53F7", 8], ["9\u53F7", 9], ["10\u53F7", 10], ["11\u53F7", 11], ["12\u53F7", 12], ["13\u53F7", 13], ["14\u53F7", 14], ["15\u53F7", 15], ["16\u53F7", 16], ["17\u53F7", 17], ["18\u53F7", 18], ["19\u53F7", 19], ["20\u53F7", 20], ["21\u53F7", 21], ["22\u53F7", 22], ["23\u53F7", 23], ["24\u53F7", 24], ["25\u53F7", 25], ["26\u53F7", 26], ["27\u53F7", 27], ["28\u53F7", 28], ["29\u53F7", 29], ["30\u53F7", 30], ["31\u53F7", 31], ["\u4E00\u53F7", 1], ["\u5341\u4E00\u53F7", 11], ["\u4E8C\u5341\u53F7", 20], ["\u5341\u53F7", 10], ["\u4E8C\u5341\u4E00\u53F7", 21], ["\u4E09\u5341\u4E00\u53F7", 31], ["\u4E8C\u53F7", 2], ["\u4E09\u53F7", 3], ["\u56DB\u53F7", 4], ["\u4E94\u53F7", 5], ["\u516D\u53F7", 6], ["\u4E03\u53F7", 7], ["\u516B\u53F7", 8], ["\u4E5D\u53F7", 9], ["\u5341\u4E8C\u53F7", 12], ["\u5341\u4E09\u53F7", 13], ["\u5341\u56DB\u53F7", 14], ["\u5341\u4E94\u53F7", 15], ["\u5341\u516D\u53F7", 16], ["\u5341\u4E03\u53F7", 17], ["\u5341\u516B\u53F7", 18], ["\u5341\u4E5D\u53F7", 19], ["\u4E8C\u5341\u4E8C\u53F7", 22], ["\u4E8C\u5341\u4E09\u53F7", 23], ["\u4E8C\u5341\u56DB\u53F7", 24], ["\u4E8C\u5341\u4E94\u53F7", 25], ["\u4E8C\u5341\u516D\u53F7", 26], ["\u4E8C\u5341\u4E03\u53F7", 27], ["\u4E8C\u5341\u516B\u53F7", 28], ["\u4E8C\u5341\u4E5D\u53F7", 29], ["\u4E09\u5341\u53F7", 30], ["\u521D\u4E00", 32], ["\u4E09\u5341", 30], ["\u4E00", 1], ["\u5341\u4E00", 11], ["\u4E8C\u5341", 20], ["\u5341", 10], ["\u4E8C\u5341\u4E00", 21], ["\u4E09\u5341\u4E00", 31], ["\u4E8C", 2], ["\u4E09", 3], ["\u56DB", 4], ["\u4E94", 5], ["\u516D", 6], ["\u4E03", 7], ["\u516B", 8], ["\u4E5D", 9], ["\u5341\u4E8C", 12], ["\u5341\u4E09", 13], ["\u5341\u56DB", 14], ["\u5341\u4E94", 15], ["\u5341\u516D", 16], ["\u5341\u4E03", 17], ["\u5341\u516B", 18], ["\u5341\u4E5D", 19], ["\u4E8C\u5341\u4E8C", 22], ["\u4E8C\u5341\u4E09", 23], ["\u4E8C\u5341\u56DB", 24], ["\u4E8C\u5341\u4E94", 25], ["\u4E8C\u5341\u516D", 26], ["\u4E8C\u5341\u4E03", 27], ["\u4E8C\u5341\u516B", 28], ["\u4E8C\u5341\u4E5D", 29]]);
  ChineseDateTime2.ParserConfigurationDayOfWeek = /* @__PURE__ */ new Map([["\u661F\u671F\u4E00", 1], ["\u661F\u671F\u4E8C", 2], ["\u661F\u671F\u4E09", 3], ["\u661F\u671F\u56DB", 4], ["\u661F\u671F\u4E94", 5], ["\u661F\u671F\u516D", 6], ["\u661F\u671F\u5929", 0], ["\u661F\u671F\u65E5", 0], ["\u793C\u62DC\u4E00", 1], ["\u793C\u62DC\u4E8C", 2], ["\u793C\u62DC\u4E09", 3], ["\u793C\u62DC\u56DB", 4], ["\u793C\u62DC\u4E94", 5], ["\u793C\u62DC\u516D", 6], ["\u793C\u62DC\u5929", 0], ["\u793C\u62DC\u65E5", 0], ["\u5468\u4E00", 1], ["\u5468\u4E8C", 2], ["\u5468\u4E09", 3], ["\u5468\u56DB", 4], ["\u5468\u4E94", 5], ["\u5468\u516D", 6], ["\u5468\u65E5", 0], ["\u5468\u5929", 0], ["\u79AE\u62DC\u4E00", 1], ["\u79AE\u62DC\u4E8C", 2], ["\u79AE\u62DC\u4E09", 3], ["\u79AE\u62DC\u56DB", 4], ["\u79AE\u62DC\u4E94", 5], ["\u79AE\u62DC\u516D", 6], ["\u79AE\u62DC\u5929", 0], ["\u79AE\u62DC\u65E5", 0], ["\u9031\u4E00", 1], ["\u9031\u4E8C", 2], ["\u9031\u4E09", 3], ["\u9031\u56DB", 4], ["\u9031\u4E94", 5], ["\u9031\u516D", 6], ["\u9031\u65E5", 0], ["\u9031\u5929", 0]]);
  ChineseDateTime2.ParserConfigurationMonthOfYear = /* @__PURE__ */ new Map([["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["11", 11], ["12", 12], ["01", 1], ["02", 2], ["03", 3], ["04", 4], ["05", 5], ["06", 6], ["07", 7], ["08", 8], ["09", 9], ["\u4E00\u6708", 1], ["\u4E8C\u6708", 2], ["\u4E09\u6708", 3], ["\u56DB\u6708", 4], ["\u4E94\u6708", 5], ["\u516D\u6708", 6], ["\u4E03\u6708", 7], ["\u516B\u6708", 8], ["\u4E5D\u6708", 9], ["\u5341\u6708", 10], ["\u5341\u4E00\u6708", 11], ["\u5341\u4E8C\u6708", 12], ["1\u6708", 1], ["2\u6708", 2], ["3\u6708", 3], ["4\u6708", 4], ["5\u6708", 5], ["6\u6708", 6], ["7\u6708", 7], ["8\u6708", 8], ["9\u6708", 9], ["10\u6708", 10], ["11\u6708", 11], ["12\u6708", 12], ["01\u6708", 1], ["02\u6708", 2], ["03\u6708", 3], ["04\u6708", 4], ["05\u6708", 5], ["06\u6708", 6], ["07\u6708", 7], ["08\u6708", 8], ["09\u6708", 9], ["\u6B63\u6708", 13], ["\u5927\u5E74", 13]]);
  ChineseDateTime2.DateTimeSimpleAmRegex = `(?<am>\u65E9|\u6668)`;
  ChineseDateTime2.DateTimeSimplePmRegex = `(?<pm>\u665A)`;
  ChineseDateTime2.DateTimePeriodMORegex = `(\u51CC\u6668|\u6E05\u6668|\u65E9\u4E0A|\u65E9|\u4E0A\u5348)`;
  ChineseDateTime2.DateTimePeriodAFRegex = `(\u4E2D\u5348|\u4E0B\u5348|\u5348\u540E|\u508D\u665A)`;
  ChineseDateTime2.DateTimePeriodEVRegex = `(\u665A\u4E0A|\u591C\u91CC|\u591C\u665A|\u665A)`;
  ChineseDateTime2.DateTimePeriodNIRegex = `(\u534A\u591C|\u591C\u95F4|\u6DF1\u591C)`;
  ChineseDateTime2.DurationUnitValueMap = /* @__PURE__ */ new Map([["Y", 31536e3], ["Mon", 2592e3], ["W", 604800], ["D", 86400], ["H", 3600], ["M", 60], ["S", 1]]);
  ChineseDateTime2.HolidayNoFixedTimex = /* @__PURE__ */ new Map([["\u7236\u4EB2\u8282", "-06-WXX-6-3"], ["\u6BCD\u4EB2\u8282", "-05-WXX-7-2"], ["\u611F\u6069\u8282", "-11-WXX-4-4"]]);
  ChineseDateTime2.MergedBeforeRegex = `(\u524D|\u4E4B\u524D)$`;
  ChineseDateTime2.MergedAfterRegex = `(\u540E|\u5F8C|\u4E4B\u540E|\u4E4B\u5F8C)$`;
  ChineseDateTime2.TimeNumberDictionary = /* @__PURE__ */ new Map([["\u96F6", 0], ["\u4E00", 1], ["\u4E8C", 2], ["\u4E09", 3], ["\u56DB", 4], ["\u4E94", 5], ["\u516D", 6], ["\u4E03", 7], ["\u516B", 8], ["\u4E5D", 9], ["\u3007", 0], ["\u4E24", 2], ["\u5341", 10]]);
  ChineseDateTime2.TimeLowBoundDesc = /* @__PURE__ */ new Map([["\u4E2D\u5348", 11], ["\u4E0B\u5348", 12], ["\u5348\u540E", 12], ["\u665A\u4E0A", 18], ["\u591C\u91CC", 18], ["\u591C\u665A", 18], ["\u591C\u95F4", 18], ["\u6DF1\u591C", 18], ["\u508D\u665A", 18], ["\u665A", 18], ["pm", 12]]);
  ChineseDateTime2.DefaultLanguageFallback = "DMY";
})(exports.ChineseDateTime || (exports.ChineseDateTime = {}));
var TimeResult = class {
  constructor(hour, minute, second, lowBound) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.lowBound = lowBound ? lowBound : -1;
  }
};
var BaseDateTimeExtractor2 = class {
  constructor(regexesDictionary) {
    this.regexesDictionary = regexesDictionary;
  }
  extract(source, refDate) {
    let results = new Array();
    if (recognizersTextNumber.StringUtility.isNullOrEmpty(source)) {
      return results;
    }
    let matchSource = /* @__PURE__ */ new Map();
    let matched = new Array(source.length);
    for (let i = 0; i < source.length; i++) {
      matched[i] = false;
    }
    let collections = [];
    this.regexesDictionary.forEach((value, regex) => {
      let matches = recognizersTextNumber.RegExpUtility.getMatches(regex, source);
      if (matches.length > 0) {
        collections.push({ matches, value });
      }
    });
    collections.forEach((collection) => {
      collection.matches.forEach((m) => {
        for (let j = 0; j < m.length; j++) {
          matched[m.index + j] = true;
        }
        matchSource.set(m, collection.value);
      });
    });
    let last = -1;
    for (let i = 0; i < source.length; i++) {
      if (matched[i]) {
        if (i + 1 === source.length || !matched[i + 1]) {
          let start = last + 1;
          let length = i - last;
          let substr = source.substring(start, start + length).trim();
          let srcMatch = Array.from(matchSource.keys()).find((m) => m.index === start && m.length === length);
          if (srcMatch) {
            results.push({
              start,
              length,
              text: substr,
              type: this.extractorName,
              data: matchSource.has(srcMatch) ? { dataType: matchSource.get(srcMatch), namedEntity: (key) => srcMatch.groups(key) } : null
            });
          }
        }
      } else {
        last = i;
      }
    }
    return results;
  }
};
var TimeResolutionUtils = class _TimeResolutionUtils {
  static addDescription(lowBoundMap, timeResult, description) {
    description = _TimeResolutionUtils.normalizeDesc(description);
    if (lowBoundMap.has(description) && timeResult.hour < lowBoundMap.get(description)) {
      timeResult.hour += 12;
      timeResult.lowBound = lowBoundMap.get(description);
    } else {
      timeResult.lowBound = 0;
    }
  }
  static normalizeDesc(description) {
    description = description.replace(/\s/g, "");
    description = description.replace(/\./g, "");
    return description;
  }
  static matchToValue(onlyDigitMatch, numbersMap, source) {
    if (recognizersTextNumber.StringUtility.isNullOrEmpty(source)) {
      return -1;
    }
    if (recognizersTextNumber.RegExpUtility.isMatch(onlyDigitMatch, source)) {
      return Number.parseInt(source);
    }
    if (source.length === 1) {
      return numbersMap.get(source);
    }
    let value = 1;
    for (let index = 0; index < source.length; index++) {
      let char = source.charAt(index);
      if (char === "\u5341") {
        value *= 10;
      } else if (index === 0) {
        value *= numbersMap.get(char);
      } else {
        value += numbersMap.get(char);
      }
    }
    return value;
  }
};

// recognizers/recognizers-date-time/src/dateTime/chinese/durationConfiguration.ts
var DurationExtractorConfiguration = class extends recognizersTextNumberWithUnit.ChineseNumberWithUnitExtractorConfiguration {
  constructor() {
    super(new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese));
    this.extractType = Constants.SYS_DATETIME_DURATION;
    this.suffixList = exports.ChineseDateTime.DurationSuffixList;
    this.prefixList = /* @__PURE__ */ new Map();
    this.ambiguousUnitList = exports.ChineseDateTime.DurationAmbiguousUnits;
  }
};
var ChineseDurationExtractor = class extends BaseDateTimeExtractor2 {
  constructor() {
    super(null);
    this.extractorName = Constants.SYS_DATETIME_DURATION;
    this.extractor = new recognizersTextNumberWithUnit.NumberWithUnitExtractor(new DurationExtractorConfiguration());
    this.yearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DurationYearRegex);
    this.halfSuffixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DurationHalfSuffixRegex);
  }
  extract(source, refDate) {
    let results = new Array();
    this.extractor.extract(source).forEach((result) => {
      if (recognizersText.RegExpUtility.isMatch(this.yearRegex, result.text)) {
        return;
      }
      let suffix = source.substr(result.start + result.length);
      let suffixMatch = recognizersText.RegExpUtility.getMatches(this.halfSuffixRegex, suffix).pop();
      if (suffixMatch && suffixMatch.index === 0) {
        result.text = result.text + suffixMatch.value;
        result.length += suffixMatch.length;
      }
      results.push(result);
    });
    return results;
  }
};
var ChineseDurationParserConfiguration = class {
  constructor() {
    this.unitValueMap = exports.ChineseDateTime.DurationUnitValueMap;
  }
};
var DurationParserConfiguration = class extends recognizersTextNumberWithUnit.ChineseNumberWithUnitParserConfiguration {
  constructor() {
    super(new recognizersTextNumber.CultureInfo(recognizersTextNumber.Culture.Chinese));
    this.BindDictionary(exports.ChineseDateTime.DurationSuffixList);
  }
};
var ChineseDurationParser = class extends BaseDurationParser {
  constructor() {
    let config = new ChineseDurationParserConfiguration();
    super(config);
    this.internalParser = new recognizersTextNumberWithUnit.NumberWithUnitParser(new DurationParserConfiguration());
  }
  parse(extractorResult, referenceDate) {
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let innerResult = new DateTimeResolutionResult();
      let hasHalfSuffix = extractorResult.text.endsWith("\u534A");
      if (hasHalfSuffix) {
        extractorResult.length--;
        extractorResult.text = extractorResult.text.substr(0, extractorResult.length);
      }
      let parserResult = this.internalParser.parse(extractorResult);
      let unitResult = parserResult.value;
      if (!unitResult) {
        return new DateTimeParseResult();
      }
      let unitStr = unitResult.unit;
      let numberStr = unitResult.number;
      if (hasHalfSuffix) {
        numberStr = (Number.parseFloat(numberStr) + 0.5).toString();
      }
      innerResult.timex = `P${this.isLessThanDay(unitStr) ? "T" : ""}${numberStr}${unitStr.charAt(0)}`;
      innerResult.futureValue = Number.parseFloat(numberStr) * this.config.unitValueMap.get(unitStr);
      innerResult.pastValue = Number.parseFloat(numberStr) * this.config.unitValueMap.get(unitStr);
      innerResult.futureResolution = {};
      innerResult.futureResolution[TimeTypeConstants.DURATION] = innerResult.futureValue.toString();
      innerResult.pastResolution = {};
      innerResult.pastResolution[TimeTypeConstants.DURATION] = innerResult.pastValue.toString();
      innerResult.success = true;
      resultValue = innerResult;
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
};
var ChineseTimeExtractor = class extends BaseDateTimeExtractor2 {
  // "Time";
  constructor() {
    super(/* @__PURE__ */ new Map([
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeRegexes1), 0 /* ChineseTime */],
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeRegexes2), 2 /* DigitTime */],
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeRegexes3), 1 /* LessTime */]
    ]));
    this.extractorName = Constants.SYS_DATETIME_TIME;
  }
};
var ChineseTimeParser = class extends BaseTimeParser {
  constructor() {
    super(null);
    this.functionMap = /* @__PURE__ */ new Map([
      [2 /* DigitTime */, (x) => this.handleDigit(x)],
      [0 /* ChineseTime */, (x) => this.handleChinese(x)],
      [1 /* LessTime */, (x) => this.handleLess(x)]
    ]);
    this.onlyDigitMatch = recognizersText.RegExpUtility.getSafeRegExp("\\d+");
    this.numbersMap = exports.ChineseDateTime.TimeNumberDictionary;
    this.lowBoundMap = exports.ChineseDateTime.TimeLowBoundDesc;
    this.innerExtractor = new ChineseTimeExtractor();
  }
  parse(er, referenceTime) {
    if (!referenceTime) referenceTime = /* @__PURE__ */ new Date();
    let extra = er.data;
    if (!extra) {
      let innerResult = this.innerExtractor.extract(er.text, referenceTime).pop();
      extra = innerResult.data;
    }
    let timeResult = this.functionMap.get(extra.dataType)(extra);
    let parseResult = this.packTimeResult(extra, timeResult, referenceTime);
    if (parseResult.success) {
      parseResult.futureResolution = {};
      parseResult.futureResolution[TimeTypeConstants.TIME] = FormatUtil.formatTime(parseResult.futureValue);
      parseResult.pastResolution = {};
      parseResult.pastResolution[TimeTypeConstants.TIME] = FormatUtil.formatTime(parseResult.pastValue);
    }
    let result = new DateTimeParseResult(er);
    result.value = parseResult;
    result.data = timeResult;
    result.resolutionStr = "";
    result.timexStr = parseResult.timex;
    return result;
  }
  handleLess(extra) {
    let hour = this.matchToValue(extra.namedEntity("hour").value);
    let quarter = this.matchToValue(extra.namedEntity("quarter").value);
    let minute = !recognizersText.StringUtility.isNullOrEmpty(extra.namedEntity("half").value) ? 30 : quarter !== -1 ? quarter * 15 : 0;
    let second = this.matchToValue(extra.namedEntity("sec").value);
    let less = this.matchToValue(extra.namedEntity("min").value);
    let all = hour * 60 + minute - less;
    if (all < 0) {
      all += 1440;
    }
    return new TimeResult(all / 60, all % 60, second);
  }
  handleChinese(extra) {
    let hour = this.matchToValue(extra.namedEntity("hour").value);
    let quarter = this.matchToValue(extra.namedEntity("quarter").value);
    let minute = !recognizersText.StringUtility.isNullOrEmpty(extra.namedEntity("half").value) ? 30 : quarter !== -1 ? quarter * 15 : this.matchToValue(extra.namedEntity("min").value);
    let second = this.matchToValue(extra.namedEntity("sec").value);
    return new TimeResult(hour, minute, second);
  }
  handleDigit(extra) {
    return new TimeResult(
      this.matchToValue(extra.namedEntity("hour").value),
      this.matchToValue(extra.namedEntity("min").value),
      this.matchToValue(extra.namedEntity("sec").value)
    );
  }
  packTimeResult(extra, timeResult, referenceTime) {
    let result = new DateTimeResolutionResult();
    let dayDescription = extra.namedEntity("daydesc").value;
    let noDescription = recognizersText.StringUtility.isNullOrEmpty(dayDescription);
    if (noDescription) {
      result.comment = "ampm";
    } else {
      this.addDescription(timeResult, dayDescription);
    }
    let hour = timeResult.hour > 0 ? timeResult.hour : 0;
    let min = timeResult.minute > 0 ? timeResult.minute : 0;
    let sec = timeResult.second > 0 ? timeResult.second : 0;
    let day = referenceTime.getDate();
    let month = referenceTime.getMonth();
    let year = referenceTime.getFullYear();
    let timex = "T";
    if (timeResult.hour >= 0) {
      timex = timex + FormatUtil.toString(timeResult.hour, 2);
      if (timeResult.minute >= 0) {
        timex = timex + ":" + FormatUtil.toString(timeResult.minute, 2);
        if (timeResult.second >= 0) {
          timex = timex + ":" + FormatUtil.toString(timeResult.second, 2);
        }
      }
    }
    if (hour === 24) {
      hour = 0;
    }
    result.futureValue = DateUtils.safeCreateFromMinValue(year, month, day, hour, min, sec);
    result.pastValue = DateUtils.safeCreateFromMinValue(year, month, day, hour, min, sec);
    result.timex = timex;
    result.success = true;
    return result;
  }
  matchToValue(source) {
    return TimeResolutionUtils.matchToValue(this.onlyDigitMatch, this.numbersMap, source);
  }
  addDescription(timeResult, description) {
    TimeResolutionUtils.addDescription(this.lowBoundMap, timeResult, description);
  }
};
var ChineseDateExtractorConfiguration = class {
  constructor() {
    this.dateRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList1),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList2),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList3),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList4),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList5),
      exports.ChineseDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList7) : recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList6),
      exports.ChineseDateTime.DefaultLanguageFallback === Constants.DefaultLanguageFallback_DMY ? recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList6) : recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList7),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateRegexList8)
    ];
    this.implicitDateList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.LunarRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecialDayRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateThisRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateLastRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateNextRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.WeekDayRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.WeekDayOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecialDate)
    ];
  }
};
var ChineseDateExtractor = class extends BaseDateExtractor {
  constructor() {
    super(new ChineseDateExtractorConfiguration());
    this.durationExtractor = new ChineseDurationExtractor();
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(super.basicRegexMatch(source)).concat(super.implicitDate(source)).concat(this.durationWithBeforeAndAfter(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  durationWithBeforeAndAfter(source, refDate) {
    let ret = [];
    let durEx = this.durationExtractor.extract(source, refDate);
    durEx.forEach((er) => {
      let pos = er.start + er.length;
      if (pos < source.length) {
        let nextChar = source.substr(pos, 1);
        if (nextChar === "\u524D" || nextChar === "\u540E") {
          ret.push(new Token(er.start, pos + 1));
        }
      }
    });
    return ret;
  }
};
var ChineseDateParserConfiguration = class {
  getSwiftDay(source) {
    let trimmedSource = source.trim().toLowerCase();
    let swift = 0;
    if (trimmedSource === "\u4ECA\u5929" || trimmedSource === "\u4ECA\u65E5" || trimmedSource === "\u6700\u8FD1") {
      swift = 0;
    } else if (trimmedSource.startsWith("\u660E")) {
      swift = 1;
    } else if (trimmedSource.startsWith("\u6628")) {
      swift = -1;
    } else if (trimmedSource === "\u5927\u540E\u5929" || trimmedSource === "\u5927\u5F8C\u5929") {
      swift = 3;
    } else if (trimmedSource === "\u5927\u524D\u5929") {
      swift = -3;
    } else if (trimmedSource === "\u540E\u5929" || trimmedSource === "\u5F8C\u5929") {
      swift = 2;
    } else if (trimmedSource === "\u524D\u5929") {
      swift = -2;
    }
    return swift;
  }
  getSwiftMonth(source) {
    let trimmedSource = source.trim().toLowerCase();
    let swift = 0;
    if (trimmedSource.startsWith(exports.ChineseDateTime.ParserConfigurationNextMonthToken)) {
      swift = 1;
    } else if (trimmedSource.startsWith(exports.ChineseDateTime.ParserConfigurationLastMonthToken)) {
      swift = -1;
    }
    return swift;
  }
  getSwift(source) {
    return null;
  }
  isCardinalLast(source) {
    return source === exports.ChineseDateTime.ParserConfigurationLastWeekDayToken;
  }
  constructor() {
    this.dateRegex = new ChineseDateExtractorConfiguration().dateRegexList;
    this.monthOfYear = exports.ChineseDateTime.ParserConfigurationMonthOfYear;
    this.dayOfMonth = exports.ChineseDateTime.ParserConfigurationDayOfMonth;
    this.dayOfWeek = exports.ChineseDateTime.ParserConfigurationDayOfWeek;
    this.specialDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecialDayRegex);
    this.specialDayWithNumRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecialDayWithNumRegex);
    this.thisRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateThisRegex);
    this.nextRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateNextRegex);
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateLastRegex);
    this.weekDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.WeekDayRegex);
    this.integerExtractor = new recognizersTextNumber.ChineseIntegerExtractor();
    this.numberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Number, new recognizersTextNumber.ChineseNumberParserConfiguration());
  }
};
var ChineseDateParser = class extends BaseDateParser {
  constructor() {
    let config = new ChineseDateParserConfiguration();
    super(config);
    this.lunarRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.LunarRegex);
    this.specialDateRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecialDate);
    this.tokenNextRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateNextRe);
    this.tokenLastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateLastRe);
    this.monthMaxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.toLowerCase();
      let innerResult = this.parseBasicRegexMatch(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.parseImplicitDate(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekdayOfMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parserDurationWithAgoAndLater(source, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.pastValue);
        innerResult.isLunar = this.parseLunarCalendar(source);
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  parseLunarCalendar(source) {
    return recognizersText.RegExpUtility.isMatch(this.lunarRegex, source.trim());
  }
  parseBasicRegexMatch(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    this.config.dateRegex.some((regex) => {
      let match = recognizersText.RegExpUtility.getMatches(regex, trimmedSource).pop();
      if (match && match.index === 0 && match.length === trimmedSource.length) {
        result = this.matchToDate(match, referenceDate);
        return true;
      }
    });
    return result;
  }
  parseImplicitDate(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.specialDateRegex, trimmedSource).pop();
    if (match && match.length === trimmedSource.length) {
      let day = 0;
      let month = referenceDate.getMonth();
      let year = referenceDate.getFullYear();
      let yearStr = match.groups("thisyear").value;
      let monthStr = match.groups("thismonth").value;
      let dayStr = match.groups("day").value;
      day = this.config.dayOfMonth.get(dayStr);
      let hasYear = !recognizersText.StringUtility.isNullOrEmpty(yearStr);
      let hasMonth = !recognizersText.StringUtility.isNullOrEmpty(monthStr);
      if (hasMonth) {
        if (recognizersText.RegExpUtility.isMatch(this.tokenNextRegex, monthStr)) {
          month++;
          if (month === 12) {
            month = 0;
            year++;
          }
        } else if (recognizersText.RegExpUtility.isMatch(this.tokenLastRegex, monthStr)) {
          month--;
          if (month === -1) {
            month = 12;
            year--;
          }
        }
        if (hasYear) {
          if (recognizersText.RegExpUtility.isMatch(this.tokenNextRegex, yearStr)) {
            year++;
          } else if (recognizersText.RegExpUtility.isMatch(this.tokenLastRegex, yearStr)) {
            year--;
          }
        }
      }
      result.timex = FormatUtil.luisDate(hasYear ? year : -1, hasMonth ? month : -1, day);
      let futureDate;
      let pastDate;
      if (day > this.monthMaxDays[month]) {
        futureDate = DateUtils.safeCreateFromMinValue(year, month + 1, day);
        pastDate = DateUtils.safeCreateFromMinValue(year, month - 1, day);
      } else {
        futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
        pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
        if (!hasMonth) {
          if (futureDate < referenceDate) futureDate = DateUtils.addMonths(futureDate, 1);
          if (pastDate >= referenceDate) pastDate = DateUtils.addMonths(pastDate, -1);
        } else if (hasMonth && !hasYear) {
          if (futureDate < referenceDate) futureDate = DateUtils.addYears(futureDate, 1);
          if (pastDate >= referenceDate) pastDate = DateUtils.addYears(pastDate, -1);
        }
      }
      result.futureValue = futureDate;
      result.pastValue = pastDate;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.specialDayRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let swift = this.config.getSwiftDay(match.value);
      let value = DateUtils.addDays(referenceDate, swift);
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.thisRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.this(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.nextRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.next(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.lastRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let value = DateUtils.last(referenceDate, this.config.dayOfWeek.get(weekdayStr));
      result.timex = FormatUtil.luisDateFromDate(value);
      result.futureValue = value;
      result.pastValue = value;
      result.success = true;
      return result;
    }
    match = recognizersText.RegExpUtility.getMatches(this.config.weekDayRegex, trimmedSource).pop();
    if (match && match.index === 0 && match.length === trimmedSource.length) {
      let weekdayStr = match.groups("weekday").value;
      let weekday = this.config.dayOfWeek.get(weekdayStr);
      let value = DateUtils.this(referenceDate, weekday);
      if (weekday === 0) weekday = 7;
      if (weekday < referenceDate.getDay()) value = DateUtils.next(referenceDate, weekday);
      result.timex = "XXXX-WXX-" + weekday;
      let futureDate = new Date(value);
      let pastDate = new Date(value);
      if (futureDate < referenceDate) futureDate = DateUtils.addDays(futureDate, 7);
      if (pastDate >= referenceDate) pastDate = DateUtils.addDays(pastDate, -7);
      result.futureValue = futureDate;
      result.pastValue = pastDate;
      result.success = true;
      return result;
    }
    return result;
  }
  matchToDate(match, referenceDate) {
    let result = new DateTimeResolutionResult();
    let yearStr = match.groups("year").value;
    let yearChs = match.groups("yearchs").value;
    let monthStr = match.groups("month").value;
    let dayStr = match.groups("day").value;
    let month = 0;
    let day = 0;
    let year = 0;
    let yearTemp = this.convertChineseYearToNumber(yearChs);
    year = yearTemp === -1 ? 0 : yearTemp;
    if (this.config.monthOfYear.has(monthStr) && this.config.dayOfMonth.has(dayStr)) {
      month = this.getMonthOfYear(monthStr);
      day = this.getDayOfMonth(dayStr);
      if (!recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
        year = Number.parseInt(yearStr, 10);
        if (year < 100 && year >= Constants.MinTwoDigitYearPastNum) year += 1900;
        else if (year >= 0 && year < Constants.MaxTwoDigitYearFutureNum) year += 2e3;
      }
    }
    let noYear = false;
    if (year === 0) {
      year = referenceDate.getFullYear();
      result.timex = FormatUtil.luisDate(-1, month, day);
      noYear = true;
    } else {
      result.timex = FormatUtil.luisDate(year, month, day);
    }
    let futureDate = DateUtils.safeCreateFromMinValue(year, month, day);
    let pastDate = DateUtils.safeCreateFromMinValue(year, month, day);
    if (noYear && futureDate < referenceDate) {
      futureDate = DateUtils.safeCreateFromMinValue(year + 1, month, day);
    }
    if (noYear && pastDate >= referenceDate) {
      pastDate = DateUtils.safeCreateFromMinValue(year - 1, month, day);
    }
    result.futureValue = futureDate;
    result.pastValue = pastDate;
    result.success = true;
    return result;
  }
  convertChineseYearToNumber(source) {
    let year = 0;
    let er = this.config.integerExtractor.extract(source).pop();
    if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
      year = Number.parseInt(this.config.numberParser.parse(er).value);
    }
    if (year < 10) {
      year = 0;
      for (let i = 0; i < source.length; i++) {
        let char = source.charAt(i);
        year *= 10;
        let er2 = this.config.integerExtractor.extract(char).pop();
        if (er2 && er2.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
          year += Number.parseInt(this.config.numberParser.parse(er2).value);
        }
      }
    }
    return year < 10 ? -1 : year;
  }
  getMonthOfYear(source) {
    let month = this.config.monthOfYear.get(source) > 12 ? this.config.monthOfYear.get(source) % 12 : this.config.monthOfYear.get(source);
    return month - 1;
  }
  getDayOfMonth(source) {
    return this.config.dayOfMonth.get(source) > 31 ? this.config.dayOfMonth.get(source) % 31 : this.config.dayOfMonth.get(source);
  }
};
var ChineseDateTimeExtractorConfiguration = class {
  constructor() {
    this.datePointExtractor = new ChineseDateExtractor();
    this.timePointExtractor = new ChineseTimeExtractor();
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PrepositionRegex);
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.NowRegex);
    this.nightRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.NightRegex);
    this.timeOfTodayBeforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfTodayRegex);
  }
  isConnectorToken(source) {
    return recognizersText.StringUtility.isNullOrEmpty(source) || source === "," || recognizersText.RegExpUtility.isMatch(this.prepositionRegex, source);
  }
};
var ChineseDateTimeExtractor = class extends BaseDateTimeExtractor {
  constructor() {
    super(new ChineseDateTimeExtractorConfiguration());
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.mergeDateAndTime(source, referenceDate)).concat(this.basicRegexMatch(source)).concat(this.timeOfToday(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  mergeDateAndTime(source, refDate) {
    let tokens = new Array();
    let ers = this.config.datePointExtractor.extract(source, refDate);
    if (ers.length < 1) return tokens;
    ers = ers.concat(this.config.timePointExtractor.extract(source, refDate));
    if (ers.length < 2) return tokens;
    ers = ers.sort((erA, erB) => erA.start < erB.start ? -1 : erA.start === erB.start ? 0 : 1);
    let i = 0;
    while (i < ers.length - 1) {
      let j = i + 1;
      while (j < ers.length && recognizersText.ExtractResult.isOverlap(ers[i], ers[j])) {
        j++;
      }
      if (j >= ers.length) break;
      if (ers[i].type === Constants.SYS_DATETIME_DATE && ers[j].type === Constants.SYS_DATETIME_TIME) {
        let middleBegin = ers[i].start + ers[i].length;
        let middleEnd = ers[j].start;
        if (middleBegin > middleEnd) {
          continue;
        }
        let middleStr = source.substr(middleBegin, middleEnd - middleBegin).trim().toLowerCase();
        if (this.config.isConnectorToken(middleStr)) {
          let begin = ers[i].start;
          let end = ers[j].start + ers[j].length;
          tokens.push(new Token(begin, end));
        }
        i = j + 1;
        continue;
      }
      i = j;
    }
    return tokens;
  }
  timeOfToday(source, refDate) {
    let tokens = new Array();
    this.config.timePointExtractor.extract(source, refDate).forEach((er) => {
      let beforeStr = source.substr(0, er.start);
      let innerMatch = recognizersText.RegExpUtility.getMatches(this.config.nightRegex, er.text).pop();
      if (innerMatch && innerMatch.index === 0) {
        beforeStr = source.substr(0, er.start + innerMatch.length);
      }
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) return;
      let match = recognizersText.RegExpUtility.getMatches(this.config.timeOfTodayBeforeRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        let begin = match.index;
        let end = er.start + er.length;
        tokens.push(new Token(begin, end));
      }
    });
    return tokens;
  }
};
var ChineseDateTimeParserConfiguration = class {
  constructor() {
    this.dateExtractor = new ChineseDateExtractor();
    this.timeExtractor = new ChineseTimeExtractor();
    this.dateParser = new ChineseDateParser();
    this.timeParser = new ChineseTimeParser();
    this.pmTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimeSimplePmRegex);
    this.amTimeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimeSimpleAmRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfTodayRegex);
    this.nowRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.NowRegex);
  }
  haveAmbiguousToken(text, matchedText) {
    return null;
  }
  getMatchedNowTimex(text) {
    let trimmedText = text.trim().toLowerCase();
    if (trimmedText.endsWith("\u73B0\u5728")) {
      return { matched: true, timex: "PRESENT_REF" };
    } else if (trimmedText === "\u521A\u521A\u624D" || trimmedText === "\u521A\u521A" || trimmedText === "\u521A\u624D") {
      return { matched: true, timex: "PAST_REF" };
    } else if (trimmedText === "\u7ACB\u523B" || trimmedText === "\u9A6C\u4E0A") {
      return { matched: true, timex: "FUTURE_REF" };
    }
    return { matched: false, timex: null };
  }
  getSwiftDay(text) {
    let swift = 0;
    if (text === "\u660E\u665A" || text === "\u660E\u65E9" || text === "\u660E\u6668") {
      swift = 1;
    } else if (text === "\u6628\u665A") {
      swift = -1;
    }
    return swift;
  }
  getHour(text, hour) {
    let result = hour;
    if (hour < 12 && ["\u4ECA\u665A", "\u660E\u665A", "\u6628\u665A"].some((o) => o === text)) {
      result += 12;
    } else if (hour >= 12 && ["\u4ECA\u65E9", "\u4ECA\u6668", "\u660E\u65E9", "\u660E\u6668"].some((o) => o === text)) {
      result -= 12;
    }
    return result;
  }
};
var ChineseDateTimeParser = class extends BaseDateTimeParser {
  constructor() {
    let config = new ChineseDateTimeParserConfiguration();
    super(config);
  }
  parse(er, refTime) {
    if (!refTime) refTime = /* @__PURE__ */ new Date();
    let referenceTime = refTime;
    let value = null;
    if (er.type === BaseDateTimeParser.ParserName) {
      let innerResult = this.mergeDateAndTime(er.text, referenceTime);
      if (!innerResult.success) {
        innerResult = this.parseBasicRegex(er.text, referenceTime);
      }
      if (!innerResult.success) {
        innerResult = this.parseTimeOfToday(er.text, referenceTime);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    {
      ret.value = value, ret.timexStr = value === null ? "" : value.timex, ret.resolutionStr = "";
    }
    return ret;
  }
  // merge a Date entity and a Time entity
  mergeDateAndTime(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let er1 = this.config.dateExtractor.extract(text, referenceTime);
    if (er1.length === 0) {
      return ret;
    }
    let er2 = this.config.timeExtractor.extract(text, referenceTime);
    if (er2.length === 0) {
      return ret;
    }
    let pr1 = this.config.dateParser.parse(er1[0], new Date(referenceTime.toDateString()));
    let pr2 = this.config.timeParser.parse(er2[0], referenceTime);
    if (pr1.value === null || pr2.value === null) {
      return ret;
    }
    let futureDate = pr1.value.futureValue;
    let pastDate = pr1.value.pastValue;
    let time = pr2.value.futureValue;
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    if (recognizersText.RegExpUtility.getMatches(this.config.pmTimeRegex, text).length && hour < 12) {
      hour += 12;
    } else if (recognizersText.RegExpUtility.getMatches(this.config.amTimeRegex, text).length && hour >= 12) {
      hour -= 12;
    }
    let timeStr = pr2.timexStr;
    if (timeStr.endsWith("ampm")) {
      timeStr = timeStr.substring(0, timeStr.length - 4);
    }
    timeStr = "T" + FormatUtil.toString(hour, 2) + timeStr.substring(3);
    ret.timex = pr1.timexStr + timeStr;
    let val = pr2.value;
    if (hour <= 12 && !recognizersText.RegExpUtility.getMatches(this.config.pmTimeRegex, text).length && !recognizersText.RegExpUtility.getMatches(this.config.amTimeRegex, text).length && val.comment) {
      ret.comment = "ampm";
    }
    ret.futureValue = new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), hour, min, sec);
    ret.pastValue = new Date(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), hour, min, sec);
    ret.success = true;
    return ret;
  }
  parseTimeOfToday(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let ers = this.config.timeExtractor.extract(text, referenceTime);
    if (ers.length !== 1) {
      return ret;
    }
    let pr = this.config.timeParser.parse(ers[0], referenceTime);
    if (pr.value === null) {
      return ret;
    }
    let time = pr.value.futureValue;
    let hour = time.getHours();
    let min = time.getMinutes();
    let sec = time.getSeconds();
    let timeStr = pr.timexStr;
    let match = recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, text).pop();
    if (match) {
      let matchStr = match.value.toLowerCase();
      let swift = this.config.getSwiftDay(matchStr);
      let date = DateUtils.addDays(referenceTime, swift);
      hour = this.config.getHour(matchStr, hour);
      if (timeStr.endsWith("ampm")) {
        timeStr = timeStr.substring(0, timeStr.length - 4);
      }
      timeStr = "T" + FormatUtil.toString(hour, 2) + timeStr.substring(3);
      ret.timex = FormatUtil.formatDate(date) + timeStr;
      ret.futureValue = ret.pastValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, min, sec);
      ret.success = true;
      return ret;
    }
    return ret;
  }
};
var ChineseTimePeriodExtractor = class extends BaseDateTimeExtractor2 {
  // "time range";
  constructor() {
    super(/* @__PURE__ */ new Map([
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimePeriodRegexes1), 1 /* FullTime */],
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimePeriodRegexes2), 0 /* ShortTime */],
      [recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfDayRegex), 0 /* ShortTime */]
    ]));
    this.extractorName = Constants.SYS_DATETIME_TIMEPERIOD;
  }
};
var ChineseTimePeriodParserConfiguration = class {
  constructor() {
    this.timeParser = new ChineseTimeParser();
    this.integerExtractor = new recognizersTextNumber.EnglishIntegerExtractor();
  }
  getMatchedTimexRange(text) {
    return null;
  }
};
var ChineseTimePeriodParser = class extends BaseTimePeriodParser {
  constructor() {
    let config = new ChineseTimePeriodParserConfiguration();
    super(config);
    this.dayDescriptionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeDayDescRegex);
    this.onlyDigitMatch = recognizersText.RegExpUtility.getSafeRegExp("\\d+");
    this.numbersMap = exports.ChineseDateTime.TimeNumberDictionary;
    this.lowBoundMap = exports.ChineseDateTime.TimeLowBoundDesc;
  }
  parse(er, referenceTime) {
    if (!referenceTime) referenceTime = /* @__PURE__ */ new Date();
    let result = new DateTimeParseResult(er);
    let extra = er.data;
    if (!extra) {
      return result;
    }
    let parseResult = this.parseChineseTimeOfDay(er.text, referenceTime);
    if (!parseResult.success) {
      parseResult = this.parseTimePeriod(extra, referenceTime);
    }
    if (parseResult.success) {
      parseResult.futureResolution = {};
      parseResult.futureResolution[TimeTypeConstants.START_TIME] = FormatUtil.formatTime(parseResult.futureValue.item1);
      parseResult.futureResolution[TimeTypeConstants.END_TIME] = FormatUtil.formatTime(parseResult.futureValue.item2);
      parseResult.pastResolution = {};
      parseResult.pastResolution[TimeTypeConstants.START_TIME] = FormatUtil.formatTime(parseResult.pastValue.item1);
      parseResult.pastResolution[TimeTypeConstants.END_TIME] = FormatUtil.formatTime(parseResult.pastValue.item2);
    }
    result.value = parseResult;
    result.resolutionStr = "";
    result.timexStr = parseResult.timex;
    return result;
  }
  parseChineseTimeOfDay(text, referenceTime) {
    let day = referenceTime.getDay(), month = referenceTime.getMonth(), year = referenceTime.getFullYear();
    let ret = new DateTimeResolutionResult();
    let parameters = this.GetMatchedTimexRange(text);
    if (!parameters.matched) {
      return new DateTimeResolutionResult();
    }
    ret.timex = parameters.timex;
    ret.futureValue = ret.pastValue = {
      item1: DateUtils.safeCreateFromMinValue(year, month, day, parameters.beginHour, 0, 0),
      item2: DateUtils.safeCreateFromMinValue(year, month, day, parameters.endHour, parameters.endMin, 0)
    };
    ret.success = true;
    return ret;
  }
  GetMatchedTimexRange(text) {
    let trimmedText = text.trim(), matched = false, timex = null, beginHour = 0, endHour = 0, endMin = 0;
    if (trimmedText.endsWith("\u4E0A\u5348")) {
      timex = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (trimmedText.endsWith("\u4E0B\u5348")) {
      timex = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (trimmedText.endsWith("\u665A\u4E0A")) {
      timex = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (trimmedText.localeCompare("\u767D\u5929") == 0) {
      timex = "TDT";
      beginHour = 8;
      endHour = 18;
    } else if (trimmedText.endsWith("\u6DF1\u591C")) {
      timex = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      timex = null;
      matched = false;
      return { matched, timex, beginHour, endHour, endMin };
    }
    matched = true;
    return { matched, timex, beginHour, endHour, endMin };
  }
  parseTimePeriod(extra, referenceTime) {
    let result = new DateTimeResolutionResult();
    let leftEntity = extra.namedEntity("left");
    let leftResult = extra.dataType === 1 /* FullTime */ ? this.getParseTimeResult(leftEntity, referenceTime) : this.getShortLeft(leftEntity.value);
    let rightEntity = extra.namedEntity("right");
    let rightResult = this.getParseTimeResult(rightEntity, referenceTime);
    if (rightResult.lowBound === -1 && leftResult.lowBound !== -1 && rightResult.hour <= leftResult.lowBound) {
      rightResult.hour += 12;
    }
    let leftDate = this.buildDate(leftResult, referenceTime);
    let rightDate = this.buildDate(rightResult, referenceTime);
    if (rightDate.getHours() < leftDate.getHours()) {
      rightDate = DateUtils.addDays(rightDate, 1);
    }
    result.futureValue = result.pastValue = {
      item1: leftDate,
      item2: rightDate
    };
    let leftTimex = this.buildTimex(leftResult);
    let rightTimex = this.buildTimex(rightResult);
    let spanTimex = this.buildSpan(leftResult, rightResult);
    result.timex = `(${leftTimex},${rightTimex},${spanTimex})`;
    result.success = true;
    return result;
  }
  getParseTimeResult(entity, referenceTime) {
    let extractResult = {
      start: entity.index,
      length: entity.length,
      text: entity.value,
      type: Constants.SYS_DATETIME_TIME
    };
    let result = this.config.timeParser.parse(extractResult, referenceTime);
    return result.data;
  }
  getShortLeft(source) {
    let description = "";
    if (recognizersText.RegExpUtility.isMatch(this.dayDescriptionRegex, source)) {
      description = source.substr(0, source.length - 1);
    }
    let hour = TimeResolutionUtils.matchToValue(this.onlyDigitMatch, this.numbersMap, source.substr(source.length - 1));
    let timeResult = new TimeResult(hour, -1, -1);
    TimeResolutionUtils.addDescription(this.lowBoundMap, timeResult, description);
    return timeResult;
  }
  buildDate(time, referenceTime) {
    let day = referenceTime.getDate();
    let month = referenceTime.getMonth();
    let year = referenceTime.getFullYear();
    let hour = time.hour > 0 ? time.hour : 0;
    let min = time.minute > 0 ? time.minute : 0;
    let sec = time.second > 0 ? time.second : 0;
    return DateUtils.safeCreateFromMinValue(year, month, day, hour, min, sec);
  }
  buildTimex(timeResult) {
    let timex = "T";
    if (timeResult.hour >= 0) {
      timex = timex + FormatUtil.toString(timeResult.hour, 2);
      if (timeResult.minute >= 0) {
        timex = timex + ":" + FormatUtil.toString(timeResult.minute, 2);
        if (timeResult.second >= 0) {
          timex = timex + ":" + FormatUtil.toString(timeResult.second, 2);
        }
      }
    }
    return timex;
  }
  buildSpan(left, right) {
    left = this.sanitizeTimeResult(left);
    right = this.sanitizeTimeResult(right);
    let spanHour = right.hour - left.hour;
    let spanMin = right.minute - left.minute;
    let spanSec = right.second - left.second;
    if (spanSec < 0) {
      spanSec += 60;
      spanMin -= 1;
    }
    if (spanMin < 0) {
      spanMin += 60;
      spanHour -= 1;
    }
    if (spanHour < 0) {
      spanHour += 24;
    }
    let spanTimex = `PT${spanHour}H`;
    if (spanMin !== 0 && spanSec === 0) {
      spanTimex = spanTimex + `${spanMin}M`;
    } else if (spanSec !== 0) {
      spanTimex = spanTimex + `${spanMin}M${spanSec}S`;
    }
    return spanTimex;
  }
  sanitizeTimeResult(timeResult) {
    return new TimeResult(
      timeResult.hour,
      timeResult.minute === -1 ? 0 : timeResult.minute,
      timeResult.second === -1 ? 0 : timeResult.second
    );
  }
};
var ChineseDatePeriodExtractorConfiguration = class {
  constructor() {
    this.simpleCasesRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SimpleCasesRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.OneWordPeriodRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.StrictYearRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearToYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearToYearSuffixRequired),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearAndMonth),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PureNumYearAndMonth),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodYearInChineseRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.WeekOfMonthRegex),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SeasonWithYear),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.QuarterRegex)
    ];
    this.datePointExtractor = new ChineseDateExtractor();
    this.integerExtractor = new recognizersTextNumber.ChineseIntegerExtractor();
    this.numberParser = new recognizersTextNumber.BaseNumberParser(new recognizersTextNumber.ChineseNumberParserConfiguration());
    this.illegalYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.BaseDateTime.IllegalYearRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodTillRegex);
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.FollowedUnit);
    this.numberCombinedWithUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.NumberCombinedWithUnit);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.FutureRegex);
  }
  getFromTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("\u4ECE")) {
      result.index = source.lastIndexOf("\u4ECE");
      result.matched = true;
    }
    return result;
  }
  getBetweenTokenIndex(source) {
    return { matched: false, index: -1 };
  }
  hasConnectorToken(source) {
    return false;
  }
};
var ChineseDatePeriodExtractor = class extends BaseDatePeriodExtractor {
  constructor() {
    super(new ChineseDatePeriodExtractorConfiguration());
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let tokens = new Array().concat(super.matchSimpleCases(source)).concat(super.mergeTwoTimePoints(source, refDate)).concat(this.matchNumberWithUnit(source));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchNumberWithUnit(source) {
    let tokens = new Array();
    let durations = new Array();
    this.config.integerExtractor.extract(source).forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      let followedUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.followedUnit, afterStr).pop();
      if (followedUnitMatch && followedUnitMatch.index === 0) {
        durations.push(new Token(er.start, er.start + er.length + followedUnitMatch.length));
      }
    });
    recognizersText.RegExpUtility.getMatches(this.config.numberCombinedWithUnit, source).forEach((match) => {
      durations.push(new Token(match.index, match.index + match.length));
    });
    durations.forEach((duration) => {
      let beforeStr = source.substr(0, duration.start).toLowerCase();
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) {
        return;
      }
      let match = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
      match = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
    });
    return tokens;
  }
};
var ChineseDatePeriodParserConfiguration = class {
  constructor() {
    this.simpleCasesRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SimpleCasesRegex);
    this.yearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodYearRegex);
    this.seasonRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SeasonRegex);
    this.seasonMap = exports.ChineseDateTime.ParserConfigurationSeasonMap;
    this.quarterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.QuarterRegex);
    this.cardinalMap = exports.ChineseDateTime.ParserConfigurationCardinalMap;
    this.unitMap = exports.ChineseDateTime.ParserConfigurationUnitMap;
    this.durationExtractor = new ChineseDurationExtractor();
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.FutureRegex);
    this.monthOfYear = exports.ChineseDateTime.ParserConfigurationMonthOfYear;
    this.dayOfMonth = exports.ChineseDateTime.ParserConfigurationDayOfMonth;
    this.monthOfYear = exports.ChineseDateTime.ParserConfigurationMonthOfYear;
    this.oneWordPeriodRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.OneWordPeriodRegex);
    this.dateExtractor = new ChineseDateExtractor();
    this.dateParser = new ChineseDateParser();
    this.tokenBeforeDate = "on ";
    this.weekOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.WeekOfMonthRegex);
    this.thisPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodThisRegex);
    this.nextPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodNextRegex);
    this.pastPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodLastRegex);
  }
  getSwiftDayOrMonth(source) {
    let trimmedSource = source.trim().toLowerCase();
    if (trimmedSource.endsWith("\u53BB\u5E74")) {
      return -1;
    }
    if (trimmedSource.endsWith("\u660E\u5E74")) {
      return 1;
    }
    if (trimmedSource.endsWith("\u524D\u5E74")) {
      return -2;
    }
    if (trimmedSource.endsWith("\u540E\u5E74")) {
      return 2;
    }
    if (trimmedSource.startsWith("\u4E0B\u4E2A")) {
      return 1;
    }
    if (trimmedSource.startsWith("\u4E0A\u4E2A")) {
      return -1;
    }
    if (recognizersText.RegExpUtility.isMatch(this.thisPrefixRegex, trimmedSource)) {
      return 0;
    }
    if (recognizersText.RegExpUtility.isMatch(this.nextPrefixRegex, trimmedSource)) {
      return 1;
    }
    if (recognizersText.RegExpUtility.isMatch(this.pastPrefixRegex, trimmedSource)) {
      return -1;
    }
    return 0;
  }
  getSwiftYear(source) {
    let trimmedSource = source.trim().toLowerCase();
    let swift = -10;
    if (trimmedSource.startsWith("\u660E\u5E74")) {
      swift = 1;
    } else if (trimmedSource.startsWith("\u53BB\u5E74")) {
      swift = -1;
    } else if (trimmedSource.startsWith("\u4ECA\u5E74")) {
      swift = 0;
    }
    return swift;
  }
  isFuture(source) {
    return recognizersText.RegExpUtility.isMatch(this.thisPrefixRegex, source) || recognizersText.RegExpUtility.isMatch(this.nextPrefixRegex, source);
  }
  isYearToDate(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource === "\u4ECA\u5E74";
  }
  isMonthToDate(source) {
    return false;
  }
  isWeekOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("\u5468") || trimmedSource.endsWith("\u661F\u671F");
  }
  isWeekend(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("\u5468\u672B");
  }
  isMonthOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("\u6708");
  }
  isYearOnly(source) {
    let trimmedSource = source.trim().toLowerCase();
    return trimmedSource.endsWith("\u5E74");
  }
  isLastCardinal(source) {
    return source === "\u6700\u540E\u4E00";
  }
};
var ChineseDatePeriodParser = class extends BaseDatePeriodParser {
  constructor() {
    let config = new ChineseDatePeriodParserConfiguration();
    super(config, false);
    this.integerExtractor = new recognizersTextNumber.ChineseIntegerExtractor();
    this.numberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Integer, new recognizersTextNumber.ChineseNumberParserConfiguration());
    this.yearInChineseRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodYearInChineseRegex);
    this.numberCombinedWithUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.NumberCombinedWithUnit);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.UnitRegex);
    this.yearAndMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearAndMonth);
    this.pureNumberYearAndMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PureNumYearAndMonth);
    this.yearToYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearToYear);
    this.YearToYearSuffixRequired = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.YearToYearSuffixRequired);
    this.chineseYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DatePeriodYearInChineseRegex);
    this.seasonWithYearRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SeasonWithYear);
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.trim().toLowerCase();
      let innerResult = this.parseSimpleCases(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.parseOneWordPeriod(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.mergeTwoTimePoints(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseNumberWithUnit(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseDuration(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseYearAndMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseYearToYear(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseYear(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseWeekOfMonth(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseSeason(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseQuarter(source, referenceDate);
      }
      if (innerResult.success) {
        if (innerResult.futureValue && innerResult.pastValue) {
          innerResult.futureResolution = {};
          innerResult.futureResolution[TimeTypeConstants.START_DATE] = FormatUtil.formatDate(innerResult.futureValue[0]);
          innerResult.futureResolution[TimeTypeConstants.END_DATE] = FormatUtil.formatDate(innerResult.futureValue[1]);
          innerResult.pastResolution = {};
          innerResult.pastResolution[TimeTypeConstants.START_DATE] = FormatUtil.formatDate(innerResult.pastValue[0]);
          innerResult.pastResolution[TimeTypeConstants.END_DATE] = FormatUtil.formatDate(innerResult.pastValue[1]);
        } else {
          innerResult.futureResolution = {};
          innerResult.pastResolution = {};
        }
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  getMatchSimpleCase(source) {
    return recognizersText.RegExpUtility.getMatches(this.config.simpleCasesRegex, source).pop();
  }
  parseSimpleCases(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let year = referenceDate.getFullYear();
    let month = referenceDate.getMonth();
    let noYear = false;
    let inputYear = false;
    let match = this.getMatchSimpleCase(source);
    if (!match || match.index !== 0 || match.length !== source.length) return result;
    let days = match.groups("day");
    let beginDay = this.config.dayOfMonth.get(days.captures[0]);
    let endDay = this.config.dayOfMonth.get(days.captures[1]);
    let monthStr = match.groups("month").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(monthStr)) {
      month = this.config.monthOfYear.get(monthStr) - 1;
    } else {
      monthStr = match.groups("relmonth").value;
      month += this.config.getSwiftDayOrMonth(monthStr);
      if (month < 0) {
        month = 0;
        year--;
      } else if (month > 11) {
        month = 11;
        year++;
      }
    }
    let yearStr = match.groups("year").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearStr)) {
      year = Number.parseInt(yearStr, 10);
      inputYear = true;
    } else {
      noYear = true;
    }
    let beginDateLuis = FormatUtil.luisDate(inputYear || this.config.isFuture(monthStr) ? year : -1, month, beginDay);
    let endDateLuis = FormatUtil.luisDate(inputYear || this.config.isFuture(monthStr) ? year : -1, month, endDay);
    let futureYear = year;
    let pastYear = year;
    let startDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, month, beginDay);
    if (noYear && startDate < referenceDate) futureYear++;
    if (noYear && startDate >= referenceDate) pastYear--;
    result.timex = `(${beginDateLuis},${endDateLuis},P${endDay - beginDay}D)`;
    result.futureValue = [
      DateUtils.safeCreateFromValue(DateUtils.minValue(), futureYear, month, beginDay),
      DateUtils.safeCreateFromValue(DateUtils.minValue(), futureYear, month, endDay)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromValue(DateUtils.minValue(), pastYear, month, beginDay),
      DateUtils.safeCreateFromValue(DateUtils.minValue(), pastYear, month, endDay)
    ];
    result.success = true;
    return result;
  }
  parseYear(source, referenceDate) {
    let trimmedSource = source.trim();
    let result = new DateTimeResolutionResult();
    let isChinese = false;
    let match = recognizersText.RegExpUtility.getMatches(this.config.yearRegex, trimmedSource).pop();
    if (!match || match.length !== trimmedSource.length) {
      match = recognizersText.RegExpUtility.getMatches(this.yearInChineseRegex, trimmedSource).pop();
      isChinese = match && match.length === trimmedSource.length;
    }
    if (!match || match.length !== trimmedSource.length) {
      return result;
    }
    let yearStr = match.value;
    if (this.config.isYearOnly(yearStr)) {
      yearStr = yearStr.substr(0, yearStr.length - 1).trim();
    }
    let year = this.convertYear(yearStr, isChinese);
    if (yearStr.length === 2) {
      if (year < 100 && year >= 30) {
        year += 1900;
      } else if (year < 30) {
        year += 2e3;
      }
    }
    let beginDay = DateUtils.safeCreateFromMinValue(year, 0, 1);
    let endDay = DateUtils.safeCreateFromMinValue(year + 1, 0, 1);
    result.timex = FormatUtil.toString(year, 4);
    result.futureValue = [beginDay, endDay];
    result.pastValue = [beginDay, endDay];
    result.success = true;
    return result;
  }
  convertYear(yearStr, isChinese) {
    let year = -1;
    let er;
    if (isChinese) {
      let yearNum = 0;
      er = this.integerExtractor.extract(yearStr).pop();
      if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
        yearNum = Number.parseInt(this.numberParser.parse(er).value);
      }
      if (yearNum < 10) {
        yearNum = 0;
        for (let index = 0; index < yearStr.length; index++) {
          let char = yearStr.charAt(index);
          yearNum *= 10;
          er = this.integerExtractor.extract(char).pop();
          if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
            yearNum += Number.parseInt(this.numberParser.parse(er).value);
          }
        }
        year = yearNum;
      } else {
        year = yearNum;
      }
    } else {
      year = Number.parseInt(yearStr, 10);
    }
    return year === 0 ? -1 : year;
  }
  getWeekOfMonth(cardinal, month, year, referenceDate, noYear) {
    let result = new DateTimeResolutionResult();
    let seedDate = this.computeDate(cardinal, 1, month, year);
    let futureDate = new Date(seedDate);
    let pastDate = new Date(seedDate);
    if (noYear && futureDate < referenceDate) {
      futureDate = this.computeDate(cardinal, 1, month, year + 1);
      if (futureDate.getMonth() !== month) {
        futureDate.setDate(futureDate.getDate() - 7);
      }
    }
    if (noYear && pastDate >= referenceDate) {
      pastDate = this.computeDate(cardinal, 1, month, year - 1);
      if (pastDate.getMonth() !== month) {
        pastDate.setDate(pastDate.getDate() - 7);
      }
    }
    result.timex = noYear ? `XXXX-${FormatUtil.toString(month + 1, 2)}-W${FormatUtil.toString(cardinal, 2)}` : `${FormatUtil.toString(year, 4)}-${FormatUtil.toString(month + 1, 2)}-W${FormatUtil.toString(cardinal, 2)}`;
    result.futureValue = [futureDate, DateUtils.addDays(futureDate, this.inclusiveEndPeriod ? 6 : 7)];
    result.pastValue = [pastDate, DateUtils.addDays(pastDate, this.inclusiveEndPeriod ? 6 : 7)];
    result.success = true;
    return result;
  }
  computeDate(cardinal, weekday, month, year) {
    let firstDay = new Date(year, month, 1);
    let firstWeekday = DateUtils.this(firstDay, weekday);
    if (weekday === 0) weekday = 7;
    if (weekday < firstDay.getDay()) firstWeekday = DateUtils.next(firstDay, weekday);
    firstWeekday.setDate(firstWeekday.getDate() + 7 * (cardinal - 1));
    return firstWeekday;
  }
  parseSeason(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.seasonWithYearRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let year = referenceDate.getFullYear();
    let yearNum = match.groups("year").value;
    let yearChinese = match.groups("yearchs").value;
    let yearRelative = match.groups("yearrel").value;
    let hasYear = false;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearNum)) {
      hasYear = true;
      if (this.config.isYearOnly(yearNum)) {
        yearNum = yearNum.substr(0, yearNum.length - 1);
      }
      year = this.convertYear(yearNum, false);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearChinese)) {
      hasYear = true;
      if (this.config.isYearOnly(yearChinese)) {
        yearChinese = yearChinese.substr(0, yearChinese.length - 1);
      }
      year = this.convertYear(yearChinese, true);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearRelative)) {
      hasYear = true;
      year += this.config.getSwiftDayOrMonth(yearRelative);
    }
    if (year < 100 && year >= 90) {
      year += 1900;
    } else if (year < 100 && year < 20) {
      year += 2e3;
    }
    let seasonStr = match.groups("season").value;
    let season = this.config.seasonMap.get(seasonStr);
    if (hasYear) {
      result.timex = `${FormatUtil.toString(year, 4)}-${season}`;
    }
    result.success = true;
    return result;
  }
  parseQuarter(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.quarterRegex, source).pop();
    if (!match || match.length !== source.length) return result;
    let year = referenceDate.getFullYear();
    let yearNum = match.groups("year").value;
    let yearChinese = match.groups("yearchs").value;
    let yearRelative = match.groups("yearrel").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearNum)) {
      if (this.config.isYearOnly(yearNum)) {
        yearNum = yearNum.substr(0, yearNum.length - 1);
      }
      year = this.convertYear(yearNum, false);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearChinese)) {
      if (this.config.isYearOnly(yearChinese)) {
        yearChinese = yearChinese.substr(0, yearChinese.length - 1);
      }
      year = this.convertYear(yearChinese, true);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearRelative)) {
      year += this.config.getSwiftDayOrMonth(yearRelative);
    }
    if (year < 100 && year >= 90) {
      year += 1900;
    } else if (year < 100 && year < 20) {
      year += 2e3;
    }
    let cardinalStr = match.groups("cardinal").value;
    let quarterNum = this.config.cardinalMap.get(cardinalStr);
    let beginDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, quarterNum * 3 - 3, 1);
    let endDate = DateUtils.safeCreateFromValue(DateUtils.minValue(), year, quarterNum * 3, 1);
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.timex = `(${FormatUtil.luisDateFromDate(beginDate)},${FormatUtil.luisDateFromDate(endDate)},P3M)`;
    result.success = true;
    return result;
  }
  parseNumberWithUnit(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.numberCombinedWithUnitRegex, source).pop();
    if (!match) return result;
    let sourceUnit = match.groups("unit").value.trim().toLowerCase();
    if (!this.config.unitMap.has(sourceUnit)) return result;
    let numStr = match.groups("num").value;
    let beforeStr = source.substr(0, match.index).trim().toLowerCase();
    return this.parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, referenceDate);
  }
  parseDuration(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let durationResult = this.config.durationExtractor.extract(source, referenceDate).pop();
    if (!durationResult) return result;
    let match = recognizersText.RegExpUtility.getMatches(this.unitRegex, durationResult.text).pop();
    if (!match) return result;
    let sourceUnit = match.groups("unit").value.trim().toLowerCase();
    if (!this.config.unitMap.has(sourceUnit)) return result;
    let beforeStr = source.substr(0, durationResult.start).trim().toLowerCase();
    let numberStr = durationResult.text.substr(0, match.index).trim().toLowerCase();
    let numberValue = this.convertChineseToNumber(numberStr);
    let numStr = numberValue.toString();
    return this.parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, referenceDate);
  }
  parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, referenceDate) {
    let result = new DateTimeResolutionResult();
    let unitStr = this.config.unitMap.get(sourceUnit);
    let pastMatch = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
    let hasPast = pastMatch && pastMatch.length === beforeStr.length;
    let futureMatch = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
    let hasFuture = futureMatch && futureMatch.length === beforeStr.length;
    if (!hasFuture && !hasPast) {
      return result;
    }
    let beginDate = new Date(referenceDate);
    let endDate = new Date(referenceDate);
    let difference = Number.parseFloat(numStr);
    switch (unitStr) {
      case "D":
        beginDate = hasPast ? DateUtils.addDays(referenceDate, -difference) : beginDate;
        endDate = hasFuture ? DateUtils.addDays(referenceDate, difference) : endDate;
        break;
      case "W":
        beginDate = hasPast ? DateUtils.addDays(referenceDate, -7 * difference) : beginDate;
        endDate = hasFuture ? DateUtils.addDays(referenceDate, 7 * difference) : endDate;
        break;
      case "MON":
        beginDate = hasPast ? DateUtils.addMonths(referenceDate, -Math.round(difference)) : beginDate;
        endDate = hasFuture ? DateUtils.addMonths(referenceDate, Math.round(difference)) : endDate;
        break;
      case "Y":
        beginDate = hasPast ? DateUtils.addYears(referenceDate, -Math.round(difference)) : beginDate;
        endDate = hasFuture ? DateUtils.addYears(referenceDate, Math.round(difference)) : endDate;
        break;
      default:
        return result;
    }
    if (hasFuture) {
      beginDate = DateUtils.addDays(beginDate, 1);
      endDate = DateUtils.addDays(endDate, 1);
    }
    let beginTimex = FormatUtil.luisDateFromDate(beginDate);
    let endTimex = FormatUtil.luisDateFromDate(endDate);
    result.timex = `(${beginTimex},${endTimex},P${numStr}${unitStr.charAt(0)})`;
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.success = true;
    return result;
  }
  convertChineseToNumber(source) {
    let num = -1;
    let er = this.integerExtractor.extract(source).pop();
    if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
      num = Number.parseInt(this.numberParser.parse(er).value);
    }
    return num;
  }
  parseYearAndMonth(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.yearAndMonthRegex, source).pop();
    if (!match || match.length !== source.length) {
      match = recognizersText.RegExpUtility.getMatches(this.pureNumberYearAndMonthRegex, source).pop();
    }
    if (!match || match.length !== source.length) {
      return result;
    }
    let year = referenceDate.getFullYear();
    let yearNum = match.groups("year").value;
    let yearChinese = match.groups("yearchs").value;
    let yearRelative = match.groups("yearrel").value;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearNum)) {
      if (this.config.isYearOnly(yearNum)) {
        yearNum = yearNum.substr(0, yearNum.length - 1);
      }
      year = this.convertYear(yearNum, false);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearChinese)) {
      if (this.config.isYearOnly(yearChinese)) {
        yearChinese = yearChinese.substr(0, yearChinese.length - 1);
      }
      year = this.convertYear(yearChinese, true);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearRelative)) {
      year += this.config.getSwiftDayOrMonth(yearRelative);
    }
    if (year < 100 && year >= 90) {
      year += 1900;
    } else if (year < 100 && year < 20) {
      year += 2e3;
    }
    let monthStr = match.groups("month").value.toLowerCase();
    let month = this.config.monthOfYear.get(monthStr) % 12 - 1;
    let beginDate = DateUtils.safeCreateFromMinValue(year, month, 1);
    let endDate = month === 11 ? DateUtils.safeCreateFromMinValue(year + 1, 0, 1) : DateUtils.safeCreateFromMinValue(year, month + 1, 1);
    result.timex = FormatUtil.toString(year, 4) + "-" + FormatUtil.toString(month, 2);
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.success = true;
    return result;
  }
  parseYearToYear(source, referenceDate) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.yearToYearRegex, source).pop();
    if (!match) {
      let match2 = recognizersText.RegExpUtility.getMatches(this.YearToYearSuffixRequired, source).pop();
      if (!match2) {
        return result;
      }
    }
    let yearMatches = recognizersText.RegExpUtility.getMatches(this.config.yearRegex, source);
    let chineseYearMatches = recognizersText.RegExpUtility.getMatches(this.chineseYearRegex, source);
    let beginYear = 0;
    let endYear = 0;
    if (yearMatches.length === 2) {
      beginYear = this.convertChineseToNumber(yearMatches[0].groups("year").value);
      endYear = this.convertChineseToNumber(yearMatches[1].groups("year").value);
    } else if (chineseYearMatches.length === 2) {
      beginYear = this.convertYear(chineseYearMatches[0].groups("yearchs").value, true);
      endYear = this.convertYear(chineseYearMatches[1].groups("yearchs").value, true);
    } else if (yearMatches.length === 1 && chineseYearMatches.length === 1) {
      if (yearMatches[0].index < chineseYearMatches[0].index) {
        beginYear = this.convertChineseToNumber(yearMatches[0].groups("year").value);
        endYear = this.convertChineseToNumber(chineseYearMatches[0].groups("yearchs").value);
      } else {
        beginYear = this.convertChineseToNumber(chineseYearMatches[0].groups("yearchs").value);
        endYear = this.convertChineseToNumber(yearMatches[0].groups("year").value);
      }
    }
    beginYear = this.sanitizeYear(beginYear);
    endYear = this.sanitizeYear(endYear);
    let beginDate = DateUtils.safeCreateFromMinValue(beginYear, 0, 1);
    let endDate = DateUtils.safeCreateFromMinValue(endYear, 0, 1);
    let beginTimex = FormatUtil.luisDateFromDate(beginDate);
    let endTimex = FormatUtil.luisDateFromDate(endDate);
    result.timex = `(${beginTimex},${endTimex},P${endYear - beginYear}Y)`;
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.success = true;
    return result;
  }
  sanitizeYear(year) {
    let result = year;
    if (year < 100 && year >= 90) {
      result += 1900;
    } else if (year < 100 && year < 20) {
      result += 2e3;
    }
    return result;
  }
};
var ChineseDateTimePeriodExtractorConfiguration = class {
  getFromTokenIndex(source) {
    let result = { matched: false, index: -1 };
    if (source.endsWith("\u4ECE")) {
      result.index = source.lastIndexOf("\u4ECE");
      result.matched = true;
    }
    return result;
  }
  getBetweenTokenIndex(source) {
    return { matched: false, index: -1 };
  }
  hasConnectorToken(source) {
    return source === "\u548C" || source === " \u4E0E" || source === "\u5230";
  }
  constructor() {
    this.singleDateExtractor = new ChineseDateExtractor();
    this.singleTimeExtractor = new ChineseTimeExtractor();
    this.singleDateTimeExtractor = new ChineseDateTimeExtractor();
    this.prepositionRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodPrepositionRegex);
    this.tillRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodTillRegex);
    this.cardinalExtractor = new recognizersTextNumber.ChineseCardinalExtractor();
    this.followedUnit = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodFollowedUnit);
    this.timeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodUnitRegex);
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecificTimeOfDayRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfDayRegex);
  }
};
var ChineseDateTimePeriodExtractor = class extends BaseDateTimePeriodExtractor {
  constructor() {
    super(new ChineseDateTimePeriodExtractorConfiguration());
    this.zhijianRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.ZhijianRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.FutureRegex);
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(this.mergeDateAndTimePeriod(source, referenceDate)).concat(this.mergeTwoTimePoints(source, referenceDate)).concat(this.matchNubmerWithUnit(source)).concat(this.matchNight(source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  mergeDateAndTimePeriod(source, refDate) {
    let tokens = new Array();
    let ersDate = this.config.singleDateExtractor.extract(source, refDate);
    let ersTime = this.config.singleTimeExtractor.extract(source, refDate);
    let timeResults = new Array();
    let j = 0;
    for (let i = 0; i < ersDate.length; i++) {
      timeResults.push(ersDate[i]);
      while (j < ersTime.length && ersTime[j].start + ersTime[j].length <= ersDate[i].start) {
        timeResults.push(ersTime[j]);
        j++;
      }
      while (j < ersTime.length && recognizersText.ExtractResult.isOverlap(ersTime[j], ersDate[i])) {
        j++;
      }
    }
    for (j; j < ersTime.length; j++) {
      timeResults.push(ersTime[j]);
    }
    timeResults = timeResults.sort((a, b) => a.start > b.start ? 1 : a.start < b.start ? -1 : 0);
    let idx = 0;
    while (idx < timeResults.length - 1) {
      let current = timeResults[idx];
      let next = timeResults[idx + 1];
      if (current.type === Constants.SYS_DATETIME_DATE && next.type === Constants.SYS_DATETIME_TIMEPERIOD) {
        let middleBegin = current.start + current.length;
        let middleEnd = next.start;
        let middleStr = source.substring(middleBegin, middleEnd).trim();
        if (recognizersText.StringUtility.isNullOrWhitespace(middleStr) || recognizersText.RegExpUtility.isMatch(this.config.prepositionRegex, middleStr)) {
          let periodBegin = current.start;
          let periodEnd = next.start + next.length;
          tokens.push(new Token(periodBegin, periodEnd));
        }
        idx++;
      }
      idx++;
    }
    return tokens;
  }
  mergeTwoTimePoints(source, refDate) {
    let tokens = new Array();
    let ersDateTime = this.config.singleDateTimeExtractor.extract(source, refDate);
    let ersTime = this.config.singleTimeExtractor.extract(source, refDate);
    let innerMarks = [];
    let j = 0;
    ersDateTime.forEach((erDateTime, index) => {
      innerMarks.push(erDateTime);
      while (j < ersTime.length && ersTime[j].start + ersTime[j].length < erDateTime.start) {
        innerMarks.push(ersTime[j++]);
      }
      while (j < ersTime.length && recognizersText.ExtractResult.isOverlap(ersTime[j], erDateTime)) {
        j++;
      }
    });
    while (j < ersTime.length) {
      innerMarks.push(ersTime[j++]);
    }
    innerMarks = innerMarks.sort((erA, erB) => erA.start < erB.start ? -1 : erA.start === erB.start ? 0 : 1);
    let idx = 0;
    while (idx < innerMarks.length - 1) {
      let currentMark = innerMarks[idx];
      let nextMark = innerMarks[idx + 1];
      if (currentMark.type === Constants.SYS_DATETIME_TIME && nextMark.type === Constants.SYS_DATETIME_TIME) {
        idx++;
        continue;
      }
      let middleBegin = currentMark.start + currentMark.length;
      let middleEnd = nextMark.start;
      let middleStr = source.substr(middleBegin, middleEnd - middleBegin).trim().toLowerCase();
      let matches = recognizersText.RegExpUtility.getMatches(this.config.tillRegex, middleStr);
      if (matches && matches.length > 0 && matches[0].index === 0 && matches[0].length === middleStr.length) {
        let periodBegin = currentMark.start;
        let periodEnd = nextMark.start + nextMark.length;
        let beforeStr = source.substr(0, periodBegin).trim().toLowerCase();
        let fromTokenIndex = this.config.getFromTokenIndex(beforeStr);
        if (fromTokenIndex.matched) {
          periodBegin = fromTokenIndex.index;
        }
        tokens.push(new Token(periodBegin, periodEnd));
        idx += 2;
        continue;
      }
      if (this.config.hasConnectorToken(middleStr)) {
        let periodBegin = currentMark.start;
        let periodEnd = nextMark.start + nextMark.length;
        let afterStr = source.substr(periodEnd).trim().toLowerCase();
        let match = recognizersText.RegExpUtility.getMatches(this.zhijianRegex, afterStr).pop();
        if (match) {
          tokens.push(new Token(periodBegin, periodEnd + match.length));
          idx += 2;
          continue;
        }
      }
      idx++;
    }
    return tokens;
  }
  matchNubmerWithUnit(source) {
    let tokens = new Array();
    let durations = new Array();
    this.config.cardinalExtractor.extract(source).forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      let followedUnitMatch = recognizersText.RegExpUtility.getMatches(this.config.followedUnit, afterStr).pop();
      if (followedUnitMatch && followedUnitMatch.index === 0) {
        durations.push(new Token(er.start, er.start + er.length + followedUnitMatch.length));
      }
    });
    recognizersText.RegExpUtility.getMatches(this.config.timeUnitRegex, source).forEach((match) => {
      durations.push(new Token(match.index, match.index + match.length));
    });
    durations.forEach((duration) => {
      let beforeStr = source.substr(0, duration.start).toLowerCase();
      if (recognizersText.StringUtility.isNullOrWhitespace(beforeStr)) {
        return;
      }
      let match = recognizersText.RegExpUtility.getMatches(this.pastRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
      match = recognizersText.RegExpUtility.getMatches(this.futureRegex, beforeStr).pop();
      if (match && recognizersText.StringUtility.isNullOrWhitespace(beforeStr.substr(match.index + match.length))) {
        tokens.push(new Token(match.index, duration.end));
        return;
      }
    });
    return tokens;
  }
  matchNight(source, refDate) {
    let tokens = new Array();
    recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, source).forEach((match) => {
      tokens.push(new Token(match.index, match.index + match.length));
    });
    this.config.singleDateExtractor.extract(source, refDate).forEach((er) => {
      let afterStr = source.substr(er.start + er.length);
      let match = recognizersText.RegExpUtility.getMatches(this.config.timeOfDayRegex, afterStr).pop();
      if (match) {
        let middleStr = source.substr(0, match.index);
        if (recognizersText.StringUtility.isNullOrWhitespace(middleStr) || recognizersText.RegExpUtility.isMatch(this.config.prepositionRegex, middleStr)) {
          tokens.push(new Token(er.start, er.start + er.length + match.index + match.length));
        }
      }
    });
    return tokens;
  }
};
var ChineseDateTimePeriodParserConfiguration = class {
  constructor() {
    this.dateExtractor = new ChineseDateExtractor();
    this.timeExtractor = new ChineseTimeExtractor();
    this.dateTimeExtractor = new ChineseDateTimeExtractor();
    this.timePeriodExtractor = new ChineseTimePeriodExtractor();
    this.dateParser = new ChineseDateParser();
    this.timeParser = new ChineseTimeParser();
    this.dateTimeParser = new ChineseDateTimeParser();
    this.timePeriodParser = new ChineseTimePeriodParser();
    this.specificTimeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SpecificTimeOfDayRegex);
    this.relativeTimeUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfDayRegex);
    this.pastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.PastRegex);
    this.futureRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.FutureRegex);
    this.unitMap = exports.ChineseDateTime.ParserConfigurationUnitMap;
  }
  getMatchedTimeRange(source) {
    let swift = 0;
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    let timeStr = "";
    switch (source) {
      case "\u4ECA\u665A":
        swift = 0;
        timeStr = "TEV";
        beginHour = 16;
        endHour = 20;
        break;
      case "\u4ECA\u65E9":
      case "\u4ECA\u6668":
        swift = 0;
        timeStr = "TMO";
        beginHour = 8;
        endHour = 12;
        break;
      case "\u660E\u665A":
        swift = 1;
        timeStr = "TEV";
        beginHour = 16;
        endHour = 20;
        break;
      case "\u660E\u65E9":
      case "\u660E\u6668":
        swift = 1;
        timeStr = "TMO";
        beginHour = 8;
        endHour = 12;
        break;
      case "\u6628\u665A":
        swift = -1;
        timeStr = "TEV";
        beginHour = 16;
        endHour = 20;
        break;
      default:
        return {
          timeStr: "",
          beginHour: 0,
          endHour: 0,
          endMin: 0,
          swift: 0,
          success: false
        };
    }
    return {
      timeStr,
      beginHour,
      endHour,
      endMin,
      swift,
      success: true
    };
  }
  getSwiftPrefix(source) {
    return null;
  }
};
var ChineseDateTimePeriodParser = class extends BaseDateTimePeriodParser {
  constructor() {
    let config = new ChineseDateTimePeriodParserConfiguration();
    super(config);
    this.TMORegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodMORegex);
    this.TAFRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodAFRegex);
    this.TEVRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodEVRegex);
    this.TNIRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodNIRegex);
    this.unitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.DateTimePeriodUnitRegex);
    this.timeOfDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.TimeOfDayRegex);
    this.cardinalExtractor = new recognizersTextNumber.ChineseCardinalExtractor();
    this.cardinalParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Cardinal, new recognizersTextNumber.ChineseNumberParserConfiguration());
  }
  parse(extractorResult, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let resultValue;
    if (extractorResult.type === this.parserName) {
      let source = extractorResult.text.trim().toLowerCase();
      let innerResult = this.mergeDateAndTimePeriods(source, referenceDate);
      if (!innerResult.success) {
        innerResult = this.mergeTwoTimePoints(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseSpecificTimeOfDay(source, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseNumberWithUnit(source, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.START_DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue[0]);
        innerResult.futureResolution[TimeTypeConstants.END_DATETIME] = FormatUtil.formatDateTime(innerResult.futureValue[1]);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.START_DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue[0]);
        innerResult.pastResolution[TimeTypeConstants.END_DATETIME] = FormatUtil.formatDateTime(innerResult.pastValue[1]);
        resultValue = innerResult;
      }
    }
    let result = new DateTimeParseResult(extractorResult);
    result.value = resultValue;
    result.timexStr = resultValue ? resultValue.timex : "";
    result.resolutionStr = "";
    return result;
  }
  mergeDateAndTimePeriods(text, referenceTime) {
    let result = new DateTimeResolutionResult();
    let erDate = this.config.dateExtractor.extract(text, referenceTime).pop();
    let erTimePeriod = this.config.timePeriodExtractor.extract(text, referenceTime).pop();
    if (!erDate || !erTimePeriod) return result;
    let prDate = this.config.dateParser.parse(erDate, referenceTime);
    let prTimePeriod = this.config.timePeriodParser.parse(erTimePeriod, referenceTime);
    let split = prTimePeriod.timexStr.split("T");
    if (split.length !== 4) {
      return result;
    }
    let beginTime = prTimePeriod.value.futureValue.item1;
    let endTime = prTimePeriod.value.futureValue.item2;
    let futureDate = prDate.value.futureValue;
    let pastDate = prDate.value.pastValue;
    result.futureValue = [
      DateUtils.safeCreateFromMinValueWithDateAndTime(futureDate, beginTime),
      DateUtils.safeCreateFromMinValueWithDateAndTime(futureDate, endTime)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromMinValueWithDateAndTime(pastDate, beginTime),
      DateUtils.safeCreateFromMinValueWithDateAndTime(pastDate, endTime)
    ];
    let dateTimex = prDate.timexStr;
    result.timex = `${split[0]}${dateTimex}T${split[1]}${dateTimex}T${split[2]}T${split[3]}`;
    result.success = true;
    return result;
  }
  mergeTwoTimePoints(text, referenceTime) {
    let result = new DateTimeResolutionResult();
    let prs;
    let timeErs = this.config.timeExtractor.extract(text, referenceTime);
    let datetimeErs = this.config.dateTimeExtractor.extract(text, referenceTime);
    let bothHasDate = false;
    let beginHasDate = false;
    let endHasDate = false;
    if (datetimeErs.length === 2) {
      prs = this.getTwoPoints(datetimeErs[0], datetimeErs[1], this.config.dateTimeParser, this.config.dateTimeParser, referenceTime);
      bothHasDate = true;
    } else if (datetimeErs.length === 1 && timeErs.length === 2) {
      if (recognizersText.ExtractResult.isOverlap(datetimeErs[0], timeErs[0])) {
        prs = this.getTwoPoints(datetimeErs[0], timeErs[1], this.config.dateTimeParser, this.config.timeParser, referenceTime);
        beginHasDate = true;
      } else {
        prs = this.getTwoPoints(timeErs[0], datetimeErs[0], this.config.timeParser, this.config.dateTimeParser, referenceTime);
        endHasDate = true;
      }
    } else if (datetimeErs.length === 1 && timeErs.length === 1) {
      if (timeErs[0].start < datetimeErs[0].start) {
        prs = this.getTwoPoints(timeErs[0], datetimeErs[0], this.config.timeParser, this.config.dateTimeParser, referenceTime);
        endHasDate = true;
      } else {
        prs = this.getTwoPoints(datetimeErs[0], timeErs[0], this.config.dateTimeParser, this.config.timeParser, referenceTime);
        beginHasDate = true;
      }
    }
    if (!prs || !prs.begin.value || !prs.end.value) return result;
    let futureBegin = prs.begin.value.futureValue;
    let futureEnd = prs.end.value.futureValue;
    let pastBegin = prs.begin.value.pastValue;
    let pastEnd = prs.end.value.pastValue;
    if (futureBegin.getTime() > futureEnd.getTime()) futureBegin = pastBegin;
    if (pastEnd.getTime() < pastBegin.getTime()) pastEnd = futureEnd;
    let rightTime = DateUtils.safeCreateFromMinValueWithDateAndTime(referenceTime);
    let leftTime = DateUtils.safeCreateFromMinValueWithDateAndTime(referenceTime);
    if (bothHasDate) {
      rightTime = DateUtils.safeCreateFromMinValueWithDateAndTime(futureEnd);
      leftTime = DateUtils.safeCreateFromMinValueWithDateAndTime(futureBegin);
    } else if (beginHasDate) {
      futureEnd = DateUtils.safeCreateFromMinValueWithDateAndTime(futureBegin, futureEnd);
      pastEnd = DateUtils.safeCreateFromMinValueWithDateAndTime(pastBegin, pastEnd);
      leftTime = DateUtils.safeCreateFromMinValueWithDateAndTime(futureBegin);
    } else if (endHasDate) {
      futureBegin = DateUtils.safeCreateFromMinValueWithDateAndTime(futureEnd, futureBegin);
      pastBegin = DateUtils.safeCreateFromMinValueWithDateAndTime(pastEnd, pastBegin);
      rightTime = DateUtils.safeCreateFromMinValueWithDateAndTime(futureEnd);
    }
    let leftResult = prs.begin.value;
    let rightResult = prs.end.value;
    let leftResultTime = leftResult.futureValue;
    let rightResultTime = rightResult.futureValue;
    leftTime = DateUtils.addTime(leftTime, leftResultTime);
    rightTime = DateUtils.addTime(rightTime, rightResultTime);
    if (rightResult.comment === "ampm" && !leftResult.comment && rightTime.getTime() < leftTime.getTime()) {
      rightTime = DateUtils.addHours(rightTime, 12);
    }
    if (rightTime.getTime() < leftTime.getTime()) {
      rightTime = DateUtils.addDays(rightTime, 1);
    }
    result.futureValue = [leftTime, rightTime];
    result.pastValue = [leftTime, rightTime];
    let hasFuzzyTimex = prs.begin.timexStr.includes("X") || prs.end.timexStr.includes("X");
    let leftTimex = hasFuzzyTimex ? prs.begin.timexStr : FormatUtil.luisDateTime(leftTime);
    let rightTimex = hasFuzzyTimex ? prs.end.timexStr : FormatUtil.luisDateTime(rightTime);
    let hoursBetween = DateUtils.totalHours(rightTime, leftTime);
    result.timex = `(${leftTimex},${rightTimex},PT${hoursBetween}H)`;
    result.success = true;
    return result;
  }
  parseSpecificTimeOfDay(text, referenceTime) {
    let result = new DateTimeResolutionResult();
    let source = text.trim().toLowerCase();
    let match = recognizersText.RegExpUtility.getMatches(this.config.specificTimeOfDayRegex, source).pop();
    if (match && match.index === 0 && match.length === source.length) {
      let values = this.config.getMatchedTimeRange(source);
      if (!values.success) {
        return result;
      }
      let swift = values.swift;
      let date = DateUtils.addDays(referenceTime, swift);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      result.timex = FormatUtil.formatDate(date) + values.timeStr;
      result.futureValue = [
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), values.beginHour, 0, 0),
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), values.endHour, values.endMin, values.endMin)
      ];
      result.pastValue = [
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), values.beginHour, 0, 0),
        DateUtils.safeCreateFromMinValue(date.getFullYear(), date.getMonth(), date.getDate(), values.endHour, values.endMin, values.endMin)
      ];
      result.success = true;
      return result;
    }
    let beginHour = 0;
    let endHour = 0;
    let endMin = 0;
    let timeStr = "";
    if (recognizersText.RegExpUtility.isMatch(this.TMORegex, source)) {
      timeStr = "TMO";
      beginHour = 8;
      endHour = 12;
    } else if (recognizersText.RegExpUtility.isMatch(this.TAFRegex, source)) {
      timeStr = "TAF";
      beginHour = 12;
      endHour = 16;
    } else if (recognizersText.RegExpUtility.isMatch(this.TEVRegex, source)) {
      timeStr = "TEV";
      beginHour = 16;
      endHour = 20;
    } else if (recognizersText.RegExpUtility.isMatch(this.TNIRegex, source)) {
      timeStr = "TNI";
      beginHour = 20;
      endHour = 23;
      endMin = 59;
    } else {
      return result;
    }
    let timeMatch = recognizersText.RegExpUtility.getMatches(this.timeOfDayRegex, source).pop();
    if (!timeMatch) return result;
    let beforeStr = source.substr(0, timeMatch.index).trim();
    let erDate = this.config.dateExtractor.extract(beforeStr, referenceTime).pop();
    if (!erDate || erDate.length !== beforeStr.length) return result;
    let prDate = this.config.dateParser.parse(erDate, referenceTime);
    let futureDate = prDate.value.futureValue;
    let pastDate = prDate.value.pastValue;
    result.timex = prDate.timexStr + timeStr;
    result.futureValue = [
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), endHour, endMin, endMin)
    ];
    result.pastValue = [
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), beginHour, 0, 0),
      DateUtils.safeCreateFromMinValue(pastDate.getFullYear(), pastDate.getMonth(), pastDate.getDate(), endHour, endMin, endMin)
    ];
    result.success = true;
    return result;
  }
  parseNumberWithUnit(text, referenceTime) {
    let result = new DateTimeResolutionResult();
    let ers = this.cardinalExtractor.extract(text);
    if (ers.length === 1) {
      let er = ers[0];
      let pr = this.cardinalParser.parse(er);
      let sourceUnit = text.substr(er.start + er.length).trim().toLowerCase();
      if (sourceUnit.startsWith("\u4E2A")) {
        sourceUnit = sourceUnit.substr(1);
      }
      let beforeStr = text.substr(0, er.start).trim().toLowerCase();
      return this.parseCommonDurationWithUnit(beforeStr, sourceUnit, pr.resolutionStr, pr.value, referenceTime);
    }
    let match = recognizersText.RegExpUtility.getMatches(this.unitRegex, text).pop();
    if (match) {
      let srcUnit = match.groups("unit").value;
      let beforeStr = text.substr(0, match.index).trim().toLowerCase();
      return this.parseCommonDurationWithUnit(beforeStr, srcUnit, "1", 1, referenceTime);
    }
    return result;
  }
  parseDuration(text, referenceTime) {
    let result = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.relativeTimeUnitRegex, text).pop();
    if (!match) return result;
    let sourceUnit = match.groups("unit").value.toLowerCase();
    let beforeStr = text.substr(0, match.index).trim().toLowerCase();
    return this.parseCommonDurationWithUnit(beforeStr, sourceUnit, "1", 1, referenceTime);
  }
  parseCommonDurationWithUnit(beforeStr, sourceUnit, numStr, swift, referenceDate) {
    let result = new DateTimeResolutionResult();
    if (!this.config.unitMap.has(sourceUnit)) return result;
    let unitStr = this.config.unitMap.get(sourceUnit);
    let pastMatch = recognizersText.RegExpUtility.getMatches(this.config.pastRegex, beforeStr).pop();
    let hasPast = pastMatch && pastMatch.length === beforeStr.length;
    let futureMatch = recognizersText.RegExpUtility.getMatches(this.config.futureRegex, beforeStr).pop();
    let hasFuture = futureMatch && futureMatch.length === beforeStr.length;
    if (!hasPast && !hasFuture) return result;
    let beginDate = new Date(referenceDate);
    let endDate = new Date(referenceDate);
    switch (unitStr) {
      case "H":
        beginDate = hasPast ? DateUtils.addHours(beginDate, -swift) : beginDate;
        endDate = hasFuture ? DateUtils.addHours(endDate, swift) : endDate;
        break;
      case "M":
        beginDate = hasPast ? DateUtils.addMinutes(beginDate, -swift) : beginDate;
        endDate = hasFuture ? DateUtils.addMinutes(endDate, swift) : endDate;
        break;
      case "S":
        beginDate = hasPast ? DateUtils.addSeconds(beginDate, -swift) : beginDate;
        endDate = hasFuture ? DateUtils.addSeconds(endDate, swift) : endDate;
        break;
      default:
        return result;
    }
    let beginTimex = `${FormatUtil.luisDateFromDate(beginDate)}T${FormatUtil.luisTimeFromDate(beginDate)}`;
    let endTimex = `${FormatUtil.luisDateFromDate(endDate)}T${FormatUtil.luisTimeFromDate(endDate)}`;
    result.timex = `(${beginTimex},${endTimex},PT${numStr}${unitStr.charAt(0)})`;
    result.futureValue = [beginDate, endDate];
    result.pastValue = [beginDate, endDate];
    result.success = true;
    return result;
  }
};
var ChineseSetExtractorConfiguration = class {
  constructor() {
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachUnitRegex);
    this.durationExtractor = new ChineseDurationExtractor();
    this.lastRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetLastRegex);
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachPrefixRegex);
    this.timeExtractor = new ChineseTimeExtractor();
    this.beforeEachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachDayRegex);
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachDayRegex);
    this.dateExtractor = new ChineseDateExtractor();
    this.dateTimeExtractor = new ChineseDateTimeExtractor();
  }
};
var ChineseSetExtractor = class extends BaseSetExtractor {
  constructor() {
    super(new ChineseSetExtractorConfiguration());
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let tokens = new Array().concat(super.matchEachUnit(source)).concat(super.matchEachDuration(source, referenceDate)).concat(this.matchEachSpecific(this.config.timeExtractor, this.config.eachDayRegex, source, referenceDate)).concat(this.matchEachSpecific(this.config.dateExtractor, this.config.eachPrefixRegex, source, referenceDate)).concat(this.matchEachSpecific(this.config.dateTimeExtractor, this.config.eachPrefixRegex, source, referenceDate));
    let result = Token.mergeAllTokens(tokens, source, this.extractorName);
    return result;
  }
  matchEachSpecific(extractor, eachRegex, source, refDate) {
    let ret = [];
    extractor.extract(source, refDate).forEach((er) => {
      let beforeStr = source.substr(0, er.start);
      let beforeMatch = recognizersText.RegExpUtility.getMatches(eachRegex, beforeStr).pop();
      if (beforeMatch) {
        ret.push(new Token(beforeMatch.index, er.start + er.length));
      }
    });
    return ret;
  }
};
var ChineseSetParserConfiguration = class {
  constructor() {
    this.dateExtractor = new ChineseDateExtractor();
    this.timeExtractor = new ChineseTimeExtractor();
    this.durationExtractor = new ChineseDurationExtractor();
    this.dateTimeExtractor = new ChineseDateTimeExtractor();
    this.dateParser = new ChineseDateParser();
    this.timeParser = new ChineseTimeParser();
    this.durationParser = new ChineseDurationParser();
    this.dateTimeParser = new ChineseDateTimeParser();
    this.unitMap = exports.ChineseDateTime.ParserConfigurationUnitMap;
    this.eachUnitRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachUnitRegex);
    this.eachDayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachDayRegex);
    this.eachPrefixRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.SetEachPrefixRegex);
  }
  getMatchedDailyTimex(text) {
    return null;
  }
  getMatchedUnitTimex(source) {
    let timex = "";
    if (source === "\u5929" || source === "\u65E5") timex = "P1D";
    else if (source === "\u5468" || source === "\u661F\u671F") timex = "P1W";
    else if (source === "\u6708") timex = "P1M";
    else if (source === "\u5E74") timex = "P1Y";
    return { matched: timex !== "", timex };
  }
};
var ChineseSetParser = class extends BaseSetParser {
  constructor() {
    let config = new ChineseSetParserConfiguration();
    super(config);
  }
  parse(er, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === BaseSetParser.ParserName) {
      let innerResult = this.parseEachUnit(er.text);
      if (!innerResult.success) {
        innerResult = this.parseEachDuration(er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parserTimeEveryday(er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.dateTimeExtractor, this.config.dateTimeParser, er.text, referenceDate);
      }
      if (!innerResult.success) {
        innerResult = this.parseEach(this.config.dateExtractor, this.config.dateParser, er.text, referenceDate);
      }
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.SET] = innerResult.futureValue;
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.SET] = innerResult.pastValue;
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value, ret.timexStr = value === null ? "" : value.timex, ret.resolutionStr = "";
    return ret;
  }
  parseEachUnit(text) {
    let ret = new DateTimeResolutionResult();
    let match = recognizersText.RegExpUtility.getMatches(this.config.eachUnitRegex, text).pop();
    if (!match || match.length !== text.length) return ret;
    let sourceUnit = match.groups("unit").value;
    if (recognizersText.StringUtility.isNullOrEmpty(sourceUnit) || !this.config.unitMap.has(sourceUnit)) return ret;
    let getMatchedUnitTimex = this.config.getMatchedUnitTimex(sourceUnit);
    if (!getMatchedUnitTimex.matched) return ret;
    ret.timex = getMatchedUnitTimex.timex;
    ret.futureValue = "Set: " + ret.timex;
    ret.pastValue = "Set: " + ret.timex;
    ret.success = true;
    return ret;
  }
  parserTimeEveryday(text, refDate) {
    let result = new DateTimeResolutionResult();
    let ers = this.config.timeExtractor.extract(text, refDate);
    if (ers.length !== 1) return result;
    let er = ers[0];
    let beforeStr = text.substr(0, er.start);
    let match = recognizersText.RegExpUtility.getMatches(this.config.eachDayRegex, beforeStr).pop();
    if (!match) return result;
    let pr = this.config.timeParser.parse(er);
    result.timex = pr.timexStr;
    result.futureValue = "Set: " + result.timex;
    result.pastValue = "Set: " + result.timex;
    result.success = true;
    return result;
  }
  parseEach(extractor, parser, text, refDate) {
    let result = new DateTimeResolutionResult();
    let ers = extractor.extract(text, refDate);
    if (ers.length !== 1) return result;
    let er = ers[0];
    let beforeStr = text.substr(0, er.start);
    let match = recognizersText.RegExpUtility.getMatches(this.config.eachPrefixRegex, beforeStr).pop();
    if (!match) return result;
    let timex = parser.parse(er).timexStr;
    result.timex = timex;
    result.futureValue = `Set: ${timex}`;
    result.pastValue = `Set: ${timex}`;
    result.success = true;
    return result;
  }
};
var ChineseHolidayExtractorConfiguration = class {
  constructor() {
    this.holidayRegexes = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.HolidayRegexList1),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.HolidayRegexList2),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.LunarHolidayRegex)
    ];
  }
};
var ChineseHolidayParserConfiguration = class extends BaseHolidayParserConfiguration {
  constructor() {
    super();
    this.holidayRegexList = [
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.HolidayRegexList1),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.HolidayRegexList2),
      recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.LunarHolidayRegex)
    ];
    this.holidayFuncDictionary = this.initHolidayFuncs();
    this.variableHolidaysTimexDictionary = exports.ChineseDateTime.HolidayNoFixedTimex;
  }
  getSwiftYear(source) {
    if (source.endsWith("\u5E74")) return 0;
    if (source.endsWith("\u53BB\u5E74")) return -1;
    if (source.endsWith("\u660E\u5E74")) return 1;
    return null;
  }
  sanitizeHolidayToken(holiday) {
    return holiday;
  }
  initHolidayFuncs() {
    return new Map([
      ...super.initHolidayFuncs(),
      ["\u7236\u4EB2\u8282", BaseHolidayParserConfiguration.FathersDay],
      ["\u6BCD\u4EB2\u8282", BaseHolidayParserConfiguration.MothersDay],
      ["\u611F\u6069\u8282", BaseHolidayParserConfiguration.ThanksgivingDay]
    ]);
  }
};
var ChineseHolidayParser = class _ChineseHolidayParser extends BaseHolidayParser {
  constructor() {
    let config = new ChineseHolidayParserConfiguration();
    super(config);
    this.lunarHolidayRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.LunarHolidayRegex);
    this.integerExtractor = new recognizersTextNumber.ChineseIntegerExtractor();
    this.numberParser = recognizersTextNumber.AgnosticNumberParserFactory.getParser(recognizersTextNumber.AgnosticNumberParserType.Integer, new recognizersTextNumber.ChineseNumberParserConfiguration());
    this.fixedHolidayDictionary = /* @__PURE__ */ new Map([
      ["\u5143\u65E6", _ChineseHolidayParser.NewYear],
      ["\u5143\u65E6\u8282", _ChineseHolidayParser.NewYear],
      ["\u6559\u5E08\u8282", _ChineseHolidayParser.TeacherDay],
      ["\u9752\u5E74\u8282", _ChineseHolidayParser.YouthDay],
      ["\u513F\u7AE5\u8282", _ChineseHolidayParser.ChildrenDay],
      ["\u5987\u5973\u8282", _ChineseHolidayParser.FemaleDay],
      ["\u690D\u6811\u8282", _ChineseHolidayParser.TreePlantDay],
      ["\u60C5\u4EBA\u8282", _ChineseHolidayParser.LoverDay],
      ["\u5723\u8BDE\u8282", _ChineseHolidayParser.ChristmasDay],
      ["\u65B0\u5E74", _ChineseHolidayParser.NewYear],
      ["\u611A\u4EBA\u8282", _ChineseHolidayParser.FoolDay],
      ["\u4E94\u4E00", _ChineseHolidayParser.LaborDay],
      ["\u52B3\u52A8\u8282", _ChineseHolidayParser.LaborDay],
      ["\u4E07\u5723\u8282", _ChineseHolidayParser.HalloweenDay],
      ["\u4E2D\u79CB\u8282", _ChineseHolidayParser.MidautumnDay],
      ["\u4E2D\u79CB", _ChineseHolidayParser.MidautumnDay],
      ["\u6625\u8282", _ChineseHolidayParser.SpringDay],
      ["\u9664\u5915", _ChineseHolidayParser.NewYearEve],
      ["\u5143\u5BB5\u8282", _ChineseHolidayParser.LanternDay],
      ["\u6E05\u660E\u8282", _ChineseHolidayParser.QingMingDay],
      ["\u6E05\u660E", _ChineseHolidayParser.QingMingDay],
      ["\u7AEF\u5348\u8282", _ChineseHolidayParser.DragonBoatDay],
      ["\u7AEF\u5348", _ChineseHolidayParser.DragonBoatDay],
      ["\u56FD\u5E86\u8282", _ChineseHolidayParser.ChsNationalDay],
      ["\u5EFA\u519B\u8282", _ChineseHolidayParser.ChsMilBuildDay],
      ["\u5973\u751F\u8282", _ChineseHolidayParser.GirlsDay],
      ["\u5149\u68CD\u8282", _ChineseHolidayParser.SinglesDay],
      ["\u53CC\u5341\u4E00", _ChineseHolidayParser.SinglesDay],
      ["\u91CD\u9633\u8282", _ChineseHolidayParser.ChongYangDay]
    ]);
  }
  static NewYear(year) {
    return new Date(year, 1 - 1, 1);
  }
  static ChsNationalDay(year) {
    return new Date(year, 10 - 1, 1);
  }
  static LaborDay(year) {
    return new Date(year, 5 - 1, 1);
  }
  static ChristmasDay(year) {
    return new Date(year, 12 - 1, 25);
  }
  static LoverDay(year) {
    return new Date(year, 2 - 1, 14);
  }
  static ChsMilBuildDay(year) {
    return new Date(year, 8 - 1, 1);
  }
  static FoolDay(year) {
    return new Date(year, 4 - 1, 1);
  }
  static GirlsDay(year) {
    return new Date(year, 3 - 1, 7);
  }
  static TreePlantDay(year) {
    return new Date(year, 3 - 1, 12);
  }
  static FemaleDay(year) {
    return new Date(year, 3 - 1, 8);
  }
  static ChildrenDay(year) {
    return new Date(year, 6 - 1, 1);
  }
  static YouthDay(year) {
    return new Date(year, 5 - 1, 4);
  }
  static TeacherDay(year) {
    return new Date(year, 9 - 1, 10);
  }
  static SinglesDay(year) {
    return new Date(year, 11 - 1, 11);
  }
  static HalloweenDay(year) {
    return new Date(year, 10 - 1, 31);
  }
  static MidautumnDay(year) {
    return new Date(year, 8 - 1, 15);
  }
  static SpringDay(year) {
    return new Date(year, 1 - 1, 1);
  }
  static NewYearEve(year) {
    return DateUtils.addDays(new Date(year, 1 - 1, 1), -1);
  }
  static LanternDay(year) {
    return new Date(year, 1 - 1, 15);
  }
  static QingMingDay(year) {
    return new Date(year, 4 - 1, 4);
  }
  static DragonBoatDay(year) {
    return new Date(year, 5 - 1, 5);
  }
  static ChongYangDay(year) {
    return new Date(year, 9 - 1, 9);
  }
  parse(er, referenceDate) {
    if (!referenceDate) referenceDate = /* @__PURE__ */ new Date();
    let value = null;
    if (er.type === BaseHolidayParser.ParserName) {
      let innerResult = this.parseHolidayRegexMatch(er.text, referenceDate);
      if (innerResult.success) {
        innerResult.futureResolution = {};
        innerResult.futureResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.futureValue);
        innerResult.pastResolution = {};
        innerResult.pastResolution[TimeTypeConstants.DATE] = FormatUtil.formatDate(innerResult.pastValue);
        innerResult.isLunar = this.isLunar(er.text);
        value = innerResult;
      }
    }
    let ret = new DateTimeParseResult(er);
    ret.value = value;
    ret.timexStr = value === null ? "" : value.timex;
    ret.resolutionStr = "";
    return ret;
  }
  isLunar(source) {
    return recognizersText.RegExpUtility.isMatch(this.lunarHolidayRegex, source);
  }
  match2Date(match, referenceDate) {
    let ret = new DateTimeResolutionResult();
    let holidayStr = this.config.sanitizeHolidayToken(match.groups("holiday").value.toLowerCase());
    if (recognizersText.StringUtility.isNullOrEmpty(holidayStr)) return ret;
    let year = referenceDate.getFullYear();
    let yearNum = match.groups("year").value;
    let yearChinese = match.groups("yearchs").value;
    let yearRelative = match.groups("yearrel").value;
    let hasYear = false;
    if (!recognizersText.StringUtility.isNullOrEmpty(yearNum)) {
      hasYear = true;
      if (this.config.getSwiftYear(yearNum) === 0) {
        yearNum = yearNum.substr(0, yearNum.length - 1);
      }
      year = this.convertYear(yearNum, false);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearChinese)) {
      hasYear = true;
      if (this.config.getSwiftYear(yearChinese) === 0) {
        yearChinese = yearChinese.substr(0, yearChinese.length - 1);
      }
      year = this.convertYear(yearChinese, true);
    } else if (!recognizersText.StringUtility.isNullOrEmpty(yearRelative)) {
      hasYear = true;
      year += this.config.getSwiftYear(yearRelative);
    }
    if (year < 100 && year >= 90) {
      year += 1900;
    } else if (year < 100 && year < 20) {
      year += 2e3;
    }
    let timex = "";
    let date = new Date(referenceDate);
    if (this.fixedHolidayDictionary.has(holidayStr)) {
      date = this.fixedHolidayDictionary.get(holidayStr)(year);
      timex = `-${FormatUtil.toString(date.getMonth() + 1, 2)}-${FormatUtil.toString(date.getDate(), 2)}`;
    } else if (this.config.holidayFuncDictionary.has(holidayStr)) {
      date = this.config.holidayFuncDictionary.get(holidayStr)(year);
      timex = this.config.variableHolidaysTimexDictionary.get(holidayStr);
    } else {
      return ret;
    }
    if (hasYear) {
      ret.timex = FormatUtil.toString(year, 4) + timex;
      ret.futureValue = new Date(year, date.getMonth(), date.getDate());
      ret.pastValue = new Date(year, date.getMonth(), date.getDate());
    } else {
      ret.timex = "XXXX" + timex;
      ret.futureValue = this.getDateValue(date, referenceDate, holidayStr, 1, (d, r) => d.getTime() < r.getTime());
      ret.pastValue = this.getDateValue(date, referenceDate, holidayStr, -1, (d, r) => d.getTime() >= r.getTime());
    }
    ret.success = true;
    return ret;
  }
  convertYear(yearStr, isChinese) {
    let year = -1;
    let er;
    if (isChinese) {
      let yearNum = 0;
      er = this.integerExtractor.extract(yearStr).pop();
      if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
        yearNum = Number.parseInt(this.numberParser.parse(er).value);
      }
      if (yearNum < 10) {
        yearNum = 0;
        for (let index = 0; index < yearStr.length; index++) {
          let char = yearStr.charAt[index];
          yearNum *= 10;
          er = this.integerExtractor.extract(char).pop();
          if (er && er.type === recognizersTextNumber.Constants.SYS_NUM_INTEGER) {
            yearNum += Number.parseInt(this.numberParser.parse(er).value);
          }
        }
      } else {
        year = yearNum;
      }
    } else {
      year = Number.parseInt(yearStr, 10);
    }
    return year === 0 ? -1 : year;
  }
  getDateValue(date, referenceDate, holiday, swift, comparer) {
    let result = new Date(date);
    if (comparer(date, referenceDate)) {
      if (this.fixedHolidayDictionary.has(holiday)) {
        return DateUtils.addYears(date, swift);
      }
      if (this.config.holidayFuncDictionary.has(holiday)) {
        result = this.config.holidayFuncDictionary.get(holiday)(referenceDate.getFullYear() + swift);
      }
    }
    return result;
  }
};

// recognizers/recognizers-date-time/src/dateTime/chinese/mergedConfiguration.ts
var ChineseMergedExtractorConfiguration = class {
  constructor() {
    this.dateExtractor = new ChineseDateExtractor();
    this.timeExtractor = new ChineseTimeExtractor();
    this.dateTimeExtractor = new ChineseDateTimeExtractor();
    this.datePeriodExtractor = new ChineseDatePeriodExtractor();
    this.timePeriodExtractor = new ChineseTimePeriodExtractor();
    this.dateTimePeriodExtractor = new ChineseDateTimePeriodExtractor();
    this.setExtractor = new ChineseSetExtractor();
    this.holidayExtractor = new BaseHolidayExtractor(new ChineseHolidayExtractorConfiguration());
    this.durationExtractor = new ChineseDurationExtractor();
  }
};
var ChineseMergedExtractor = class extends BaseMergedExtractor {
  constructor(options) {
    let config = new ChineseMergedExtractorConfiguration();
    super(config, options);
    this.dayOfMonthRegex = recognizersText.RegExpUtility.getSafeRegExp(`^\\d{1,2}\u53F7`, "gi");
  }
  extract(source, refDate) {
    if (!refDate) refDate = /* @__PURE__ */ new Date();
    let referenceDate = refDate;
    let result = new Array();
    this.addTo(result, this.config.dateExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.timeExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.durationExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.datePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.dateTimeExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.timePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.dateTimePeriodExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.setExtractor.extract(source, referenceDate), source);
    this.addTo(result, this.config.holidayExtractor.extract(source, referenceDate), source);
    result = this.checkBlackList(result, source);
    result = result.sort((a, b) => a.start - b.start);
    return result;
  }
  addTo(destination, source, sourceStr) {
    source.forEach((er) => {
      let isFound = false;
      let rmIndex = -1;
      let rmLength = 1;
      for (let index = 0; index < destination.length; index++) {
        if (recognizersText.ExtractResult.isOverlap(destination[index], er)) {
          isFound = true;
          if (er.length > destination[index].length) {
            rmIndex = index;
            let j = index + 1;
            while (j < destination.length && recognizersText.ExtractResult.isOverlap(destination[j], er)) {
              rmLength++;
              j++;
            }
          }
          break;
        }
      }
      if (!isFound) {
        destination.push(er);
      } else if (rmIndex >= 0) {
        destination.splice(rmIndex, rmLength);
        destination.splice(0, destination.length, ...this.moveOverlap(destination, er));
        destination.splice(rmIndex, 0, er);
      }
    });
  }
  moveOverlap(destination, result) {
    let duplicated = new Array();
    for (let i = 0; i < destination.length; i++) {
      if (result.text.includes(destination[i].text) && (result.start === destination[i].start || result.start + result.length === destination[i].start + destination[i].length)) {
        duplicated.push(i);
      }
    }
    return destination.filter((_, i) => duplicated.indexOf(i) < 0);
  }
  // ported from CheckBlackList
  checkBlackList(destination, source) {
    return destination.filter((value) => {
      let valueEnd = value.start + value.length;
      if (valueEnd !== source.length) {
        let lastChar = source.substr(valueEnd, 1);
        if (value.text.endsWith("\u5468") && lastChar === "\u5C81") {
          return false;
        }
      }
      if (recognizersText.RegExpUtility.isMatch(this.dayOfMonthRegex, value.text)) {
        return false;
      }
      return true;
    });
  }
};
var ChineseMergedParserConfiguration = class {
  constructor() {
    this.beforeRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.MergedBeforeRegex);
    this.afterRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.MergedAfterRegex);
    this.sinceRegex = recognizersText.RegExpUtility.getSafeRegExp(exports.ChineseDateTime.MergedAfterRegex);
    this.dateParser = new ChineseDateParser();
    this.holidayParser = new ChineseHolidayParser();
    this.timeParser = new ChineseTimeParser();
    this.dateTimeParser = new ChineseDateTimeParser();
    this.datePeriodParser = new ChineseDatePeriodParser();
    this.timePeriodParser = new ChineseTimePeriodParser();
    this.dateTimePeriodParser = new ChineseDateTimePeriodParser();
    this.durationParser = new ChineseDurationParser();
    this.setParser = new ChineseSetParser();
  }
};
var ChineseMergedParser = class extends BaseMergedParser {
  constructor() {
    let config = new ChineseMergedParserConfiguration();
    super(config, 0);
  }
  parse(er, refTime) {
    let referenceTime = refTime || /* @__PURE__ */ new Date();
    let pr = null;
    let hasBefore = recognizersText.RegExpUtility.isMatch(this.config.beforeRegex, er.text);
    let hasAfter = recognizersText.RegExpUtility.isMatch(this.config.afterRegex, er.text);
    let hasSince = recognizersText.RegExpUtility.isMatch(this.config.sinceRegex, er.text);
    if (er.type === Constants.SYS_DATETIME_DATE) {
      pr = this.config.dateParser.parse(er, referenceTime);
      if (pr.value === null || pr.value === void 0) {
        pr = this.config.holidayParser.parse(er, referenceTime);
      }
    } else if (er.type === Constants.SYS_DATETIME_TIME) {
      pr = this.config.timeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIME) {
      pr = this.config.dateTimeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATEPERIOD) {
      pr = this.config.datePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_TIMEPERIOD) {
      pr = this.config.timePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIMEPERIOD) {
      pr = this.config.dateTimePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DURATION) {
      pr = this.config.durationParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_SET) {
      pr = this.config.setParser.parse(er, referenceTime);
    } else {
      return null;
    }
    if (hasBefore && pr.value !== null) {
      let val = pr.value;
      val.mod = TimeTypeConstants.beforeMod;
      pr.value = val;
    }
    if (hasAfter && pr.value !== null) {
      let val = pr.value;
      val.mod = TimeTypeConstants.afterMod;
      pr.value = val;
    }
    if (hasSince && pr.value !== null) {
      let val = pr.value;
      val.mod = TimeTypeConstants.sinceMod;
      pr.value = val;
    }
    pr.value = this.dateTimeResolution(pr, hasBefore, hasAfter, hasSince);
    pr.type = `${this.parserTypeName}.${this.determineDateTimeType(er.type, hasBefore, hasAfter, hasSince)}`;
    return pr;
  }
};
var ChineseFullMergedParser = class extends BaseMergedParser {
  constructor() {
    let config = new ChineseMergedParserConfiguration();
    super(config, 0);
  }
  parse(er, refTime) {
    let referenceTime = refTime || /* @__PURE__ */ new Date();
    let pr = null;
    let hasBefore = false;
    let hasAfter = false;
    let modStr = "";
    let beforeMatch = recognizersText.RegExpUtility.getMatches(this.config.beforeRegex, er.text).pop();
    let afterMatch = recognizersText.RegExpUtility.getMatches(this.config.afterRegex, er.text).pop();
    if (beforeMatch) {
      hasBefore = true;
      er.start += beforeMatch.length;
      er.length -= beforeMatch.length;
      er.text = er.text.substring(beforeMatch.length);
      modStr = beforeMatch.value;
    } else if (afterMatch) {
      hasAfter = true;
      er.start += afterMatch.length;
      er.length -= afterMatch.length;
      er.text = er.text.substring(afterMatch.length);
      modStr = afterMatch.value;
    }
    if (er.type === Constants.SYS_DATETIME_DATE) {
      pr = this.config.dateParser.parse(er, referenceTime);
      if (pr.value === null || pr.value === void 0) {
        pr = this.config.holidayParser.parse(er, referenceTime);
      }
    } else if (er.type === Constants.SYS_DATETIME_TIME) {
      pr = this.config.timeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIME) {
      pr = this.config.dateTimeParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATEPERIOD) {
      pr = this.config.datePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_TIMEPERIOD) {
      pr = this.config.timePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DATETIMEPERIOD) {
      pr = this.config.dateTimePeriodParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_DURATION) {
      pr = this.config.durationParser.parse(er, referenceTime);
    } else if (er.type === Constants.SYS_DATETIME_SET) {
      pr = this.config.setParser.parse(er, referenceTime);
    } else {
      return null;
    }
    if (hasBefore && pr.value !== null) {
      pr.length += modStr.length;
      pr.start -= modStr.length;
      pr.text = modStr + pr.text;
      let val = pr.value;
      val.mod = TimeTypeConstants.beforeMod;
      pr.value = val;
    }
    if (hasAfter && pr.value !== null) {
      pr.length += modStr.length;
      pr.start -= modStr.length;
      pr.text = modStr + pr.text;
      let val = pr.value;
      val.mod = TimeTypeConstants.afterMod;
      pr.value = val;
    }
    pr.value = this.dateTimeResolution(pr, hasBefore, hasAfter);
    pr.type = `${this.parserTypeName}.${this.determineDateTimeType(er.type, hasBefore, hasAfter)}`;
    return pr;
  }
  dateTimeResolution(slot, hasBefore, hasAfter, hasSince = false) {
    if (!slot) return null;
    let result = /* @__PURE__ */ new Map();
    let resolutions = new Array();
    let type = slot.type;
    let outputType = this.determineDateTimeType(type, hasBefore, hasAfter);
    let timex = slot.timexStr;
    let value = slot.value;
    if (!value) return null;
    let isLunar = value.isLunar;
    let mod = value.mod;
    let comment = value.comment;
    this.addResolutionFieldsAny(result, Constants.TimexKey, timex);
    this.addResolutionFieldsAny(result, Constants.CommentKey, comment);
    this.addResolutionFieldsAny(result, Constants.ModKey, mod);
    this.addResolutionFieldsAny(result, Constants.TypeKey, outputType);
    let futureResolution = value.futureResolution;
    let pastResolution = value.pastResolution;
    let future = this.generateFromResolution(type, futureResolution, mod);
    let past = this.generateFromResolution(type, pastResolution, mod);
    let futureValues = Array.from(this.getValues(future)).sort();
    let pastValues = Array.from(this.getValues(past)).sort();
    if (isEqual(futureValues, pastValues)) {
      if (pastValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveKey, past);
    } else {
      if (pastValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveToPastKey, past);
      if (futureValues.length > 0) this.addResolutionFieldsAny(result, Constants.ResolveToFutureKey, future);
    }
    if (comment && comment === "ampm") {
      if (result.has("resolve")) {
        this.resolveAMPM(result, "resolve");
      } else {
        this.resolveAMPM(result, "resolveToPast");
        this.resolveAMPM(result, "resolveToFuture");
      }
    }
    if (isLunar) {
      this.addResolutionFieldsAny(result, Constants.IsLunarKey, isLunar);
    }
    result.forEach((value2, key) => {
      if (this.isObject(value2)) {
        let newValues = {};
        this.addResolutionFields(newValues, Constants.TimexKey, timex);
        this.addResolutionFields(newValues, Constants.ModKey, mod);
        this.addResolutionFields(newValues, Constants.TypeKey, outputType);
        Object.keys(value2).forEach((innerKey) => {
          newValues[innerKey] = value2[innerKey];
        });
        resolutions.push(newValues);
      }
    });
    if (Object.keys(past).length === 0 && Object.keys(future).length === 0) {
      let o = {};
      o["timex"] = timex;
      o["type"] = outputType;
      o["value"] = "not resolved";
      resolutions.push(o);
    }
    return {
      values: resolutions
    };
  }
  determineDateTimeType(type, hasBefore, hasAfter, hasSince = false) {
    if (hasBefore || hasAfter || hasSince) {
      if (type === Constants.SYS_DATETIME_DATE) return Constants.SYS_DATETIME_DATEPERIOD;
      if (type === Constants.SYS_DATETIME_TIME) return Constants.SYS_DATETIME_TIMEPERIOD;
      if (type === Constants.SYS_DATETIME_DATETIME) return Constants.SYS_DATETIME_DATETIMEPERIOD;
    }
    return type;
  }
};

// recognizers/recognizers-date-time/src/dateTime/dateTimeRecognizer.ts
var DateTimeOptions = /* @__PURE__ */ ((DateTimeOptions2) => {
  DateTimeOptions2[DateTimeOptions2["None"] = 0] = "None";
  DateTimeOptions2[DateTimeOptions2["SkipFromToMerge"] = 1] = "SkipFromToMerge";
  DateTimeOptions2[DateTimeOptions2["SplitDateAndTime"] = 2] = "SplitDateAndTime";
  DateTimeOptions2[DateTimeOptions2["Calendar"] = 4] = "Calendar";
  return DateTimeOptions2;
})(DateTimeOptions || {});
function recognizeDateTime(query, culture, options = 0 /* None */, referenceDate = /* @__PURE__ */ new Date(), fallbackToDefaultCulture = true) {
  let recognizer = new DateTimeRecognizer(culture, options);
  let model = recognizer.getDateTimeModel(culture, fallbackToDefaultCulture);
  return model.parse(query, referenceDate);
}
var DateTimeRecognizer = class extends recognizersText.Recognizer {
  constructor(culture, options = 0 /* None */, lazyInitialization = false) {
    super(culture, options, lazyInitialization);
  }
  InitializeConfiguration() {
    this.registerModel("DateTimeModel", recognizersTextNumber.Culture.English, (options) => new DateTimeModel(
      new BaseMergedParser(new EnglishMergedParserConfiguration(new EnglishCommonDateTimeParserConfiguration2()), this.Options),
      new BaseMergedExtractor(new EnglishMergedExtractorConfiguration(), this.Options)
    ));
    this.registerModel("DateTimeModel", recognizersTextNumber.Culture.Spanish, (options) => new DateTimeModel(
      new BaseMergedParser(new SpanishMergedParserConfiguration(), this.Options),
      new BaseMergedExtractor(new SpanishMergedExtractorConfiguration(), this.Options)
    ));
    this.registerModel("DateTimeModel", recognizersTextNumber.Culture.Chinese, (options) => new DateTimeModel(
      new ChineseFullMergedParser(),
      new ChineseMergedExtractor(this.Options)
    ));
    this.registerModel("DateTimeModel", recognizersTextNumber.Culture.French, (options) => new DateTimeModel(
      new BaseMergedParser(new FrenchMergedParserConfiguration(), this.Options),
      new BaseMergedExtractor(new FrenchMergedExtractorConfiguration(), this.Options)
    ));
  }
  IsValidOptions(options) {
    return options >= 0 && options <= 0 /* None */ + 1 /* SkipFromToMerge */ + 2 /* SplitDateAndTime */ + 4 /* Calendar */;
  }
  getDateTimeModel(culture = null, fallbackToDefaultCulture = true) {
    return this.getModel("DateTimeModel", culture, fallbackToDefaultCulture);
  }
};
var FrenchTimeParser = class extends BaseTimeParser {
  constructor(config) {
    super(config);
  }
  internalParse(text, referenceTime) {
    let ret = super.internalParse(text, referenceTime);
    if (!ret.success) {
      ret = this.parseIsh(text, referenceTime);
    }
    return ret;
  }
  parseIsh(text, referenceTime) {
    let ret = new DateTimeResolutionResult();
    let trimedText = text.trim().toLowerCase();
    let matches = recognizersText.RegExpUtility.getMatches(recognizersText.RegExpUtility.getSafeRegExp(exports.FrenchDateTime.IshRegex), text);
    if (matches.length && matches[0].index === 0 && matches[0].length === trimedText.length) {
      let hourStr = matches[0].groups("hour").value;
      let hour = 12;
      if (hourStr) {
        hour = parseInt(hourStr, 10);
      }
      ret.timex = "T" + FormatUtil.toString(hour, 2);
      ret.futureValue = ret.pastValue = DateUtils.safeCreateFromMinValue(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate(), hour, 0, 0);
      ret.success = true;
    }
    return ret;
  }
};

Object.defineProperty(exports, "Culture", {
  enumerable: true,
  get: function () { return recognizersTextNumber.Culture; }
});
Object.defineProperty(exports, "CultureInfo", {
  enumerable: true,
  get: function () { return recognizersTextNumber.CultureInfo; }
});
exports.AgoLaterMode = AgoLaterMode;
exports.AgoLaterUtil = AgoLaterUtil;
exports.BaseDateExtractor = BaseDateExtractor;
exports.BaseDateParser = BaseDateParser;
exports.BaseDateParserConfiguration = BaseDateParserConfiguration;
exports.BaseDatePeriodExtractor = BaseDatePeriodExtractor;
exports.BaseDatePeriodParser = BaseDatePeriodParser;
exports.BaseDateTimeExtractor = BaseDateTimeExtractor;
exports.BaseDateTimeParser = BaseDateTimeParser;
exports.BaseDateTimePeriodExtractor = BaseDateTimePeriodExtractor;
exports.BaseDateTimePeriodParser = BaseDateTimePeriodParser;
exports.BaseDurationExtractor = BaseDurationExtractor;
exports.BaseDurationParser = BaseDurationParser;
exports.BaseHolidayExtractor = BaseHolidayExtractor;
exports.BaseHolidayParser = BaseHolidayParser;
exports.BaseHolidayParserConfiguration = BaseHolidayParserConfiguration;
exports.BaseMergedExtractor = BaseMergedExtractor;
exports.BaseMergedParser = BaseMergedParser;
exports.BaseSetExtractor = BaseSetExtractor;
exports.BaseSetParser = BaseSetParser;
exports.BaseTimeExtractor = BaseTimeExtractor;
exports.BaseTimeParser = BaseTimeParser;
exports.BaseTimePeriodExtractor = BaseTimePeriodExtractor;
exports.BaseTimePeriodParser = BaseTimePeriodParser;
exports.ChineseDateExtractor = ChineseDateExtractor;
exports.ChineseDateParser = ChineseDateParser;
exports.ChineseDatePeriodExtractor = ChineseDatePeriodExtractor;
exports.ChineseDatePeriodParser = ChineseDatePeriodParser;
exports.ChineseDateTimeExtractor = ChineseDateTimeExtractor;
exports.ChineseDateTimeParser = ChineseDateTimeParser;
exports.ChineseDateTimePeriodExtractor = ChineseDateTimePeriodExtractor;
exports.ChineseDateTimePeriodParser = ChineseDateTimePeriodParser;
exports.ChineseDurationExtractor = ChineseDurationExtractor;
exports.ChineseDurationParser = ChineseDurationParser;
exports.ChineseFullMergedParser = ChineseFullMergedParser;
exports.ChineseHolidayExtractorConfiguration = ChineseHolidayExtractorConfiguration;
exports.ChineseHolidayParser = ChineseHolidayParser;
exports.ChineseMergedExtractor = ChineseMergedExtractor;
exports.ChineseMergedParser = ChineseMergedParser;
exports.ChineseSetExtractor = ChineseSetExtractor;
exports.ChineseSetParser = ChineseSetParser;
exports.ChineseTimeExtractor = ChineseTimeExtractor;
exports.ChineseTimeParser = ChineseTimeParser;
exports.ChineseTimePeriodExtractor = ChineseTimePeriodExtractor;
exports.ChineseTimePeriodParser = ChineseTimePeriodParser;
exports.Constants = Constants;
exports.DateTimeModel = DateTimeModel;
exports.DateTimeModelResult = DateTimeModelResult;
exports.DateTimeOptions = DateTimeOptions;
exports.DateTimeParseResult = DateTimeParseResult;
exports.DateTimeRecognizer = DateTimeRecognizer;
exports.DateTimeResolutionResult = DateTimeResolutionResult;
exports.DateUtils = DateUtils;
exports.DayOfWeek = DayOfWeek;
exports.EnglishCommonDateTimeParserConfiguration = EnglishCommonDateTimeParserConfiguration2;
exports.EnglishDateExtractorConfiguration = EnglishDateExtractorConfiguration;
exports.EnglishDateParserConfiguration = EnglishDateParserConfiguration;
exports.EnglishDatePeriodExtractorConfiguration = EnglishDatePeriodExtractorConfiguration;
exports.EnglishDatePeriodParserConfiguration = EnglishDatePeriodParserConfiguration;
exports.EnglishDateTimeExtractorConfiguration = EnglishDateTimeExtractorConfiguration;
exports.EnglishDateTimeParserConfiguration = EnglishDateTimeParserConfiguration;
exports.EnglishDateTimePeriodExtractorConfiguration = EnglishDateTimePeriodExtractorConfiguration;
exports.EnglishDateTimePeriodParserConfiguration = EnglishDateTimePeriodParserConfiguration;
exports.EnglishDateTimeUtilityConfiguration = EnglishDateTimeUtilityConfiguration;
exports.EnglishDurationExtractorConfiguration = EnglishDurationExtractorConfiguration;
exports.EnglishDurationParserConfiguration = EnglishDurationParserConfiguration;
exports.EnglishHolidayExtractorConfiguration = EnglishHolidayExtractorConfiguration;
exports.EnglishHolidayParserConfiguration = EnglishHolidayParserConfiguration;
exports.EnglishMergedExtractorConfiguration = EnglishMergedExtractorConfiguration;
exports.EnglishMergedParserConfiguration = EnglishMergedParserConfiguration;
exports.EnglishSetExtractorConfiguration = EnglishSetExtractorConfiguration;
exports.EnglishSetParserConfiguration = EnglishSetParserConfiguration;
exports.EnglishTimeExtractorConfiguration = EnglishTimeExtractorConfiguration;
exports.EnglishTimeParser = EnglishTimeParser;
exports.EnglishTimeParserConfiguration = EnglishTimeParserConfiguration;
exports.EnglishTimePeriodExtractorConfiguration = EnglishTimePeriodExtractorConfiguration;
exports.EnglishTimePeriodParserConfiguration = EnglishTimePeriodParserConfiguration;
exports.FormatUtil = FormatUtil;
exports.FrenchCommonDateTimeParserConfiguration = FrenchCommonDateTimeParserConfiguration;
exports.FrenchDateExtractorConfiguration = FrenchDateExtractorConfiguration;
exports.FrenchDateParserConfiguration = FrenchDateParserConfiguration;
exports.FrenchDatePeriodExtractorConfiguration = FrenchDatePeriodExtractorConfiguration;
exports.FrenchDatePeriodParserConfiguration = FrenchDatePeriodParserConfiguration;
exports.FrenchDateTimeExtractorConfiguration = FrenchDateTimeExtractorConfiguration;
exports.FrenchDateTimeParserConfiguration = FrenchDateTimeParserConfiguration;
exports.FrenchDateTimePeriodExtractorConfiguration = FrenchDateTimePeriodExtractorConfiguration;
exports.FrenchDateTimePeriodParserConfiguration = FrenchDateTimePeriodParserConfiguration;
exports.FrenchDateTimeUtilityConfiguration = FrenchDateTimeUtilityConfiguration;
exports.FrenchDurationExtractorConfiguration = FrenchDurationExtractorConfiguration;
exports.FrenchDurationParserConfiguration = FrenchDurationParserConfiguration;
exports.FrenchHolidayExtractorConfiguration = FrenchHolidayExtractorConfiguration;
exports.FrenchHolidayParserConfiguration = FrenchHolidayParserConfiguration;
exports.FrenchMergedExtractorConfiguration = FrenchMergedExtractorConfiguration;
exports.FrenchMergedParserConfiguration = FrenchMergedParserConfiguration;
exports.FrenchSetExtractorConfiguration = FrenchSetExtractorConfiguration;
exports.FrenchSetParserConfiguration = FrenchSetParserConfiguration;
exports.FrenchTimeExtractorConfiguration = FrenchTimeExtractorConfiguration;
exports.FrenchTimeParser = FrenchTimeParser;
exports.FrenchTimeParserConfiguration = FrenchTimeParserConfiguration;
exports.FrenchTimePeriodExtractorConfiguration = FrenchTimePeriodExtractorConfiguration;
exports.FrenchTimePeriodParserConfiguration = FrenchTimePeriodParserConfiguration;
exports.MatchingUtil = MatchingUtil;
exports.SpanishCommonDateTimeParserConfiguration = SpanishCommonDateTimeParserConfiguration;
exports.SpanishDateExtractorConfiguration = SpanishDateExtractorConfiguration;
exports.SpanishDateParserConfiguration = SpanishDateParserConfiguration;
exports.SpanishDatePeriodExtractorConfiguration = SpanishDatePeriodExtractorConfiguration;
exports.SpanishDatePeriodParserConfiguration = SpanishDatePeriodParserConfiguration;
exports.SpanishDateTimeExtractorConfiguration = SpanishDateTimeExtractorConfiguration;
exports.SpanishDateTimeParserConfiguration = SpanishDateTimeParserConfiguration;
exports.SpanishDateTimePeriodExtractorConfiguration = SpanishDateTimePeriodExtractorConfiguration;
exports.SpanishDateTimePeriodParser = SpanishDateTimePeriodParser;
exports.SpanishDateTimePeriodParserConfiguration = SpanishDateTimePeriodParserConfiguration;
exports.SpanishDateTimeUtilityConfiguration = SpanishDateTimeUtilityConfiguration;
exports.SpanishDurationExtractorConfiguration = SpanishDurationExtractorConfiguration;
exports.SpanishDurationParserConfiguration = SpanishDurationParserConfiguration;
exports.SpanishHolidayExtractorConfiguration = SpanishHolidayExtractorConfiguration;
exports.SpanishHolidayParserConfiguration = SpanishHolidayParserConfiguration;
exports.SpanishMergedExtractorConfiguration = SpanishMergedExtractorConfiguration;
exports.SpanishMergedParserConfiguration = SpanishMergedParserConfiguration;
exports.SpanishSetExtractorConfiguration = SpanishSetExtractorConfiguration;
exports.SpanishSetParserConfiguration = SpanishSetParserConfiguration;
exports.SpanishTimeExtractorConfiguration = SpanishTimeExtractorConfiguration;
exports.SpanishTimeParserConfiguration = SpanishTimeParserConfiguration;
exports.SpanishTimePeriodExtractorConfiguration = SpanishTimePeriodExtractorConfiguration;
exports.SpanishTimePeriodParserConfiguration = SpanishTimePeriodParserConfiguration;
exports.TimeTypeConstants = TimeTypeConstants;
exports.Token = Token;
exports.recognizeDateTime = recognizeDateTime;
