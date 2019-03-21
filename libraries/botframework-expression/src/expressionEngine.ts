import { ANTLRInputStream, BailErrorStrategy, CommonTokenStream } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree';
import { ExpressionErrorListener } from './expressionErrorListener';
import { ExpressionEvaluator } from './expressionEvaluator';
import { GetMethodDelegate, MethodBinder } from './methodBinder';
import { GetValueDelegate, PropertyBinder } from './propertyBinder';
import { ExpressionLexer } from './resources/ExpressionLexer';
import { ExpressionParser } from './resources/ExpressionParser';

// tslint:disable-next-line: completed-docs
export abstract class ExpressionEngine {
    public static EvaluateWithString(expression: string,
                                     scope: any,
                                     getValue: GetValueDelegate|undefined,
                                     getMethod: GetMethodDelegate|undefined): any {
        const parser: ParseTree = ExpressionEngine.Parse(expression);

        return ExpressionEngine.Evaluate(parser, scope, getValue, getMethod);
    }

    public static Parse(expression: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionLexer = new ExpressionLexer(inputStream);
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionParser = new ExpressionParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ExpressionErrorListener.INSTANCE);
        parser.buildParseTree = true;
        parser.errorHandler = new BailErrorStrategy();

        return parser.expression();
    }

    public static Evaluate(parserTree: ParseTree,
                           scope: any,
                           getValue: GetValueDelegate|undefined,
                           getMethod: GetMethodDelegate|undefined): any {
        getValue = getValue === undefined ? PropertyBinder.Auto : getValue;
        getMethod = getMethod === undefined ? MethodBinder.All : getMethod;
        const evaluator: ExpressionEvaluator = new ExpressionEvaluator(getValue, getMethod);

        return evaluator.Evaluator(parserTree, scope);
    }
}
