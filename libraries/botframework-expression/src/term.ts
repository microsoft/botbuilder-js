import { OperatorEntry } from "./operatorEntry";
import { Token } from "./token";

export class Term {

    public static From(token: Token, entity: OperatorEntry, ...terms: Term[]): Term {
        return new Term(token, entity, terms);
    }

    public readonly Entity: OperatorEntry;
    public readonly Token: Token;
    public readonly Terms: Term[];

    private constructor(token: Token, entry: OperatorEntry, terms: Term[]) {
        this.Entity = entry;
        this.Token = token;
        this.Terms = terms;
    }

    public ToString(): string {
        return this.Terms.length > 0 ? `${this.Token}(${this.Terms.join(",")})` : this.Token.Input;
    }


}