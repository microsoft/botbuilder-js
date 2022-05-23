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
    public static readonly Min: string = 'Min';
    public static readonly Max: string = 'Max';
    public static readonly Power: string = '^';
    public static readonly Mod: string = '%';
    public static readonly Average: string = 'Average';
    public static readonly Sum: string = 'Sum';
    public static readonly Count: string = 'Count';
    public static readonly Range: string = 'Range';
    public static readonly Floor: string = 'Floor';
    public static readonly Ceiling: string = 'Ceiling';
    public static readonly Round: string = 'Round';
    public static readonly Abs: string = 'Abs';
    public static readonly Sqrt: string = 'Sqrt';

    // Comparisons
    public static readonly LessThan: string = '<';
    public static readonly LessThanOrEqual: string = '<=';
    public static readonly Equal: string = '==';
    public static readonly NotEqual: string = '!=';
    public static readonly GreaterThan: string = '>';
    public static readonly GreaterThanOrEqual: string = '>=';
    public static readonly Exists: string = 'Exists';
    public static readonly Contains: string = 'Contains';
    public static readonly Empty: string = 'Empty';

    // Logic
    public static readonly And: string = '&&';
    public static readonly Or: string = '||';
    public static readonly Not: string = '!';

    // String
    public static readonly Concat: string = 'Concat';
    public static readonly Length: string = 'Length';
    public static readonly Replace: string = 'Replace';
    public static readonly ReplaceIgnoreCase: string = 'ReplaceIgnoreCase';
    public static readonly Split: string = 'Split';
    public static readonly Substring: string = 'Substring';
    public static readonly ToLower: string = 'ToLower';
    public static readonly ToUpper: string = 'ToUpper';
    public static readonly Trim: string = 'Trim';
    public static readonly Join: string = 'Join';
    public static readonly EndsWith: string = 'EndsWith';
    public static readonly StartsWith: string = 'StartsWith';
    public static readonly CountWord: string = 'CountWord';
    public static readonly AddOrdinal: string = 'AddOrdinal';
    public static readonly NewGuid: string = 'NewGuid';
    public static readonly IndexOf: string = 'IndexOf';
    public static readonly LastIndexOf: string = 'LastIndexOf';
    public static readonly EOL: string = 'EOL';
    public static readonly SentenceCase: string = 'SentenceCase';
    public static readonly TitleCase: string = 'TitleCase';

    // DateTime
    public static readonly AddDays: string = 'AddDays';
    public static readonly AddHours: string = 'AddHours';
    public static readonly AddMinutes: string = 'AddMinutes';
    public static readonly AddSeconds: string = 'AddSeconds';
    public static readonly DayOfMonth: string = 'DayOfMonth';
    public static readonly DayOfWeek: string = 'DayOfWeek';
    public static readonly DayOfYear: string = 'DayOfYear';
    public static readonly Month: string = 'Month';
    public static readonly Date: string = 'Date';
    public static readonly Year: string = 'Year';
    public static readonly UtcNow: string = 'UtcNow';
    public static readonly FormatDateTime: string = 'FormatDateTime';
    public static readonly FormatEpoch: string = 'FormatEpoch';
    public static readonly FormatTicks: string = 'FormatTicks';
    public static readonly SubtractFromTime: string = 'SubtractFromTime';
    public static readonly DateReadBack: string = 'DateReadBack';
    public static readonly GetTimeOfDay: string = 'GetTimeOfDay';
    public static readonly GetFutureTime: string = 'GetFutureTime';
    public static readonly GetPastTime: string = 'GetPastTime';
    public static readonly ConvertFromUTC: string = 'ConvertFromUTC';
    public static readonly ConvertToUTC: string = 'ConvertToUTC';
    public static readonly AddToTime: string = 'AddToTime';
    public static readonly StartOfDay: string = 'StartOfDay';
    public static readonly StartOfHour: string = 'StartOfHour';
    public static readonly StartOfMonth: string = 'StartOfMonth';
    public static readonly Ticks: string = 'Ticks';
    public static readonly TicksToDays: string = 'TicksToDays';
    public static readonly TicksToHours: string = 'TicksToHours';
    public static readonly TicksToMinutes: string = 'TicksToMinutes';
    public static readonly DateTimeDiff: string = 'DateTimeDiff';

    // timex
    public static readonly IsDefinite: string = 'IsDefinite';
    public static readonly IsTime: string = 'IsTime';
    public static readonly IsDuration: string = 'IsDuration';
    public static readonly IsDate: string = 'IsDate';
    public static readonly IsTimeRange: string = 'IsTimeRange';
    public static readonly IsDateRange: string = 'IsDateRange';
    public static readonly IsPresent: string = 'IsPresent';
    public static readonly GetNextViableDate: string = 'GetNextViableDate';
    public static readonly GetPreviousViableDate: string = 'GetPreviousViableDate';
    public static readonly GetNextViableTime: string = 'GetNextViableTime';
    public static readonly GetPreviousViableTime: string = 'GetPreviousViableTime';
    public static readonly TimexResolve: string = 'Resolve';

    // Conversions
    public static readonly Float: string = 'Float';
    public static readonly Int: string = 'Int';
    public static readonly String: string = 'String';
    public static readonly Bool: string = 'Bool';
    public static readonly Binary: string = 'Binary';
    public static readonly Base64: string = 'Base64';
    public static readonly Base64ToBinary: string = 'Base64ToBinary';
    public static readonly Base64ToString: string = 'Base64ToString';
    public static readonly DataUri: string = 'DataUri';
    public static readonly DataUriToBinary: string = 'DataUriToBinary';
    public static readonly DataUriToString: string = 'DataUriToString';
    public static readonly UriComponent: string = 'UriComponent';
    public static readonly UriComponentToString: string = 'UriComponentToString';
    public static readonly FormatNumber: string = 'FormatNumber';
    public static readonly JsonStringify: string = 'JsonStringify';

    // Memory
    public static readonly Accessor: string = 'Accessor';
    public static readonly Element: string = 'Element';
    public static readonly CreateArray: string = 'CreateArray';

    // Collection
    public static readonly First: string = 'First';
    public static readonly Last: string = 'Last';
    public static readonly Foreach: string = 'ForEach';
    public static readonly Select: string = 'Select';
    public static readonly Where: string = 'Where';
    public static readonly Union: string = 'Union';
    public static readonly Intersection: string = 'Intersection';
    public static readonly Skip: string = 'Skip';
    public static readonly Take: string = 'Take';
    public static readonly FilterNotEqual: string = 'FilterNotEqual';
    public static readonly SubArray: string = 'SubArray';
    public static readonly SortBy: string = 'SortBy';
    public static readonly SortByDescending: string = 'SortByDescending';
    public static readonly IndicesAndValues: string = 'IndicesAndValues';
    public static readonly Flatten: string = 'Flatten';
    public static readonly Unique: string = 'Unique';
    public static readonly Reverse: string = 'Reverse';
    public static readonly Any: string = 'Any';
    public static readonly All: string = 'All';

    // Misc
    public static readonly Constant: string = 'Constant';
    public static readonly Lambda: string = 'Lambda';
    public static readonly If: string = 'If';
    public static readonly Rand: string = 'Rand';

    // Object manipulation and construction functions
    public static readonly Json: string = 'Json';
    public static readonly AddProperty: string = 'AddProperty';
    public static readonly RemoveProperty: string = 'RemoveProperty';
    public static readonly SetProperty: string = 'SetProperty';
    public static readonly GetProperty: string = 'GetProperty';
    public static readonly Coalesce: string = 'Coalesce';
    public static readonly JPath: string = 'JPath';
    public static readonly SetPathToValue: string = 'SetPathToValue';
    public static readonly Merge: string = 'Merge';
    public static readonly XML: string = 'Xml';
    public static readonly XPath: string = 'XPath';

    // URI parsing functions
    public static readonly UriHost: string = 'UriHost';
    public static readonly UriPath: string = 'UriPath';
    public static readonly UriPathAndQuery: string = 'UriPathAndQuery';
    public static readonly UriPort: string = 'UriPort';
    public static readonly UriQuery: string = 'UriQuery';
    public static readonly UriScheme: string = 'UriScheme';

    // Regar expression
    public static readonly IsMatch: string = 'IsMatch';

    //Type Checking
    public static readonly IsString: string = 'IsString';
    public static readonly IsInteger: string = 'IsInteger';
    public static readonly IsArray: string = 'IsArray';
    public static readonly IsObject: string = 'IsObject';
    public static readonly IsFloat: string = 'IsFloat';
    public static readonly IsDateTime: string = 'IsDateTime';
    public static readonly IsBoolean: string = 'IsBoolean';

    // StringOrValue
    public static readonly StringOrValue: string = 'StringOrValue';

    public static readonly Ignore: string = 'Ignore';
    public static readonly Optional: string = 'Optional';
}
