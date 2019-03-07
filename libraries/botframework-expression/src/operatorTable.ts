import Enumerable from "typescript-dotnet-umd/System.Linq/Linq";
import IDictionary from "typescript-dotnet-umd/System/Collections/Dictionaries/IDictionary";
import { BindingDirection } from "./bindingDirection";
import { EvaluationDelegate, OperatorEntry } from "./operatorEntry";

export abstract class OperatorTable {

    public static All: OperatorEntry[] = [
        OperatorTable.Infix(",", 0, null),
        OperatorTable.Infix("]", 0, null),
        OperatorTable.Infix(")", 0, null),

        OperatorTable.InfixRight("or", 30,
            (operands) => (typeof operands[0] === "boolean" && typeof operands[1] === "boolean") ?
                (operands[0] || operands[1]) : console.log("new error"),
        ),
        OperatorTable.InfixRight("and", 40,
            (operands) => (typeof operands[0] === "boolean" && typeof operands[1] === "boolean") ?

                (operands[0] && operands[1]) : console.log("new error"),
        ),
        OperatorTable.Prefix("not", 50,
            (operands) => (typeof operands[0] === "boolean") ?
                (!operands[0]) : console.log("new error"),
        ),

        OperatorTable.Infix("<", 60, (operands) => operands[0] < operands[1]),
        OperatorTable.Infix("<=", 60, (operands) => operands[0] <= operands[1]),
        OperatorTable.Infix(">", 60, (operands) => operands[0] > operands[1]),
        OperatorTable.Infix(">=", 60, (operands) => operands[0] >= operands[1]),
        OperatorTable.Infix("<>", 60, (operands) => operands[0] !== operands[1]),
        OperatorTable.Infix("!=", 60, (operands) => operands[0] !== operands[1]),
        OperatorTable.Infix("==", 60, (operands) => operands[0] === operands[1]),

        OperatorTable.Infix("+", 110,
            (operands) => (typeof operands[0] === "number" && typeof operands[1] === "number") ?
                operands[0] + operands[1] : (typeof operands[0] === "string" && typeof operands[1] === "string") ?
                    operands[0] + operands[1] : console.log("new error"),
        ),

        OperatorTable.Infix("-", 110,
            (operands) => (typeof operands[0] === "number" && typeof operands[1] === "number") ?
                operands[0] - operands[1] : console.log("new error"),
        ),

        OperatorTable.Infix("*", 120,
            (operands) => (typeof operands[0] === "number" && typeof operands[1] === "number") ?
                operands[0] * operands[1] : console.log("new error"),
        ),

        OperatorTable.Infix("/", 120,
            (operands) => (typeof operands[0] === "number" && typeof operands[1] === "number") ?
                operands[0] / operands[1] : console.log("new error"),
        ),

        OperatorTable.Prefix("+", 130,
            (operands) => (typeof operands[0] === "number" ? operands[0] : console.log("new error")
            )),

        OperatorTable.Prefix("-", 130,
            (operands) => (typeof operands[0] === "number" ? - operands[0] : console.log("new error")
            )),

        OperatorTable.InfixRight("^", 140,
            (operands) => (typeof operands[0] === "number" && typeof operands[1] === "number") ?
                Math.pow(operands[0], operands[1]) : console.log("new error"),
        ),

        OperatorTable.Infix(".", 150, null),
        OperatorTable.Infix("[", 150, null),
        OperatorTable.Infix("(", 150, null),
    ];

    public static readonly PrefixByToken: IDictionary<string, OperatorEntry> =
    Enumerable(OperatorTable.All).where((e) => e.MinArgs === 1)
    .toDictionary<string, OperatorEntry>((u) => u.Token, (u) => u);

    public static readonly InfixByToken: IDictionary<string, OperatorEntry> =
    Enumerable(OperatorTable.All).where((e) => e.MinArgs > 1)
    .toDictionary<string, OperatorEntry>((u) => u.Token, (u) => u);
    public static Prefix(input: string, power: number, evaluator: EvaluationDelegate): OperatorEntry {
        return OperatorEntry.From(input, power, BindingDirection.Left, 1, 1, evaluator);
    }

    public static Infix(input: string, power: number, evaluator: EvaluationDelegate): OperatorEntry {
        return OperatorEntry.From(input, power, BindingDirection.Left, 2, 2, evaluator);
    }

    public static InfixFree(input: string, power: number, evaluator: EvaluationDelegate): OperatorEntry {
        return OperatorEntry.From(input, power, BindingDirection.Free, 2, Number.MAX_VALUE, evaluator);
    }

    public static InfixRight(input: string, power: number, evaluator: EvaluationDelegate): OperatorEntry {
        return OperatorEntry.From(input, power, BindingDirection.Right, 2, 2, evaluator);
    }
}
