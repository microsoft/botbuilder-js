/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { Constant } from '../constant';
import { Expression } from '../expression';
import { EvaluatorLookup } from '../expressionEvaluator';
import { ExpressionParserInterface } from '../expressionParserInterface';
import { ExpressionType } from '../expressionType';
import { ExpressionAntlrLexer, ExpressionAntlrParser, ExpressionAntlrParserVisitor } from './generated';
import * as ep from './generated/ExpressionAntlrParser';
import { ParseErrorListener } from './parseErrorListener';

/**
 * Parser to turn strings into Expression
 */
export class ExpressionParser implements ExpressionParserInterface {
    /**
     * The delegate to lookup function information from the type.
     */
    public readonly EvaluatorLookup: EvaluatorLookup;

    private static expressionDict: Map<string, ParseTree> = new Map<string, ParseTree>();

    private readonly ExpressionTransformer = class
        extends AbstractParseTreeVisitor<Expression>
        implements ExpressionAntlrParserVisitor<Expression> {
        private readonly escapeRegex: RegExp = new RegExp(/\\[^\r\n]?/g);
        private readonly _lookupFunction: EvaluatorLookup = undefined;
        public constructor(lookup: EvaluatorLookup) {
            super();
            this._lookupFunction = lookup;
        }

        public transform = (context: ParseTree): Expression => this.visit(context);

        public visitUnaryOpExp(context: ep.UnaryOpExpContext): Expression {
            const unaryOperationName: string = context.getChild(0).text;
            const operand: Expression = this.visit(context.expression());
            if (unaryOperationName === ExpressionType.Subtract || unaryOperationName === ExpressionType.Add) {
                return this.makeExpression(unaryOperationName, new Constant(0), operand);
            }

            return this.makeExpression(unaryOperationName, operand);
        }

        public visitBinaryOpExp(context: ep.BinaryOpExpContext): Expression {
            const binaryOperationName: string = context.getChild(1).text;
            const left: Expression = this.visit(context.expression(0));
            const right: Expression = this.visit(context.expression(1));

            return this.makeExpression(binaryOperationName, left, right);
        }

        public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): Expression {
            const parameters: Expression[] = this.processArgsList(context.argsList());

            // Remove the check to check primaryExpression is just an IDENTIFIER to support "." in template name
            let functionName: string = context.primaryExpression().text;

            if (context.NON() !== undefined) {
                functionName += context.NON().text;
            }

            return this.makeExpression(functionName, ...parameters);
        }

        public visitIdAtom(context: ep.IdAtomContext): Expression {
            let result: Expression;
            const symbol: string = context.text;

            if (symbol === 'false') {
                result = new Constant(false);
            } else if (symbol === 'true') {
                result = new Constant(true);
            } else if (symbol === 'null') {
                result = new Constant(null);
            } else if (symbol === 'undefined') {
                result = new Constant(undefined);
            } else {
                result = this.makeExpression(ExpressionType.Accessor, new Constant(symbol));
            }

            return result;
        }

        public visitIndexAccessExp(context: ep.IndexAccessExpContext): Expression {
            let instance: Expression;
            const property: Expression = this.visit(context.expression());

            instance = this.visit(context.primaryExpression());

            return this.makeExpression(ExpressionType.Element, instance, property);
        }

        public visitMemberAccessExp(context: ep.MemberAccessExpContext): Expression {
            const property: string = context.IDENTIFIER().text;
            const instance: Expression = this.visit(context.primaryExpression());

            return this.makeExpression(ExpressionType.Accessor, new Constant(property), instance);
        }

        public visitNumericAtom(context: ep.NumericAtomContext): Expression {
            const numberValue: number = parseFloat(context.text);
            if (typeof numberValue === 'number' && !Number.isNaN(numberValue)) {
                return new Constant(numberValue);
            }

            throw new Error(`${context.text} is not a number.`);
        }

        public visitParenthesisExp = (context: ep.ParenthesisExpContext): Expression =>
            this.visit(context.expression());

        public visitArrayCreationExp(context: ep.ArrayCreationExpContext): Expression {
            const parameters: Expression[] = this.processArgsList(context.argsList());
            return this.makeExpression(ExpressionType.CreateArray, ...parameters);
        }

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            let text: string = context.text;
            if (text.startsWith("'") && text.endsWith("'")) {
                text = text.substr(1, text.length - 2).replace(/\\'/g, "'");
            } else if (text.startsWith('"') && text.endsWith('"')) {
                // start with ""
                text = text.substr(1, text.length - 2).replace(/\\"/g, '"');
            } else {
                throw new Error(`Invalid string ${text}`);
            }

            return new Constant(this.evalEscape(text));
        }

        public visitJsonCreationExp(context: ep.JsonCreationExpContext): Expression {
            let expr: Expression = this.makeExpression(ExpressionType.Json, new Constant('{}'));
            if (context.keyValuePairList()) {
                for (const kvPair of context.keyValuePairList().keyValuePair()) {
                    let key = '';
                    const keyNode = kvPair.key().children[0];
                    if (keyNode instanceof TerminalNode) {
                        if (keyNode.symbol.type === ep.ExpressionAntlrParser.IDENTIFIER) {
                            key = keyNode.text;
                        } else {
                            key = keyNode.text.substring(1, keyNode.text.length - 1);
                        }
                    }

                    expr = this.makeExpression(
                        ExpressionType.SetProperty,
                        expr,
                        new Constant(key),
                        this.visit(kvPair.expression())
                    );
                }
            }

            return expr;
        }

        public visitStringInterpolationAtom(context: ep.StringInterpolationAtomContext): Expression {
            const children: Expression[] = [new Constant('')];

            for (const node of context.stringInterpolation().children) {
                if (node instanceof TerminalNode) {
                    switch ((node as TerminalNode).symbol.type) {
                        case ep.ExpressionAntlrParser.TEMPLATE:
                            const expressionString = this.trimExpression(node.text);
                            children.push(Expression.parse(expressionString, this._lookupFunction));
                            break;
                        case ep.ExpressionAntlrParser.ESCAPE_CHARACTER:
                            children.push(
                                new Constant(this.evalEscape(node.text).replace(/\\`/g, '`').replace(/\\\$/g, '$'))
                            );
                            break;
                        default:
                            break;
                    }
                } else {
                    const text = this.evalEscape(node.text);
                    children.push(new Constant(text));
                }
            }

            return this.makeExpression(ExpressionType.Concat, ...children);
        }
        protected defaultResult = (): Expression => new Constant('');

        private readonly makeExpression = (functionType: string, ...children: Expression[]): Expression => {
            if (!this._lookupFunction(functionType)) {
                throw new Error(
                    `${functionType} does not have an evaluator, it's not a built-in function or a custom function.`
                );
            }

            return Expression.makeExpression(functionType, this._lookupFunction(functionType), ...children);
        };

        private processArgsList(context: ep.ArgsListContext): Expression[] {
            const result: Expression[] = [];
            if (!context) {
                return result;
            }

            for (const child of context.children) {
                if (child instanceof ep.LambdaContext) {
                    const evalParam = this.makeExpression(
                        ExpressionType.Accessor,
                        new Constant(child.IDENTIFIER().text)
                    );
                    const evalFun = this.visit(child.expression());
                    result.push(evalParam);
                    result.push(evalFun);
                } else if (child instanceof ep.ExpressionContext) {
                    result.push(this.visit(child));
                }
            }

            return result;
        }

        private trimExpression(expression: string): string {
            let result = expression.trim();
            if (result.startsWith('$')) {
                result = result.substr(1);
            }

            result = result.trim();

            if (result.startsWith('{') && result.endsWith('}')) {
                result = result.substr(1, result.length - 2);
            }

            return result.trim();
        }

        private evalEscape(text: string): string {
            const validCharactersDict: any = {
                '\\r': '\r',
                '\\n': '\n',
                '\\t': '\t',
                '\\\\': '\\',
            };

            return text.replace(this.escapeRegex, (sub: string): string => {
                if (sub in validCharactersDict) {
                    return validCharactersDict[sub];
                } else {
                    return sub;
                }
            });
        }
    };

    /**
     * Initializes a new instance of the `ExpressionParser` class.
     * @param lookup Delegate to lookup evaluation information from type string.
     */
    public constructor(lookup?: EvaluatorLookup) {
        this.EvaluatorLookup = lookup || Expression.lookup;
    }

    /**
     * @protected
     * Parse the expression to ANTLR lexer and parser.
     * @param expression The input string expression.
     * @returns A ParseTree.
     */
    protected static antlrParse(expression: string): ParseTree {
        if (ExpressionParser.expressionDict.has(expression)) {
            return ExpressionParser.expressionDict.get(expression);
        }

        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionAntlrLexer = new ExpressionAntlrLexer(inputStream);
        lexer.removeErrorListeners();
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionAntlrParser = new ExpressionAntlrParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ParseErrorListener.Instance);
        parser.buildParseTree = true;

        let expressionContext: ParseTree;
        const file: ep.FileContext = parser.file();
        if (file !== undefined) {
            expressionContext = file.expression();
        }
        ExpressionParser.expressionDict.set(expression, expressionContext);

        return expressionContext;
    }

    /**
     * Parse the input into an expression.
     * @param expression Expression to parse.
     * @returns Expression tree.
     */
    public parse(expression: string): Expression {
        if (expression === undefined || expression === null || expression === '') {
            return new Constant('');
        } else {
            return new this.ExpressionTransformer(this.EvaluatorLookup).transform(
                ExpressionParser.antlrParse(expression)
            );
        }
    }
}
