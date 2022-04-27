/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Built-in expression types.
 */
export class ExpressionType {
    // Math
    static readonly Add: string = '+';
    static readonly Subtract: string = '-';
    static readonly Multiply: string = '*';
    static readonly Divide: string = '/';
    static readonly Min: string = 'min';
    static readonly Max: string = 'max';
    static readonly Power: string = '^';
    static readonly Mod: string = '%';
    static readonly Average: string = 'average';
    static readonly Sum: string = 'sum';
    static readonly Count: string = 'count';
    static readonly Range: string = 'range';
    static readonly Floor: string = 'floor';
    static readonly Ceiling: string = 'ceiling';
    static readonly Round: string = 'round';
    static readonly Abs: string = 'abs';
    static readonly Sqrt: string = 'sqrt';

    // Comparisons
    static readonly LessThan: string = '<';
    static readonly LessThanOrEqual: string = '<=';
    static readonly Equal: string = '==';
    static readonly NotEqual: string = '!=';
    static readonly GreaterThan: string = '>';
    static readonly GreaterThanOrEqual: string = '>=';
    static readonly Exists: string = 'exists';
    static readonly Contains: string = 'contains';
    static readonly Empty: string = 'empty';

    // Logic
    static readonly And: string = '&&';
    static readonly Or: string = '||';
    static readonly Not: string = '!';

    // String
    static readonly Concat: string = 'concat';
    static readonly Length: string = 'length';
    static readonly Replace: string = 'replace';
    static readonly ReplaceIgnoreCase: string = 'replaceIgnoreCase';
    static readonly Split: string = 'split';
    static readonly Substring: string = 'substring';
    static readonly ToLower: string = 'toLower';
    static readonly ToUpper: string = 'toUpper';
    static readonly Trim: string = 'trim';
    static readonly Join: string = 'join';
    static readonly EndsWith: string = 'endsWith';
    static readonly StartsWith: string = 'startsWith';
    static readonly CountWord: string = 'countWord';
    static readonly AddOrdinal: string = 'addOrdinal';
    static readonly NewGuid: string = 'newGuid';
    static readonly IndexOf: string = 'indexOf';
    static readonly LastIndexOf: string = 'lastIndexOf';
    static readonly EOL: string = 'EOL';
    static readonly SentenceCase: string = 'sentenceCase';
    static readonly TitleCase: string = 'titleCase';

    // DateTime
    static readonly AddDays: string = 'addDays';
    static readonly AddHours: string = 'addHours';
    static readonly AddMinutes: string = 'addMinutes';
    static readonly AddSeconds: string = 'addSeconds';
    static readonly DayOfMonth: string = 'dayOfMonth';
    static readonly DayOfWeek: string = 'dayOfWeek';
    static readonly DayOfYear: string = 'dayOfYear';
    static readonly Month: string = 'month';
    static readonly Date: string = 'date';
    static readonly Year: string = 'year';
    static readonly UtcNow: string = 'utcNow';
    static readonly FormatDateTime: string = 'formatDateTime';
    static readonly FormatEpoch: string = 'formatEpoch';
    static readonly FormatTicks: string = 'formatTicks';
    static readonly SubtractFromTime: string = 'subtractFromTime';
    static readonly DateReadBack: string = 'dateReadBack';
    static readonly GetTimeOfDay: string = 'getTimeOfDay';
    static readonly GetFutureTime: string = 'getFutureTime';
    static readonly GetPastTime: string = 'getPastTime';
    static readonly ConvertFromUTC: string = 'convertFromUTC';
    static readonly ConvertToUTC: string = 'convertToUTC';
    static readonly AddToTime: string = 'addToTime';
    static readonly StartOfDay: string = 'startOfDay';
    static readonly StartOfHour: string = 'startOfHour';
    static readonly StartOfMonth: string = 'startOfMonth';
    static readonly Ticks: string = 'ticks';
    static readonly TicksToDays: string = 'ticksToDays';
    static readonly TicksToHours: string = 'ticksToHours';
    static readonly TicksToMinutes: string = 'ticksToMinutes';
    static readonly DateTimeDiff: string = 'dateTimeDiff';

    // timex
    static readonly IsDefinite: string = 'isDefinite';
    static readonly IsTime: string = 'isTime';
    static readonly IsDuration: string = 'isDuration';
    static readonly IsDate: string = 'isDate';
    static readonly IsTimeRange: string = 'isTimeRange';
    static readonly IsDateRange: string = 'isDateRange';
    static readonly IsPresent: string = 'isPresent';
    static readonly GetNextViableDate: string = 'getNextViableDate';
    static readonly GetPreviousViableDate: string = 'getPreviousViableDate';
    static readonly GetNextViableTime: string = 'getNextViableTime';
    static readonly GetPreviousViableTime: string = 'getPreviousViableTime';
    static readonly TimexResolve: string = 'resolve';

    // Conversions
    static readonly Float: string = 'float';
    static readonly Int: string = 'int';
    static readonly String: string = 'string';
    static readonly Bool: string = 'bool';
    static readonly Binary: string = 'binary';
    static readonly Base64: string = 'base64';
    static readonly Base64ToBinary: string = 'base64ToBinary';
    static readonly Base64ToString: string = 'base64ToString';
    static readonly DataUri: string = 'dataUri';
    static readonly DataUriToBinary: string = 'dataUriToBinary';
    static readonly DataUriToString: string = 'dataUriToString';
    static readonly UriComponent: string = 'uriComponent';
    static readonly UriComponentToString: string = 'uriComponentToString';
    static readonly FormatNumber: string = 'formatNumber';
    static readonly JsonStringify: string = 'jsonStringify';

    // Memory
    static readonly Accessor: string = 'Accessor';
    static readonly Element: string = 'Element';
    static readonly CreateArray: string = 'createArray';

    // Collection
    static readonly First: string = 'first';
    static readonly Last: string = 'last';
    static readonly Foreach: string = 'foreach';
    static readonly Select: string = 'select';
    static readonly Where: string = 'where';
    static readonly Union: string = 'union';
    static readonly Intersection: string = 'intersection';
    static readonly Skip: string = 'skip';
    static readonly Take: string = 'take';
    static readonly FilterNotEqual: string = 'filterNotEqual';
    static readonly SubArray: string = 'subArray';
    static readonly SortBy: string = 'sortBy';
    static readonly SortByDescending: string = 'sortByDescending';
    static readonly IndicesAndValues: string = 'indicesAndValues';
    static readonly Flatten: string = 'flatten';
    static readonly Unique: string = 'unique';
    static readonly Reverse: string = 'reverse';
    static readonly Any: string = 'any';
    static readonly All: string = 'all';

    // Misc
    static readonly Constant: string = 'Constant';
    static readonly Lambda: string = 'Lambda';
    static readonly If: string = 'if';
    static readonly Rand: string = 'rand';

    // Object manipulation and construction functions
    static readonly Json: string = 'json';
    static readonly AddProperty: string = 'addProperty';
    static readonly RemoveProperty: string = 'removeProperty';
    static readonly SetProperty: string = 'setProperty';
    static readonly GetProperty: string = 'getProperty';
    static readonly Coalesce: string = 'coalesce';
    static readonly JPath: string = 'jPath';
    static readonly SetPathToValue: string = 'setPathToValue';
    static readonly Merge: string = 'merge';
    static readonly XML: string = 'xml';
    static readonly XPath: string = 'xPath';

    // URI parsing functions
    static readonly UriHost: string = 'uriHost';
    static readonly UriPath: string = 'uriPath';
    static readonly UriPathAndQuery: string = 'uriPathAndQuery';
    static readonly UriPort: string = 'uriPort';
    static readonly UriQuery: string = 'uriQuery';
    static readonly UriScheme: string = 'uriScheme';

    // Regar expression
    static readonly IsMatch: string = 'isMatch';

    //Type Checking
    static readonly IsString: string = 'isString';
    static readonly IsInteger: string = 'isInteger';
    static readonly IsArray: string = 'isArray';
    static readonly IsObject: string = 'isObject';
    static readonly IsFloat: string = 'isFloat';
    static readonly IsDateTime: string = 'isDateTime';
    static readonly IsBoolean: string = 'isBoolean';

    // StringOrValue
    static readonly StringOrValue: string = 'stringOrValue';

    static readonly Ignore: string = 'ignore';
    static readonly Optional: string = 'optional';
}
