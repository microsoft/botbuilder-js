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
import {  ExpressionAntlrLexer, ExpressionAntlrParser, ExpressionAntlrParserVisitor } from './generated';
import * as ep from './generated/ExpressionAntlrParser';
import { ParseErrorListener } from './parseErrorListener';
import { Util } from './util';

enum State {
    None,
    EscapeSquence,
    Dollor,
    Template
}

/**
 * Parser to turn strings into Expression
 */
export class ExpressionParser implements ExpressionParserInterface {
    /**
     * The delegate to lookup function information from the type.
     */
    public readonly EvaluatorLookup: EvaluatorLookup;

    private readonly ExpressionTransformer = class extends AbstractParseTreeVisitor<Expression> implements ExpressionAntlrParserVisitor<Expression> {

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
            } else if (symbol === 'null' || symbol === 'undefined') {
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

            throw Error(`${ context.text } is not a number.`);
        }

        public visitParenthesisExp = (context: ep.ParenthesisExpContext): Expression => this.visit(context.expression());

        public visitArrayCreationExp(context: ep.ArrayCreationExpContext): Expression {
            const parameters: Expression[] = this.processArgsList(context.argsList());
            return this.makeExpression(ExpressionType.CreateArray, ...parameters);
        } 

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            const text: string = context.text;
            if (text.startsWith('\'')) {
                return new Constant(Util.unescape(Util.trim(context.text, '\'')));
            } else { // start with ""
                return new Constant(Util.unescape(Util.trim(context.text, '"')));
            }
        }

        public visitJsonCreationExp(context: ep.JsonCreationExpContext): Expression {
            let expr: Expression = new Constant({});
            if (context.keyValuePairList()) {
                for (const kvPair of context.keyValuePairList().keyValuePair()) {
                    let key = '';
                    const node = kvPair.key().children[0];
                    if (node instanceof TerminalNode) {
                        if (node.symbol.type === ep.ExpressionAntlrParser.IDENTIFIER) {
                            key = node.text;
                        } else {
                            key = node.text.substring(1, node.text.length - 1);
                        }
                    } 
                    
                    expr = this.makeExpression(ExpressionType.SetProperty, expr, new Constant(key), this.visit(kvPair.expression()));
                }
            }

            return expr;
        }

        public visitStringInterpolationAtom(context: ep.StringInterpolationAtomContext): Expression {
            let children: Expression[] = [];
            const interStr = context.text.substring(1, context.text.length - 1);
            let templateStr = '';
            let tokenBuffer = '';
            let fmtState: any = State.None;

            const changeState = (newState): void => { 
                switch(fmtState) 
                {
                    case (State.EscapeSquence):
                        children.push(new Constant(Util.unescape(tokenBuffer)));
                        tokenBuffer = ''; 
                        break;
                    case (State.Template):
                        children.push(Expression.parse(this.trimExpression(templateStr), this._lookupFunction));
                        templateStr = '';
                        break;
                } 

                fmtState = newState;
            };

            let curlyBracketLevel = 0;
            let singleQuoteLevel = 0;
            let doubleQuoteLevel = 0;

            for (const char of interStr) {
                if (fmtState === State.EscapeSquence) {
                    tokenBuffer += char;
                    changeState(State.None);
                }

                else if (fmtState === State.None && char === '\\') {
                    tokenBuffer += char;
                    changeState(State.EscapeSquence);
                }

                else if(char === '$' && fmtState === State.None) {
                    templateStr += char;
                    changeState(State.Dollor);
                }

                else if (char === '{' && fmtState === State.Dollor) {
                    curlyBracketLevel += 1;
                    templateStr += char;
                    changeState(State.Template);
                }

                else if(fmtState === State.Template) {
                    if (char === '\'') {
                        if (doubleQuoteLevel === 0) {
                            doubleQuoteLevel += 1;
                        } else {
                            doubleQuoteLevel -= 1;
                        }

                        templateStr += char;
                    } else if (char === '\"') {
                        if (singleQuoteLevel === 0) {
                            singleQuoteLevel += 1;
                        } else {
                            singleQuoteLevel -= 1;
                        }
                        
                        templateStr += char;
                    } else if (char === '{') {
                        if (singleQuoteLevel === 0 && doubleQuoteLevel === 0) {
                            curlyBracketLevel += 1;
                        }

                        templateStr += char;
                    } else if (char === '}') {
                        if (singleQuoteLevel === 0 && doubleQuoteLevel === 0) {
                            curlyBracketLevel -= 1;
                        }

                        templateStr += char;
                        if (curlyBracketLevel === 0) {
                            changeState(State.None);
                        }
                    } else {
                        templateStr += char;
                    }
                } else {
                    children.push(new Constant(char));
                }
            }
            

            const result =  this.makeExpression(ExpressionType.Concat, ...children);
            return result;

        }

        protected defaultResult = (): Expression => new Constant('');

        private readonly makeExpression = (functionType: string, ...children: Expression[]): Expression => {
            if (!this._lookupFunction(functionType)) {
                throw Error(`${ functionType } does not have an evaluator, it's not a built-in function or a custom function.`);
            }

            return Expression.makeExpression(functionType, this._lookupFunction(functionType), ...children);
        }
           

        private processArgsList(context: ep.ArgsListContext): Expression[] {
            const result: Expression[] = [];
            if (context !== undefined) {
                for (const expression of context.expression()) {
                    result.push(this.visit(expression));
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

        
    };

    public constructor(lookup?: EvaluatorLookup) {
        this.EvaluatorLookup = lookup || Expression.lookup;
    }

    protected static antlrParse(expression: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionAntlrLexer = new ExpressionAntlrLexer(inputStream);
        lexer.removeErrorListeners();
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionAntlrParser = new ExpressionAntlrParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ParseErrorListener.Instance);
        parser.buildParseTree = true;

        const file: ep.FileContext = parser.file();
        if (file !== undefined) {
            return file.expression();
        }

        return undefined;
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
            return new this.ExpressionTransformer(this.EvaluatorLookup).transform(ExpressionParser.antlrParse(expression));
        }
    }
}
