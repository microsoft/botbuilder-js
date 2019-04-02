import {Expression} from './expression';
export interface ExpressionParser{
    Parse(expression: string) : Expression;
}