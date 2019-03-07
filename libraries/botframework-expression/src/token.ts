export class Token {

    public static From(input: string, value: any): Token {
        return new Token(input, value);
    }
    public readonly Input: string;
    public readonly Value: any;

    private constructor(input: string, value: any) {
        this.Input = input;
        this.Value = value;
    }

    public ToString(): string {
        return this.Input;
    }
}
