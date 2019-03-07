import Enumerable from "typescript-dotnet-umd/System.Linq/Linq";
import { BindingDirection } from "./bindingDirection";
import { Identifier, Lexer } from "./lexer";
import { GetMethodDelegate, MethodBinder } from "./methodBinder";
import { OperatorEntry } from "./operatorEntry";
import { OperatorTable } from "./operatorTable";
import { GetValueDelegate, PropertyBinder } from "./propertyBinder";
import { Term } from "./term";
import { Token } from "./token";

export abstract class ExpressionEngine {
    public static EvaluateWithString(expression: string,
                                     scope: any,
                                     getValue: GetValueDelegate = null,
                                     getMethod: GetMethodDelegate = null): any {
        const term = ExpressionEngine.Parse(expression);
        return ExpressionEngine.Evaluate(term, scope, getValue, getMethod);
    }

    public static Parse(expression: string): Term {
        const tokens = Lexer.Tokens(expression);
        Lexer.Next(tokens);
        return ExpressionEngine.Expression(tokens, 0);
    }

    public static Evaluate(term: Term,
                           scope: any,
                           getValue: GetValueDelegate = null,
                           getMethod: GetMethodDelegate = null): any {
        getValue = getValue == null ? PropertyBinder.Auto : getValue;
        getMethod = getMethod == null ? MethodBinder.All : getMethod;

        const token = term.Token;
        const value = token.Value;

        let identifier: Identifier = null;
        if (value instanceof Identifier) {
            identifier =  value as Identifier;
        }
        if (identifier != null) {
            return getValue(scope, identifier.Name);
        }
        if (value != null) {
            return value;
        }

        switch (token.Input) {
            case ".": {
                const instance = ExpressionEngine.Evaluate(term.Terms[0], scope, getValue, getMethod);
                return getValue(instance, term.Terms[1].Token.Input);
            }

            case "[": {
                const instance = ExpressionEngine.Evaluate(term.Terms[0], scope, getValue, getMethod);
                const index = ExpressionEngine.Evaluate(term.Terms[1], scope, getValue, getMethod);
                return getValue(instance, index);
            }

            case "(": {
                const name = term.Terms[0].Token.Input;

                if (name === ".") {
                    const method = getMethod(term.Terms[0].Terms[1].Token.Input);
                    const instance = ExpressionEngine.Evaluate(term.Terms[0].Terms[0], scope, getValue, getMethod);
                    const parameters = term.Terms.slice(1)
                                        .map((u) => ExpressionEngine.Evaluate(u, scope, getValue, getMethod));
                    parameters.unshift(instance);
                    return method(parameters);
                } else {
                    const method = getMethod(name);
                    const parameters = term.Terms.slice(1)
                                        .map((u) => ExpressionEngine.Evaluate(u, scope, getValue, getMethod));
                    return method(parameters);
                }

            }
        }
        const entry = term.Entity;
        if (entry != null) {
            const eager = entry.Evaluate;
            if (eager != null) {
                const terms = Enumerable(term.Terms)
                        .select((t) => ExpressionEngine.Evaluate(t, scope, getValue, getMethod)).toArray();
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
        const success = OperatorTable.InfixByToken.tryGetValue(token.Input, (u) => (entry = u));
        return success ? entry.Power : 0;
    }

    private static Prefix(tokens: IterableIterator<Token>): Term {
        const token = Lexer.Current;
        Lexer.Next(tokens);

        let prefix: OperatorEntry;
        if (OperatorTable.PrefixByToken.tryGetValue(token.Input, (u) => prefix = u)) {
            return Term.From(token, prefix, ExpressionEngine.Expression(tokens, prefix.Power));
        }

        switch (token.Input) {
            case "(": {
                const term: Term = ExpressionEngine.Expression(tokens, 0);
                Lexer.Match(tokens, ")");
                return term;
            }
            default:
                return Term.From(token, null);
        }

    }

    private static Infix(tokens: IterableIterator<Token>, left: Term): Term {
        const token = Lexer.Current;
        Lexer.Next(tokens);
        let infix: OperatorEntry;
        if (OperatorTable.InfixByToken.tryGetValue(token.Input, (u) => infix = u)) {
            switch (token.Input) {
                case "(": {
                    const terms: Term[] = [left];
                    if (Lexer.Current.Input !== ")") {
                        while (true) {
                            const term: Term = ExpressionEngine.Expression(tokens, 0);
                            terms.push(term);
                            if (Lexer.Current.Input !== ",") {
                                break;
                            }
                            Lexer.Match(tokens, ",");
                        }
                    }

                    Lexer.Match(tokens, ")");
                    return Term.From(token, infix, ...terms);
                }
                case "[": {
                    const terms: Term[] = [left, ExpressionEngine.Expression(tokens, 0)];
                    Lexer.Match(tokens, "]");
                    return Term.From(token, infix, ...terms);
                }
                default: {
                    const power = infix.Power - (infix.Direction === BindingDirection.Right ? 1 : 0);
                    return Term.From(token, infix, left, ExpressionEngine.Expression(tokens, power));
                }
            }
        }
        throw new Error();
    }

    private static Expression(tokens: IterableIterator<Token>, rightBindingPower: number): Term {
        let left = ExpressionEngine.Prefix(tokens);
        while (Lexer.Current && rightBindingPower < ExpressionEngine.LeftBindingPower(Lexer.Current)) {
            left = ExpressionEngine.Infix(tokens, left);
        }

        return left;
    }

}
