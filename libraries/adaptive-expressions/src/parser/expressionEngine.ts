
/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { ExpressionFunctions } from '../expressionFunctions';
import { Constant } from '../constant';
import { Expression } from '../expression';
import { EvaluatorLookup } from '../expressionEvaluator';
import { ExpressionParserInterface } from '../expressionParser';
import { ExpressionType } from '../expressionType';
import { ExpressionLexer, ExpressionParser, ExpressionParserVisitor } from './generated';
import * as ep from './generated/ExpressionParser';
import { ParseErrorListener } from './parseErrorListener';
import { Util } from './util';

/**
 * Parser to turn strings into Expression
 */
export class ExpressionEngine implements ExpressionParserInterface {
    /**
     * The elegate to lookup function information from the type.
     */
    public readonly EvaluatorLookup: EvaluatorLookup;

    // tslint:disable-next-line: typedef
    private readonly ExpressionTransformer = class extends AbstractParseTreeVisitor<Expression> implements ExpressionParserVisitor<Expression> {

        private readonly _lookup: EvaluatorLookup = undefined;
        public constructor(lookup: EvaluatorLookup) {
            super();
            this._lookup = lookup;
        }

        public transform = (context: ParseTree): Expression => this.visit(context);

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

        public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): Expression {
            const parameters: Expression[] = this.processArgsList(context.argsList());

            // Remove the check to check primaryExpression is just an IDENTIFIER to support "." in template name
            const functionName: string = context.primaryExpression().text;

            return this.MakeExpression(functionName, ...parameters);
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
            let instance: Expression;
            const property: Expression = this.visit(context.expression());

            instance = this.visit(context.primaryExpression());

            return this.MakeExpression(ExpressionType.Element, instance, property);
        }

        public visitMemberAccessExp(context: ep.MemberAccessExpContext): Expression {
            const property: string = context.IDENTIFIER().text;
            const instance: Expression = this.visit(context.primaryExpression());

            return this.MakeExpression(ExpressionType.Accessor, new Constant(property), instance);
        }

        public visitNumericAtom(context: ep.NumericAtomContext): Expression {
            const numberValue: number = parseFloat(context.text);
            if (typeof numberValue === 'number' && !Number.isNaN(numberValue)) {
                return new Constant(numberValue);
            }

            throw Error(`${ context.text } is not a number.`);
        }

        public visitParenthesisExp = (context: ep.ParenthesisExpContext): Expression => this.visit(context.expression());

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            const text: string = context.text;
            if (text.startsWith('\'')) {
                return new Constant(Util.unescape(Util.trim(context.text, '\'')));
            } else { // start with ""
                return new Constant(Util.unescape(Util.trim(context.text, '"')));
            }
        }

        public visitStringInterpolationAtom(context: ep.StringInterpolationAtomContext): Expression {
            let children: Expression[] = [];

            for (const node  of context.stringInterpolation().children) {
                if (node instanceof TerminalNode){
                    switch((node as TerminalNode).symbol.type) {
                        case ep.ExpressionParser.TEMPLATE:
                            const expressionString = this.trimExpression(node.text);
                            children.push(new ExpressionEngine(this._lookup).parse(expressionString));
                            break;
                        case ep.ExpressionParser.TEXT_CONTENT:
                            children.push(new Constant(node.text));
                            break;
                        case ep.ExpressionParser.ESCAPE_CHARACTER:
                            children.push(new Constant(Util.unescape(node.text)));
                            break;
                        default:
                            break;
                    }
                } else {
                    children.push(new Constant(node.text));
                }
                
            }

            return this.MakeExpression(ExpressionType.Concat, ...children);

        }

        public visitConstantAtom(context: ep.ConstantAtomContext): Expression {
            let text: string = context.text;
            if (text.startsWith('[') && text.endsWith(']')) {
                text = text.substr(1, text.length - 2).trim();
                if (text === '') {
                    return new Constant([]);
                }
            }

            if (text.startsWith('{') && text.endsWith('}')) {
                text = text.substr(1, text.length - 2).trim();
                if (text === '') {
                    return new Constant({});
                }
            }

            throw new Error(`Unrecognized constant: ${ text }`);
        }

        protected defaultResult = (): Expression => new Constant('');

        private readonly MakeExpression = (type: string, ...children: Expression[]): Expression =>
            Expression.makeExpression(type, this._lookup(type), ...children)

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
        this.EvaluatorLookup = lookup === undefined ? ExpressionFunctions.lookup : lookup;
    }

    protected static antlrParse(expression: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(expression);
        const lexer: ExpressionLexer = new ExpressionLexer(inputStream);
        lexer.removeErrorListeners();
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: ExpressionParser = new ExpressionParser(tokenStream);
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
            return new this.ExpressionTransformer(this.EvaluatorLookup).transform(ExpressionEngine.antlrParse(expression));
        }
    }
}
