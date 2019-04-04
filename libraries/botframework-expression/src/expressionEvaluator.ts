import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { Util } from './common/util';
import { EvaluationDelegate, GetMethodDelegate } from './methodBinder';
import { GetValueDelegate } from './propertyBinder';
import * as ep from './resources/ExpressionParser';
import { ExpressionVisitor } from './resources/ExpressionVisitor';

// tslint:disable-next-line: completed-docs
export class ExpressionEvaluator extends AbstractParseTreeVisitor<any> implements ExpressionVisitor<any> {
    public static readonly BinaryOperatorFunctions: Map<string, string> = new Map([
        ['^', 'exp'],
        ['/', 'div'],
        ['*', 'mul'],
        ['+', 'add'],
        ['-', 'sub'],
        ['==', 'equals'],
        ['!=', 'notEquals'],
        ['<', 'less'],
        ['<=', 'lessOrEquals'],
        ['>', 'greater'],
        ['>=', 'greaterOrEquals'],
        ['&&', 'and'],
        ['||', 'or']
    ]);

    public static readonly UnaryOperatorFunctions : Map<string, string> = new Map([
        ['!', 'not']
    ]);

    private readonly GetValue: GetValueDelegate;
    private readonly GetMethod: GetMethodDelegate;
    private Scope: any;

    constructor(getValue: GetValueDelegate, getMethod: GetMethodDelegate) {
        super();
        this.GetValue = getValue;
        this.GetMethod = getMethod;
    }

    public Evaluator(context: ParseTree, scope: any): any {
        this.Scope = scope;

        return this.visit(context);
    }

    public visitArgsList(context: ep.ArgsListContext): any {
        let parameters: any[] = [];
        for (const expression of context.expression()) {
            parameters.push(this.visit(expression));
        }

        return parameters;
    }

    public visitUnaryOpExp(context: ep.UnaryOpExpContext): any {
        const unaryOperationName : string = context.getChild(0).text;
        const methodName: string = ExpressionEvaluator.UnaryOperatorFunctions.get(unaryOperationName);
        const method: EvaluationDelegate = this.GetMethod(methodName);
        const value: any = this.visit(context.expression());

        return method([value]);
    }

    public visitBinaryOpExp(context: ep.BinaryOpExpContext): any {
        const binaryOperationName: string = context.getChild(1).text;
        const methodName: string = ExpressionEvaluator.BinaryOperatorFunctions.get(binaryOperationName);
        const method: EvaluationDelegate = this.GetMethod(methodName);

        const left: any = this.visit(context.expression(0));
        const right: any = this.visit(context.expression(1));
        const parameters: any[] =  [left, right];

        return method(parameters);
    }

    public visitFuncInvokeExp(context: ep.FuncInvokeExpContext): any {
        let parameters: any[] = [];
        if (context.argsList !== undefined) {
            parameters = this.visit(context.argsList()) as any[];
        }

        // if context.primaryExpression() is idAtom --> normal function
        if (context.primaryExpression() instanceof ep.IdAtomContext) {
            const idAtom: ep.IdAtomContext = <ep.IdAtomContext>(context.primaryExpression());
            const functionName: string = idAtom.text;
            const method: EvaluationDelegate = this.GetMethod(functionName);

            return method(parameters);
        }

        //if context.primaryExpression() is memberaccessExp --> lamda function
        if (context.primaryExpression() instanceof ep.MemberAccessExpContext) {
            const memberAccessExp: ep.MemberAccessExpContext = <ep.MemberAccessExpContext>(context.primaryExpression());
            const instance: any = this.visit(memberAccessExp.primaryExpression());
            const functionName: string = memberAccessExp.IDENTIFIER().text;
            parameters.splice(0, 0, instance);
            const method: EvaluationDelegate = this.GetMethod(functionName);

            return method(parameters);
        }

        throw Error('This format is wrong.');
    }

    public visitIdAtom(context: ep.IdAtomContext): any {
        return this.GetValue(this.Scope, context.text);
    }

    public visitIndexAccessExp(context: ep.IndexAccessExpContext): any {
        const instance: any = this.visit(context.primaryExpression());
        const property: any = this.visit(context.expression());

        return this.GetValue(instance, property);
    }

    public visitMemberAccessExp(context: ep.MemberAccessExpContext): any {
        const instance: any = this.visit(context.primaryExpression());

        return this.GetValue(instance, context.IDENTIFIER().text);
    }

    public visitNumericAtom(context: ep.NumericAtomContext): any {
        const numberValue: number = parseFloat(context.text);
        if (!isNaN(numberValue)) {
            return numberValue;
        }

        throw Error(`${context.text} is not a number.`);
    }

    public visitParenthesisExp(context: ep.ParenthesisExpContext): any {
        return this.visit(context.expression());
    }

    public visitStringAtom(context: ep.StringAtomContext): any {
        return Util.Trim(context.text, '\'');
    }

    protected defaultResult(): any {
        return '';
    }
}
