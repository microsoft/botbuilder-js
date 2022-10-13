/* eslint-disable security/detect-object-injection */
const assert = require('assert');
const bigInt = require('big-integer');
const { Expression, SimpleObjectMemory, FunctionUtils, Options, NumericEvaluator, StackedMemory } = require('../lib');
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { useFakeTimers } = require('sinon');
const os = require('os');

const one = ['one'];
const oneTwo = ['one', 'two'];

const testCases = [
    {
        label: 'accessProperty and accessIndex',
        testCases: [
            ['$index', 'index'],
            ['`hi\\``', 'hi`'], // `hi\`` -> hi`
            ['`hi\\y`', 'hi\\y'], // `hi\y` -> hi\y
            ['`\\${a}`', '${a}'], // `\${a}` -> ${a}
            ['"ab\\"cd"', 'ab"cd'], // "ab\"cd" -> ab"cd
            ['"ab`cd"', 'ab`cd'], // "ab`cd" -> ab`cd
            ['"ab\\ncd"', 'ab\ncd'], // "ab\ncd" -> ab [newline] cd
            ['"ab\\ycd"', 'ab\\ycd'], //"ab\ycd" -> ab\ycd
            ["'ab\\'cd'", "ab'cd"], // 'ab\'cd' -> ab'cd
            ['alist[0].Name', 'item1'],
        ],
    },
    {
        label: 'string interpolation',
        testCases: [
            ['``', ''],
            ['`hi`', 'hi'],
            ['`hi\r\n`', 'hi\r\n'],
            ['`hi\\r\\n`', 'hi\\r\\n'],
            ['`hi\\\\``', 'hi\\`'],
            ['`hi\\$`', 'hi$'],
            ['`hi\\``', 'hi`'],
            ['`${world}`', 'world'],
            ["`hi ${string('jack`')}`", 'hi jack`'],
            ['`\\${world}`', '${world}'],
            ['length(`hello ${world}`)', 'hello world'.length],
            ['json(`{"key":"${hello}","item":"${world}"}`).key', 'hello'],
            ['`{expr: hello all}`', '{expr: hello all}'],
            ['json(`{"key":${{text:"hello"}},"item": "${world}"}`).key.text', 'hello'],
            ['json(`{"key":${{text:"hello", cool: "hot", obj:{new: 123}}},"item": "${world}"}`).key.text', 'hello'],
            ['`hi\\`[1,2,3]`', 'hi`[1,2,3]'],
            ["`hi ${['jack`', 'queen', 'king']}`", 'hi ["jack`","queen","king"]'],
            ['`abc ${concat("[", "]")}`', 'abc []'],
            ['`[] ${concat("[]")}`', '[] []'],
            ['`hi ${count(["a", "b", "c"])}`', 'hi 3'],
            ["`hello ${world}` == 'hello world'", true],
            ["`hello ${world}` != 'hello hello'", true],
            ["`hello ${user.nickname}` == 'hello John'", true],
            ["`hello ${user.nickname}` != 'hello Dong'", true],
            ['`hello ${string({obj:  1})}`', 'hello {"obj":1}'],
            ['`hello ${string({obj:  "${not expr}"})}`', 'hello {"obj":"${not expr}"}'],
            ['`hello ${string({obj:  {a: 1}})}`', 'hello {"obj":{"a":1}}'],
            ['`${hello} \n\n ${world}`', 'hello \n\n world'],
            ['`${hello} \r\n ${world}`', 'hello \r\n world'],
            ['`\n\n ${world}`', '\n\n world'],
            ['`\r\n ${world}`', '\r\n world'],
            ['`${hello} \n\n`', 'hello \n\n'],
            ['`${hello} \r\n`', 'hello \r\n'],
        ],
    },
    {
        label: 'Operators',
        testCases: [
            ['user.income-user.outcome', -10.0],
            ['user.income - user.outcome', -10.0],
            ['user.income!=user.outcome', true],
            ['user.income != user.outcome', true],
            ['user.income==user.outcome', false],
            ['user.income == user.outcome', false],
            ['1 + 2', 3],
            ['1 +\n 2', 3],
            ['1 \n+ 2', 3],
            ['1 +\r\n 2', 3],
            ['- 1 + 2', 1],
            ['-\r\n 1 + 2', 1],
            ['+ 1 + 2', 3],
            ['+\r\n 1 + 2', 3],
            ['1 - 2', -1],
            ['1 -\r\n 2', -1],
            ['1 - (-2)', 3],
            ['1 - (\r\n-2)', 3],
            ['1.0 + 2.0', 3.0],
            ['1 * 2 + 3', 5],
            ['1 *\r\n 2 + 3', 5],
            ['1 + 2 * 3', 7],
            ['4 / 2', 2],
            ['11.2 / 2', 5.6],
            ['4 /\r\n 2', 2],
            ['1 + 3 / 2', 2],
            ['(1 + 3) / 2', 2],
            ['(1 +\r\n 3) / 2', 2],
            ['1 * (2 + 3)', 5],
            ['(1 + 2) * 3', 9],
            ['(one + two) * bag.three', 9.0, ['one', 'two', 'bag.three']],
            ['(one + two) * bag.set.four', 12.0, ['one', 'two', 'bag.set.four']],
            ['hello + nullObj', 'hello'],
            ['one + two + hello + world', '3helloworld'],
            ['one + two + hello + one + two', '3hello12'],
            ['2^2', 4.0],
            ['2^\r\n2', 4.0],
            ['3^2^2', 81.0],
            ['one >\r\n 0.5', true],
            ['one > 0.5 && two < 2.5', true],
            ['one > 0.5 || two < 1.5', true],
            ['5 % 2', 1],
            ['5 %\r\n 2', 1],
            ['!(one == 1.0)', false],
            ['!\r\n(one == 1.0)', false],
            ['!!(one == 1.0)', true],
            ['!exists(xione) || !!exists(two)', true],
            ['(1 + 2) == (4 - 1)', true],
            ['(1 + 2) ==\r\n (4 - 1)', true],
            ['!!exists(one) == !!exists(one)', true],
            ['!(one == 1.0)', false, ['one']],
            ['!!(one == 1.0)', true, ['one']],
            ['!(one == 1.0) || !!(two == 2.0)', true, oneTwo],
            ['!true', false],
            ['!!true', true],
            ['!(one == 1.0) || !!(two == 2.0)', true],
            ["hello == 'hello'", true],
            ["hello == 'world'", false],
            ['(1 + 2) != (4 - 1)', false],
            ['(1 + 2) !=\r\n (4 - 1)', false],
            ['!!exists(one) != !!exists(one)', false],
            ["hello != 'hello'", false],
            ["hello != 'world'", true],
            ['hello!= "hello"', false],
            ['hello!= "world"', true],
            ['(1 + 2) >= (4 - 1)', true],
            ['(2 + 2) >= (4 - 1)', true],
            ['(2 + 2) >=\r\n (4 - 1)', true],
            ['float(5.5) >= float(4 - 1)', true],
            ['(1 + 2) <= (4 - 1)', true],
            ['(2 + 2) <= (4 - 1)', false],
            ['(2 + 2) <=\r\n (4 - 1)', false],
            ['float(5.5) <= float(4 - 1)', false],
            ["'string'&'builder'", 'stringbuilder'],
            ['"string"&"builder"', 'stringbuilder'],
            ['"string"&\n"builder"', 'stringbuilder'],
            ['"string"&\r\n"builder"', 'stringbuilder'],
            ['one > 0.5 && two < 2.5', true, oneTwo],
            ['notThere > 4', false],
            ['float(5.5) && float(0.0)', true],
            ['hello && "hello"', true],
            ['hello &&\n "hello"', true],
            ['hello &&\r\n "hello"', true],
            ['items || ((2 + 2) <= (4 - 1))', true], // true || false
            ['0 || false', true], // true || false
            ['0 ||\n false', true], // true || false
            ['0 ||\r\n false', true], // true || false
            ['false ||\r\n false || \r\n true', true], // true || false
            ['!(hello)', false], // false
            ['!(10)', false],
            ['!(0)', false],
            ['one > 0.5 || two < 1.5', true, oneTwo],
            ['one / 0 || two', true],
            ['0/3', 0],
            ['3??2', 3],
            ['null ?? two', 2],
            ['undefined ?? two', 2],
            ['bag.notExist ?? bag.n ?? bag.name', 'mybag'],
            ['!exists(one)?"r1":"r2"', 'r2'],
            ['!!exists(one) ? "r1" : "r2"', 'r1'],
            ['0?"r1":"r2"', 'r1'],
            ['bool("true")? "r1": "r2"', 'r1'],
            ['bag.name == null ? "hello": bag.name', 'mybag'],
            ['one > 0? one : two', 1],
            ['hello * 5?"r1":"r2"', 'r2'],
            ['timestampObj < timestampObj2', false],
            ['timestampObj2 < timestampObj', true],
            ['timestampObj > timestampObj2', true],
            ['timestampObj2 > timestampObj', false],
            ['timestampObj >= timestampObj2', true],
            ['timestampObj2 >= timestampObj', false],
            ['timestampObj <= timestampObj2', false],
            ['timestampObj2 <= timestampObj', true],
            ['timestampObj == timestampObj2', false],
            ['timestampObj == timestampObj', true],
            ['where([{a: 1, b:{c: 2}}, {b: 2}], x, x == { b: { c: 2}, a: 1})[0].b.c', 2],
        ],
    },
    {
        label: 'String functions',
        testCases: [
            ['concat(hello,world)', 'helloworld'],
            ['concat(hello,nullObj)', 'hello'],
            ["concat('hello','world')", 'helloworld'],
            ["concat('hello'\r\n,'world')", 'helloworld'],
            ['concat("hello","world")', 'helloworld'],
            ['add(hello,world)', 'helloworld'],
            ["add('hello','world')", 'helloworld'],
            ["add('hello',\r\n'world')", 'helloworld'],
            ["add(nullObj,'world')", 'world'],
            ["add('hello',nullObj)", 'hello'],
            ['add("hello","world")', 'helloworld'],
            ["length('hello')", 5],
            ['length(nullObj)', 0],
            ['length("hello")', 5],
            ['length(concat(hello,world))', 10],
            ['length(concat("[]", "abc"))', 5],
            ['length(hello + world)', 10],
            ["count('hello')", 5],
            ['count("hello")', 5],
            ['count(concat(hello,\r\nworld))', 10],
            ['reverse("hello")', 'olleh'],
            ['reverse(reverse("hello"))', 'hello'],
            ["reverse('hello')", 'olleh'],
            ['reverse(concat(hello,world))', 'dlrowolleh'],
            ["replace('hello', 'l', 'k')", 'hekko'],
            ["replace('hello', 'L', 'k')", 'hello'],
            ["replace(nullObj, 'L', 'k')", ''],
            ["replace('hello', 'L', nullObj)", 'hello'],
            ['replace("hello\'", "\'", \'"\')', 'hello"'],
            ["replace('hello\"', '\"', \"'\")", "hello'"],
            ["replace('hello\"', '\"', '\n')", 'hello\n'],
            ["replace('hello\n', '\n', '\\\\')", 'hello\\'],
            ["replace('hello\\\\', '\\\\', '\\\\\\\\')", 'hello\\\\'],
            ["replaceIgnoreCase('hello', 'L', 'k')", 'hekko'],
            ["replaceIgnoreCase(nullObj, 'L', 'k')", ''],
            ["replaceIgnoreCase('hello', 'L', nullObj)", 'heo'],
            ["split('hello','e')", ['h', 'llo']],
            ["split('hello')", ['h', 'e', 'l', 'l', 'o']],
            ["split(nullObj,'e')", ['']],
            ["split('hello',nullObj)", ['h', 'e', 'l', 'l', 'o']],
            ['split(nullObj,nullObj)', []],
            ["substring('hello', 0, 5)", 'hello'],
            ["substring('hello', 0, 3)", 'hel'],
            ["substring('hello', 5, 0)", ''],
            ["substring('hello', 3)", 'lo'],
            ['substring(nullObj, 3)', ''],
            ['substring(nullObj, 0, 3)', ''],
            ["substring('hello', 0, bag.index)", 'hel'],
            ['string(1.22, "de-DE")', '1,22'],
            ["toLower('UpCase')", 'upcase'],
            ["toLower('UpCase', 'en-GB')", 'upcase'],
            ['toLower(nullObj)', ''],
            ["toUpper('lowercase')", 'LOWERCASE'],
            ["toUpper('lowercase', 'en-US')", 'LOWERCASE'],
            ['toUpper(nullObj)', ''],
            ["toLower(toUpper('lowercase'))", 'lowercase'],
            ["trim(' hello ')", 'hello'],
            ['trim(nullObj)', ''],
            ["trim(' hello')", 'hello'],
            ["trim('hello')", 'hello'],
            ["endsWith('hello','o')", true],
            ["endsWith('hello','a')", false],
            ["endsWith(nullObj,'a')", false],
            ['endsWith(nullObj, nullObj)', true],
            ["endsWith('hello',nullObj)", true],
            ["endsWith(hello,'o')", true],
            ["endsWith(hello,'a')", false],
            ["startsWith('hello','h')", true],
            ["startsWith('hello','a')", false],
            ["startsWith(nullObj,'a')", false],
            ['startsWith(nullObj, nullObj)', true],
            ["startsWith('hello',nullObj)", true],
            ['take(hello,1)', 'h'],
            ['take(hello,-1)', ''],
            ['take(hello,10)', 'hello'],
            ['countWord(hello)', 1],
            ["countWord(concat(hello, ' ', world))", 2],
            ['addOrdinal(11)', '11th'],
            ['addOrdinal(11 + 1)', '12th'],
            ['addOrdinal(11 + 2)', '13th'],
            ['addOrdinal(11 + 10)', '21st'],
            ['addOrdinal(11 + 11)', '22nd'],
            ['addOrdinal(11 + 12)', '23rd'],
            ['addOrdinal(11 + 13)', '24th'],
            ['addOrdinal(-1)', '-1'], //original string value
            ['count(newGuid())', 36],
            ["indexOf(newGuid(), '-')", 8],
            ["indexOf(newGuid(), '-')", 8],
            ['EOL()', os.EOL],
            ["indexOf(hello, '-')", -1],
            ["indexOf(nullObj, '-')", -1],
            ['indexOf(hello, nullObj)', 0],
            ['indexOf(json(\'["a", "b"]\'), "a")', 0],
            ['indexOf(json(\'["a", "b"]\'), \'c\')', -1],
            ["indexOf(createArray('abc', 'def', 'ghi'), 'def')", 1],
            ["indexOf(['abc', 'def', 'ghi'], 'def')", 1],
            ["indexOf(createArray('abc', 'def', 'ghi'), 'klm')", -1],
            ["lastIndexOf(nullObj, '-')", -1],
            ['lastIndexOf(hello, nullObj)', 4],
            ['lastIndexOf(nullObj, nullObj)', 0],
            ["lastIndexOf(newGuid(), '-')", 23],
            ["lastIndexOf(newGuid(), '-')", 23],
            ["lastIndexOf(hello, '-')", -1],
            ['lastIndexOf(json(\'["a", "b", "a"]\'), "a")', 2],
            ['lastIndexOf(json(\'["a", "b"]\'), \'c\')', -1],
            ["lastIndexOf(createArray('abc', 'def', 'ghi', 'def'), 'def')", 3],
            ["lastIndexOf(createArray('abc', 'def', 'ghi'), 'klm')", -1],
            ["sentenceCase('a')", 'A'],
            ["sentenceCase('abc')", 'Abc'],
            ["sentenceCase('abc', 'en-GB')", 'Abc'],
            ["sentenceCase('aBC')", 'Abc'],
            ["titleCase('a')", 'A'],
            ["titleCase('abc dEF')", 'Abc Def'],
            ["titleCase('abc dEF', 'en-US')", 'Abc Def'],
        ],
    },
    {
        label: 'Logical comparison functions',
        testCases: [
            ['and(1 == 1, 1 < 2, 1 > 2)', false],
            ['and(!true, !!true)', false], //false && true
            ['and(!!true, !!true)', true], //true && true
            ["and(hello != 'world', bool('true'))", true], //true && true
            ["and(hello == 'world', bool('true'))", false], //false && true
            ['or(!exists(one), !!exists(one))', true], //false && true
            ['or(!exists(one), !exists(one))', false], //false && false
            ['greater(one, two)', false, oneTwo],
            ['greater(one , 0.5) && less(two , 2.5)', true], // true && true
            ['greater(one , 0.5) || less(two , 1.5)', true], //true || false
            ['greater(5, 2)', true],
            ['greater(2, 2)', false],
            ['greater(one, two)', false],
            ['greaterOrEquals((1 + 2) , (4 - 1))', true],
            ['greaterOrEquals((2 + 2) , (4 - 1))', true],
            ['greaterOrEquals(float(5.5) , float(4 - 1))', true],
            ['greaterOrEquals(one, one)', true],
            ['greaterOrEquals(one, two)', false],
            ['greaterOrEquals(one, one)', true, one],
            ['greaterOrEquals(one, two)', false, oneTwo],
            ['less(5, 2)', false],
            ['less(2, 2)', false],
            ['less(one, two)', true],
            ['less(one, two)', true, oneTwo],
            ["less('abc', 'xyz')", true],
            ['lessOrEquals(one, one)', true, ['one']],
            ['lessOrEquals(one, two)', true, oneTwo],
            ['lessOrEquals(one, one)', true],
            ['lessOrEquals(one, two)', true],
            ['lessOrEquals((1 + 2) , (4 - 1))', true],
            ['lessOrEquals((2 + 2) , (4 - 1))', false],
            ['lessOrEquals(float(5.5) , float(4 - 1))', false],
            ['lessOrEquals(one, one)', true],
            ['lessOrEquals(one, two)', true],
            ["equals(hello, 'hello')", true],
            ['equals(bag.index, 3)', true],
            ['equals(min(createArray(1,2,3,4), 5.0), 1.0)', true],
            ['equals(max(createArray(1,2,3,4), 5.0), 5)', true],
            ['equals(bag.index, 2)', false],
            ["equals(hello == 'world', bool('true'))", false],
            ["equals(hello == 'world', bool(0))", true],
            ["equals(hello == 'world', bool(1))", false],
            ["if(!exists(one), 'r1', 'r2')", 'r2'],
            ["if(!!exists(one), 'r1', 'r2')", 'r1'],
            ["if(0, 'r1', 'r2')", 'r1'],
            ["if(bool('true'), 'r1', 'r2')", 'r1'],
            ["if(istrue, 'r1', 'r2')", 'r1'], // true
            ['exists(one)', true],
            ['exists(xxx)', false],
            ['exists(one.xxx)', false],
            ['not(one != null)', false],
            ['not(not(one != null))', true],
            ['not(false)', true],
            ['not(one == 1.0)', false, ['one']],
            ['not(not(one == 1.0))', true, ['one']],
            ['not(false)', true],
            ['and(one > 0.5, two < 2.5)', true, oneTwo],
            ['and(float(5.5), float(0.0))', true],
            ['and(hello, "hello")', true],
            ['or(items, (2 + 2) <= (4 - 1))', true], // true || false
            ['or(0, false)', true], // true || false
            ['not(hello)', false], // false'not(10)', false],
            ['not(0)', false],
            ["if(hello, 'r1', 'r2')", 'r1'],
            ["if(null, 'r1', 'r2')", 'r2'],
            ["if(hello * 5, 'r1', 'r2')", 'r2'],
            ['emptyList == []', true],
            ['emptyList != []', false],
            ['emptyList == {}', false],
            ['emptyObject == {}', true],
            ['emptyObject != {}', false],
            ['emptyObject == []', false],
            ['emptyJObject == {}', true],
            ['emptyJObject != {}', false],
            ['emptyJObject == []', false],
            ['emptyList == [ ]', true],
            ['emptyList == {  }', false],
            ['emptyObject == {  }', true],
            ['emptyObject == [  ]', false],
            ['{} == undefined', false],
            ['{} != undefined', true],
            ['[] == undefined', false],
            ['{} != undefined', true],
            ['{} == null', false],
            ['{} != null', true],
            ['[] == null', false],
            ['{} != null', true],
            ['{} == {}', true],
            ['[] == []', true],
            ['{} != []', true],
            ['[] == {}', false],
            ['null < 1', false],
            ['null >= 1', false],
            ['undefined < 1', false],
            ['undefined >= 1', false],
        ],
    },
    {
        label: 'Conversion functions',
        testCases: [
            ["float('10.333')", 10.333],
            ["float('10')", 10.0],
            ["int('10')", 10],
            ['int(ticks)/100000000', 6372436242],
            ["string('str')", 'str'],
            ["string('str\"')", 'str"'],
            ['string(one)', '1'], //ts-->1, C#-->1.0
            ['string(bool(1))', 'true'],
            ['string(bag.set)', '{"four":4}'], // ts-->"{\"four\":4}", C# --> "{\"four\":4.0}"
            ['bool(1)', true],
            ['bool(0)', false],
            ['bool(null)', false],
            ['bool(hello * 5)', false],
            ["bool('false')", false],
            ["bool('true')", true],
            ["bool('hi')", true],
            ['[1,2,3]', [1, 2, 3]],
            ['[1,2,3, [4,5]]', [1, 2, 3, [4, 5]]],
            ['"[1,2,3]"', '[1,2,3]'],
            ["[1, bool(0), string(bool(1)), float('10')]", [1, false, 'true', 10.0]],
            ["['a', 'b[]', 'c[][][]'][1]", 'b[]'],
            ["['a', ['b', 'c']][1][0]", 'b'],
            ['union(["a", "b", "c"], ["d", ["e", "f"], "g"][1])', ['a', 'b', 'c', 'e', 'f']],
            ['union(["a", "b", "c"], ["d", ["e", "f"], "g"][1])[1]', 'b'],
            ["createArray('h', 'e', 'l', 'l', 'o')", ['h', 'e', 'l', 'l', 'o']],
            ['createArray()', []],
            ['[]', []],
            ["createArray(1, bool(0), string(bool(1)), float('10'))", [1, false, 'true', 10.0]],
            ['binary(hello)', new Uint8Array([104, 101, 108, 108, 111])],
            ['dataUri(hello)', 'data:text/plain;charset=utf-8;base64,aGVsbG8='],
            ['count(binary(hello))', 5],
            ['string(binary(hello))', 'hello'],
            [
                'dataUriToBinary(dataUri(hello))',
                new Uint8Array([
                    100,
                    97,
                    116,
                    97,
                    58,
                    116,
                    101,
                    120,
                    116,
                    47,
                    112,
                    108,
                    97,
                    105,
                    110,
                    59,
                    99,
                    104,
                    97,
                    114,
                    115,
                    101,
                    116,
                    61,
                    117,
                    116,
                    102,
                    45,
                    56,
                    59,
                    98,
                    97,
                    115,
                    101,
                    54,
                    52,
                    44,
                    97,
                    71,
                    86,
                    115,
                    98,
                    71,
                    56,
                    61,
                ]),
            ],
            ['dataUriToString(dataUri(hello))', 'hello'],
            ["uriComponentToString('http%3A%2F%2Fcontoso.com')", 'http://contoso.com'],
            ['base64(hello)', 'aGVsbG8='],
            ['base64(byteArr)', 'AwUBDA=='],
            ['base64ToBinary(base64(byteArr))', new Uint8Array([3, 5, 1, 12])],
            ['base64(base64ToBinary("AwUBDA=="))', 'AwUBDA=='],
            ['base64ToString(base64(hello))', 'hello'],
            ['dataUriToBinary(base64(hello))', new Uint8Array([97, 71, 86, 115, 98, 71, 56, 61])],
            ["uriComponent('http://contoso.com')", 'http%3A%2F%2Fcontoso.com'],
            ['{a: 1, b: newExpr}.b', 'new land'],
            ['formatNumber(20.0000, 2)', '20.00'],
            ['formatNumber(12.123, 2)', '12.12'],
            ['formatNumber(1.555, 2)', '1.56'],
            ['formatNumber(12.123, 4)', '12.1230'],
            ['formatNumber(12000.3, 4, "fr-FR")', '12\u00a0000,3000'],
            ['formatNumber(12000.3, 4, "de-DE")', '12.000,3000'],
            ['jsonStringify(json(\'{"a":"b"}\'))', '{"a":"b"}'],
            ["jsonStringify('a')", '"a"'],
            ['jsonStringify(null)', 'null'],
            ['jsonStringify(undefined)', undefined],
            ['jsonStringify({a:"b"})', '{"a":"b"}'],
        ],
    },
    {
        label: 'Math functions',
        testCases: [
            ['add(1, 2, 3)', 6],
            ['add(1, 2)', 3],
            ['add(1.0, 2.0)', 3.0],
            ['add(mul(1, 2), 3)', 5],
            ['max(mul(1, 2), 5) ', 5],
            ['max(createArray(1,2,3,4), 5.0) ', 5.0],
            ['max(createArray(1,2,3,4)) ', 4],
            ['max(5)', 5],
            ['max(4, 5) ', 5],
            ['min(mul(1, 2), 5) ', 2],
            ['min(4, 5) ', 4],
            ['min(4)', 4],
            ['min(1.0, two) + max(one, 2.0)', 3.0, oneTwo],
            ['min(createArray(1,2,3,4)) ', 1],
            ['min(createArray(1,2,3,4), 5.0) ', 1],
            ['sub(2, 1)', 1],
            ['sub(2, 1, 1)', 0],
            ['sub(2.0, 0.5)', 1.5],
            ['mul(2, 5)', 10],
            ['mul(2, 5, 2)', 20],
            ['div(mul(2, 5), 2)', 5],
            ['div(5, 2)', 2],
            ['div(5, 2, 2)', 1],
            ['div(11.2, 2)', 5.6],
            ['exp(2,2)', 4.0],
            ['mod(5,2)', 1],
            ['rand(1, 2)', 1],
            ['rand(2, 3)', 2],
            ['floor(3.51)', 3],
            ['floor(4.00)', 4],
            ['ceiling(3.51)', 4],
            ['ceiling(4.00)', 4],
            ['round(3.51)', 4],
            ['round(3.55, 1)', 3.6],
            ['round(3.12134, 3)', 3.121],
            ['abs(3.12134)', 3.12134],
            ['abs(-3.12134)', 3.12134],
            ['abs(0)', 0],
            ['sqrt(9)', 3],
            ['sqrt(0)', 0],
        ],
    },
    // All the timestamp strings passed in must be in ISO format of YYYY-MM-DDTHH:mm:ss.sssZ
    // Otherwise exceptions will be thrown out
    // All the output timestamp strings are in ISO format of YYYY-MM-DDTHH:mm:ss.sssZ
    // Init dateTime: 2018-03-15T13:00:00:111Z
    {
        label: 'Date and time functions',
        testCases: [
            ["isDefinite('helloworld')", false],
            ["isDefinite('2012-12-21')", true],
            ["isDefinite('xxxx-12-21')", false],
            ['isDefinite(validFullDateTimex)', true],
            ['isDefinite(invalidFullDateTimex)', false],
            ['isTime(validHourTimex)', true],
            ['isTime(invalidHourTimex)', false],
            ["isDuration('PT30M')", true],
            ["isDuration('2012-12-21T12:30')", false],
            ["isDate('PT30M')", false],
            ["isDate('2012-12-21T12:30')", true],
            ["isTimeRange('PT30M')", false],
            ['isTimeRange(validTimeRange)', true],
            ["isDateRange('PT30M')", false],
            ["isDateRange('2012-02')", true],
            ["isPresent('PT30M')", false],
            ['isPresent(validNow)', true],
            ['addDays(timestamp, 1)', '2018-03-16T13:00:00.111Z'],
            ["addDays(timestamp, 1,'MM-dd-yy')", '03-16-18'],
            ["addDays(timestamp, 1,'MM/dd/yy', 'es-ES')", '03/16/18'],
            ["addDays(timestamp, 1,'', 'es-ES')", '2018-03-16T13:00:00.111Z'],
            ['addHours(timestamp, 1)', '2018-03-15T14:00:00.111Z'],
            ["addHours(timestamp, 1, '', 'fr-FR')", '2018-03-15T14:00:00.111Z'],
            ["addHours(timestamp, 1,'MM-dd-yy hh-mm')", '03-15-18 02-00'],
            ['addMinutes(timestamp, 1)', '2018-03-15T13:01:00.111Z'],
            ["addMinutes(timestamp, 1, 'MM-dd-yy hh-mm')", '03-15-18 01-01'],
            ["addMinutes(timestamp, 1, 'MM-dd-yy hh-mm', 'fr-FR')", '03-15-18 01-01'],
            ['addSeconds(timestamp, 1)', '2018-03-15T13:00:01.111Z'],
            ["addSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss')", '03-15-18 01-00-01'],
            ["addSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss', 'fr-FR')", '03-15-18 01-00-01'],
            ['dayOfMonth(timestamp)', 15],
            ['dayOfWeek(timestamp)', 4], //Thursday
            ['dayOfYear(timestamp)', 74],
            ['month(timestamp)', 3],
            ['date(timestamp)', '3/15/2018'], //Default. TODO
            ['year(timestamp)', 2018],
            ['length(utcNow())', 24],
            ["formatDateTime(notISOTimestamp, 'dd/MM/yyy')", '15/03/2018'],
            ["formatDateTime(notISOTimestamp, 'dd/MM/yyy', 'fr-FR')", '15/03/2018'],
            ["formatDateTime(notISOTimestamp, 'dd%MM%yyy')", '15032018'],
            ['formatDateTime(notISOTimestamp)', '2018-03-15T13:00:00.000Z'],
            ["formatDateTime(notISOTimestamp, 'MM-dd-yy')", '03-15-18'],
            ["formatDateTime(notISOTimestamp, 'ddd')", 'Thu'],
            ["formatDateTime(notISOTimestamp, 'dddd')", 'Thursday'],
            ["formatDateTime('2018-03-15T00:00:00.000Z', 'yyyy')", '2018'],
            ["formatDateTime('2018-03-15T00:00:00.000Z', 'yyyy-MM-dd-\\\\d')", '2018-03-15-4'],
            ["formatDateTime('2018-03-15T00:00:00.010Z', 'FFF')", '010'],
            ["formatDateTime('2018-03-15T00:00:00.010Z', 'FFF', 'fr-FR')", '010'],
            ["formatDateTime('2018-03-15T09:00:00.010', 'hh')", '09'],
            ["formatDateTime('2018-03-15T09:00:00.010', 'MMMM')", 'March'],
            ["formatDateTime('2018-03-15T09:00:00.010', 'MMM')", 'Mar'],
            ["length(formatDateTime('2018-03-15T09:00:00.010', 'z'))", 5],
            ["length(formatDateTime('2018-03-15T09:00:00.010', 'zzz'))", 6],
            ["formatDateTime(formatDateTime('2018-03-15T00:00:00.000Z', 'o'), 'yyyy')", '2018'],
            ["formatDateTime('2018-03-15T00:00:00.123Z', 'fff')", '123'],
            ["formatDateTime('2018-03-15T11:00:00.123', 't')", 'AM'],
            ["formatDateTime('2018-03-15T11:00:00.123', 'tt')", 'AM'],
            ["formatDateTime('2018-03-15')", '2018-03-15T00:00:00.000Z'],
            ['formatDateTime(timestampObj)', '2018-03-15T13:00:00.000Z'],
            ['formatEpoch(unixTimestamp)', '2018-03-15T13:00:00.000Z'],
            ["formatEpoch(unixTimestamp, 'MM-dd', 'es-ES')", '03-15'],
            ['formatEpoch(unixTimestampFraction)', '2018-03-15T13:00:00.500Z'],
            ['formatTicks(ticks)', '2020-05-06T11:47:00.000Z'],
            ["formatTicks(ticks, '', 'en-US')", '2020-05-06T11:47:00.000Z'],
            ["subtractFromTime(timestamp, 1, 'Year')", '2017-03-15T13:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Year', '', 'fr-FR')", '2017-03-15T13:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Month')", '2018-02-15T13:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Week')", '2018-03-08T13:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Day')", '2018-03-14T13:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Hour')", '2018-03-15T12:00:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Minute')", '2018-03-15T12:59:00.111Z'],
            ["subtractFromTime(timestamp, 1, 'Second')", '2018-03-15T12:59:59.111Z'],
            ['dateReadBack(timestamp, addDays(timestamp, 1))', 'tomorrow'],
            ['dateReadBack(addDays(timestamp, 1),timestamp)', 'yesterday'],
            ["getTimeOfDay(convertFromUTC('2018-03-15T11:00:00.000Z', 'W. Europe Standard Time'))", 'noon'],
            ["getTimeOfDay('2018-03-15T00:00:00.0000000')", 'midnight'],
            ["getTimeOfDay('2018-03-15T00:00:00.000Z')", 'midnight'],
            ["getTimeOfDay('2018-03-15T08:00:00.000Z')", 'morning'],
            ["getTimeOfDay('2018-03-15T12:00:00.000Z')", 'noon'],
            ["getTimeOfDay('2018-03-15T13:00:00.000Z')", 'afternoon'],
            ["getTimeOfDay('2018-03-15T18:00:00.000Z')", 'evening'],
            ["getTimeOfDay('2018-03-15T22:00:00.000Z')", 'evening'],
            ["getTimeOfDay('2018-03-15T23:00:00.000Z')", 'night'],
            ["length(getPastTime(1, 'Year'))", 24],
            ["length(getFutureTime(1, 'Year'))", 24],
            ["addToTime('2018-01-01T08:00:00.000Z', 1, 'Day')", '2018-01-02T08:00:00.000Z'],
            ["addToTime('2018-01-01T08:00:00.000Z', sub(3,1), 'Week')", '2018-01-15T08:00:00.000Z'],
            ["addToTime('2018-01-01T08:00:00.000Z', 1, 'Month', 'MM-DD-YY')", '02-01-18'],
            ["addToTime('2018-01-01T08:00:00.000Z', 1, 'Month', 'MM-DD-YY', 'fr-FR')", '02-01-18'],
            ["convertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time')", '2018-02-01T18:00:00.0000000'],
            ["convertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time', 'MM-DD-YY')", '02-01-18'],
            ["convertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time', 'MM-DD-YY', 'fr-FR')", '02-01-18'],
            ["convertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time')", '2018-01-02T02:00:00.000Z'],
            ["convertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time', 'MM-DD-YY')", '01-02-18'],
            ["convertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time', 'MM-DD-YY', 'en-GB')", '01-02-18'],
            ["startOfDay('2018-03-15T13:30:30.000Z')", '2018-03-15T00:00:00.000Z'],
            ["startOfDay('2018-03-15T13:30:30.000Z', '', 'fr-FR')", '2018-03-15T00:00:00.000Z'],
            ["startOfHour('2018-03-15T13:30:30.000Z')", '2018-03-15T13:00:00.000Z'],
            ["startOfHour('2018-03-15T13:30:30.000Z', '', 'es-ES')", '2018-03-15T13:00:00.000Z'],
            ["startOfMonth('2018-03-15T13:30:30.000Z')", '2018-03-01T00:00:00.000Z'],
            ["startOfMonth('2018-03-15T13:30:30.000Z', '', 'en-US')", '2018-03-01T00:00:00.000Z'],
            ["ticks('2018-01-01T08:00:00.000Z')", bigInt('636503904000000000')],
            ['dateTimeDiff("2019-01-01T08:00:00.000Z","2018-01-01T08:00:00.000Z")', 315360000000000],
            ['dateTimeDiff("2017-01-01T08:00:00.000Z","2018-01-01T08:00:00.000Z")', -315360000000000],
            ['ticksToDays(2193385800000000)', 2538.6409722222224],
            ['ticksToHours(2193385800000000)', 60927.383333333331],
            ['ticksToMinutes(2193385811100000)', 3655643.0185],
            ['resolve("T14")', '14:00:00'],
            ['resolve("T14:20")', '14:20:00'],
            ['resolve("T14:20:30")', '14:20:30'],
            ['resolve("2020-12-20")', '2020-12-20'],
            ['resolve("2020-12-20T14")', '2020-12-20 14:00:00'],
            ['resolve("2020-12-20T14:20")', '2020-12-20 14:20:00'],
            ['resolve("2020-12-20T14:20:30")', '2020-12-20 14:20:30'],
        ],
    },
    {
        label: 'URI parsing functions',
        testCases: [
            ["uriHost('https://www.localhost.com:8080')", 'www.localhost.com'],
            ["uriPath('http://www.contoso.com/catalog/shownew.htm?date=today')", '/catalog/shownew.htm'],
            [
                "uriPathAndQuery('http://www.contoso.com/catalog/shownew.htm?date=today')",
                '/catalog/shownew.htm?date=today',
            ],
            ["uriPort('http://www.localhost:8080')", 8080],
            ["uriQuery('http://www.contoso.com/catalog/shownew.htm?date=today')", '?date=today'],
            ["uriScheme('http://www.contoso.com/catalog/shownew.htm?date=today')", 'http'],
        ],
    },
    {
        label: 'Collection functions',
        testCases: [
            ['createArray(hello)', ['hello']],
            ['sum(createArray(1, 2))', 3],
            ['sum(createArray(one, two, 3))', 6.0],
            ['average(createArray(1, 2))', 1.5],
            ['average(createArray(one, two, 3))', 2.0],
            ["contains('hello world', 'hello')", true],
            ["contains('hello world', 'hellow')", false],
            ["contains(items, 'zero')", true],
            ["contains(items, 'hi')", false],
            ["contains(bag, 'three')", true],
            ["contains(bag, 'xxx')", false],
            ['contains([{ a: 1, b: { c: 2} }, { b: 2}], { a: 1, b: { c: 2} })', true],
            ['concat(null, [1, 2], null)', [1, 2]],
            ['concat(createArray(1, 2), createArray(3, 4))', [1, 2, 3, 4]],
            ["concat(['a', 'b'], ['b', 'c'], ['c', 'd'])", ['a', 'b', 'b', 'c', 'c', 'd']],
            ["count(split(hello,'e'))", 2],
            ["count(createArray('h', 'e', 'l', 'l', 'o'))", 5],
            ["empty('')", true],
            ['reverse(split(hello,"e"))', ['llo', 'h']],
            ['reverse(createArray("h", "e", "l", "l", "o"))', ['o', 'l', 'l', 'e', 'h']],
            ["empty('a')", false],
            ['empty(bag)', false],
            ['empty(items)', false],
            ['empty(null)', true],
            ['empty(undefined)', true],
            ['empty(notexist)', true],
            ['first(items)', 'zero'],
            ["first('hello')", 'h'],
            ['first(createArray(0, 1, 2))', 0],
            ['first(1)', undefined],
            ['first(nestedItems).x', 1, ['nestedItems']],
            ['first(where(indicesAndValues(items), elt, elt.index > 1)).value', 'two'],
            ['first(where(indicesAndValues(bag), elt, elt.index == "three")).value', 3.0],
            ["join(items,',')", 'zero,one,two'],
            ["join(createArray('a', 'b', 'c'), '.')", 'a.b.c'],
            ["join(createArray('a', 'b', 'c'), ',', ' and ')", 'a,b and c'],
            ["join(foreach(items, item, item), ',')", 'zero,one,two'],
            ["join(foreach(nestedItems, i, i.x + first(nestedItems).x), ',')", '2,3,4', ['nestedItems']],
            ["join(foreach(items, item, concat(item, string(count(items)))), ',')", 'zero3,one3,two3', ['items']],
            ['join(foreach(doubleNestedItems, items, join(foreach(items, item, item.x), ",")), ",")', '1,2,3'],
            [
                'join(foreach(doubleNestedItems, items, join(foreach(items, item, concat(y, string(item.x))), ",")), ",")',
                'y1,y2,y3',
            ],
            ['join(foreach(dialog, item, item.key), ",")', 'x,instance,options,title,subTitle'],
            ['join(foreach(dialog, item => item.key), ",")', 'x,instance,options,title,subTitle'],
            ['foreach(dialog, item, item.value)[2].xxx', 'options'],
            ['foreach(dialog, item=>item.value)[2].xxx', 'options'],
            ['join(foreach(indicesAndValues(items), item, item.value), ",")', 'zero,one,two'],
            ['join(foreach(indicesAndValues(items), item=>item.value), ",")', 'zero,one,two'],
            ['count(where(doubleNestedItems, items, count(where(items, item, item.x == 1)) == 1))', 1],
            ['count(where(doubleNestedItems, items, count(where(items, item, count(items) == 1)) == 1))', 1],
            ["join(select(items, item, item), ',')", 'zero,one,two'],
            ["join(select(items, item=>item), ',')", 'zero,one,two'],
            ["join(select(nestedItems, i, i.x + first(nestedItems).x), ',')", '2,3,4', ['nestedItems']],
            ["join(select(items, item, concat(item, string(count(items)))), ',')", 'zero3,one3,two3', ['items']],
            ["join(where(items, item, item == 'two'), ',')", 'two'],
            ["join(where(items, item => item == 'two'), ',')", 'two'],
            ["join(foreach(where(nestedItems, item, item.x > 1), result, result.x), ',')", '2,3', ['nestedItems']],
            ['string(where(dialog, item, item.value=="Dialog Title"))', '{"title":"Dialog Title"}'],
            ['last(items)', 'two'],
            ["last('hello')", 'o'],
            ['last(createArray(0, 1, 2))', 2],
            ['last(1)', undefined],
            ["count(union(createArray('a', 'b')))", 2],
            ["count(union(createArray('a', 'b'), createArray('b', 'c'), createArray('b', 'd')))", 4],
            ["count(intersection(createArray('a', 'b')))", 2],
            ["count(intersection(createArray('a', 'b'), createArray('b', 'c'), createArray('b', 'd')))", 1],
            ["skip(createArray('a', 'b', 'c', 'd'), 2)", ['c', 'd']],
            ["skip(createArray('a', 'b', 'c', 'd'), -1)", ['a', 'b', 'c', 'd']],
            ["skip(createArray('a', 'b', 'c', 'd'), 10)", []],
            ['take(hello, two)', 'he'],
            ["take(createArray('a', 'b', 'c', 'd'), one)", ['a']],
            ["take(createArray('a', 'b', 'c', 'd'), -1)", []],
            ["take(createArray('a', 'b', 'c', 'd'), 10)", ['a', 'b', 'c', 'd']],
            ["subArray(createArray('a', 'b', 'c', 'd'), 1, 3)", ['b', 'c']],
            ["subArray(createArray('a', 'b', 'c', 'd'), 4, 4)", []],
            ["subArray(createArray('a', 'b', 'c', 'd'), 1)", ['b', 'c', 'd']],
            ['range(1, 4)', [1, 2, 3, 4]],
            ['range(-1, 3)', [-1, 0, 1]],
            ['sortBy(items)', ['one', 'two', 'zero']],
            ["sortBy(nestedItems, 'x')[0].x", 1],
            ['sortByDescending(items)', ['zero', 'two', 'one']],
            ["sortByDescending(nestedItems, 'x')[0].x", 3],
            [
                'flatten(createArray(1,createArray(2),createArray(createArray(3, 4), createArray(5,6))))',
                [1, 2, 3, 4, 5, 6],
            ],
            [
                'flatten(createArray(1,createArray(2),createArray(createArray(3, 4), createArray(5,6))), 1)',
                [1, 2, [3, 4], [5, 6]],
            ],
            ['unique(createArray(1, 5, 1))', [1, 5]],
            ['any(createArray(1, "cool"), item, isInteger(item))', true],
            ['any(createArray("first", "cool"), item => isInteger(item))', false],
            ['all(createArray(1, "cool"), item, isInteger(item))', false],
            ['all(createArray(1, 2), item => isInteger(item))', true],
            ['any(dialog, item, item.key == "title")', true],
            ['any(dialog, item, isInteger(item.value))', true],
            ['all(dialog, item, item.key == "title")', false],
            ['all(dialog, item, isInteger(item.value))', false],
        ],
    },
    {
        label: 'Object manipulation and construction functions',
        testCases: [
            ['{text:"hello"}.text', 'hello'],
            ['{name: user.name}.name', undefined],
            ['{name: user.nickname}.name', 'John'],
            [
                "string(addProperty(json('{\"key1\":\"value1\"}'), 'key2','value2'))",
                '{"key1":"value1","key2":"value2"}',
            ],
            ['foreach(items, x, addProperty({}, "a", x))[0].a', 'zero'],
            ['foreach(items, x => addProperty({}, "a", x))[0].a', 'zero'],
            ['string(addProperty({"key1":"value1"}, \'key2\',\'value2\'))', '{"key1":"value1","key2":"value2"}'],
            ["string(setProperty(json('{\"key1\":\"value1\"}'), 'key1','value2'))", '{"key1":"value2"}'],
            ['string(setProperty({"key1":"value1"}, \'key1\',\'value2\'))', '{"key1":"value2"}'],
            ["string(setProperty({}, 'key1','value2'))", '{"key1":"value2"}'],
            ["string(setProperty({}, 'key1','value2{}'))", '{"key1":"value2{}"}'],
            ['string([{a: 1}, {b: 2}, {c: 3}][0])', '{"a":1}'],
            ['string({obj: {"name": "adams"}})', '{"obj":{"name":"adams"}}'],
            [
                'string({obj: {"name": "adams"}, txt: {utter: "hello"}})',
                '{"obj":{"name":"adams"},"txt":{"utter":"hello"}}',
            ],
            ['string(removeProperty(json(\'{"key1":"value1","key2":"value2"}\'), \'key2\'))', '{"key1":"value1"}'],
            ["coalesce(nullObj,'hello',nullObj)", 'hello'],
            ["coalesce(nullObj, false, 'hello')", false],
            ['jPath(jsonStr, pathStr )', ['Jazz', 'Accord']],
            ["jPath(jsonStr, '.automobiles[0].maker' )", ['Nissan']],
            [
                'string(merge(json1, json2))',
                '{"FirstName":"John","LastName":"Smith","Enabled":true,"Roles":["Customer","Admin"]}',
            ],
            [
                'string(merge(json1, json2, json3))',
                '{"FirstName":"John","LastName":"Smith","Enabled":true,"Roles":["Customer","Admin"],"age":36}',
            ],
            ['merge(callstack[1], callstack[2]).z', 1],
            ['merge(callstack).z', 1],
            [
                "string(merge({k1:'v1'}, [{k2:'v2'}, {k3: 'v3'}], {k4:'v4'}))",
                '{"k1":"v1","k2":"v2","k3":"v3","k4":"v4"}',
            ],
            [
                'xml(\'{"person": {"name": "Sophia Owen", "city": "Seattle"}}\')',
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<person>\n  <name>Sophia Owen</name>\n  <city>Seattle</city>\n</person>',
            ],
            ['xPath(xmlStr,"/produce/item/name")', ['<name>Gala</name>', '<name>Honeycrisp</name>']],
            ['xPath(xmlStr,"sum(/produce/item/count)")', 30],
        ],
    },
    {
        label: 'Memory access',
        testCases: [
            ["getProperty(bag, concat('na','me'))", 'mybag'],
            ["getProperty('bag').index", 3],
            ["getProperty('a:b')", 'stringa:b'],
            ["getProperty(concat('he', 'llo'))", 'hello'],
            ['items[2]', 'two', ['items[2]']],
            ['bag.list[bag.index - 2]', 'blue', ['bag.list', 'bag.index']],
            ['items[nestedItems[1].x]', 'two', ['items', 'nestedItems[1].x']],
            ["bag['name']", 'mybag'],
            ["bag[substring(concat('na','me','more'), 0, length('name'))]", 'mybag'],
            ['items[1+1]', 'two'],
            ["getProperty(undefined, 'p')", undefined],
            ["(getProperty(undefined, 'p'))[1]", undefined],
        ],
    },
    {
        label: 'regex',
        testCases: [
            ["isMatch('abc', '^[ab]+$')", false], // simple character classes ([abc]), "+" (one or more)
            ["isMatch('abb', '^[ab]+$')", true], // simple character classes ([abc])
            ["isMatch('123', '^[^abc]+$')", true], // complemented character classes ([^abc])
            ["isMatch('12a', '^[^abc]+$')", false], // complemented character classes ([^abc])
            ["isMatch('123', '^[^a-z]+$')", true], // complemented character classes ([^a-z])
            ["isMatch('12a', '^[^a-z]+$')", false], // complemented character classes ([^a-z])
            ["isMatch('a1', '^[a-z]?[0-9]$')", true], // "?" (zero or one)
            ["isMatch('1', '^[a-z]?[0-9]$')", true], // "?" (zero or one)
            ["isMatch('1', '^[a-z]*[0-9]$')", true], // "*" (zero or more)
            ["isMatch('abc1', '^[a-z]*[0-9]$')", true], // "*" (zero or more)
            ["isMatch('ab', '^[a-z]{1}$')", false], // "{x}" (exactly x occurrences)
            ["isMatch('ab', '^[a-z]{1,2}$')", true], // "{x,y}" (at least x, at most y, occurrences)
            ["isMatch('abc', '^[a-z]{1,}$')", true], // "{x,}" (x occurrences or more)
            ["isMatch('Name', '^(?i)name$')", true], // "(?i)x" (x ignore case)
            ["isMatch('FORTUNE', '(?i)fortune|future')", true], // "x|y" (alternation)
            ["isMatch('FUTURE', '(?i)fortune|future')", true], // "x|y" (alternation)
            ["isMatch('A', '(?i)fortune|future')", false], // "x|y" (alternation)
            ["isMatch('abacaxc', 'ab.+?c')", true], // "+?" (lazy versions)
            ["isMatch('abacaxc', 'ab.*?c')", true], // "*?" (lazy versions)
            ["isMatch('abacaxc', 'ab.??c')", true], // "??" (lazy versions)
            ["isMatch('12abc34', '([0-9]+)([a-z]+)([0-9]+)')", true], // "(...)" (simple group)
            ["isMatch('12abc', '([0-9]+)([a-z]+)([0-9]+)')", false], // "(...)" (simple group)
            ['isMatch("a", "\\\\w{1}")', true], // "\w" (match [a-zA-Z0-9_])
            ['isMatch("1", "\\\\d{1}")', true], // "\d" (match [0-9])
            ['isMatch("12.5", "[0-9]+(\\\\.5)")', true], // "\." (match .)
            ['isMatch("12x5", "[0-9]+(\\\\.5)")', false], // "\." (match .)
            ["isMatch('', '[0-9]')", false], // empty string
            ["isMatch(nullObj, '[0-9]')", false], // null object
        ],
    },
    {
        label: 'Type Checking',
        testCases: [
            ['isString(hello)', true],
            ['isString("Monday")', true],
            ['isString(one)', false],
            ['isInteger(one)', true],
            ['isInteger(1)', true],
            ['isInteger(1.23)', false],
            ['isFloat(one)', false],
            ['isFloat(1)', false],
            ['isFloat(1.23)', true],
            ['isArray(hello)', false],
            ['isArray(createArray(1,2,3))', true],
            ['isObject(hello)', false],
            ['isObject(dialog)', true],
            ['isBoolean(hello)', false],
            ['isBoolean(1 == one)', true],
            ['isDateTime(hello)', false],
            ['isDateTime(timestamp)', true],
        ],
    },
    {
        label: 'StringOrValue',
        testCases: [
            ['stringOrValue("${one}")', 1.0],
            ['stringOrValue("${one} item")', '1 item'],
        ],
    },
    {
        label: 'Empty expression',
        testCases: [['', '']],
    },
    {
        label: 'SetPathToValue',
        testCases: [
            ['setPathToValue(path.simple, 3) + path.simple', 6],
            ['setPathToValue(path.simple, 5) + path.simple', 10],
            ['setPathToValue(path.array[0], 7) + path.array[0]', 14],
            ['setPathToValue(path.array[1], 9) + path.array[1]', 18],
            ['setPathToValue(path.x, null)', null],
        ],
    },
];

const mockedTimeTestCases = [
    ["utcNow('MM-DD-YY HH', 'de-DE')", '08-01-20 00'],
    ["utcNow('', 'de-DE')", '2020-08-01T00:12:20.000Z'],
    ["utcNow('MM-DD-YY HH')", '08-01-20 00'],
    ["getPastTime(1, 'Year', 'MM-dd-yy', 'de-DE')", '08-01-19'],
    ["getPastTime(1, 'Year', '', 'de-DE')", '2019-08-01T00:12:20.000Z'],
    ["getPastTime(1, 'Year', 'MM-dd-yy')", '08-01-19'],
    ["getPastTime(1, 'Month', 'MM-dd-yy')", '07-01-20'],
    ["getPastTime(1, 'Week', 'MM-dd-yy')", '07-25-20'],
    ["getPastTime(1, 'Day', 'MM-dd-yy')", '07-31-20'],
    ["getFutureTime(1, 'Year', 'MM-dd-yy')", '08-01-21'],
    ["getFutureTime(1, 'Year', 'MM-dd-yy', 'de-DE')", '08-01-21'],
    ["getFutureTime(1, 'Year', '', 'ru-RU')", '2021-08-01T00:12:20.000Z'],
    ["getFutureTime(1, 'Month', 'MM-dd-yy')", '09-01-20'],
    ["getFutureTime(1, 'Week', 'MM-dd-yy')", '08-08-20'],
    ["getFutureTime(1, 'Day', 'MM-dd-yy')", '08-02-20'],
    ["getPreviousViableDate('XXXX-07-10')", '2020-07-10'],
    ["getPreviousViableDate('XXXX-08-10')", '2019-08-10'],
    ["getPreviousViableDate('XXXX-07-10', 'Asia/Shanghai')", '2020-07-10'],
    ["getPreviousViableDate('XXXX-02-29')", '2020-02-29'],
    ["getPreviousViableDate('XXXX-02-29', 'Pacific Standard Time')", '2020-02-29'],
    ["getNextViableDate('XXXX-07-10')", '2021-07-10'],
    ["getNextViableDate('XXXX-08-10')", '2020-08-10'],
    ["getNextViableDate('XXXX-07-10', 'Europe/London')", '2021-07-10'],
    ["getNextViableDate('XXXX-02-29')", '2024-02-29'],
    ["getNextViableDate('XXXX-02-29', 'America/Los_Angeles')", '2024-02-29'],
    ["getNextViableTime('TXX:40:20')", 'T00:40:20'],
    ["getNextViableTime('TXX:40:20', 'Asia/Tokyo')", 'T09:40:20'],
    ["getNextViableTime('TXX:05:10')", 'T01:05:10'],
    ["getNextViableTime('TXX:05:10', 'Europe/Paris')", 'T03:05:10'],
    ["getPreviousViableTime('TXX:40:20')", 'T23:40:20'],
    ["getPreviousViableTime('TXX:40:20', 'Eastern Standard Time')", 'T19:40:20'],
    ["getPreviousViableTime('TXX:05:10')", 'T00:05:10'],
    ["getPreviousViableTime('TXX:05:10', 'Central Standard Time')", 'T19:05:10'],
];

const scope = {
    $index: 'index',
    'a:b': 'stringa:b',
    alist: [
        {
            Name: 'item1',
        },
        {
            Name: 'item2',
        },
    ],
    emptyList: [],
    emptyObject: new Map(),
    emptyJObject: {},

    path: {
        array: [1],
    },
    one: 1.0,
    two: 2.0,
    hello: 'hello',
    world: 'world',
    newExpr: 'new land',
    cit: 'cit',
    y: 'y',
    istrue: true,
    nullObj: undefined,
    jsonStr:
        '{"automobiles" : [{ "maker" : "Nissan", "model" : "Teana", "year" : 2011 },{ "maker" : "Honda", "model" : "Jazz", "year" : 2010 },{ "maker" : "Honda", "model" : "Civic", "year" : 2007 },{ "maker" : "Toyota", "model" : "Yaris", "year" : 2008 },{"maker" : "Honda", "model" : "Accord", "year" : 2011 }],"motorcycles" : [{ "maker" : "Honda", "model" : "ST1300", "year" : 2012 }]}',
    pathStr: '.automobiles{.maker === "Honda" && .year > 2009}.model',
    byteArr: new Uint8Array([3, 5, 1, 12]),
    bag: {
        three: 3.0,
        set: {
            four: 4.0,
        },
        list: ['red', 'blue'],
        index: 3,
        name: 'mybag',
    },
    items: ['zero', 'one', 'two'],
    nestedItems: [{ x: 1 }, { x: 2 }, { x: 3 }],
    timestamp: '2018-03-15T13:00:00.111Z',
    notISOTimestamp: '2018-03-15T13:00:00Z',
    validFullDateTimex: new TimexProperty('2020-02-20'),
    invalidFullDateTimex: new TimexProperty('xxxx-02-20'),
    validHourTimex: new TimexProperty('2020-02-20T07:30'),
    validTimeRange: new TimexProperty({ partOfDay: 'morning' }),
    validNow: new TimexProperty({ now: true }),
    invalidHourTimex: new TimexProperty('2001-02-20'),
    timestampObj: new Date('2018-03-15T13:00:00.000Z'),
    timeStampObj2: new Date('2018-01-02T02:00:00.000Z'),
    unixTimestamp: 1521118800,
    unixTimestampFraction: 1521118800.5,
    ticks: bigInt('637243624200000000'),
    json1: {
        FirstName: 'John',
        LastName: 'Smith',
        Enabled: false,
        Roles: ['User'],
    },
    json2: {
        Enabled: true,
        Roles: ['Customer', 'Admin'],
    },
    json3: { age: 36 },
    user: {
        income: 110.0,
        outcome: 120.0,
        nickname: 'John',
        lists: {
            todo: ['todo1', 'todo2', 'todo3'],
        },
        listType: 'todo',
    },
    turn: {
        recognized: {
            entities: {
                city: 'Seattle',
                ordinal: ['1', '2', '3'],
                CompositeList1: [['firstItem']],
                CompositeList2: [['firstItem', 'secondItem']],
            },
            intents: {
                BookFlight: 'BookFlight',
                BookHotel: [
                    {
                        Where: 'Bellevue',
                        Time: 'Tomorrow',
                        People: '2',
                    },
                    {
                        Where: 'Kirkland',
                        Time: 'Today',
                        People: '4',
                    },
                ],
            },
        },
    },
    dialog: {
        x: 3,
        instance: { xxx: 'instance', yyy: { instanceY: 'instanceY' } },
        options: { xxx: 'options', yyy: ['optionY1', 'optionY2'] },
        title: 'Dialog Title',
        subTitle: 'Dialog Sub Title',
    },
    doubleNestedItems: [[{ x: 1 }, { x: 2 }], [{ x: 3 }]],
    xmlStr:
        "<?xml version='1.0'?> <produce> <item> <name>Gala</name> <type>apple</type> <count>20</count> </item> <item> <name>Honeycrisp</name> <type>apple</type> <count>10</count> </item> </produce>",
    callStack: [
        {
            x: 3,
            instance: {
                xxx: 'instance',
                yyy: {
                    instanceY: 'instanceY',
                },
            },
            options: {
                xxx: 'options',
                yyy: ['optionY1', 'optionY2'],
            },
            title: 'Dialog Title',
            subTitle: 'Dialog Sub Title',
        },
        {
            x: 2,
            y: 2,
        },
        {
            x: 1,
            y: 1,
            z: 1,
        },
    ],
};

const generateParseTest = (input, expectedOutput, expectedRefs) => () => {
    const parsed = Expression.parse(input.toString());
    assert(parsed != null);

    const { value: actualOutput, error } = parsed.tryEvaluate(scope);
    assert(error == null);

    assertObjectEquals(actualOutput, expectedOutput, input);

    if (expectedRefs) {
        const actualRefs = parsed.references();
        assertObjectEquals(actualRefs.sort(), expectedRefs.sort(), input);
    }

    const { value: newOutput } = Expression.parse(parsed.toString()).tryEvaluate(scope);
    assertObjectEquals(actualOutput, newOutput, input);
};

describe('expression parser functional test', function () {
    testCases.forEach(({ label, testCases }) => {
        describe(label, function () {
            testCases.forEach(([input, expectedOutput, expectedRefs]) => {
                it(input.toString() || '(empty)', generateParseTest(input, expectedOutput, expectedRefs));
            });
        });
    });

    describe('StackedMemory', function () {
        it('supports null values', function () {
            const sm = new StackedMemory();

            sm.push(new SimpleObjectMemory({ a: 'a', b: 'b', c: null }));
            sm.push(new SimpleObjectMemory({ c: 'c' }));
            sm.push(new SimpleObjectMemory({ a: 'newa', b: null, d: 'd' }));

            assert.deepStrictEqual(Expression.parse('d').tryEvaluate(sm), { error: undefined, value: 'd' }, 'd');
            assert.deepStrictEqual(Expression.parse('a').tryEvaluate(sm), { error: undefined, value: 'newa' }, 'a');
            assert.deepStrictEqual(Expression.parse('c').tryEvaluate(sm), { error: undefined, value: 'c' }, 'c');
            assert.deepStrictEqual(Expression.parse('b').tryEvaluate(sm), { error: undefined, value: null }, 'b');
        });
    });

    // Any test getting the system time with something like `new Date()` is prone to failure because
    // actual and expected may differ just enough make the test fail.
    // To evaluate expressions like "getPastTime", we need to freeze the system clock so that every call to
    // `new Date()` done by both the test and by ExpressionEvaluator return the exact same time.
    describe('mocked time expressions', function () {
        let clock;

        beforeEach(function () {
            clock = useFakeTimers({
                now: new Date(Date.UTC(2020, 7, 1, 0, 12, 20)),
                shouldAdvanceTime: false,
            });
        });

        afterEach(function () {
            clock.restore();
        });

        mockedTimeTestCases.forEach(([input, expectedOutput, expectedRefs]) => {
            it(input || '(empty)', generateParseTest(input, expectedOutput, expectedRefs));
        });
    });

    it('Test AccumulatePath', function () {
        const scope = {
            f: 'food',
            b: 'beta',
            z: {
                z: 'zar',
            },
            n: 2,
        };
        const memory = new SimpleObjectMemory(scope);

        // normal case, note, we doesn't append a " yet
        let exp = Expression.parse('a[f].b[n].z');
        let path;
        ({ path } = FunctionUtils.tryAccumulatePath(exp, memory, undefined));
        assert.strictEqual(path, "a['food'].b[2].z");

        // normal case
        exp = Expression.parse('a[z.z][z.z].y');
        ({ path } = FunctionUtils.tryAccumulatePath(exp, memory, undefined));
        assert.strictEqual(path, "a['zar']['zar'].y");

        // normal case
        exp = Expression.parse('a.b[z.z]');
        ({ path } = FunctionUtils.tryAccumulatePath(exp, memory, undefined));
        assert.strictEqual(path, "a.b['zar']");

        // stop evaluate at middle
        exp = Expression.parse('json(x).b');
        ({ path } = FunctionUtils.tryAccumulatePath(exp, memory, undefined));
        assert.strictEqual(path, 'b');
    });

    it('Test Evaluation Options', function () {
        const mockMemory = {};

        const options = new Options();
        options.nullSubstitution = (path) => `${path} is undefined`;

        let value;
        let error;

        // normal case null value is substituted
        let exp = Expression.parse('food');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, 'food is undefined');

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('if(food, 1, 2)');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, 2);

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('food && true');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, false);

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('food || true');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, true);

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('food == "food is undefined"');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, false);

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('not(food)');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, true);

        // in boolean context, substitution is not allowed, use raw value instead
        exp = Expression.parse('bool(food)');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, false);

        // concat is evaluated in boolean context also, use raw value
        exp = Expression.parse('if(concat(food, "beta"), 1, 2)');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert.strictEqual(value, 1);

        // index is not boolean context, but it also requires raw value
        exp = Expression.parse('a[b]');
        ({ value, error } = exp.tryEvaluate(mockMemory, options));
        assert(error !== undefined);
    });

    it('Test NumericEvaluator', function () {
        const functionName = 'Math.sum';
        Expression.functions.add(functionName, new NumericEvaluator(functionName, (args) => args[0] + args[1]));

        const { value, error } = Expression.parse('Math.sum(1, 2, 3)').tryEvaluate(undefined);
        assert.strictEqual(value, 6);
        assert(error == null);
    });
});

const assertObjectEquals = (actual, expected, input) => {
    const debugMessage = `actual is: ${actual}, expected is ${expected}, with expression ${input}`;
    if (actual === undefined && expected === undefined) {
        return;
    } else if (actual === undefined || expected === undefined) {
        assert.fail(`actual or expected was undefined. ${debugMessage}`);
    } else if (typeof actual === 'number' && typeof expected === 'number') {
        assert.strictEqual(
            parseFloat(actual.toString()),
            parseFloat(expected.toString()),
            `Numbers don't match. ${debugMessage}`
        );
    } else if (Array.isArray(actual) && Array.isArray(expected)) {
        assert.strictEqual(actual.length, expected.length);
        for (let i = 0; i < actual.length; i++) {
            assertObjectEquals(actual[i], expected[i], `Array doesn't match. ${debugMessage}`);
        }
    } else if (actual instanceof Uint8Array && expected instanceof Uint8Array) {
        assert.strictEqual(actual.length, expected.length);
        for (let i = 0; i < actual.length; i++) {
            assertObjectEquals(actual[i], expected[i], `Uint8Array doesn't match. ${debugMessage}`);
        }
    } else if (bigInt.isInstance(actual) && bigInt.isInstance(expected)) {
        assert(actual.equals(expected), `bigInt is not equal. ${debugMessage}`);
    } else {
        assert.strictEqual(actual, expected, `Acutal and expected don't match. ${debugMessage}`);
    }
};
