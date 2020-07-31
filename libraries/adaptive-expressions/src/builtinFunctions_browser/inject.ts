import { EOL } from './eol';
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';

/**
 * Inject Browser-specific functions into the common builtin-function list.
 */
export const injectNodeFunctions = (function(): void {
    const functions: ExpressionEvaluator[] = [
        new EOL()
    ];

    functions.forEach((func: ExpressionEvaluator): void => {
        Expression.functions.add(func.type, func);
    });
})(); 