import { ExpressionEngine } from "./parser/expressionEngine";

const scope = {
    one: 1.0,
    two: 2.0,
    nullObj: undefined
};

var parsed = new ExpressionEngine().parse('one + two + nullObj');
var { value, error } = parsed.tryEvaluate(scope);
console.log(value);