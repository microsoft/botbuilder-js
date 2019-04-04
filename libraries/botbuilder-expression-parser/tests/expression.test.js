const { ExpressionEngine } =  require('../');
const assert = require('assert');

const dataSource = [
    ['1 + 2',3],
    ["add(1, 2)", 3],
    ["add(1.0, 2.0)", 3.0],
    ["mul(2, 5)", 10],
   
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
        const input = data[0].toString();
        var parsed = new ExpressionEngine().Parse(input);
        assert(parsed !== undefined);
        var {value, error} = parsed.TryEvaluate(scope);
        assert(error === undefined, `Has error ${error}`);

        const expected = data[1];
        assert(value == expected,`actual is: ${value} for case ${data[0]}`);
    }
  });
});