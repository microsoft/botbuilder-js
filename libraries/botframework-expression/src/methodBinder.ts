import { BuildinFunctions } from './buildInFunctions';

export type EvaluationDelegate = (parameters?: any[]) => any;

export type GetMethodDelegate = (name: string) => EvaluationDelegate;

/**
 * Implementations of <see cref="GetMethodDelegate"/>.
 */
export abstract class MethodBinder {
    private static readonly FunctionMap: Map<string, EvaluationDelegate> = new Map([
        //Operators
        ['div', BuildinFunctions.Div],
        ['mul', BuildinFunctions.Mul],
        ['add', BuildinFunctions.Add],
        ['sub', BuildinFunctions.Sub],
        ['equals', BuildinFunctions.Equal],
        ['notEquals', BuildinFunctions.NotEqual],
        ['min', BuildinFunctions.Min],
        ['max', BuildinFunctions.Max],
        ['less', BuildinFunctions.LessThan],
        ['lessOrEquals', BuildinFunctions.LessThanOrEqual],
        ['greater', BuildinFunctions.GreaterThan],
        ['greaterOrEquals', BuildinFunctions.GreaterThanOrEqual],
        ['exp', BuildinFunctions.Pow],
        ['and', BuildinFunctions.And],
        ['exists', BuildinFunctions.Exist],
        ['if', BuildinFunctions.If],
        ['or', BuildinFunctions.Or],
        ['not', BuildinFunctions.Not],
        // String Functions
        ['length',BuildinFunctions.StrLength],
        ['concat',BuildinFunctions.Concat],
        ['replace',BuildinFunctions.Replace],
        ['replaceIgnoreCase',BuildinFunctions.ReplaceIgnoreCase],
        ['split',BuildinFunctions.Split],
        ['substring',BuildinFunctions.Substring],
        ['toLower',BuildinFunctions.ToLower],
        ['toUpper',BuildinFunctions.ToUpper],
        ['trim',BuildinFunctions.Trim],
        // Collection Functions
        ['contains',BuildinFunctions.Contains],
        ['empty',BuildinFunctions.Empty],
        ['first',BuildinFunctions.First],
        ['last',BuildinFunctions.Last],
        ['count',BuildinFunctions.Count],
        ['join',BuildinFunctions.Join],
        // Conversion Functions
        ['int',BuildinFunctions.Int],
        ['float',BuildinFunctions.Float],
        ['string',BuildinFunctions.String],
        ['bool',BuildinFunctions.Bool],
        ['createArray',BuildinFunctions.CreateArray],
        // Math Functions
        ['mod',BuildinFunctions.Mod],
        ['rand',BuildinFunctions.Rand],
        ['sum',BuildinFunctions.ArraySum],
        ['average',BuildinFunctions.ArrayAverage],
        // Date and time functions  
        ['addDays',BuildinFunctions.AddDays],
        ['addHours',BuildinFunctions.AddHours],
        ['addMinutes',BuildinFunctions.AddMinutes],
        ['addSeconds',BuildinFunctions.AddSeconds],
        ['dayOfMonth',BuildinFunctions.DayOfMonth],
        ['dayOfWeek',BuildinFunctions.DayOfWeek],
        ['dayOfYear',BuildinFunctions.DayOfYear],
        ['utcNow',BuildinFunctions.UtcNow],
        ['date',BuildinFunctions.Date],
        ['month',BuildinFunctions.Month],
        ['year',BuildinFunctions.Year],
        ['formatDateTime',BuildinFunctions.FormatDateTime],
        ['getTimeOfDay',BuildinFunctions.GetTimeOfDay],
        ['subtractFromTime',BuildinFunctions.SubtractFromTime],
        ['dateReadBack',BuildinFunctions.DateReadBack],
        //Object manipulation and construction functions 
        ['toJson', BuildinFunctions.Json],
        ['jsonAddProp', BuildinFunctions.AddProperty],
        ['jsonRemoveProp', BuildinFunctions.RemoveProperty],
        ['jsonSetProp', BuildinFunctions.SetProperty]
    ]);

    public static readonly All: GetMethodDelegate = (name: string) => {
        if (MethodBinder.FunctionMap.has(name)) {
            return MethodBinder.FunctionMap.get(name);
        }

        throw Error(`Operation ${name} is invalid.`);
    }
}
