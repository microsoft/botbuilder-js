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
    public static readonly Add: string = '+';
    public static readonly Subtract: string = '-';
    public static readonly Multiply: string = '*';
    public static readonly Divide: string = '/';
    public static readonly Min: string = 'min';
    public static readonly Max: string = 'max';
    public static readonly Power: string = '^';
    public static readonly Mod: string = '%';
    public static readonly Average: string = 'average';
    public static readonly Sum: string = 'sum';
    public static readonly Count: string = 'count';
    public static readonly Range: string = 'range';

    // Comparisons
    public static readonly LessThan: string = '<';
    public static readonly LessThanOrEqual: string = '<=';
    public static readonly Equal: string = '==';
    public static readonly NotEqual: string = '!=';
    public static readonly GreaterThan: string = '>';
    public static readonly GreaterThanOrEqual: string = '>=';
    public static readonly Exists: string = 'exists';
    public static readonly Contains: string = 'contains';
    public static readonly Empty: string = 'empty';

    // Logic
    public static readonly And: string = '&&';
    public static readonly Or: string = '||';
    public static readonly Not: string = '!';

    // String
    public static readonly Concat: string = '&';
    public static readonly Length: string = 'length';
    public static readonly Replace: string = 'replace';
    public static readonly ReplaceIgnoreCase: string = 'replaceIgnoreCase';
    public static readonly Split: string = 'split';
    public static readonly Substring: string = 'substring';
    public static readonly ToLower: string = 'toLower';
    public static readonly ToUpper: string = 'toUpper';
    public static readonly Trim: string = 'trim';
    public static readonly Join: string = 'join';
    public static readonly EndsWith: string = 'endsWith';
    public static readonly StartsWith: string = 'startsWith';
    public static readonly CountWord: string = 'countWord';
    public static readonly AddOrdinal: string = 'addOrdinal';
    public static readonly NewGuid: string = 'newGuid';
    public static readonly IndexOf: string = 'indexOf';
    public static readonly LastIndexOf: string = 'lastIndexOf';

    // DateTime
    public static readonly AddDays: string = 'addDays';
    public static readonly AddHours: string = 'addHours';
    public static readonly AddMinutes: string = 'addMinutes';
    public static readonly AddSeconds: string = 'addSeconds';
    public static readonly DayOfMonth: string = 'dayOfMonth';
    public static readonly DayOfWeek: string = 'dayOfWeek';
    public static readonly DayOfYear: string = 'dayOfYear';
    public static readonly Month: string = 'month';
    public static readonly Date: string = 'date';
    public static readonly Year: string = 'year';
    public static readonly UtcNow: string = 'utcNow';
    public static readonly FormatDateTime: string = 'formatDateTime';
    public static readonly SubtractFromTime: string = 'subtractFromTime';
    public static readonly DateReadBack: string = 'dateReadBack';
    public static readonly GetTimeOfDay: string = 'getTimeOfDay';
    public static readonly GetFutureTime: string = 'getFutureTime';
    public static readonly GetPastTime: string = 'getPastTime';
    public static readonly ConvertFromUTC: string = 'convertFromUTC';
    public static readonly ConvertToUTC: string = 'convertToUTC';
    public static readonly AddToTime: string = 'addToTime';
    public static readonly StartOfDay: string = 'startOfDay';
    public static readonly StartOfHour: string = 'startOfHour';
    public static readonly StartOfMonth: string = 'startOfMonth';
    public static readonly Ticks: string = 'ticks';

    // Conversions
    public static readonly Float: string = 'float';
    public static readonly Int: string = 'int';
    public static readonly String: string = 'string';
    public static readonly Bool: string = 'bool';
    public static readonly Array: string = 'array';
    public static readonly Binary: string = 'binary';
    public static readonly DataUri: string = 'dataUri';
    public static readonly DataUriToBinary: string = 'dataUriToBinary';
    public static readonly DataUriToString: string = 'dataUriToString';
    public static readonly UriComponentToString: string = 'uriComponentToString';
    public static readonly Base64: string = 'base64';
    public static readonly Base64ToBinary: string = 'base64ToBinary';
    public static readonly Base64ToString: string = 'base64ToString';
    public static readonly UriComponent: string = 'uriComponent';
    // TODO
    // xml

    // Memory
    public static readonly Accessor: string = 'Accessor';
    public static readonly Element: string = 'Element';
    public static readonly CreateArray: string = 'createArray';

    // Collection
    public static readonly First: string = 'first';
    public static readonly Last: string = 'last';
    public static readonly Foreach: string = 'foreach';
    public static readonly Select: string = 'select';
    public static readonly Where: string = 'where';
    public static readonly Union: string = 'union';
    public static readonly Intersection: string = 'intersection';
    public static readonly Skip: string = 'skip';
    public static readonly Take: string = 'take';
    public static readonly FilterNotEqual: string = 'filterNotEqual';
    public static readonly SubArray: string = 'subArray';
    public static readonly SortBy: string = 'sortBy';
    public static readonly SortByDescending: string = 'sortByDescending';

    // Misc
    public static readonly Constant: string = 'Constant';
    public static readonly Lambda: string = 'Lambda';
    public static readonly If: string = 'if';
    public static readonly Rand: string = 'rand';

    // Object manipulation and construction functions
    public static readonly Json: string = 'json';
    public static readonly AddProperty: string = 'addProperty';
    public static readonly RemoveProperty: string = 'removeProperty';
    public static readonly SetProperty: string = 'setProperty';
    public static readonly GetProperty: string = 'getProperty';
    public static readonly Coalesce: string = 'coalesce';
    public static readonly JPath: string = 'jPath';
    public static readonly SetPathToValue: string = 'setPathToValue';
    
    // TODO
    // xPath
    // jPath

    // URI parsing functions
    public static readonly UriHost: string = 'uriHost';
    public static readonly UriPath: string = 'uriPath';
    public static readonly UriPathAndQuery: string = 'uriPathAndQuery';
    public static readonly UriPort: string = 'uriPort';
    public static readonly UriQuery: string = 'uriQuery';
    public static readonly UriScheme: string = 'uriScheme';

    // Regar expression
    public static readonly IsMatch: string = 'isMatch';
}
