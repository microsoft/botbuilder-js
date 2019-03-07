import Enumerable from "typescript-dotnet-umd/System.Linq/Linq";
import { Util } from './common/util';
import { OperatorEntry } from './operatorEntry';
import { OperatorTable } from './operatorTable';
import { Token } from './token';

export class Identifier {
    public readonly Name: string;
    private constructor(name: string) {
        this.Name = name;
    }
    public static From(name: string): Identifier {
        return new Identifier(name);
    }

}

// tslint:disable-next-line: max-classes-per-file
export abstract class Lexer {

    public static readonly Patterns: string[] = ['[+-]?\\d+(?:\.\\d+)?', '\'[^\']*\'', '[a-z][a-z0-9]*']
        .concat(Enumerable(OperatorTable.All)
        .select((e: OperatorEntry) => e.Token)
        .distinct()
        .orderByDescending((e: string) => e.length)
        .select((e: string) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .toArray());

    public static readonly Matcher: RegExp = new RegExp(`^\\s*((${Lexer.Patterns.join(')|(')}))`, 'i');
    public static Current: Token;

    public static *Tokens(text: string): IterableIterator<Token> {
        while (text !== undefined && text !== undefined && text.length !== 0) {
            const groups: RegExpExecArray = Lexer.Matcher.exec(text);

            if (groups.length > 0) {
                const input: string = groups[1];
                if (groups[2] !== undefined) {
                    const num: number = +groups[2];
                    yield Token.From(input, num);
                } else if (groups[3] !== undefined) {
                    yield Token.From(input, Util.Trim(input, '\''));
                } else if (groups[4] !== undefined) {
                    yield Token.From(input, Identifier.From(input));
                } else {
                    yield Token.From(input, undefined);
                }
            }

            text = text.substr(groups[0].length);
        }
    }

    public static Next(tokens: IterableIterator<Token>): void {
        Lexer.Current = tokens.next().value;
    }

    public static Match(tokens: IterableIterator<Token>, token: string): void {
// tslint:disable-next-line: possible-timing-attack
        if (Lexer.Current.Input !== token) {
            throw new Error();
        }
        Lexer.Next(tokens);
    }

}
