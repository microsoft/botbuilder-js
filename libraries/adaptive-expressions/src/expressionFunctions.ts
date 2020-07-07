/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';
import * as jsPath from 'jspath';
import * as lodash from 'lodash';
import moment, {Moment, parseZone} from 'moment';
import {tz} from 'moment-timezone';
import {CommonRegex} from './commonRegex';
import {Constant} from './constant';
import {Expression, ReturnType} from './expression';
import {EvaluateExpressionDelegate, ExpressionEvaluator, ValidateExpressionDelegate} from './expressionEvaluator';
import {ExpressionType} from './expressionType';
import {TimeZoneConverter} from './timeZoneConverter';
import {convertCSharpDateTimeToMomentJS} from './datetimeFormatConverter';
import {MemoryInterface, SimpleObjectMemory, StackedMemory} from './memory';
import {Options} from './options';
import atob = require('atob-lite');
import bigInt = require('big-integer');
            new ExpressionEvaluator(
                ExpressionType.Average,
                ExpressionFunctions.apply(
                    (args: any[]): number => args[0].reduce((x: number, y: number): number => x + y) / args[0].length,
                    ExpressionFunctions.verifyNumericList),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Sum,
                ExpressionFunctions.apply(
                    (args: any[]): number => args[0].reduce((x: number, y: number): number => x + y),
                    ExpressionFunctions.verifyNumericList),
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Array)),
            new ExpressionEvaluator(
                ExpressionType.Add,
                ExpressionFunctions.applySequenceWithError(
                    (args: any[]): any => {
                        let value: any;
                        let error: string;
                        const stringConcat = !ExpressionFunctions.isNumber(args[0]) || !ExpressionFunctions.isNumber(args[1]);
                        if (((args[0] === null || args[0] === undefined) && ExpressionFunctions.isNumber(args[1]))
                            || ((args[1] === null || args[1] === undefined) && ExpressionFunctions.isNumber(args[0]))) {
                            error = 'Operator \'+\' or add cannot be applied to operands of type \'number\' and null object.';
                        }
                        else if (stringConcat) {
                            if ((args[0] === null || args[0] === undefined) && (args[1] === null || args[1] === undefined)) {
                                value = '';
                            } else if (args[0] === null || args[0] === undefined) {
                                value = args[1].toString();
                            } else if (args[1] === null || args[1] === undefined) {
                                value = args[0].toString();
                            } else {
                                value = args[0].toString() + args[1].toString();
                            }
                        } else {
                            value = args[0] + args[1];
                        }

                        return {value, error};
                    },
                    ExpressionFunctions.verifyNumberOrStringOrNull),
                ReturnType.String | ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER, ReturnType.String | ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.Count,
                ExpressionFunctions.apply(
                    (args: any[]): number => {
                        let count: number;
                        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
                            count = args[0].length;
                        } else if (args[0] instanceof Map) {
                            count = args[0].size;
                        } else if (typeof args[0] == 'object') {
                            count = Object.keys(args[0]).length;
                        }

                        return count;
                    },
                    ExpressionFunctions.verifyContainer),
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.String | ReturnType.Array)),
            new ExpressionEvaluator(
                ExpressionType.Range,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        if (args[1] <= 0) {
                            error = 'Second paramter must be more than zero';
                        }

                        const result: number[] = [...Array(args[1]).keys()].map((u: number): number => u + Number(args[0]));

                        return {value: result, error};
                    },
                    ExpressionFunctions.verifyInteger
                ),
                ReturnType.Array,
                ExpressionFunctions.validateBinaryNumber
            ),
            ExpressionFunctions.numberTransform(ExpressionType.Floor,
                (args: any[]) => Math.floor(args[0])),
            ExpressionFunctions.numberTransform(ExpressionType.Ceiling,
                (args: any[]) => Math.ceil(args[0])),
            new ExpressionEvaluator(
                ExpressionType.Round,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let result: any;
                        let error: string;
                        if (args.length === 2 && !Number.isInteger(args[1])) {
                            error = `The second parameter ${ args[1] } must be an integer.`;
                        }

                        if (!error) {
                            const digits = args.length === 2 ? args[1] as number : 0;
                            if (digits < 0 || digits > 15) {
                                error = `The second parameter ${ args[1] } must be an integer between 0 and 15;`;
                            } else {
                                result = this.roundToPrecision(args[0], digits);
                            }
                        }

                        return {value: result, error};
                    },
                    ExpressionFunctions.verifyNumber
                ),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryOrBinaryNumber
            ),
            new ExpressionEvaluator(
                ExpressionType.Union,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        let result: any[] = [];
                        for (const arg of args) {
                            result = result.concat(arg);
                        }

                        return Array.from(new Set(result));
                    },
                    ExpressionFunctions.verifyList),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Array)
            ),
            new ExpressionEvaluator(
                ExpressionType.Intersection,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        let result: any[] = args[0];
                        for (const arg of args) {
                            result = result.filter((e: any): boolean => arg.indexOf(e) > -1);
                        }

                        return Array.from(new Set(result));
                    },
                    ExpressionFunctions.verifyList),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Array)
            ),
            new ExpressionEvaluator(
                ExpressionType.Skip,
                ExpressionFunctions.skip,
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Array, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.Take,
                ExpressionFunctions.take,
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Array, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.SubArray,
                ExpressionFunctions.subArray,
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.Number], ReturnType.Array, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.SortBy,
                ExpressionFunctions.sortBy(false),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Array)
            ),
            new ExpressionEvaluator(
                ExpressionType.SortByDescending,
                ExpressionFunctions.sortBy(true),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Array)
            ),
            new ExpressionEvaluator(
                ExpressionType.Flatten,
                ExpressionFunctions.apply(
                    (args: any[]): any[] => {
                        let array = args[0];
                        let depth = args.length > 1 ? args[1] : 100;
                        return ExpressionFunctions.flatten(array, depth);
                    }),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.Number], ReturnType.Array)
            ),
            new ExpressionEvaluator(
                ExpressionType.Unique,
                ExpressionFunctions.apply((args: any[]): any[] => [... new Set(args[0])]),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.Array)
            ),
            new ExpressionEvaluator(ExpressionType.IndicesAndValues,
                (expression: Expression, state: any, options: Options): {value: any; error: string} => ExpressionFunctions.indicesAndValues(expression, state, options),
                ReturnType.Array, ExpressionFunctions.validateUnary),
            ExpressionFunctions.comparison(
                ExpressionType.LessThan,
                (args: any[]): boolean => args[0] < args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.LessThanOrEqual,
                (args: any[]): boolean => args[0] <= args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.Equal,
                this.isEqual, ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.NotEqual,
                (args: any[]): boolean => !this.isEqual(args), ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.GreaterThan,
                (args: any[]): boolean => args[0] > args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.GreaterThanOrEqual,
                (args: any[]): boolean => args[0] >= args[1], ExpressionFunctions.validateBinaryNumberOrString, ExpressionFunctions.verifyNumberOrString),
            ExpressionFunctions.comparison(
                ExpressionType.Exists,
                (args: any[]): boolean => args[0] !== undefined, ExpressionFunctions.validateUnary, ExpressionFunctions.verifyNumberOrString),
            new ExpressionEvaluator(
                ExpressionType.Contains,
                (expression: Expression, state: any, options: Options): {value: any; error: string} => {
                    let found = false;
                    let error: any;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expression, state, options));

                    if (!error) {
                        if (typeof args[0] === 'string' && typeof args[1] === 'string' || Array.isArray(args[0])) {
                            found = args[0].includes(args[1]);
                        } else if (args[0] instanceof Map) {
                            found = (args[0] as Map<string, any>).get(args[1]) !== undefined;
                        } else if (typeof args[1] === 'string') {
                            let value: any;
                            ({value, error} = ExpressionFunctions.accessProperty(args[0], args[1]));
                            found = !error && value !== undefined;
                        }
                    }

                    return {value: found, error: undefined};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateBinary),
            ExpressionFunctions.comparison(
                ExpressionType.Empty,
                (args: any[]): boolean => this.isEmpty(args[0]),
                ExpressionFunctions.validateUnary,
                ExpressionFunctions.verifyContainer),
            new ExpressionEvaluator(
                ExpressionType.And,
                (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => ExpressionFunctions._and(expression, state, options),
                ReturnType.Boolean,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Or,
                (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => ExpressionFunctions._or(expression, state, options),
                ReturnType.Boolean,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Not,
                (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => ExpressionFunctions._not(expression, state, options),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Concat,
                ExpressionFunctions.applySequence((args: any[]): string => {
                    const firstItem = args[0];
                    const secondItem = args[1];
                    const isFirstList = Array.isArray(firstItem);
                    const isSecondList = Array.isArray(secondItem);
            
                    if ((firstItem === null || firstItem === undefined)
                        && (secondItem === null || secondItem === undefined)) {
                        return undefined;
                    } else if ((firstItem === null || firstItem === undefined) && isSecondList){
                        return secondItem;
                    } else if ((secondItem === null || secondItem === undefined) && isFirstList){
                        return firstItem;
                    } else if (isFirstList && isSecondList){
                        return firstItem.concat(secondItem);
                    } else {
                        return ExpressionFunctions.commonStringify(firstItem) + ExpressionFunctions.commonStringify(secondItem);
                    }
                }),
                ReturnType.String | ReturnType.Array,
                ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(
                ExpressionType.Length,
                ExpressionFunctions.apply((args: any[]): number => (ExpressionFunctions.parseStringOrNull(args[0])).length, ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Replace,
                ExpressionFunctions.applyWithError((
                    args: any[]): any => {
                    let error = undefined;
                    let result = undefined;
                    if (ExpressionFunctions.parseStringOrNull(args[1]).length === 0) {
                        error = `${args[1]} should be a string with length at least 1`;
                    }

                    if (!error) {
                        result = ExpressionFunctions.parseStringOrNull(args[0]).split(ExpressionFunctions.parseStringOrNull(args[1])).join(ExpressionFunctions.parseStringOrNull(args[2]));
                    }

                    return {value: result, error};
                }, ExpressionFunctions.verifyStringOrNull),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.ReplaceIgnoreCase,
                ExpressionFunctions.applyWithError((
                    args: any[]): any => {
                    let error = undefined;
                    let result = undefined;
                    if (ExpressionFunctions.parseStringOrNull(args[1]).length === 0) {
                        error = `${args[1]} should be a string with length at least 1`;
                    }

                    if (!error) {
                        result = ExpressionFunctions.parseStringOrNull(args[0]).replace(new RegExp(ExpressionFunctions.parseStringOrNull(args[1]), 'gi'), ExpressionFunctions.parseStringOrNull(args[2]));
                    }

                    return {value: result, error};
                }, ExpressionFunctions.verifyStringOrNull),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 3, 3, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Split,
                ExpressionFunctions.apply((args: any[]): string[] => ExpressionFunctions.parseStringOrNull(args[0]).split(ExpressionFunctions.parseStringOrNull(args[1] || '')), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Array,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, 2, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.Substring,
                ExpressionFunctions.substring,
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number)),
            ExpressionFunctions.stringTransform(ExpressionType.ToLower, (args: any[]): string => String(ExpressionFunctions.parseStringOrNull(args[0])).toLowerCase()),
            ExpressionFunctions.stringTransform(ExpressionType.ToUpper, (args: any[]): string => String(ExpressionFunctions.parseStringOrNull(args[0])).toUpperCase()),
            ExpressionFunctions.stringTransform(ExpressionType.Trim, (args: any[]): string => String(ExpressionFunctions.parseStringOrNull(args[0])).trim()),
            new ExpressionEvaluator(
                ExpressionType.StartsWith,
                ExpressionFunctions.apply((args: any[]): boolean => ExpressionFunctions.parseStringOrNull(args[0]).startsWith(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Boolean,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.EndsWith,
                ExpressionFunctions.apply((args: any[]): boolean => ExpressionFunctions.parseStringOrNull(args[0]).endsWith(ExpressionFunctions.parseStringOrNull(args[1])), ExpressionFunctions.verifyStringOrNull),
                ReturnType.Boolean,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, 2, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.CountWord,
                ExpressionFunctions.apply((args: any[]): number => ExpressionFunctions.parseStringOrNull(args[0]).trim().split(/\s+/).length, ExpressionFunctions.verifyStringOrNull),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString
            ),
            new ExpressionEvaluator(
                ExpressionType.AddOrdinal,
                ExpressionFunctions.apply((args: any[]): string => this.addOrdinal(args[0]), ExpressionFunctions.verifyInteger),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 1, 1, ReturnType.Number)
            ),
            new ExpressionEvaluator(
                ExpressionType.IndexOf,
                (expression: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value = -1;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expression, state, options));
                    if (!error) {
                        if (args[0] == undefined || typeof args[0] === 'string') {
                            if (args[1] === undefined || typeof args[1] === 'string') {
                                value = ExpressionFunctions.parseStringOrNull(args[0]).indexOf(ExpressionFunctions.parseStringOrNull(args[1]));
                            } else {
                                error = `Can only look for indexof string in ${expression}`;
                            }
                        } else if (Array.isArray(args[0])) {
                            value = args[0].indexOf(args[1]);
                        } else {
                            error = `${expression} works only on string or list.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.String | ReturnType.Array, ReturnType.Object)
            ),
            new ExpressionEvaluator(
                ExpressionType.LastIndexOf,
                (expression: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value = -1;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expression, state, options));
                    if (!error) {
                        if (args[0] == undefined || typeof args[0] === 'string') {
                            if (args[1] === undefined || typeof args[1] === 'string') {
                                const str = ExpressionFunctions.parseStringOrNull(args[0]);
                                const searchValue = ExpressionFunctions.parseStringOrNull(args[1]);
                                value = str.lastIndexOf(searchValue, str.length - 1);
                            } else {
                                error = `Can only look for indexof string in ${expression}`;
                            }
                        } else if (Array.isArray(args[0])) {
                            value = args[0].lastIndexOf(args[1]);
                        } else {
                            error = `${expression} works only on string or list.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [], ReturnType.String | ReturnType.Array, ReturnType.Object)
            ),
            ExpressionFunctions.stringTransform(ExpressionType.SentenceCase, (args: any[]): string => {
                const inputStr = String(ExpressionFunctions.parseStringOrNull(args[0])).toLowerCase();
                if (inputStr === '') {
                    return inputStr;
                } else {
                    return inputStr.charAt(0).toUpperCase() + inputStr.substr(1).toLowerCase();
                }
            }),
            ExpressionFunctions.stringTransform(ExpressionType.TitleCase, (args: any[]): string => {
                const inputStr = String(ExpressionFunctions.parseStringOrNull(args[0])).toLowerCase();
                if (inputStr === '') {
                    return inputStr;
                } else {
                    return inputStr.replace(/\w\S*/g, (txt): string => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                }
            }),
            new ExpressionEvaluator(
                ExpressionType.Join,
                (expression: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expression, state, options));
                    if (!error) {
                        if (!Array.isArray(args[0])) {
                            error = `${expression.children[0]} evaluates to ${args[0]} which is not a list.`;
                        } else {
                            if (args.length === 2) {
                                value = args[0].join(args[1]);
                            } else {
                                if (args[0].length < 3) {
                                    value = args[0].join(args[2]);
                                } else {
                                    const firstPart: string = args[0].slice(0, args[0].length - 1).join(args[1]);
                                    value = firstPart.concat(args[2], args[0][args[0].length - 1]);
                                }
                            }
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Array, ReturnType.String)),
            // datetime
            ExpressionFunctions.timeTransform(ExpressionType.AddDays, (ts: Date, num: any): Date =>  moment(ts).utc().add(num, 'd').toDate()),
            ExpressionFunctions.timeTransform(ExpressionType.AddHours, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'h').toDate()),
            ExpressionFunctions.timeTransform(ExpressionType.AddMinutes, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'minutes').toDate()),
            ExpressionFunctions.timeTransform(ExpressionType.AddSeconds, (ts: Date, num: any): Date => moment(ts).utc().add(num, 'seconds').toDate()),
            new ExpressionEvaluator(
                ExpressionType.DayOfMonth,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): number => timestamp.getUTCDate()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfWeek,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): number => timestamp.getUTCDay()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.DayOfYear,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): number => moment(timestamp).utc().dayOfYear()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Month,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): number => timestamp.getUTCMonth() + 1),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Date,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): string => moment(timestamp).utc().format('M/DD/YYYY')),
                    ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.Year,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => ExpressionFunctions.parseTimestamp(args[0], (timestamp: Date): number =>timestamp.getUTCFullYear()),
                    ExpressionFunctions.verifyString),
                ReturnType.Number,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.UtcNow,
                ExpressionFunctions.apply(
                    (args: any[]): string => args.length === 1 ? moment(new Date()).utc().format(args[0]) : new Date().toISOString(),
                    ExpressionFunctions.verifyString),
                ReturnType.String),
            new ExpressionEvaluator(
                ExpressionType.FormatDateTime,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        let arg: any = args[0];
                        if (typeof arg === 'string') {
                            error = ExpressionFunctions.verifyTimestamp(arg.toString());
                        } else {
                            arg = arg.toString();
                        }
                        let value: any;
                        if (!error) {
                            const dateString: string = new Date(arg).toISOString();
                            value = args.length === 2 ? moment(dateString).format(ExpressionFunctions.timestampFormatter(args[1])) : dateString;
                        }

                        return {value, error};
                    }),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.FormatEpoch,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        let arg: any = args[0];
                        if (typeof arg !== 'number') {
                            error = `formatEpoch first argument ${arg} must be a number`
                        } else {
                            // Convert to ms
                            arg = arg * 1000
                        }

                        let value: any;
                        if (!error) {
                            const dateString: string = new Date(arg).toISOString();
                            value = args.length === 2 ? moment(dateString).format(ExpressionFunctions.timestampFormatter(args[1])) : dateString;
                        }

                        return {value, error};
                    }),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.FormatTicks,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        let arg: any = args[0];
                        if (typeof arg === 'number') {
                            arg = bigInt(arg);
                        }
                        if (typeof arg === 'string') {
                            arg = bigInt(arg);
                        }
                        if (!bigInt.isInstance(arg)) {
                            error = `formatTicks first argument ${arg} is not a number, numeric string or bigInt`;
                        } else {
                            // Convert to ms
                            arg = ((arg.subtract(this.UnixMilliSecondToTicksConstant)).divide(this.MillisecondToTickConstant)).toJSNumber();
                        }

                        let value: any;
                        if (!error) {
                            const dateString: string = new Date(arg).toISOString();
                            value = args.length === 2 ? moment(dateString).format(ExpressionFunctions.timestampFormatter(args[1])) : dateString;
                        }

                        return {value, error};
                    }),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.SubtractFromTime,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: any;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                            const format: string = (args.length === 4 ? ExpressionFunctions.timestampFormatter(args[3]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const {duration, tsStr} = ExpressionFunctions.timeUnitTransformer(args[1], args[2]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({value, error} = ExpressionFunctions.parseTimestamp(args[0], (dt: Date): string => {
                                    return args.length === 4 ?
                                    moment(dt).utc().subtract(dur, tsStr).format(format) : moment(dt).utc().subtract(dur, tsStr).toISOString()}));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.DateReadBack,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let value: any;
                        let error: string;
                        const dateFormat = 'YYYY-MM-DD';
                        ({value, error} = ExpressionFunctions.parseTimestamp(args[0]));
                        if (!error) {
                            const timestamp1: Date = new Date(value.format(dateFormat));
                            ({value, error} = ExpressionFunctions.parseTimestamp(args[1]));
                            const timestamp2: string = value.format(dateFormat);
                            const timex: TimexProperty = new TimexProperty(timestamp2);

                            return {value: timex.toNaturalLanguage(timestamp1), error};
                        }
                    },
                    ExpressionFunctions.verifyString),
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.String, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.GetTimeOfDay,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let value: any;
                        const error: string = ExpressionFunctions.verifyISOTimestamp(args[0]);
                        if (!error) {
                            const thisTime: number = parseZone(args[0]).hour() * 100 + parseZone(args[0]).minute();
                            if (thisTime === 0) {
                                value = 'midnight';
                            } else if (thisTime > 0 && thisTime < 1200) {
                                value = 'morning';
                            } else if (thisTime === 1200) {
                                value = 'noon';
                            } else if (thisTime > 1200 && thisTime < 1800) {
                                value = 'afternoon';
                            } else if (thisTime >= 1800 && thisTime <= 2200) {
                                value = 'evening';
                            } else if (thisTime > 2200 && thisTime <= 2359) {
                                value = 'night';
                            }
                        }

                        return {value, error};
                    },
                    this.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnaryString),
            new ExpressionEvaluator(
                ExpressionType.GetFutureTime,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: any;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? ExpressionFunctions.timestampFormatter(args[2]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const {duration, tsStr} = ExpressionFunctions.timeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({value, error} = ExpressionFunctions.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                                    return moment(dt).utc().add(dur, tsStr).format(format)}));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.GetPastTime,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: any;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                            const format: string = (args.length === 3 ? ExpressionFunctions.timestampFormatter(args[2]) : ExpressionFunctions.DefaultDateTimeFormat);
                            const {duration, tsStr} = ExpressionFunctions.timeUnitTransformer(args[0], args[1]);
                            if (tsStr === undefined) {
                                error = `${args[2]} is not a valid time unit.`;
                            } else {
                                const dur: any = duration;
                                ({value, error} = ExpressionFunctions.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                                    return moment(dt).utc().subtract(dur, tsStr).format(format)}));
                            }
                        } else {
                            error = `${expr} can't evaluate.`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.ConvertFromUTC,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 3) ? ExpressionFunctions.timestampFormatter(args[2]) : this.NoneUtcDefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                            ({value, error} = ExpressionFunctions.convertFromUTC(args[0], args[1], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.ConvertToUTC,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 3) ? ExpressionFunctions.timestampFormatter(args[2]) : this.DefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                            ({value, error} = ExpressionFunctions.convertToUTC(args[0], args[1], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.AddToTime,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 4) ? ExpressionFunctions.timestampFormatter(args[3]) : this.DefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string' && Number.isInteger(args[1]) && typeof (args[2]) === 'string') {
                            ({value, error} = ExpressionFunctions.addToTime(args[0], args[1], args[2], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfDay,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfDay(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfHour,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfHour(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.StartOfMonth,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        const format: string = (args.length === 2) ? ExpressionFunctions.timestampFormatter(args[1]) : this.DefaultDateTimeFormat;
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.startOfMonth(args[0], format));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.String)
            ),
            new ExpressionEvaluator(
                ExpressionType.Ticks,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.ticks(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.TicksToDays,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (Number.isInteger(args[0])) {
                            value = args[0] / this.TicksPerDay;
                        } else {
                            error = `${expr} should contain an integer of ticks`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnaryNumber),
            new ExpressionEvaluator(
                ExpressionType.TicksToHours,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (Number.isInteger(args[0])) {
                            value = args[0] / this.TicksPerHour;
                        } else {
                            error = `${expr} should contain an integer of ticks`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnaryNumber),
            new ExpressionEvaluator(
                ExpressionType.TicksToMinutes,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (Number.isInteger(args[0])) {
                            value = args[0] / this.TicksPerMinute;
                        } else {
                            error = `${expr} should contain an integer of ticks`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnaryNumber),
            new ExpressionEvaluator(
                ExpressionType.DateTimeDiff,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let dateTimeStart: any;
                    let dateTimeEnd: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({value: dateTimeStart, error: error} = this.ticks(args[0]));
                        if (!error) {
                            ({value: dateTimeEnd, error: error} = this.ticks(args[1]));
                        }
                    }

                    if (!error) {
                        value = dateTimeStart - dateTimeEnd
                    }

                    return {value, error};
                },
                ReturnType.Number,
                expr => ExpressionFunctions.validateArityAndAnyType(expr, 2, 2, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.IsDefinite,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (!error) {
                        value = parsed != undefined && parsed.year !== undefined && parsed.month !== undefined && parsed.dayOfMonth !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsTime,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = parsed.hour !== undefined && parsed.minute !== undefined && parsed.second !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsDuration,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = parsed.years !== undefined
                            || parsed.months !== undefined
                            || parsed.weeks !== undefined
                            || parsed.days !== undefined
                            || parsed.hours !== undefined
                            || parsed.minutes !== undefined
                            || parsed.seconds !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsDate,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = (parsed.month !== undefined && parsed.dayOfMonth !== undefined) || parsed.dayOfWeek !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsTimeRange,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = parsed.partOfDay !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsDateRange,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = (parsed.year !== undefined && parsed.dayOfMonth === undefined) ||
                            (parsed.year !== undefined && parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                            (parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                            parsed.season !== undefined || parsed.weekOfYear !== undefined || parsed.weekOfMonth !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.IsPresent,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let parsed: TimexProperty;
                    let value = false;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        ({timexProperty: parsed, error: error} = ExpressionFunctions.parseTimexProperty(args[0]));
                    }

                    if (parsed && !error) {
                        value = parsed.now !== undefined;
                    }

                    return {value, error};
                },
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),

            new ExpressionEvaluator(
                ExpressionType.UriHost,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriHost(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPath,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPath(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPathAndQuery,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPathAndQuery(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriQuery,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriQuery(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriPort,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriPort(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriScheme,
                (expr: Expression, state: any, options: Options): {value: any; error: string} => {
                    let value: any;
                    let error: string;
                    let args: any[];
                    ({args, error} = ExpressionFunctions.evaluateChildren(expr, state, options));
                    if (!error) {
                        if (typeof (args[0]) === 'string') {
                            ({value, error} = ExpressionFunctions.uriScheme(args[0]));
                        } else {
                            error = `${expr} cannot evaluate`;
                        }
                    }

                    return {value, error};
                },
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Float,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        const value: number = parseFloat(args[0]);
                        if (!ExpressionFunctions.isNumber(value)) {
                            error = `parameter ${args[0]} is not a valid number string.`;
                        }

                        return {value, error};
                    }),
                ReturnType.Number, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Int,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        const value: number = parseInt(args[0], 10);
                        if (!ExpressionFunctions.isNumber(value)) {
                            error = `parameter ${args[0]} is not a valid number string.`;
                        }

                        return {value, error};
                    }),
                ReturnType.Number,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.String,
                ExpressionFunctions.apply((args: any[]): string => {
                    return JSON.stringify(args[0])
                        .replace(/(^\'*)/g, '')
                        .replace(/(\'*$)/g, '')
                        .replace(/(^\"*)/g, '')
                        .replace(/(\"*$)/g, '');
                }),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            ExpressionFunctions.comparison(
                ExpressionType.Bool,
                (args: any[]): boolean => this.isLogicTrue(args[0]),
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.FormatNumber,
                ExpressionFunctions.applyWithError(
                    args => {
                        let value: any = null;
                        let error: string;
                        let number = args[0];
                        let precision = args[1];
                        let locale = args.length > 2 ? args[2] : "en-us";
                        if (typeof number !== 'number') {
                            error = `formatNumber first argument ${number} must be a number`;
                        } else if (typeof precision !== 'number') {
                            error = `formatNumber second argument ${precision} must be a number`;
                        } else if (locale && typeof locale !== 'string') {
                            error = `formatNubmer third argument ${locale} is not a valid locale`;
                        } else {
                            // NOTE: Nodes toLocaleString and Intl do not work to localize unless a special version of node is used.
                            // TODO: In R10 we should try another package.  Numeral and d3-format have the basics, but no locale specific.  
                            // Numbro has locales, but is optimized for the browser.
                            value = number.toLocaleString(locale, {minimumFractionDigits: precision, maximumFractionDigits: precision});
                        }

                        return {value, error};
                    }),
                ReturnType.String,
                (expr: Expression): void => ExpressionFunctions.validateOrder(expr, [ReturnType.String], ReturnType.Number, ReturnType.Number)),
            new ExpressionEvaluator(
                ExpressionType.GetProperty,
                ExpressionFunctions.getProperty,
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, [ReturnType.String], ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.If,
                (expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} => ExpressionFunctions._if(expression, state, options),
                ReturnType.Object,
                (expr: Expression): void => ExpressionFunctions.validateArityAndAnyType(expr, 3, 3)),
            new ExpressionEvaluator(
                ExpressionType.Rand,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        if (args[0] > args[1]) {
                            error = `Min value ${args[0]} cannot be greater than max value ${args[1]}.`;
                        }

                        const value: any = Math.floor(Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]));

                        return {value, error};
                    },
                    ExpressionFunctions.verifyInteger),
                ReturnType.Number,
                ExpressionFunctions.validateBinaryNumber),
            new ExpressionEvaluator(ExpressionType.CreateArray, ExpressionFunctions.apply((args: any[]): any[] => Array.from(args)), ReturnType.Array),
            new ExpressionEvaluator(
                ExpressionType.Binary,
                ExpressionFunctions.apply((args: any[]): Uint8Array => this.toBinary(args[0]), ExpressionFunctions.verifyString),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUri,
                ExpressionFunctions.apply(
                    (args: Readonly<any>): string => 'data:text/plain;charset=utf-8;base64,'.concat(Buffer.from(args[0]).toString('base64')), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToBinary,
                ExpressionFunctions.apply((args: Readonly<any>): Uint8Array => this.toBinary(args[0]), ExpressionFunctions.verifyString),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.DataUriToString,
                ExpressionFunctions.apply((args: Readonly<any>): string => Buffer.from(args[0].slice(args[0].indexOf(',') + 1), 'base64').toString(), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponentToString,
                ExpressionFunctions.apply((args: Readonly<any>): string => decodeURIComponent(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64,
                ExpressionFunctions.apply(
                    (args: Readonly<any>): string | Uint8Array => {
                        let result: string;
                        if (typeof args[0] === 'string') {
                            result = Buffer.from(args[0]).toString('base64');
                        }

                        if (args[0] instanceof Uint8Array) {
                            result = Buffer.from(args[0]).toString('base64');
                        }
                        return result;
                    }),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToBinary,
                ExpressionFunctions.apply(
                    (args: Readonly<any>): Uint8Array => {
                        const raw = atob(args[0].toString());
                        return this.toBinary(raw);
                    }, ExpressionFunctions.verifyString),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Base64ToString,
                ExpressionFunctions.apply((args: Readonly<any>): string => Buffer.from(args[0], 'base64').toString(), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.UriComponent,
                ExpressionFunctions.apply((args: Readonly<any>): string => encodeURIComponent(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.First,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        let first: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            first = args[0][0];
                        }

                        if (Array.isArray(args[0]) && args[0].length > 0) {
                            first = ExpressionFunctions.accessIndex(args[0], 0).value;
                        }

                        return first;
                    }),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Last,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        let last: any;
                        if (typeof args[0] === 'string' && args[0].length > 0) {
                            last = args[0][args[0].length - 1];
                        }

                        if (Array.isArray(args[0]) && args[0].length > 0) {
                            last = ExpressionFunctions.accessIndex(args[0], args[0].length - 1).value;
                        }

                        return last;
                    }),
                ReturnType.Object,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(
                ExpressionType.Json,
                ExpressionFunctions.apply((args: any[]): any => JSON.parse(args[0].trim())),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.AddProperty,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let error: string;
                        const temp: any = args[0];
                        const prop = String(args[1]);
                        if (prop in temp) {
                            error = `${prop} already exists`;
                        } else {
                            temp[String(args[1])] = args[2];
                        }

                        return {value: temp, error};
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.SetProperty,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        const temp: any = args[0];
                        temp[String(args[1])] = args[2];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object)),
            new ExpressionEvaluator(
                ExpressionType.RemoveProperty,
                ExpressionFunctions.apply(
                    (args: any[]): any => {
                        const temp: any = args[0];
                        delete temp[String(args[1])];

                        return temp;
                    }),
                ReturnType.Object,
                (expression: Expression): void => ExpressionFunctions.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(
                ExpressionType.SetPathToValue,
                this.setPathToValue,
                ReturnType.Object,
                this.validateBinary),
            new ExpressionEvaluator(ExpressionType.Select, ExpressionFunctions.foreach, ReturnType.Array, ExpressionFunctions.validateForeach),
            new ExpressionEvaluator(ExpressionType.Foreach, ExpressionFunctions.foreach, ReturnType.Array, ExpressionFunctions.validateForeach),
            new ExpressionEvaluator(ExpressionType.Where, ExpressionFunctions.where, ReturnType.Array, ExpressionFunctions.validateWhere),

            //URI Parsing Functions
            new ExpressionEvaluator(ExpressionType.UriHost, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriHost(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPath, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPath(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPathAndQuery,
                ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPathAndQuery(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriQuery, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriQuery(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriPort, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriPort(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.UriScheme, ExpressionFunctions.applyWithError((args: Readonly<any>): any => this.uriScheme(args[0]), ExpressionFunctions.verifyString),
                ReturnType.String, ExpressionFunctions.validateUnary),

            new ExpressionEvaluator(ExpressionType.Coalesce, ExpressionFunctions.apply((args: any[][]): any => this.coalesce(args as any[])),
                ReturnType.Object, ExpressionFunctions.validateAtLeastOne),
            new ExpressionEvaluator(ExpressionType.JPath, ExpressionFunctions.applyWithError((args: any[][]): any => this.jPath(args[0], args[1].toString())),
                ReturnType.Object, (expr: Expression): void => ExpressionFunctions.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String)),
            new ExpressionEvaluator(ExpressionType.Merge, 
                ExpressionFunctions.applySequenceWithError(
                    (args: any[]): any => {
                        let value: any;
                        let error: string;
                        if ((typeof(args[0]) === 'object' && !Array.isArray(args[0])) && (typeof(args[1]) === 'object' && !Array.isArray(args[1]))) {
                            Object.assign(args[0], args[1]);
                            value = args[0];
                        } else {
                            error = `The argumets ${ args[0] } and ${ args[1] } must be JSON objects.`;
                        }

                        return {value, error};
                    }),
                ReturnType.Object, 
                (expression: Expression): void => ExpressionFunctions.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER)),

            // Regex expression functions
            new ExpressionEvaluator(
                ExpressionType.IsMatch,
                ExpressionFunctions.applyWithError(
                    (args: any[]): any => {
                        let value = false;
                        let error: string;
                        if (args[0] === undefined || args[0] === '') {
                            value = false;
                            error = 'regular expression is empty.';
                        } else {
                            const regex: RegExp = CommonRegex.CreateRegex(args[1].toString());
                            value = regex.test(args[0].toString());
                        }

                        return {value, error};
                    }, ExpressionFunctions.verifyStringOrNull),
                ReturnType.Boolean,
                ExpressionFunctions.validateIsMatch),

            // Type Checking Functions
            new ExpressionEvaluator(ExpressionType.isString, ExpressionFunctions.apply(
                (args: any[]): boolean => typeof args[0] === 'string'),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isInteger, ExpressionFunctions.apply(
                (args: any[]): boolean => this.isNumber(args[0]) && Number.isInteger(args[0])),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isFloat, ExpressionFunctions.apply(
                (args: any[]): boolean => this.isNumber(args[0]) && !Number.isInteger(args[0])),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isArray, ExpressionFunctions.apply(
                (args: any[]): boolean => Array.isArray(args[0])),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isObject, ExpressionFunctions.apply(
                (args: any[]): boolean => typeof args[0] === 'object'),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isBoolean, ExpressionFunctions.apply(
                (args: any[]): boolean => typeof args[0] === 'boolean'),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary),
            new ExpressionEvaluator(ExpressionType.isDateTime, ExpressionFunctions.apply(
                (args: any[]): boolean => typeof args[0] === 'string' && this.verifyISOTimestamp(args[0]) === undefined),
                ReturnType.Boolean,
                ExpressionFunctions.validateUnary)
        ];

        const lookup: Map<string, ExpressionEvaluator> = new Map<string, ExpressionEvaluator>();
        functions.forEach((func: ExpressionEvaluator): void => {
            lookup.set(func.type, func);
        });

        // Math aliases
        lookup.set('add', lookup.get(ExpressionType.Add)); // more than 1 param
        lookup.set('mul', lookup.get(ExpressionType.Multiply)); // more than 1 param
        lookup.set('div', lookup.get(ExpressionType.Divide)); // more than 1 param
        lookup.set('sub', lookup.get(ExpressionType.Subtract)); // more than 1 param
        lookup.set('exp', lookup.get(ExpressionType.Power)); // more than 1 param
        lookup.set('mod', lookup.get(ExpressionType.Mod));

        // Comparison aliases
        lookup.set('and', lookup.get(ExpressionType.And));
        lookup.set('equals', lookup.get(ExpressionType.Equal));
        lookup.set('greater', lookup.get(ExpressionType.GreaterThan));
        lookup.set('greaterOrEquals', lookup.get(ExpressionType.GreaterThanOrEqual));
        lookup.set('less', lookup.get(ExpressionType.LessThan));
        lookup.set('lessOrEquals', lookup.get(ExpressionType.LessThanOrEqual));
        lookup.set('not', lookup.get(ExpressionType.Not));
        lookup.set('or', lookup.get(ExpressionType.Or));
        lookup.set('&', lookup.get(ExpressionType.Concat));

        return lookup as ReadonlyMap<string, ExpressionEvaluator>;
    }
}
