const { ExpressionEngine} =  require('../');
const { Extensions } = require('botbuilder-expression');
const assert = require('assert');

const dataSource = [

  // operators test
  ["first(nestedItems).x", 1, ["nestedItems"]],
  ["1 + 2", 3],
  ["1 - 2", -1],
  ["1.0 + 2.0", 3.0],
  ["1 * 2 + 3", 5],
  ["1 + 2 * 3", 7],
  ["4 / 2", 2],
  ["1 + 3 / 2", 2],
  ["(1 + 3) / 2", 2],
  ["1 * (2 + 3)", 5],
  ["(1 + 2) * 3", 9],
  ["(one + two) * bag.three", 9.0, ["one", "two", "bag.three" ]],
  ["(one + two) * bag.set.four", 12.0 ,["one", "two", "bag.set.four"]],
  ["items[2]", "two",["items[2]"]],
  ["bag.list[bag.index - 2]", "blue",["bag.list", "bag.index"]],
  ["min(1.0, two) + max(one, 2.0)", 3.0,["one", "two"]],

  // Multiple arg tests
  ["and(1 == 1, 1 < 2, 1 > 2)", false],
  ["add(1, 2, 3)", 6],
  ["greater(one, two)", false, ["one", "two"]],
  ["greaterOrEquals(one, one)", true, ["one"]],
  ["greaterOrEquals(one, two)", false,["one", "two"]],
  ["less(5, 2)", false],
  ["less(2, 2)", false],
  ["less(one, two)", true, ["one", "two"]],
  ["lessOrEquals(one, one)", true, ["one"]],
  ["lessOrEquals(one, two)", true, ["one", "two"]],
  ["less(one, two)", true],
  ["lessOrEquals(one, one)", true],
  ["lessOrEquals(one, two)", true],

  ["2^2", 4.0],
  ["3^2^2", 81.0],
  ["one > 0.5 && two < 2.5", true],
  ["one > 0.5 || two < 1.5", true],
  ["5 % 2", 1],
  ["!(one == 1.0)", false],
  ["!!(one == 1.0)", true],
  ["!exists(xione) || !!exists(two)", true],
  ["(1 + 2) == (4 - 1)", true],
  ["!!exists(one) == !!exists(one)", true],
  ["hello == 'hello'", true],
  ["hello == 'world'", false],
  ["(1 + 2) != (4 - 1)", false],
  ["!!exists(one) != !!exists(one)", false],
  ["hello != 'hello'", false],
  ["hello != 'world'", true],
  ["hello != \"hello\"", false],
  ["hello != \"world\"", true],
  ["(1 + 2) >= (4 - 1)", true],
  ["(2 + 2) >= (4 - 1)", true],
  ["float(5.5) >= float(4 - 1)", true],
  ["(1 + 2) <= (4 - 1)", true],
  ["(2 + 2) <= (4 - 1)", false],
  ["float(5.5) <= float(4 - 1)", false],
  ["'string'&'builder'","stringbuilder"],
  ["\"string\"&\"builder\"","stringbuilder"],
  ["concat(hello,world)","helloworld"],
  ["concat('hello','world')","helloworld"],
  ["concat(\"hello\",\"world\")","helloworld"],
  ["length('hello')",5],
  ["length(\"hello\")",5],
  ["length(concat(hello,world))",10],
  ["replace('hello', 'l', 'k')","hekko"],
  ["replace('hello', 'L', 'k')","hello"],
  ["replaceIgnoreCase('hello', 'L', 'k')","hekko"],
  ["split('hello','e')",["h","llo"]],
  ["substring('hello', 0, 5)", "hello"],
  ["substring('hello', 0, 3)", "hel"],
  ["toLower('UpCase')", "upcase"],
  ["toUpper('lowercase')", "LOWERCASE"],
  ["toLower(toUpper('lowercase'))", "lowercase"],
  ["trim(' hello ')", "hello"],
  ["trim(' hello')", "hello"],
  ["trim('hello')", "hello"],

  // logical comparison functions test
  ["and(!true, !!true)", false],//false && true
  ["and(!!true, !!true)", true],//true && true
  ["and(hello != 'world', bool('true'))", true],//true && true
  ["and(hello == 'world', bool('true'))", false],//false && true
  ["equals(hello, 'hello')", true],
  ["equals(bag.index, 3)", true],
  ["equals(bag.index, 2)", false],
  ["equals(hello == 'world', bool('true'))", false],//false, true
  ["equals(hello == 'world', bool(0))", true],//false, false
  ["greater(one , 0.5) && less(two , 2.5)", true],// true && true
  ["if(!exists(one), 'r1', 'r2')", "r2"],//false
  ["if(!!exists(one), 'r1', 'r2')", "r1"],//true
  ["greater(one , 0.5) || less(two , 1.5)", true],//true || false
  ["greater(5, 2)", true],
  ["greater(2, 2)", false],
  ["or(!exists(one), !!exists(one))", true],//false && true
  ["or(!exists(one), !exists(one))", false],//false && false
  ["greater(one, two)", false],
  ["greaterOrEquals((1 + 2) , (4 - 1))", true],
  ["greaterOrEquals((2 + 2) , (4 - 1))", true],
  ["greaterOrEquals(float(5.5) , float(4 - 1))", true],
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
  ["if(bool('true'), 'r1', 'r2')", "r1"],//true

  // math functions test
  ["add(1, 2)", 3],
  ["add(1.0, 2.0)", 3.0],
  ["add(mul(1, 2), 3)", 5],
  ["max(mul(1, 2), 5) ", 5],
  ["max(4, 5) ", 5],
  ["min(mul(1, 2), 5) ", 2],
  ["min(4, 5) ", 4],
  ["sum(createArray(1, 2))", 3],
  ["sum(createArray(one, two, 3))", 6.0],
  ["average(createArray(1, 2))", 1.5],
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
  //init dateTime: 2018-03-15T13:00:00Z
  ["addDays(timestamp, 1)", "2018-03-16T13:00:00.0000000Z"],
  ["addDays(timestamp, 1,'MM-dd-yy')", "03-16-18"],
  ["addHours(timestamp, 1)", "2018-03-15T14:00:00.0000000Z"],
  ["addHours(timestamp, 1,'MM-dd-yy hh-mm')", "03-15-18 02-00"],
  ["addMinutes(timestamp, 1)", "2018-03-15T13:01:00.0000000Z"],
  ["addMinutes(timestamp, 1, 'MM-dd-yy hh-mm')", "03-15-18 01-01"],
  ["addSeconds(timestamp, 1)", "2018-03-15T13:00:01.0000000Z"],
  ["addSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss')", "03-15-18 01-00-01"],
  ["dayOfMonth(timestamp)", 15],
  ["dayOfWeek(timestamp)", 4],//Thursday
  ["dayOfYear(timestamp)", 74],
  ["month(timestamp)", 3],
  ["date(timestamp)", "3/15/2018"],//Default. TODO
  ["year(timestamp)", 2018],
  ["formatDateTime(timestamp)", "2018-03-15T13:00:00.0000000Z"],
  ["formatDateTime(timestamp, 'MM-dd-yy')", "03-15-18"],
  ["subtractFromTime(timestamp, 1, 'Day')", "2018-03-14T13:00:00.0000000Z"],
  ["subtractFromTime(timestamp, 1, 'Minute')", "2018-03-15T12:59:00.0000000Z"],
  ["subtractFromTime(timestamp, 1, 'Second')", "2018-03-15T12:59:59.0000000Z"],
  ["subtractFromTime(timestamp, 1, 'Week')", "2018-03-08T13:00:00.0000000Z"],
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
  ["string(one)", "1"], //ts-->1, C#-->1.0
  ["string(bool(1))", "true"],
  ["string(bag.set)", "{\"four\":4}"], // ts-->"{\"four\":4}", C# --> "{\"four\":4.0}"
  ["bool(1)", true],
  ["bool(0)", false],
  ["bool('false')", false],
  ["bool('true')", true],
  ["createArray('h', 'e', 'l', 'l', 'o')", ["h", "e", "l", "l", "o" ]],
  ["createArray(1, string(bool(1)))", [1, "true"]],

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
  ["one > 0.5 && two < 2.5", true, ["one", "two"]],
  ["one > 0.5 || two < 1.5", true, ["one", "two"]],
  ["!true", false],
  ["!!true", true],
  ["!(one == 1.0) || !!(two == 2.0)", true],
  ["not(one != null)", false],
  ["not(not(one != null))", true],
  ["not(false)", true],
  ["exists(one)", true],
  ["exists(xxx)", false],
  ["exists(one.xxx)", false],
  ["!(one == 1.0)", false, ["one"]],
  ["!!(one == 1.0)", true, ["one"]],
  ["!(one == 1.0) || !!(two == 2.0)", true, ["one", "two"]],
  ["not(one == 1.0)", false, ["one"]],
  ["not(not(one == 1.0))", true, ["one"]],
  ["not(false)", true],

  // Object manipulation and construction functions
  ["string(addProperty(json('{\"key1\":\"value1\"}'), 'key2','value2'))", "{\"key1\":\"value1\",\"key2\":\"value2\"}"],
  ["string(setProperty(json('{\"key1\":\"value1\"}'), 'key1','value2'))", "{\"key1\":\"value2\"}"],
  ["string(removeProperty(json('{\"key1\":\"value1\",\"key2\":\"value2\"}'), 'key2'))", "{\"key1\":\"value1\"}"],

  // Short Hand Expression
  ["@city == 'Bellevue'", false, ["turn.entities.city"]],
  ["@city", "Seattle",["turn.entities.city"]],
  ["@city == 'Seattle'", true,["turn.entities.city"]],
  ["#BookFlight == 'BookFlight'", true,["turn.intents.BookFlight"]],
  ["exists(#BookFlight)", true,["turn.intents.BookFlight"]],
  ["$title", "Dialog Title",["dialog.result.title"]],
  ["$subTitle", "Dialog Sub Title",["dialog.result.subTitle"]],
  ["join(foreach(items, item, item), ',')", "zero,one,two"],
  ["join(foreach(nestedItems, i, i.x + first(nestedItems).x), ',')", "2,3,4",["nestedItems"]],
  ["join(foreach(items, item, concat(item, string(count(items)))), ',')", "zero3,one3,two3",["items"]]

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
      list : ["red", "blue" ],
      index : 3
  },
  items : ["zero", "one", "two" ],
  nestedItems : 
  [
    {x : 1},
    {x : 2},
    {x : 3},
  ],
  timestamp : "2018-03-15T13:00:00Z",
  turn : 
  {
      entities : 
      {
          city : "Seattle"
      },
      intents : 
      {
          BookFlight : "BookFlight"
      }
  },
  dialog : 
  {
      result : 
      {
          title : "Dialog Title",
          subTitle : "Dialog Sub Title"
      }
  },
};

describe('expression functional test', () => {
  it('should get right evaluate result', () => {
    for (const data of dataSource) {
        const input = data[0].toString();
        var parsed = new ExpressionEngine().parse(input);
        assert(parsed !== undefined);
        var {value: actual, error} = parsed.tryEvaluate(scope);
        assert(error === undefined, `input: ${input}, Has error: ${error}`);

        const expected = data[1];

        //Assert Object Equals
        if(actual instanceof Array && expected instanceof Array) {
          const [isSuccess, errorMessage] = IsArraySame(actual, expected);
          if(!isSuccess) {
            assert.fail(errorMessage);
          }
        }
        else {
          assert(actual === expected,`actual is: ${actual} for case ${input}`);
        }
      
        //Assert ExpectedRefs
        if(data.length === 3) {
          const actualRefs = Extensions.References(parsed);
          const [isSuccess, errorMessage] = IsArraySame(actualRefs.sort(), data[2].sort());
          if(!isSuccess) {
            assert.fail(errorMessage);
          }
        }
    }
  });
});

var IsArraySame = (actual, expected) => { //return [isSuccess, errorMessage]
  if(actual.length !== expected.length) return [false,`expected length: ${expected.length}, actual length: ${actual.length}`];

  for(let i = 0; i < actual.length; i++) {
    if(actual[i] !== expected[i]) return [false, `actual is: ${actual[i]}, expected is: ${expected[i]}`];
  }

  return [true, ''];
}