const { ExpressionEngine } =  require('../');
const assert = require('assert');

 const dataSource = [
    ['1 + 2',3],
    ['1.0 + 2.0',3.0],
    ['1 * 2 + 3',5],
    ['1 + 2 * 3',7],
    ['1 * (2 + 3)',5],
    ['(1 + 2) * 3',9],
    ['(one + two) * bag.three',9.0],
    ['(one + two) * bag.set.four',12.0],
    ["(hello + ' ' + world)","hello world"],
    ['items[2]',"two"],
    ['bag.list[bag.index - 2]',"blue"],
    ["bag.list[bag.index - 2] + 'more'","bluemore"],
    ['min(1.0, two) + max(one, 2.0)',3.0],
    
    ["add(1, 2)", 3],
    ["add(1.0, 2.0)", 3.0],
    ["add(mul(1, 2), 3)", 5],
    ["sub(2, 1)", 1],
    ["sub(2.0, 0.5)", 1.5],
    ["mul(2, 5)", 10],
    ["div(mul(2, 5), 2)", 5],
    ["div(5, 2)", 2.5],
    ["greater(5, 2)", true],
    ["greater(2, 2)", false],
    ["greaterOrEquals(one, one)", true],
    ["greaterOrEquals(one, two)", false],
    ["less(5, 2)", false],
    ["less(2, 2)", false],
    ["less(one, two)", true],
    ["lessOrEquals(one, one)", true],
    ["lessOrEquals(one, two)", true],

    ["2^2", 4],
    ["3^2^2", 81],
    ["exp(2,2)", 4],

    ["one > 0.5 && two < 2.5", true],
    ["one > 0.5 || two < 1.5", true],

    ['!one', false],
    ['!!one', true],
    ['!one || !!two', true],
    ['not(one)', false],
    ['not(not(one))', true],
    ['not(0)', true]
]

const scope = {
    one : 1.0,
    two : 2.0,
    hello : "hello",
    world : "world",
    bag :
    {
        three : 3.0,
        set : 
        {
            four : 4.0,
        },
        index : 3,
        list : [ "red", "blue" ]
    },
    items : ["zero", "one", "two" ]
}


describe('expression functional test', () => {
  it('should get right evaluate result', () => {
    for (const data of dataSource) {
        var parsed = ExpressionEngine.Parse(data[0].toString());
        var actual = ExpressionEngine.Evaluate(parsed, scope);
        assert(actual == data[1],`actual is: ${actual} for case ${data[0]}`);
    }
  });
});