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
    ['not(0)', true],
    //['5 % 2',1],
    ['!(one == 1.0)',false],
    ['!!(one == 1.0)',true],    
    ['(1 + 2)!=(4 - 1)',false],
    ["hello != 'hello'",false],
    ["hello != 'world'",true],
    ["(1 + 2) >= (4 - 1)", true],
    ["(2 + 2) >= (4 - 1)", true],
    //["float(5.5) >= float(4 - 1)", true],
    ["(1 + 2) <= (4 - 1)", true],
    ["(2 + 2) <= (4 - 1)", false],
    //["float(5.5) <= float(4 - 1)", false],


    // String Function 
    ["concat(hello,world)","helloworld"],
    ["concat('hello','world')","helloworld"],
    ["length('hello')",5],
    ["length(concat(hello,world))",10], 
    ["replace('hello','l','k')","hekko"],
    ["replace('hello','L','k')","hello"],
    ["replaceIgnoreCase('hello','L','k')","hekko"],
    //["split('hello','e')", ['h','llo']],   //Need to redo the array result generation
    ["substring('hello',0,5)","hello"],
    ["substring('hello',0,3)","hel"],
    ["toLower('UpCase')","upcase"],
    ["toUpper('lowercase')","LOWERCASE"],
    //["toLower(toUpper('lowercase')","lowercase"],  //Assume there can't be a nested
    ["trim('hello')","hello"],
    ["trim('hello')","hello"],
    ["trim('hello')","hello"],
    
    // logical comparison functions test
    ["and(!trueCase, trueCase)", false],//false && true            //TICKET：True and false can't be passed in string to be counted as boolean, need to use scope to pass in
    ["and(falseCase, trueCase)", false],//false && true
    ["and(trueCase, trueCase)", true],//true && true
    ["and(hello != 'world', bool('true'))", true],//true && true
    ["and(hello == 'world', bool('true'))", false],//false && true
    ["equals(hello, 'hello')", true],
    ["equals(bag.index, 3)", true],
    ["equals(bag.index, 2)", false],
    ["equals(hello == 'world', bool('true'))", false],//false, true
    ["equals(hello == 'world', bool(0))", true],//false, false
    ["greater(one , 0.5) && less(two , 2.5)", true],// true && true
    ["if(!exists(one), 'r1', 'r2')", "r2"],//false
    ["if(!!exists(one), 'r1', 'r2')", "r1"],//true     //Good until there
    ["greater(one , 0.5) || less(two , 1.5)", true],//true || false
    ["greater(5, 2)", true],
    ["greater(2, 2)", false],
    ["or(!exists(one), !!exists(one))", true],//false && true
    ["or(!exists(one), !exists(one))", false],//false && false
    ["greater(one, two)", false],
    ["greaterOrEquals((1 + 2) , (4 - 1))", true],
    ["greaterOrEquals((2 + 2) , (4 - 1))", true],
    ["greaterOrEquals(5.5 , float(4 - 1))", true],
    ["greaterOrEquals(one, one)", true],
    ["greaterOrEquals(one, two)", false],
    ["less(5, 2)", false],
    ["less(2, 2)", false],
    ["less(one, two)", true],
    ["lessOrEquals(one, one)", true],
    ["lessOrEquals(one, two)", true],
    ["lessOrEquals((1 + 2) , (4 - 1))", true],
    ["lessOrEquals((2 + 2) , (4 - 1))", false],
    ["lessOrEquals(float(5.5) , float(4 - 1))", false],
    ["if(bool(0), 'r1', 'r2')", "r2"],//false
    ["if(bool('true'), 'r1', 'r2')", "r1"],//true*/   
        
    // math functions test
    ["add(1, 2)", 3],
    ["add(1.0, 2.0)", 3.0],
    ["add(mul(1, 2), 3)", 5],
    ["max(mul(1, 2), 5) ", 5],
    ["max(4, 5) ", 5],
    ["min(mul(1, 2), 5) ", 2],
    ["min(4, 5) ", 4],
    ["sum(numbers)", 3],      //TICKET： Can pass the test when parameter is an array of numbers. Should we change the test from (1,2,3) to ([1,2,3])?
    ["sum(createArray(one, two, 3))", 6.0],
    ["average(numbers)", 1.5],   // Same as sum
    ["average(createArray(one, two, 3))", 2.0],
    ["sub(2, 1)", 1],
    ["sub(2.0, 0.5)", 1.5],
    ["mul(2, 5)", 10],
    ["div(mul(2, 5), 2)", 5],
    ["div(5, 2)", 2],
    ["exp(2,2)", 4.0],
    ["mod(5,2)", 1],
    ["rand(1, 2)", 1],
    ["rand(2, 3)", 2],

    //Date and time function test
    //init dateTime: 2018-03-15T13:00:00Z            //TICKET: Do we really need Z as default? Are we care more about local or Zulu/utc time. Also 0000000Z is it necessary
    ["addDays(timestamp, 1)", "2018-03-16T13:00:00Z"],
    ["addDays(timestamp, 1,'MM-DD-YY')", "03-16-18"],
    ["addHours(timestamp, 1)", "2018-03-15T14:00:00Z"],
    ["addHours(timestamp, 1,'MM-DD-YY hh-mm')", "03-15-18 02-00"],    //TICKET: 'MM-dd-yy hh-mm'  Moment can not handle lowercase format but upper only
    ["addMinutes(timestamp, 1)", "2018-03-15T13:01:00Z"],
    ["addMinutes(timestamp, 1, 'MM-DD-YY hh-mm')", "03-15-18 01-01"],
    ["addSeconds(timestamp, 1)", "2018-03-15T13:00:01Z"],
    ["addSeconds(timestamp, 1, 'MM-DD-YY hh-mm-ss')", "03-15-18 01-00-01"],
    ["dayOfMonth(timestamp)", 15],
    ["dayOfWeek(timestamp)", 4],//Thursday
    ["dayOfYear(timestamp)", 74],
    ["month(timestamp)", 3],
    ["date(timestamp)", "3/15/2018"],//Dfefault. TODO
    ["year(timestamp)", 2018],
    ["formatDateTime(timestamp)", "2018-03-15T13:00:00Z"],
    ["formatDateTime(timestamp, 'MM-DD-YY')", "03-15-18"],
    ["subtractFromTime(timestamp, 1, 'Day')", "2018-03-14T13:00:00Z"],
    ["subtractFromTime(timestamp, 1, 'Minute')", "2018-03-15T12:59:00Z"],
    ["subtractFromTime(timestamp, 1, 'Second')", "2018-03-15T12:59:59Z"],
    ["dateReadBack(timestamp, addDays(timestamp, 1))", "Tomorrow"],
    ["dateReadBack(addDays(timestamp, 1),timestamp))", "Yesterday"],
    ["getTimeOfDay('2018-03-15T00:00:00Z')", "midnight"],
    ["getTimeOfDay('2018-03-15T08:00:00Z')", "morning"],
    ["getTimeOfDay('2018-03-15T12:00:00Z')", "noon"],
    ["getTimeOfDay('2018-03-15T13:00:00Z')", "afternoon"],
    ["getTimeOfDay('2018-03-15T18:00:00Z')", "evening"],
    ["getTimeOfDay('2018-03-15T22:00:00Z')", "evening"],
    ["getTimeOfDay('2018-03-15T23:00:00Z')", "night"], 
    
    // conversion functions test
    ["float('10.333')", 10.333],
    ["float('10')", 10.0],
    ["int('10')", 10],
    ["string('str')", "str"],
    ["string(one)", "1"],      //TICKET: JS does not differ flote and int
    ["string(bool(1))", "true"],
  //["string(bag.set)", "{\"four\":4}"],  //TODO1: Need separate test function for objects
    ["bool(1)", true],
    ["bool(0)", false],
    ["bool('false')", false],
    ["bool('true')", true],
  //  ["createArray('h', 'e', 'l', 'l', 'o')", ["h", "e", "l", "l", "o" ]],
  //  ["createArray(1, bool('false'], string(bool(1)], float('10'))", [1, false, "true", 10.0 ]],


    // collection functions test
    ["contains('hello world', 'hello')", true],
    ["contains('hello world', 'hellow')", false],
    ["contains(items, 'zero')", true],
    ["contains(items, 'hi')", false],
    ["contains(bag, 'three')", true],
    ["contains(bag, 'xxx')", false],
    ["count(split(hello,'e'))",2],
    ["count(createArray('h', 'e', 'l', 'l', 'o'))",5],
    ["empty('')", true],
    ["empty('a')", false],
    ["empty(bag)", false],
    ["empty(items)", false],
    ["first(items)", "zero"],
    ["first('hello')", "h"],
    ["first(createArray(0, 1, 2))", 0],
    ["join(items,',')", "zero,one,two"],
    ["join(createArray('a', 'b', 'c'), '.')", "a.b.c"],
    ["last(items)", "two"],
    ["last('hello')", "o"],
    ["last(createArray(0, 1, 2))", 2], 
    // We already support constant variable paths so we don't need this.
    // Unless we made it a computed path, but we would need to make it work everywhere.
    // "parameter(hello)", "hello"),
    ["one > 0.5 && two < 2.5", true],
    ["one > 0.5 || two < 1.5", true],
    ["!trueCase", false],
    ["!!trueCase", true],
    ["!(one == 1.0) || !!(two == 2.0)", true],
    ["not(one != null)", false],
    ["not(not(one != null))", true],
    ["not(falseCase)", true],       //Good until there
    ["exists(one)", true],
    ["exists(xxx)", false],
    ["exists(one.xxx)", false],

    ["!(one == 1.0)", false],
    ["!!(one == 1.0)", true],
    ["!(one == 1.0) || !!(two == 2.0)", true],
    ["not(one == 1.0)", false],
    ["not(not(one == 1.0))", true],
    ["not(false)", true],

        
    



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
    items : ["zero", "one", "two" ],
    numbers : [1,2],
    timestamp : "2018-03-15T13:00:00Z",
    trueCase: true,
    falseCase: false
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