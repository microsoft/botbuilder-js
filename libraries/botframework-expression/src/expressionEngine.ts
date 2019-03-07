import Enumerable, { LinqEnumerable } from "typescript-dotnet-umd/System.Linq/Linq";
import { BindingDirection } from './bindingDirection';
import { Identifier, Lexer } from './lexer';
import { GetMethodDelegate, MethodBinder } from './methodBinder';
import { EvaluationDelegate, OperatorEntry } from './operatorEntry';
import { OperatorTable } from './operatorTable';
import { GetValueDelegate, PropertyBinder } from './propertyBinder';
import { Term } from './term';
import { Token } from './token';

export abstract class ExpressionEngine {
    public static EvaluateWithString(expression: string,
                                     scope: any,
                                     getValue: GetValueDelegate|undefined,
                                     getMethod: GetMethodDelegate|undefined): any {
        const term: Term = ExpressionEngine.Parse(expression);

        return ExpressionEngine.Evaluate(term, scope, getValue, getMethod);
    }

    public static Parse(expression: string): Term {
        const tokens: IterableIterator<Token> = Lexer.Tokens(expression);
        Lexer.Next(tokens);

        return ExpressionEngine.Expression(tokens, 0);
    }

    public static Evaluate(term: Term,
                           scope: any,
                           getValue: GetValueDelegate|undefined,
                           getMethod: GetMethodDelegate|undefined): any {
        getValue = getValue === undefined ? PropertyBinder.Auto : getValue;
        getMethod = getMethod === undefined ? MethodBinder.All : getMethod;

        const token: Token = term.Token;
        const value: any = token.Value;

        let identifier: Identifier;
        if (value instanceof Identifier) {
            identifier =  value;
        }
        if (identifier !== undefined) {
            return getValue(scope, identifier.Name);
        }

        if (value !== undefined) {
            return value;
        }

        switch (token.Input) {
            case '.': {
                const instance: any = ExpressionEngine.Evaluate(term.Terms[0], scope, getValue, getMethod);

                return getValue(instance, term.Terms[1].Token.Input);
            }

            case '[': {
                const instance: any = ExpressionEngine.Evaluate(term.Terms[0], scope, getValue, getMethod);
                const index: any = ExpressionEngine.Evaluate(term.Terms[1], scope, getValue, getMethod);

                return getValue(instance, index);
            }

            case '(': {
                const name: string = term.Terms[0].Token.Input;

                if (name === '.') {
                    const method: EvaluationDelegate = getMethod(term.Terms[0].Terms[1].Token.Input);
                    const instance: any = ExpressionEngine.Evaluate(term.Terms[0].Terms[0], scope, getValue, getMethod);
                    const parameters: any[] = term.Terms.slice(1)
                                        .map((u: Term) => {
                                            return ExpressionEngine.Evaluate(u, scope, getValue, getMethod);
                                        });
                    parameters.unshift(instance);

                    return method(parameters);
                } else {
                    const method: EvaluationDelegate = getMethod(name);
                    const parameters: any[] = term.Terms.slice(1)
                                        .map((u: Term) => {
                                            return ExpressionEngine.Evaluate(u, scope, getValue, getMethod);
                                        });

                    return method(parameters);
                }
            }
// tslint:disable-next-line: no-empty
            default: {}
        }
        const entry: OperatorEntry = term.Entity;
        if (entry !== undefined) {
            const eager: EvaluationDelegate = entry.Evaluate;
            if (eager !== undefined) {
                const terms: any[] = Enumerable(term.Terms)
                        .select((t: Term) => {
                            return ExpressionEngine.Evaluate(t, scope, getValue, getMethod);
                        })
                        .toArray();
                if (terms.length < entry.MinArgs || terms.length > entry.MaxArgs) {
                    throw new Error();
                }

                return eager(terms);
            }
        }

        throw new Error();
    }

    private static LeftBindingPower(token: Token): number {
        let entry: OperatorEntry;
        const success: boolean = OperatorTable.InfixByToken.tryGetValue(token.Input, (u: OperatorEntry) => (entry = u));

        return success ? entry.Power : 0;
    }

    private static Prefix(tokens: IterableIterator<Token>): Term {
        const token: Token = Lexer.Current;
        Lexer.Next(tokens);

        let prefix: OperatorEntry;
        if (OperatorTable.PrefixByToken.tryGetValue(token.Input, (u: OperatorEntry) => prefix = u)) {
            return Term.From(token, prefix, ExpressionEngine.Expression(tokens, prefix.Power));
        }

        switch (token.Input) {
            case '(': {
                const term: Term = ExpressionEngine.Expression(tokens, 0);
                Lexer.Match(tokens, ')');

                return term;
            }
            default:
                return Term.From(token, undefined);
        }

    }

    private static Infix(tokens: IterableIterator<Token>, left: Term): Term {
        const token: Token = Lexer.Current;
        Lexer.Next(tokens);
        let infix: OperatorEntry;
        if (OperatorTable.InfixByToken.tryGetValue(token.Input, (u) => infix = u)) {
            switch (token.Input) {
                case '(': {
                    const terms: Term[] = [left];
                    if (Lexer.Current.Input !== ')') {
// tslint:disable-next-line: no-constant-condition
                        while (true) {
                            const term: Term = ExpressionEngine.Expression(tokens, 0);
                            terms.push(term);
                            if (Lexer.Current.Input !== ',') {
                                break;
                            }
                            Lexer.Match(tokens, ',');
                        }
                    }

                    Lexer.Match(tokens, ')');

                    return Term.From(token, infix, ...terms);
                }
                case '[': {
                    const terms: Term[] = [left, ExpressionEngine.Expression(tokens, 0)];
                    Lexer.Match(tokens, ']');

                    return Term.From(token, infix, ...terms);
                }
                default: {
                    const power: number = infix.Power - (infix.Direction === BindingDirection.Right ? 1 : 0);

                    return Term.From(token, infix, left, ExpressionEngine.Expression(tokens, power));
                }
            }
        }
        throw new Error();
    }

    private static Expression(tokens: IterableIterator<Token>, rightBindingPower: number): Term {
        let left: Term = ExpressionEngine.Prefix(tokens);
        while (Lexer.Current !== undefined && rightBindingPower < ExpressionEngine.LeftBindingPower(Lexer.Current)) {
            left = ExpressionEngine.Infix(tokens, left);
        }

        return left;
    }

}
