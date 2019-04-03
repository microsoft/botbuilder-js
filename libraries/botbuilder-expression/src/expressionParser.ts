import {Expression} from './expression';
export interface IExpressionParser {
    Parse(expression: string) : Expression;
}
