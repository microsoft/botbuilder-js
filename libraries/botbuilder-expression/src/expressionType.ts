
/**
 * @module botbuilder-expression
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
    public static readonly Optional: string = 'optional';

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

    // Conversions
    public static readonly Float: string = 'float';
    public static readonly Int: string = 'int';
    public static readonly String: string = 'string';
    public static readonly Bool: string = 'bool';

    // Memory
    public static readonly Accessor: string = 'Accessor';
    public static readonly Element: string = 'Element';
    public static readonly CreateArray: string = 'createArray';
    public static readonly First: string = 'first';
    public static readonly Last: string = 'last';

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

}
