import { ANTLRInputStream, CommonTokenStream } from 'antlr4ts';
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { BuiltInFunctions, Constant, EvaluatorLookup, Expression, ExpressionType, IExpressionParser } from 'botbuilder-expression';
import { ErrorListener } from './ErrorListener';
import { ExpressionLexer, ExpressionParser, ExpressionVisitor } from './generated';
import * as ep from './generated/ExpressionParser';
import { Util } from './util';

/**
 * Parser to turn strings into Expression
 */
export class ExpressionEngine implements IExpressionParser {
    private readonly _lookup: EvaluatorLookup;

    // tslint:disable-next-line: typedef
    private readonly ExpressionTransformer = class extends AbstractParseTreeVisitor<Expression> implements ExpressionVisitor<Expression> {
        private readonly _lookup: EvaluatorLookup = undefined;
        public constructor(lookup: EvaluatorLookup) {
            super();
            this._lookup = lookup;
        }

        public Transform(context: ParseTree): Expression {
            return this.visit(context);
        }

        public visitUnaryOpExp(context: ep.UnaryOpExpContext): Expression {
            const unaryOperationName: string = context.getChild(0).text;
            const operand: Expression = this.visit(context.expression());

            return this.MakeExpression(unaryOperationName, operand);
        }

        public visitBinaryOpExp(context: ep.BinaryOpExpContext): Expression {
            const binaryOperationName: string = context.getChild(1).text;
            const left: Expression = this.visit(context.expression(0));
            const right: Expression = this.visit(context.expression(1));

            return this.MakeExpression(binaryOperationName, left, right);
        }

        public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): Expression {
            const parameters: Expression[] = this.ProcessArgsList(context.argsList());

            // if context.primaryExpression() is idAtom --> normal function
            if (context.primaryExpression() instanceof ep.IdAtomContext) {
                const idAtom: ep.IdAtomContext = <ep.IdAtomContext>(context.primaryExpression());
                const functionName: string = idAtom.text;

                return this.MakeExpression(functionName, ...parameters);
            }

            //if context.primaryExpression() is memberaccessExp --> lamda function
            if (context.primaryExpression() instanceof ep.MemberAccessExpContext) {
                const memberAccessExp: ep.MemberAccessExpContext = <ep.MemberAccessExpContext>(context.primaryExpression());
                const instance: Expression = this.visit(memberAccessExp.primaryExpression());
                const functionName: string = memberAccessExp.IDENTIFIER().text;
                parameters.splice(0, 0, instance);

                return this.MakeExpression(functionName, ...parameters);
            }

            throw Error('This format is wrong.');
        }

        public visitIdAtom(context: ep.IdAtomContext): Expression {
            let result: Expression;
            const symbol: string = context.text;

            if (symbol === 'false') {
                result = new Constant(false);
            } else if (symbol === 'true') {
                result = new Constant(true);
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

            return this.MakeExpression(ExpressionType.Accessor, new Constant(context.IDENTIFIER().text), instance);
        }

        public visitNumericAtom(context: ep.NumericAtomContext): Expression {
            const numberValue: number = parseFloat(context.text);
            if (!Number.isNaN(numberValue)) {
                return new Constant(numberValue);
            }

            throw Error(`${context.text} is not a number.`);
        }

        public visitParenthesisExp(context: ep.ParenthesisExpContext): Expression {
            return this.visit(context.expression());
        }

        public visitStringAtom(context: ep.StringAtomContext): Expression {
            return new Constant(unescape(Util.Trim(context.text, '\'')));
        }

        protected defaultResult(): Expression {
            return new Constant('');
        }
        private MakeExpression(type: string, ...children: Expression[]): Expression {
            return Expression.MakeExpression(type, this._lookup(type), ...children);
        }

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

    public Parse(expression: string): Expression {
        return new this.ExpressionTransformer(this._lookup).Transform(this.AntlrParse(expression));
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
