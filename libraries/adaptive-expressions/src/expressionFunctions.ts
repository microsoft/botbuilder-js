/**
 * @module adaptive-expressions
 */

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as BuiltinFunctions from './builtinFunctions';
import { ExpressionEvaluator } from './expressionEvaluator';
import { ExpressionType } from './expressionType';

/**
 *  <summary>
 *  Definition of default built-in functions for expressions.
 *  </summary>
 *  <remarks>
 *  These functions are largely from WDL https://docs.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference
 *  with a few extensions like infix operators for math, logic and comparisons.
 *  This class also has some methods that are useful to use when defining custom functions.
 *  You can always construct a <see cref="ExpressionEvaluator"/> directly which gives the maximum amount of control over validation and evaluation.
 *  Validators are static checkers that should throw an exception if something is not valid statically.
 *  Evaluators are called to evaluate an expression and should try not to throw.
 *  There are some evaluators in this file that take in a verifier that is called at runtime to verify arguments are proper.
 *  </remarks>
 */
export class ExpressionFunctions {
    /**
     * Read only Dictionary of built in functions.
     */
    static readonly standardFunctions: ReadonlyMap<
        string,
        ExpressionEvaluator
    > = ExpressionFunctions.getStandardFunctions();

    /**
     * @private
     */
    private static getStandardFunctions(): ReadonlyMap<string, ExpressionEvaluator> {
        const functions: ExpressionEvaluator[] = [
            new BuiltinFunctions.Abs(),
            new BuiltinFunctions.Accessor(),
            new BuiltinFunctions.Add(),
            new BuiltinFunctions.AddDays(),
            new BuiltinFunctions.AddHours(),
            new BuiltinFunctions.AddMinutes(),
            new BuiltinFunctions.AddOrdinal(),
            new BuiltinFunctions.AddProperty(),
            new BuiltinFunctions.AddSeconds(),
            new BuiltinFunctions.AddToTime(),
            new BuiltinFunctions.All(),
            new BuiltinFunctions.And(),
            new BuiltinFunctions.Any(),
            new BuiltinFunctions.Average(),
            new BuiltinFunctions.Base64(),
            new BuiltinFunctions.Base64ToBinary(),
            new BuiltinFunctions.Base64ToString(),
            new BuiltinFunctions.Binary(),
            new BuiltinFunctions.Bool(),
            new BuiltinFunctions.Ceiling(),
            new BuiltinFunctions.Coalesce(),
            new BuiltinFunctions.Concat(),
            new BuiltinFunctions.Contains(),
            new BuiltinFunctions.ConvertFromUTC(),
            new BuiltinFunctions.ConvertToUTC(),
            new BuiltinFunctions.Count(),
            new BuiltinFunctions.CountWord(),
            new BuiltinFunctions.CreateArray(),
            new BuiltinFunctions.DataUri(),
            new BuiltinFunctions.DataUriToBinary(),
            new BuiltinFunctions.DataUriToString(),
            new BuiltinFunctions.DateFunc(),
            new BuiltinFunctions.DateReadBack(),
            new BuiltinFunctions.DateTimeDiff(),
            new BuiltinFunctions.DayOfMonth(),
            new BuiltinFunctions.DayOfWeek(),
            new BuiltinFunctions.DayOfYear(),
            new BuiltinFunctions.Divide(),
            new BuiltinFunctions.Element(),
            new BuiltinFunctions.Empty(),
            new BuiltinFunctions.EndsWith(),
            new BuiltinFunctions.EOL(),
            new BuiltinFunctions.Equal(),
            new BuiltinFunctions.Exists(),
            new BuiltinFunctions.Flatten(),
            new BuiltinFunctions.First(),
            new BuiltinFunctions.Float(),
            new BuiltinFunctions.Floor(),
            new BuiltinFunctions.Foreach(),
            new BuiltinFunctions.FormatDateTime(),
            new BuiltinFunctions.FormatEpoch(),
            new BuiltinFunctions.FormatNumber(),
            new BuiltinFunctions.FormatTicks(),
            new BuiltinFunctions.GetFutureTime(),
            new BuiltinFunctions.GetNextViableDate(),
            new BuiltinFunctions.GetNextViableTime(),
            new BuiltinFunctions.GetPastTime(),
            new BuiltinFunctions.GetPreviousViableDate(),
            new BuiltinFunctions.GetPreviousViableTime(),
            new BuiltinFunctions.GetPastTime(),
            new BuiltinFunctions.GetProperty(),
            new BuiltinFunctions.GetTimeOfDay(),
            new BuiltinFunctions.GreaterThan(),
            new BuiltinFunctions.GreaterThanOrEqual(),
            new BuiltinFunctions.If(),
            new BuiltinFunctions.Ignore(),
            new BuiltinFunctions.IndexOf(),
            new BuiltinFunctions.IndicesAndValues(),
            new BuiltinFunctions.Int(),
            new BuiltinFunctions.Intersection(),
            new BuiltinFunctions.IsArray(),
            new BuiltinFunctions.IsBoolean(),
            new BuiltinFunctions.IsDate(),
            new BuiltinFunctions.IsDateRange(),
            new BuiltinFunctions.IsDateTime(),
            new BuiltinFunctions.IsDefinite(),
            new BuiltinFunctions.IsDuration(),
            new BuiltinFunctions.IsFloat(),
            new BuiltinFunctions.IsInteger(),
            new BuiltinFunctions.IsMatch(),
            new BuiltinFunctions.IsObject(),
            new BuiltinFunctions.IsPresent(),
            new BuiltinFunctions.IsString(),
            new BuiltinFunctions.IsTime(),
            new BuiltinFunctions.IsTimeRange(),
            new BuiltinFunctions.Join(),
            new BuiltinFunctions.JPath(),
            new BuiltinFunctions.Json(),
            new BuiltinFunctions.JsonStringify(),
            new BuiltinFunctions.Last(),
            new BuiltinFunctions.LastIndexOf(),
            new BuiltinFunctions.Length(),
            new BuiltinFunctions.LessThan(),
            new BuiltinFunctions.LessThanOrEqual(),
            new BuiltinFunctions.Max(),
            new BuiltinFunctions.Merge(),
            new BuiltinFunctions.Min(),
            new BuiltinFunctions.Mod(),
            new BuiltinFunctions.Month(),
            new BuiltinFunctions.Multiply(),
            new BuiltinFunctions.NewGuid(),
            new BuiltinFunctions.Not(),
            new BuiltinFunctions.NotEqual(),
            new BuiltinFunctions.Optional(),
            new BuiltinFunctions.Or(),
            new BuiltinFunctions.Power(),
            new BuiltinFunctions.Rand(),
            new BuiltinFunctions.Range(),
            new BuiltinFunctions.RemoveProperty(),
            new BuiltinFunctions.Replace(),
            new BuiltinFunctions.ReplaceIgnoreCase(),
            new BuiltinFunctions.Reverse(),
            new BuiltinFunctions.Round(),
            new BuiltinFunctions.Select(),
            new BuiltinFunctions.SentenceCase(),
            new BuiltinFunctions.SetPathToValue(),
            new BuiltinFunctions.SetProperty(),
            new BuiltinFunctions.Skip(),
            new BuiltinFunctions.SortBy(),
            new BuiltinFunctions.SortByDescending(),
            new BuiltinFunctions.Split(),
            new BuiltinFunctions.Sqrt(),
            new BuiltinFunctions.StartOfDay(),
            new BuiltinFunctions.StartOfHour(),
            new BuiltinFunctions.StartOfMonth(),
            new BuiltinFunctions.StartsWith(),
            new BuiltinFunctions.String(),
            new BuiltinFunctions.StringOrValue(),
            new BuiltinFunctions.SubArray(),
            new BuiltinFunctions.Substring(),
            new BuiltinFunctions.Subtract(),
            new BuiltinFunctions.SubtractFromTime(),
            new BuiltinFunctions.Sum(),
            new BuiltinFunctions.Take(),
            new BuiltinFunctions.Ticks(),
            new BuiltinFunctions.TicksToDays(),
            new BuiltinFunctions.TicksToHours(),
            new BuiltinFunctions.TicksToMinutes(),
            new BuiltinFunctions.TimexResolve(),
            new BuiltinFunctions.TitleCase(),
            new BuiltinFunctions.ToLower(),
            new BuiltinFunctions.ToUpper(),
            new BuiltinFunctions.Trim(),
            new BuiltinFunctions.Union(),
            new BuiltinFunctions.Unique(),
            new BuiltinFunctions.UriComponent(),
            new BuiltinFunctions.UriComponentToString(),
            new BuiltinFunctions.UriHost(),
            new BuiltinFunctions.UriPath(),
            new BuiltinFunctions.UriPathAndQuery(),
            new BuiltinFunctions.UriPort(),
            new BuiltinFunctions.UriQuery(),
            new BuiltinFunctions.UriScheme(),
            new BuiltinFunctions.UtcNow(),
            new BuiltinFunctions.Where(),
            new BuiltinFunctions.XML(),
            new BuiltinFunctions.XPath(),
            new BuiltinFunctions.Year(),
        ];

        const lookup: Map<string, ExpressionEvaluator> = new Map<string, ExpressionEvaluator>();
        functions.forEach((func: ExpressionEvaluator): void => {
            lookup.set(func.type, func);
        });

        // Attach negations
        lookup.get(ExpressionType.LessThan).negation = lookup.get(ExpressionType.GreaterThanOrEqual);
        lookup.get(ExpressionType.LessThanOrEqual).negation = lookup.get(ExpressionType.GreaterThan);
        lookup.get(ExpressionType.Equal).negation = lookup.get(ExpressionType.NotEqual);

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
        lookup.set('??', lookup.get(ExpressionType.Coalesce));

        return lookup as ReadonlyMap<string, ExpressionEvaluator>;
    }
}
