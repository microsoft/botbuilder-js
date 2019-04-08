import { Expression } from './expression';

/**
 * Interface to parse a string into an Expression
 */
export interface IExpressionParser {
    
    /**
     * Parse a string into an Expression
     * @param expression Expression to parse.
     * @returns The resulting expression.
     */
    parse(expression: string): Expression;
}
