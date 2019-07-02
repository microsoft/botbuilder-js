
/**
 * @module botbuilder-expression-parser
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { BuiltInFunctions, Constant, EvaluatorLookup, Expression, ExpressionType, IExpressionParser } from 'botbuilder-expression';
import { ErrorListener } from './errorListener';
import { ExpressionLexer, ExpressionParser, ExpressionVisitor } from './generated';
import * as ep from './generated/ExpressionParser';
import { Util } from './util';

/**
 * Parser to turn strings into Expression
 */
export class ExpressionEngine implements IExpressionParser {
    private static readonly ShorthandFunctionMap: Map<string, string> = new Map<string, string>([
        ['#', ExpressionType.Intent],
        ['@', ExpressionType.SimpleEntity],
        ['@@', ExpressionType.Entity],
        ['$', ExpressionType.Dialog],
        ['^', ExpressionType.Callstack],
        ['%', ExpressionType.Option],
        ['~', ExpressionType.Instance]
    ]);

    private readonly _lookup: EvaluatorLookup;

    // tslint:disable-next-line: typedef
    private readonly ExpressionTransformer = class extends AbstractParseTreeVisitor<Expression> implements ExpressionVisitor<Expression> {
        private readonly _lookup: EvaluatorLookup = undefined;
        public constructor(lookup: EvaluatorLookup) {
            super();
            this._lookup = lookup;
        }

        public Transform = (context: ParseTree): Expression => this.visit(context);

        public visitUnaryOpExp(context: ep.UnaryOpExpContext): Expression {
            const unaryOperationName: string = context.getChild(0).text;
            const operand: Expression = this.visit(context.expression());
            if (unaryOperationName === ExpressionType.Subtract || unaryOperationName === ExpressionType.Add) {
                return this.MakeExpression(unaryOperationName, new Constant(0), operand);
            }

            return this.MakeExpression(unaryOperationName, operand);
        }

        public visitBinaryOpExp(context: ep.BinaryOpExpContext): Expression {
            const binaryOperationName: string = context.getChild(1).text;
            const left: Expression = this.visit(context.expression(0));
            const right: Expression = this.visit(context.expression(1));

            return this.MakeExpression(binaryOperationName, left, right);
        }

        public visitShortHandExp(context: ep.ShortHandExpContext): Expression {
            const prefix: string = context.getChild(0).text;
            if (!ExpressionEngine.ShorthandFunctionMap.has(prefix)) {
                throw new Error(`${prefix} is not a shorthand`);
            }

            const functionName: string = ExpressionEngine.ShorthandFunctionMap.get(prefix);

            return this.MakeExpression(functionName, new Constant(context.IDENTIFIER().text));
        }

        public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): Expression {
            const parameters: Expression[] = this.ProcessArgsList(context.argsList());

            // Current only IdAtom is supported as function name
            if (context.primaryExpression() instanceof ep.IdAtomContext) {
                const idAtom: ep.IdAtomContext = <ep.IdAtomContext>(context.primaryExpression());
                const functionName: string = idAtom.text;

                return this.MakeExpression(functionName, ...parameters);
            }

            throw Error(`This format is wrong in expression ${context.text}.`);
        }

        public visitIdAtom(context: ep.IdAtomContext): Expression {
            let result: Expression;
            const symbol: string = context.text;

            if (symbol === 'false') {
                result = new Constant(false);
            } else if (symbol === 'true') {
                result = new Constant(true);
            } else if (symbol === 'null' || symbol === 'undefined') {
                result = new Constant(undefined);
            } else {
                result = this.MakeExpression(ExpressionType.Accessor, new Constant(symbol));
            }

            return result;
        }

        public visitIndexAccessExp(context: ep.IndexAccessExpContext): Expression {
            const instance: Expression = this.visit(context.primaryExpression());
            const index: Expression = this.visit(context.expression());

            return this.MakeExpression(ExpressionType.Element, instance, index);
        }

        public visitMemberAccessExp(context: ep.MemberAccessExpContext): Expression {
            const instance: Expression = this.visit(context.primaryExpression());
            const property: string = context.IDENTIFIER().text;

            return this.MakeExpression(ExpressionType.Accessor, new Constant(property), instance);
        }

        public visitNumericAtom(context: ep.NumericAtomContext): Expression {
            const numberValue: number = parseFloat(context.text);
            if (typeof numberValue === 'number' && !Number.isNaN(numberValue)) {
                return new Constant(numberValue);
            }

            throw Error(`${context.text} is not a number.`);
        }

        public visitParenthesisExp = (context: ep.ParenthesisExpContext): Expression => this.visit(context.expression());

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            const text: string = context.text;
            if (text.startsWith('\'')) {
                return new Constant(unescape(Util.Trim(context.text, '\'')));
            } else { // start with ""
                return new Constant(unescape(Util.Trim(context.text, '"')));
            }
        }

        protected defaultResult = (): Expression => new Constant('');

        private MakeExpression = (type: string, ...children: Expression[]): Expression =>
            Expression.MakeExpression(type, this._lookup(type), ...children);

        private ProcessArgsList(context: ep.ArgsListContext): Expression[] {
            const result: Expression[] = [];
            if (context !== undefined) {
                for (const expression of context.expression()) {
                    result.push(this.visit(expression));
                }
            }

            return result;
        }
    };

    public constructor(lookup?: EvaluatorLookup) {
        this._lookup = lookup === undefined ? BuiltInFunctions.Lookup : lookup;
    }

    public parse(expression: string): Expression {
        try {
            return new this.ExpressionTransformer(this._lookup).Transform(this.AntlrParse(expression));
        } catch (err) {
            throw new Error(`Parse failed for expression '${expression}', inner error: ${err}`);
        }
    }

    private AntlrParse(expression: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionLexer = new ExpressionLexer(inputStream);
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionParser = new ExpressionParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ErrorListener.Instance);
        parser.buildParseTree = true;

        return parser.expression();
    }
}
