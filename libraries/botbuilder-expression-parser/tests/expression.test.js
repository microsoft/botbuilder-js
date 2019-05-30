const { ExpressionEngine } = require('../');
const { Extensions } = require('botbuilder-expression');
const assert = require('assert');
const moment = require('moment');

const one = ["one"];
const oneTwo = ["one", "two"];

const dataSource = [
  // Operators tests
  ["1 + 2", 3],
  ["- 1 + 2", 1],
  ["+ 1 + 2", 3],
  ["1 - 2", -1],
  ["1 - (-2)", 3],
  ["1.0 + 2.0", 3.0],
  ["1 * 2 + 3", 5],
  ["1 + 2 * 3", 7],
  ["4 / 2", 2],
  ["1 + 3 / 2", 2],
  ["(1 + 3) / 2", 2],
  ["1 * (2 + 3)", 5],
  ["(1 + 2) * 3", 9],
  ["(one + two) * bag.three", 9.0, ["one", "two", "bag.three"]],
  ["(one + two) * bag.set.four", 12.0, ["one", "two", "bag.set.four"]],
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
  ["!(one == 1.0)", false, ["one"]],
  ["!!(one == 1.0)", true, ["one"]],
  ["!(one == 1.0) || !!(two == 2.0)", true, oneTwo],
  ["!true", false],
  ["!!true", true],
  ["!(one == 1.0) || !!(two == 2.0)", true],
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
  ["'string'&'builder'", "stringbuilder"],
  ["\"string\"&\"builder\"", "stringbuilder"],
  ["one > 0.5 && two < 2.5", true, oneTwo],
  ["notThere > 4", false],
  ["float(5.5) && float(0.0)", true],
  ["hello && \"hello\"", true],
  ["items || ((2 + 2) <= (4 - 1))", true], // true || false
  ["0 || false", true], // true || false
  ["!(hello)", false], // false
  ["!(10)", false],
  ["!(0)", false],
  ["one > 0.5 || two < 1.5", true, oneTwo],
  ["one / 0 || two", true],
  ["0/3", 0],

  // String functions tests
  ["concat(hello,world)", "helloworld"],
  ["concat('hello','world')", "helloworld"],
  ["concat(\"hello\",\"world\")", "helloworld"],
  ["length('hello')", 5],
  ["length(\"hello\")", 5],
  ["length(concat(hello,world))", 10],
  ["count('hello')", 5],
  ["count(\"hello\")", 5],
  ["count(concat(hello,world))", 10],
  ["replace('hello', 'l', 'k')", "hekko"],
  ["replace('hello', 'L', 'k')", "hello"],
  ["replaceIgnoreCase('hello', 'L', 'k')", "hekko"],
  ["split('hello','e')", ["h", "llo"]],
  ["substring('hello', 0, 5)", "hello"],
  ["substring('hello', 0, 3)", "hel"],
  ["substring('hello', 3)", "lo"],
  ["substring('hello', 0, bag.index)", "hel"],
  ["toLower('UpCase')", "upcase"],
  ["toUpper('lowercase')", "LOWERCASE"],
  ["toLower(toUpper('lowercase'))", "lowercase"],
  ["trim(' hello ')", "hello"],
  ["trim(' hello')", "hello"],
  ["trim('hello')", "hello"],
  ["endsWith('hello','o')", true],
  ["endsWith('hello','a')", false],
  ["endsWith(hello,'o')", true],
  ["endsWith(hello,'a')", false],
  ["startsWith('hello','h')", true],
  ["startsWith('hello','a')", false],
  ["countWord(hello)", 1],
  ["countWord(concat(hello, ' ', world))", 2],
  ["addOrdinal(11)", "11th"],
  ["addOrdinal(11 + 1)", "12th"],
  ["addOrdinal(11 + 2)", "13th"],
  ["addOrdinal(11 + 10)", "21st"],
  ["addOrdinal(11 + 11)", "22nd"],
  ["addOrdinal(11 + 12)", "23rd"],
  ["addOrdinal(11 + 13)", "24th"],
  ["addOrdinal(-1)", "-1"],//original string value
  ["count(guid())", 36],
  ["guid().indexOf('-')", 8],
  ["indexOf(guid(), '-')", 8],
  ["indexOf(hello, '-')", -1],
  ["guid().lastIndexOf('-')", 23],
  ["lastIndexOf(guid(), '-')", 23],
  ["lastIndexOf(hello, '-')", -1],

  // Logical comparison functions tests
  ["and(1 == 1, 1 < 2, 1 > 2)", false],
  ["and(!true, !!true)", false],//false && true
  ["and(!!true, !!true)", true],//true && true
  ["and(hello != 'world', bool('true'))", true],//true && true
  ["and(hello == 'world', bool('true'))", false],//false && true
  ["or(!exists(one), !!exists(one))", true],//false && true
  ["or(!exists(one), !exists(one))", false],//false && false
  ["greater(one, two)", false, oneTwo],
  ["greater(one , 0.5) && less(two , 2.5)", true],// true && true
  ["greater(one , 0.5) || less(two , 1.5)", true],//true || false
  ["greater(5, 2)", true],
  ["greater(2, 2)", false],
  ["greater(one, two)", false],
  ["greaterOrEquals((1 + 2) , (4 - 1))", true],
  ["greaterOrEquals((2 + 2) , (4 - 1))", true],
  ["greaterOrEquals(float(5.5) , float(4 - 1))", true],
  ["greaterOrEquals(one, one)", true],
  ["greaterOrEquals(one, two)", false],
  ["greaterOrEquals(one, one)", true, one],
  ["greaterOrEquals(one, two)", false, oneTwo],
  ["less(5, 2)", false],
  ["less(2, 2)", false],
  ["less(one, two)", true],
  ["less(one, two)", true, oneTwo],
  ["lessOrEquals(one, one)", true, ["one"]],
  ["lessOrEquals(one, two)", true, oneTwo],
  ["lessOrEquals(one, one)", true],
  ["lessOrEquals(one, two)", true],
  ["lessOrEquals((1 + 2) , (4 - 1))", true],
  ["lessOrEquals((2 + 2) , (4 - 1))", false],
  ["lessOrEquals(float(5.5) , float(4 - 1))", false],
  ["lessOrEquals(one, one)", true],
  ["lessOrEquals(one, two)", true],
  ["equals(hello, 'hello')", true],
  ["equals(bag.index, 3)", true],
  ["equals(bag.index, 2)", false],
  ["equals(hello == 'world', bool('true'))", false],
  ["equals(hello == 'world', bool(0))", false],
  ["if(!exists(one), 'r1', 'r2')", "r2"],
  ["if(!!exists(one), 'r1', 'r2')", "r1"],
  ["if(0, 'r1', 'r2')", "r1"],
  ["if(bool('true'), 'r1', 'r2')", "r1"],
  ["if(istrue, 'r1', 'r2')", "r1"], // true
  ["exists(one)", true],
  ["exists(xxx)", false],
  ["exists(one.xxx)", false],
  ["not(one != null)", false],
  ["not(not(one != null))", true],
  ["not(false)", true],
  ["not(one == 1.0)", false, ["one"]],
  ["not(not(one == 1.0))", true, ["one"]],
  ["not(false)", true],
  ["and(one > 0.5, two < 2.5)", true, oneTwo],
  ["and(float(5.5), float(0.0))", true],
  ["and(hello, \"hello\")", true],
  ["or(items, (2 + 2) <= (4 - 1))", true], // true || false
  ["or(0, false)", true], // true || false
  ["not(hello)", false], // false
  ["not(10)", false],
  ["not(0)", false],
  ["if(hello, 'r1', 'r2')", "r1"],
  ["if(null, 'r1', 'r2')", "r2"],
  ["if(hello * 5, 'r1', 'r2')", "r2"],

  // Conversion functions tests
  ["float('10.333')", 10.333],
  ["float('10')", 10.0],
  ["int('10')", 10],
  ["string('str')", "str"],
  ["string(one)", "1"], //ts-->1, C#-->1.0
  ["string(bool(1))", "true"],
  ["string(bag.set)", "{\"four\":4}"], // ts-->"{\"four\":4}", C# --> "{\"four\":4.0}"
  ["bool(1)", true],
  ["bool(0)", true],
  ["bool(null)", false],
  ["bool(hello * 5)", false],
  ["bool('false')", true], // we make it true, because it is not empty
  ["bool('hi')", true],
  ["createArray('h', 'e', 'l', 'l', 'o')", ["h", "e", "l", "l", "o"]],
  ["createArray(1, bool(0), string(bool(1)), float('10'))", [1, true, "true", 10.0]],
  ["array(hello)", ['hello']],
  ["binary(hello)", '0110100001100101011011000110110001101111'],
  ["dataUri(hello)", 'data:text/plain;charset=utf-8;base64,aGVsbG8='],
  ["dataUriToBinary(dataUri(hello))", '011001000110000101110100011000010011101001110100011001010111100001110100001011110111000001101100011000010110100101101110001110110110001101101000011000010111001001110011011001010111010000111101011101010111010001100110001011010011100000111011011000100110000101110011011001010011011000110100001011000110000101000111010101100111001101100010010001110011100000111101'],
  ["dataUriToString(dataUri(hello))", 'hello'],
  ["uriComponentToString('http%3A%2F%2Fcontoso.com')", 'http://contoso.com'],
  ["base64(hello)", 'aGVsbG8='],
  ["base64ToBinary(base64(hello))", '0110000101000111010101100111001101100010010001110011100000111101'],
  ["base64ToString(base64(hello))", 'hello'],
  ["uriComponent('http://contoso.com')", 'http%3A%2F%2Fcontoso.com'],
  ["xml('{\"person\": {\"name\": \"Sophia Owen\", \"city\": \"Seattle\"}}')", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<person>\n  <name>Sophia Owen</name>\n  <city>Seattle</city>\n</person>'],

  // Math functions tests
  ["add(1, 2, 3)", 6],
  ["add(1, 2)", 3],
  ["add(1.0, 2.0)", 3.0],
  ["add(mul(1, 2), 3)", 5],
  ["max(mul(1, 2), 5) ", 5],
  ["max(5)", 5],
  ["max(4, 5) ", 5],
  ["min(mul(1, 2), 5) ", 2],
  ["min(4, 5) ", 4],
  ["min(4)", 4],
  ["min(1.0, two) + max(one, 2.0)", 3.0, oneTwo],
  ["sub(2, 1)", 1],
  ["sub(2, 1, 1)", 0],
  ["sub(2.0, 0.5)", 1.5],
  ["mul(2, 5)", 10],
  ["mul(2, 5, 2)", 20],
  ["div(mul(2, 5), 2)", 5],
  ["div(5, 2)", 2],
  ["div(5, 2, 2)", 1],
  ["exp(2,2)", 4.0],
  ["mod(5,2)", 1],
  ["rand(1, 2)", 1],
  ["rand(2, 3)", 2],

  // Date and time function tests
  // All the timestamp strings passed in must be in ISO format of YYYY-MM-DDTHH:mm:ss.sssZ
  // Otherwise exceptions will be thrown out
  // All the output timestamp strings are in ISO format of YYYY-MM-DDTHH:mm:ss.sssZ
  // Init dateTime: 2018-03-15T13:00:00:111Z
  ["addDays(timestamp, 1)", "2018-03-16T13:00:00.111Z"],
  ["addDays(timestamp, 1,'MM-dd-yy')", "03-16-18"],
  ["addHours(timestamp, 1)", "2018-03-15T14:00:00.111Z"],
  ["addHours(timestamp, 1,'MM-dd-yy hh-mm')", "03-15-18 02-00"],
  ["addMinutes(timestamp, 1)", "2018-03-15T13:01:00.111Z"],
  ["addMinutes(timestamp, 1, 'MM-dd-yy hh-mm')", "03-15-18 01-01"],
  ["addSeconds(timestamp, 1)", "2018-03-15T13:00:01.111Z"],
  ["addSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss')", "03-15-18 01-00-01"],
  ["dayOfMonth(timestamp)", 15],
  ["dayOfWeek(timestamp)", 4],//Thursday
  ["dayOfYear(timestamp)", 74],
  ["month(timestamp)", 3],
  ["date(timestamp)", "3/15/2018"],//Default. TODO
  ["year(timestamp)", 2018],
  ["length(utcNow())", 24],
  ["utcNow('MM-DD-YY')", moment(new Date().toISOString()).format('MM-DD-YY')],
  ["formatDateTime('2018-03-15T13:00:00.111+00:00')", "2018-03-15T13:00:00.111Z"],
  ["formatDateTime(timestamp, 'MM-dd-yy')", "03-15-18"],
  ["formatDateTime('2018-03-15')", "2018-03-15T00:00:00.000Z"],
  ["subtractFromTime(timestamp, 1, 'Year')", "2017-03-15T13:00:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Month')", "2018-02-15T13:00:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Week')", "2018-03-08T13:00:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Day')", "2018-03-14T13:00:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Hour')", "2018-03-15T12:00:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Minute')", "2018-03-15T12:59:00.111Z"],
  ["subtractFromTime(timestamp, 1, 'Second')", "2018-03-15T12:59:59.111Z"],
  ["dateReadBack(timestamp, addDays(timestamp, 1))", "tomorrow"],
  ["dateReadBack(addDays(timestamp, 1),timestamp))", "yesterday"],
  ["getTimeOfDay('2018-03-15T00:00:00.000Z')", "midnight"],
  ["getTimeOfDay('2018-03-15T08:00:00.000Z')", "morning"],
  ["getTimeOfDay('2018-03-15T12:00:00.000Z')", "noon"],
  ["getTimeOfDay('2018-03-15T13:00:00.000Z')", "afternoon"],
  ["getTimeOfDay('2018-03-15T18:00:00.000Z')", "evening"],
  ["getTimeOfDay('2018-03-15T22:00:00.000Z')", "evening"],
  ["getTimeOfDay('2018-03-15T23:00:00.000Z')", "night"],
  ["getPastTime(1, 'Year', 'MM-dd-yy')", moment(new Date().toISOString()).subtract(1, 'years').format('MM-DD-YY')],
  ["getPastTime(1, 'Month', 'MM-dd-yy')", moment(new Date().toISOString()).subtract(1, 'months').format('MM-DD-YY')],
  ["getPastTime(1, 'Week', 'MM-dd-yy')", moment(new Date().toISOString()).subtract(7, 'days').format('MM-DD-YY')],
  ["getPastTime(1, 'Day', 'MM-dd-yy')", moment(new Date().toISOString()).subtract(1, 'days').format('MM-DD-YY')],
  ["getFutureTime(1, 'Year', 'MM-dd-yy')", moment(new Date().toISOString()).add(1, 'years').format('MM-DD-YY')],
  ["getFutureTime(1, 'Month', 'MM-dd-yy')", moment(new Date().toISOString()).add(1, 'months').format('MM-DD-YY')],
  ["getFutureTime(1, 'Week', 'MM-dd-yy')", moment(new Date().toISOString()).add(7, 'days').format('MM-DD-YY')],
  ["getFutureTime(1, 'Day', 'MM-dd-yy')", moment(new Date().toISOString()).add(1, 'days').format('MM-DD-YY')],

  // Collection functions tests
  ["sum(createArray(1, 2))", 3],
  ["sum(createArray(one, two, 3))", 6.0],
  ["average(createArray(1, 2))", 1.5],
  ["average(createArray(one, two, 3))", 2.0],
  ["contains('hello world', 'hello')", true],
  ["contains('hello world', 'hellow')", false],
  ["contains(items, 'zero')", true],
  ["contains(items, 'hi')", false],
  ["contains(bag, 'three')", true],
  ["contains(bag, 'xxx')", false],
  ["count(split(hello,'e'))", 2],
  ["count(createArray('h', 'e', 'l', 'l', 'o'))", 5],
  ["empty('')", true],
  ["empty('a')", false],
  ["empty(bag)", false],
  ["empty(items)", false],
  ["first(items)", "zero"],
  ["first('hello')", "h"],
  ["first(createArray(0, 1, 2))", 0],
  ["first(1)", undefined],
  ["first(nestedItems).x", 1, ["nestedItems"]],
  ["join(items,',')", "zero,one,two"],
  ["join(createArray('a', 'b', 'c'), '.')", "a.b.c"],
  ["join(foreach(items, item, item), ',')", "zero,one,two"],
  ["join(foreach(nestedItems, i, i.x + first(nestedItems).x), ',')", "2,3,4", ["nestedItems"]],
  ["join(foreach(items, item, concat(item, string(count(items)))), ',')", "zero3,one3,two3", ["items"]],
  ["last(items)", "two"],
  ["last('hello')", "o"],
  ["last(createArray(0, 1, 2))", 2],
  ["last(1)", undefined],
  ["count(union(createArray('a', 'b')))", 2],
  ["count(union(createArray('a', 'b'), createArray('b', 'c'), createArray('b', 'd')))", 4],
  ["count(intersection(createArray('a', 'b')))", 2],
  ["count(intersection(createArray('a', 'b'), createArray('b', 'c'), createArray('b', 'd')))", 1],
  ["skip(createArray('a', 'b', 'c', 'd'), 2)", ['c', 'd']],
  ["take(hello, two)", 'he'],
  ["take(createArray('a', 'b', 'c', 'd'), one)", ['a']],
  ["subArray(createArray('a', 'b', 'c', 'd'), 1, 3)", ['b', 'c']],
  ["subArray(createArray('a', 'b', 'c', 'd'), 1)", ['b', 'c', 'd']],
  ["range(1, 4)", [1, 2, 3, 4]],
  ["range(-1, 3)", [-1, 0, 1]],

  // Object manipulation and construction functions tests
  ["string(addProperty(json('{\"key1\":\"value1\"}'), 'key2','value2'))", "{\"key1\":\"value1\",\"key2\":\"value2\"}"],
  ["string(setProperty(json('{\"key1\":\"value1\"}'), 'key1','value2'))", "{\"key1\":\"value2\"}"],
  ["string(removeProperty(json('{\"key1\":\"value1\",\"key2\":\"value2\"}'), 'key2'))", "{\"key1\":\"value1\"}"],

  // Short hand expression tests
  ["@city == 'Bellevue'", false, ["turn.entities.city"]],
  ["@city", "Seattle", ["turn.entities.city"]],
  ["@city == 'Seattle'", true, ["turn.entities.city"]],
  ["#BookFlight == 'BookFlight'", true, ["turn.intents.BookFlight"]],
  ["exists(#BookFlight)", true, ["turn.intents.BookFlight"]],
  ["$title", "Dialog Title", ["dialog.result.title"]],
  ["$subTitle", "Dialog Sub Title", ["dialog.result.subTitle"]],

  // Memory access tests
  ["getProperty(bag, concat('na','me'))", "mybag"],
  ["items[2]", "two", ["items[2]"]],
  ["bag.list[bag.index - 2]", "blue", ["bag.list", "bag.index"]],
  ["items[nestedItems[1].x]", "two", ["items", "nestedItems[1].x"]],
  ["bag['name']", "mybag"],
  ["bag[substring(concat('na','me','more'), 0, length('name'))]", "mybag"],
  ["getProperty(undefined, 'p')", undefined],
  ["(getProperty(undefined, 'p'))[1]", undefined]
];

const scope = {
  one: 1.0,
  two: 2.0,
  hello: "hello",
  world: "world",
  istrue: true,
  bag:
  {
    three: 3.0,
    set:
    {
      four: 4.0,
    },
    list: ["red", "blue"],
    index: 3,
    name: "mybag"
  },
  items: ["zero", "one", "two"],
  nestedItems:
    [
      { x: 1 },
      { x: 2 },
      { x: 3 },
    ],
  timestamp: "2018-03-15T13:00:00.111Z",
  turn:
  {
    entities:
    {
      city: "Seattle"
    },
    intents:
    {
      BookFlight: "BookFlight"
    }
  },
  dialog:
  {
    result:
    {
      title: "Dialog Title",
      subTitle: "Dialog Sub Title"
    }
  },
};

describe('expression functional test', () => {
  it('should get right evaluate result', () => {
    for (const data of dataSource) {
      const input = data[0].toString();
      var parsed = new ExpressionEngine().parse(input);
      assert(parsed !== undefined);
      var { value: actual, error } = parsed.tryEvaluate(scope);
      assert(error === undefined, `input: ${input}, Has error: ${error}`);

      const expected = data[1];

      //Assert Object Equals
      if (actual instanceof Array && expected instanceof Array) {
        const [isSuccess, errorMessage] = IsArraySame(actual, expected);
        if (!isSuccess) {
          assert.fail(errorMessage);
        }
      } else if (typeof expected === 'number') {
        assert(parseFloat(actual) === expected, `actual is: ${actual} for case ${input}`)
      }
      else {
        assert(actual === expected, `actual is: ${actual} for case ${input}`);
      }

      //Assert ExpectedRefs
      if (data.length === 3) {
        const actualRefs = Extensions.References(parsed);
        const [isSuccess, errorMessage] = IsArraySame(actualRefs.sort(), data[2].sort());
        if (!isSuccess) {
          assert.fail(errorMessage);
        }
      }
    }
  });
});

var IsArraySame = (actual, expected) => { //return [isSuccess, errorMessage]
  if (actual.length !== expected.length) return [false, `expected length: ${expected.length}, actual length: ${actual.length}`];

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) return [false, `actual is: ${actual[i]}, expected is: ${expected[i]}`];
  }

  return [true, ''];
}