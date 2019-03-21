import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import * as ep from 'botframework-expression';
import { Analyzer } from './analyzer';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: completed-docs
export class ExpressionAnalyzerVisitor extends AbstractParseTreeVisitor<string[]> implements ep.ExpressionVisitor<string[]> {
    private readonly evaluationContext: EvaluationContext;

    constructor(evaluationContext: EvaluationContext) {
        super();
        this.evaluationContext = evaluationContext;
    }

    public Analyzer(context: ParseTree): string[] {
        return this.visit(context);
    }

    public visitBinaryOpExp(context: ep.BinaryOpExpContext): string[] {
        let result: string[] = [];

        return result.concat(this.visit(context.expression(0)))
            .concat(this.visit(context.expression(1)));
    }

    public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): string[] {
        let result: string[] = [];
        const args = context.argsList();

        if (context.primaryExpression() instanceof ep.IdAtomContext) {
            const idAtom: ep.IdAtomContext = <ep.IdAtomContext>(context.primaryExpression());
            const functionName: string = idAtom.text;
            if (functionName === 'count') {
                result = result.concat(this.visit(args.expression(0)));
            } else if (functionName === 'join') {
                args.expression().forEach(expression => {
                    result = result.concat(this.visit(expression));
                });
            } else {
                if (functionName === 'foreach'
                    || functionName === 'map'
                    || functionName === 'mapjoin'
                    || functionName === 'humanize') {
                        result = result.concat(this.visit(args.expression(0)));
                        const analyzer: Analyzer = new Analyzer(this.evaluationContext);
                        result = result.concat(analyzer.AnalyzeTemplate(args.expression(1).text));
                        if (args.expression().length > 2) {
                            for (let i: number = 2; i < args.expression().length; i++) {
                                result = result.concat(this.visit(args.expression(i)));
                            }
                        }
                    }
            }
        }

        if (context.primaryExpression() instanceof ep.MemberAccessExpContext) {
            const memberAccessExp: ep.MemberAccessExpContext = <ep.MemberAccessExpContext>(context.primaryExpression());
            const primaryExpressionResult: string[] = this.visit(memberAccessExp.primaryExpression());
            result  = result.concat(primaryExpressionResult);

            const functionName: string = memberAccessExp.IDENTIFIER().text;

            if (functionName === 'foreach'
                || functionName === 'map'
                || functionName === 'mapjoin'
                || functionName === 'humanize') {
                const analyzer: Analyzer = new Analyzer(this.evaluationContext);
                result = result.concat(analyzer.AnalyzeTemplate(args.expression(0).text));
                if (args.expression().length > 1) {
                    for (let i: number = 1; i < args.expression().length; i++) {
                        result = result.concat(this.visit(args.expression(i)));
                    }
                }
            }
        }

        return result;
    }

    public visitIdAtom(context: ep.IdAtomContext): string[] {
        return [context.text];
    }

    public visitIndexAccessExp(context: ep.IndexAccessExpContext): string[] {
        let result: string[] = [];
        result = result.concat(this.visit(context.primaryExpression()))
            .concat(this.visit(context.expression()));

        return result;
    }

    public visitMemberAccessExp(context: ep.MemberAccessExpContext): string[] {
        return this.visit(context.primaryExpression());
    }

    public visitNumericAtom(context: ep.NumericAtomContext): string[] {
        return [];
    }

    public visitParenthesisExp(context: ep.ParenthesisExpContext): string[] {
        return this.visit(context.expression());
    }

    public visitStringAtom(context: ep.StringAtomContext): string[] {
        return [];
    }

    protected defaultResult(): string[] {
        return [];
    }
}
