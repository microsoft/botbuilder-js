import { OperatorEntry } from './operatorEntry';
import { Token } from './token';

/**
 * Expression term from grammar analysis.
 */
export class Term {

    public readonly Entity: OperatorEntry;
    public readonly Token: Token;
    public readonly Terms: Term[];

    private constructor(token: Token, entry: OperatorEntry, terms: Term[]) {
        this.Entity = entry;
        this.Token = token;
        this.Terms = terms;
    }

    public static From(token: Token, entity: OperatorEntry, ...terms: Term[]): Term {
        return new Term(token, entity, terms);
    }

    public ToString(): string {
        return this.Terms.length > 0 ? `${this.Token}(${this.Terms.join(',')})` : this.Token.Input;
    }

}
