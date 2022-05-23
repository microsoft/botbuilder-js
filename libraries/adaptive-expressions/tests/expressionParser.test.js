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
                ["`hi ${String('jack`')}`", 'hi jack`'],
                ['`\\${world}`', '${world}'],
                ['Length(`hello ${world}`)', 'hello world'.length],
                ['Json(`{"key":"${hello}","item":"${world}"}`).key', 'hello'],
                ['`{expr: hello all}`', '{expr: hello all}'],
                ['Json(`{"key":${{text:"hello"}},"item": "${world}"}`).key.text', 'hello'],
                ['Json(`{"key":${{text:"hello", cool: "hot", obj:{new: 123}}},"item": "${world}"}`).key.text', 'hello'],
                ['`hi\\`[1,2,3]`', 'hi`[1,2,3]'],
                ["`hi ${['jack`', 'queen', 'king']}`", 'hi ["jack`","queen","king"]'],
                ['`abc ${Concat("[", "]")}`', 'abc []'],
                ['`[] ${Concat("[]")}`', '[] []'],
                ['`hi ${Count(["a", "b", "c"])}`', 'hi 3'],
                ["`hello ${world}` == 'hello world'", true],
                ["`hello ${world}` != 'hello hello'", true],
                ["`hello ${user.nickname}` == 'hello John'", true],
                ["`hello ${user.nickname}` != 'hello Dong'", true],
                ['`hello ${String({obj:  1})}`', 'hello {"obj":1}'],
                ['`hello ${String({obj:  "${not expr}"})}`', 'hello {"obj":"${not expr}"}'],
                ['`hello ${String({obj:  {a: 1}})}`', 'hello {"obj":{"a":1}}'],
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
                ['!Exists(xione) || !!Exists(two)', true],
                ['(1 + 2) == (4 - 1)', true],
                ['(1 + 2) ==\r\n (4 - 1)', true],
                ['!!Exists(one) == !!Exists(one)', true],
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
                ['!!Exists(one) != !!Exists(one)', false],
                ["hello != 'hello'", false],
                ["hello != 'world'", true],
                ['hello!= "hello"', false],
                ['hello!= "world"', true],
                ['(1 + 2) >= (4 - 1)', true],
                ['(2 + 2) >= (4 - 1)', true],
                ['(2 + 2) >=\r\n (4 - 1)', true],
                ['Float(5.5) >= Float(4 - 1)', true],
                ['(1 + 2) <= (4 - 1)', true],
                ['(2 + 2) <= (4 - 1)', false],
                ['(2 + 2) <=\r\n (4 - 1)', false],
                ['Float(5.5) <= Float(4 - 1)', false],
                ["'string'&'builder'", 'stringbuilder'],
                ['"string"&"builder"', 'stringbuilder'],
                ['"string"&\n"builder"', 'stringbuilder'],
                ['"string"&\r\n"builder"', 'stringbuilder'],
                ['one > 0.5 && two < 2.5', true, oneTwo],
                ['notThere > 4', false],
                ['Float(5.5) && Float(0.0)', true],
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
                ['!Exists(one)?"r1":"r2"', 'r2'],
                ['!!Exists(one) ? "r1" : "r2"', 'r1'],
                ['0?"r1":"r2"', 'r1'],
                ['Bool("true")? "r1": "r2"', 'r1'],
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
                ['Where([{a: 1, b:{c: 2}}, {b: 2}], x, x == { b: { c: 2}, a: 1})[0].b.c', 2],
            ],
        },
        {
            label: 'String functions',
            testCases: [
                ['Concat(hello,world)', 'helloworld'],
                ['Concat(hello,nullObj)', 'hello'],
                ["Concat('hello','world')", 'helloworld'],
                ["Concat('hello'\r\n,'world')", 'helloworld'],
                ['Concat("hello","world")', 'helloworld'],
                ['Add(hello,world)', 'helloworld'],
                ["Add('hello','world')", 'helloworld'],
                ["Add('hello',\r\n'world')", 'helloworld'],
                ["Add(nullObj,'world')", 'world'],
                ["Add('hello',nullObj)", 'hello'],
                ['Add("hello","world")', 'helloworld'],
                ["Length('hello')", 5],
                ['Length(nullObj)', 0],
                ['Length("hello")', 5],
                ['Length(Concat(hello,world))', 10],
                ['Length(Concat("[]", "abc"))', 5],
                ['Length(hello + world)', 10],
                ["Count('hello')", 5],
                ['Count("hello")', 5],
                ['Count(Concat(hello,\r\nworld))', 10],
                ['Reverse("hello")', 'olleh'],
                ['Reverse(Reverse("hello"))', 'hello'],
                ["Reverse('hello')", 'olleh'],
                ['Reverse(Concat(hello,world))', 'dlrowolleh'],
                ["Replace('hello', 'l', 'k')", 'hekko'],
                ["Replace('hello', 'L', 'k')", 'hello'],
                ["Replace(nullObj, 'L', 'k')", ''],
                ["Replace('hello', 'L', nullObj)", 'hello'],
                ['Replace("hello\'", "\'", \'"\')', 'hello"'],
                ["Replace('hello\"', '\"', \"'\")", "hello'"],
                ["Replace('hello\"', '\"', '\n')", 'hello\n'],
                ["Replace('hello\n', '\n', '\\\\')", 'hello\\'],
                ["Replace('hello\\\\', '\\\\', '\\\\\\\\')", 'hello\\\\'],
                ["ReplaceIgnoreCase('hello', 'L', 'k')", 'hekko'],
                ["ReplaceIgnoreCase(nullObj, 'L', 'k')", ''],
                ["ReplaceIgnoreCase('hello', 'L', nullObj)", 'heo'],
                ["Split('hello','e')", ['h', 'llo']],
                ["Split('hello')", ['h', 'e', 'l', 'l', 'o']],
                ["Split(nullObj,'e')", ['']],
                ["Split('hello',nullObj)", ['h', 'e', 'l', 'l', 'o']],
                ['Split(nullObj,nullObj)', []],
                ["Substring('hello', 0, 5)", 'hello'],
                ["Substring('hello', 0, 3)", 'hel'],
                ["Substring('hello', 5, 0)", ''],
                ["Substring('hello', 3)", 'lo'],
                ['Substring(nullObj, 3)', ''],
                ['Substring(nullObj, 0, 3)', ''],
                ["Substring('hello', 0, bag.index)", 'hel'],
                ['String(1.22, "de-DE")', '1,22'],
                ["ToLower('UpCase')", 'upcase'],
                ["ToLower('UpCase', 'en-GB')", 'upcase'],
                ['ToLower(nullObj)', ''],
                ["ToUpper('lowercase')", 'LOWERCASE'],
                ["ToUpper('lowercase', 'en-US')", 'LOWERCASE'],
                ['ToUpper(nullObj)', ''],
                ["ToLower(ToUpper('lowercase'))", 'lowercase'],
                ["Trim(' hello ')", 'hello'],
                ['Trim(nullObj)', ''],
                ["Trim(' hello')", 'hello'],
                ["Trim('hello')", 'hello'],
                ["EndsWith('hello','o')", true],
                ["EndsWith('hello','a')", false],
                ["EndsWith(nullObj,'a')", false],
                ['EndsWith(nullObj, nullObj)', true],
                ["EndsWith('hello',nullObj)", true],
                ["EndsWith(hello,'o')", true],
                ["EndsWith(hello,'a')", false],
                ["StartsWith('hello','h')", true],
                ["StartsWith('hello','a')", false],
                ["StartsWith(nullObj,'a')", false],
                ['StartsWith(nullObj, nullObj)', true],
                ["StartsWith('hello',nullObj)", true],
                ['Take(hello,1)', 'h'],
                ['Take(hello,-1)', ''],
                ['Take(hello,10)', 'hello'],
                ['CountWord(hello)', 1],
                ["CountWord(Concat(hello, ' ', world))", 2],
                ['AddOrdinal(11)', '11th'],
                ['AddOrdinal(11 + 1)', '12th'],
                ['AddOrdinal(11 + 2)', '13th'],
                ['AddOrdinal(11 + 10)', '21st'],
                ['AddOrdinal(11 + 11)', '22nd'],
                ['AddOrdinal(11 + 12)', '23rd'],
                ['AddOrdinal(11 + 13)', '24th'],
                ['AddOrdinal(-1)', '-1'], //original string value
                ['Count(NewGuid())', 36],
                ["IndexOf(NewGuid(), '-')", 8],
                ["IndexOf(NewGuid(), '-')", 8],
                ['EOL()', os.EOL],
                ["IndexOf(hello, '-')", -1],
                ["IndexOf(nullObj, '-')", -1],
                ['IndexOf(hello, nullObj)', 0],
                ['IndexOf(Json(\'["a", "b"]\'), "a")', 0],
                ['IndexOf(Json(\'["a", "b"]\'), \'c\')', -1],
                ["IndexOf(CreateArray('abc', 'def', 'ghi'), 'def')", 1],
                ["IndexOf(['abc', 'def', 'ghi'], 'def')", 1],
                ["IndexOf(CreateArray('abc', 'def', 'ghi'), 'klm')", -1],
                ["LastIndexOf(nullObj, '-')", -1],
                ['LastIndexOf(hello, nullObj)', 4],
                ['LastIndexOf(nullObj, nullObj)', 0],
                ["LastIndexOf(NewGuid(), '-')", 23],
                ["LastIndexOf(NewGuid(), '-')", 23],
                ["LastIndexOf(hello, '-')", -1],
                ['LastIndexOf(Json(\'["a", "b", "a"]\'), "a")', 2],
                ['LastIndexOf(Json(\'["a", "b"]\'), \'c\')', -1],
                ["LastIndexOf(CreateArray('abc', 'def', 'ghi', 'def'), 'def')", 3],
                ["LastIndexOf(CreateArray('abc', 'def', 'ghi'), 'klm')", -1],
                ["SentenceCase('a')", 'A'],
                ["SentenceCase('abc')", 'Abc'],
                ["SentenceCase('abc', 'en-GB')", 'Abc'],
                ["SentenceCase('aBC')", 'Abc'],
                ["TitleCase('a')", 'A'],
                ["TitleCase('abc dEF')", 'Abc Def'],
                ["TitleCase('abc dEF', 'en-US')", 'Abc Def'],
            ],
        },
        {
            label: 'Logical comparison functions',
            testCases: [
                ['And(1 == 1, 1 < 2, 1 > 2)', false],
                ['And(!true, !!true)', false], //false && true
                ['And(!!true, !!true)', true], //true && true
                ["And(hello != 'world', Bool('true'))", true], //true && true
                ["And(hello == 'world', Bool('true'))", false], //false && true
                ['Or(!Exists(one), !!Exists(one))', true], //false && true
                ['Or(!Exists(one), !Exists(one))', false], //false && false
                ['Greater(one, two)', false, oneTwo],
                ['Greater(one , 0.5) && Less(two , 2.5)', true], // true && true
                ['Greater(one , 0.5) || Less(two , 1.5)', true], //true || false
                ['Greater(5, 2)', true],
                ['Greater(2, 2)', false],
                ['Greater(one, two)', false],
                ['GreaterOrEquals((1 + 2) , (4 - 1))', true],
                ['GreaterOrEquals((2 + 2) , (4 - 1))', true],
                ['GreaterOrEquals(Float(5.5) , Float(4 - 1))', true],
                ['GreaterOrEquals(one, one)', true],
                ['GreaterOrEquals(one, two)', false],
                ['GreaterOrEquals(one, one)', true, one],
                ['GreaterOrEquals(one, two)', false, oneTwo],
                ['Less(5, 2)', false],
                ['Less(2, 2)', false],
                ['Less(one, two)', true],
                ['Less(one, two)', true, oneTwo],
                ["Less('abc', 'xyz')", true],
                ['LessOrEquals(one, one)', true, ['one']],
                ['LessOrEquals(one, two)', true, oneTwo],
                ['LessOrEquals(one, one)', true],
                ['LessOrEquals(one, two)', true],
                ['LessOrEquals((1 + 2) , (4 - 1))', true],
                ['LessOrEquals((2 + 2) , (4 - 1))', false],
                ['LessOrEquals(Float(5.5) , Float(4 - 1))', false],
                ['LessOrEquals(one, one)', true],
                ['LessOrEquals(one, two)', true],
                ["Equals(hello, 'hello')", true],
                ['Equals(bag.index, 3)', true],
                ['Equals(Min(CreateArray(1,2,3,4), 5.0), 1.0)', true],
                ['Equals(Max(CreateArray(1,2,3,4), 5.0), 5)', true],
                ['Equals(bag.index, 2)', false],
                ["Equals(hello == 'world', Bool('true'))", false],
                ["Equals(hello == 'world', Bool(0))", true],
                ["Equals(hello == 'world', Bool(1))", false],
                ["If(!Exists(one), 'r1', 'r2')", 'r2'],
                ["If(!!Exists(one), 'r1', 'r2')", 'r1'],
                ["If(0, 'r1', 'r2')", 'r1'],
                ["If(Bool('true'), 'r1', 'r2')", 'r1'],
                ["If(istrue, 'r1', 'r2')", 'r1'], // true
                ['Exists(one)', true],
                ['Exists(xxx)', false],
                ['Exists(one.xxx)', false],
                ['Not(one != null)', false],
                ['Not(Not(one != null))', true],
                ['Not(false)', true],
                ['Not(one == 1.0)', false, ['one']],
                ['Not(Not(one == 1.0))', true, ['one']],
                ['Not(false)', true],
                ['And(one > 0.5, two < 2.5)', true, oneTwo],
                ['And(Float(5.5), Float(0.0))', true],
                ['And(hello, "hello")', true],
                ['Or(items, (2 + 2) <= (4 - 1))', true], // true || false
                ['Or(0, false)', true], // true || false
                ['Not(hello)', false], // false'Not(10)', false],
                ['Not(0)', false],
                ["If(hello, 'r1', 'r2')", 'r1'],
                ["If(null, 'r1', 'r2')", 'r2'],
                ["If(hello * 5, 'r1', 'r2')", 'r2'],
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
                ["Float('10.333')", 10.333],
                ["Float('10')", 10.0],
                ["Int('10')", 10],
                ['Int(ticks)/100000000', 6372436242],
                ["String('str')", 'str'],
                ["String('str\"')", 'str"'],
                ['String(one)', '1'], //ts-->1, C#-->1.0
                ['String(Bool(1))', 'true'],
                ['String(bag.set)', '{"four":4}'], // ts-->"{\"four\":4}", C# --> "{\"four\":4.0}"
                ['Bool(1)', true],
                ['Bool(0)', false],
                ['Bool(null)', false],
                ['Bool(hello * 5)', false],
                ["Bool('false')", true], // we make it true, because it is not empty
                ["Bool('hi')", true],
                ['[1,2,3]', [1, 2, 3]],
                ['[1,2,3, [4,5]]', [1, 2, 3, [4, 5]]],
                ['"[1,2,3]"', '[1,2,3]'],
                ["[1, Bool(0), String(Bool(1)), Float('10')]", [1, false, 'true', 10.0]],
                ["['a', 'b[]', 'c[][][]'][1]", 'b[]'],
                ["['a', ['b', 'c']][1][0]", 'b'],
                ['Union(["a", "b", "c"], ["d", ["e", "f"], "g"][1])', ['a', 'b', 'c', 'e', 'f']],
                ['Union(["a", "b", "c"], ["d", ["e", "f"], "g"][1])[1]', 'b'],
                ["CreateArray('h', 'e', 'l', 'l', 'o')", ['h', 'e', 'l', 'l', 'o']],
                ['CreateArray()', []],
                ['[]', []],
                ["CreateArray(1, Bool(0), String(Bool(1)), Float('10'))", [1, false, 'true', 10.0]],
                ['Binary(hello)', new Uint8Array([104, 101, 108, 108, 111])],
                ['DataUri(hello)', 'data:text/plain;charset=utf-8;base64,aGVsbG8='],
                ['Count(Binary(hello))', 5],
                ['String(Binary(hello))', 'hello'],
                [
                    'DataUriToBinary(DataUri(hello))',
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
                ['DataUriToString(DataUri(hello))', 'hello'],
                ["UriComponentToString('http%3A%2F%2Fcontoso.com')", 'http://contoso.com'],
                ['Base64(hello)', 'aGVsbG8='],
                ['Base64(byteArr)', 'AwUBDA=='],
                ['Base64ToBinary(Base64(byteArr))', new Uint8Array([3, 5, 1, 12])],
                ['Base64(Base64ToBinary("AwUBDA=="))', 'AwUBDA=='],
                ['Base64ToString(Base64(hello))', 'hello'],
                ['DataUriToBinary(Base64(hello))', new Uint8Array([97, 71, 86, 115, 98, 71, 56, 61])],
                ["UriComponent('http://contoso.com')", 'http%3A%2F%2Fcontoso.com'],
                ['{a: 1, b: newExpr}.b', 'new land'],
                ['FormatNumber(20.0000, 2)', '20.00'],
                ['FormatNumber(12.123, 2)', '12.12'],
                ['FormatNumber(1.555, 2)', '1.56'],
                ['FormatNumber(12.123, 4)', '12.1230'],
                ['FormatNumber(12000.3, 4, "fr-FR")', '12\u00a0000,3000'],
                ['FormatNumber(12000.3, 4, "de-DE")', '12.000,3000'],
                ['JsonStringify(Json(\'{"a":"b"}\'))', '{"a":"b"}'],
                ["JsonStringify('a')", '"a"'],
                ['JsonStringify(null)', 'null'],
                ['JsonStringify(undefined)', undefined],
                ['JsonStringify({a:"b"})', '{"a":"b"}'],
            ],
        },
        {
            label: 'Math functions',
            testCases: [
                ['Add(1, 2, 3)', 6],
                ['Add(1, 2)', 3],
                ['Add(1.0, 2.0)', 3.0],
                ['Add(Mul(1, 2), 3)', 5],
                ['Max(Mul(1, 2), 5) ', 5],
                ['Max(CreateArray(1,2,3,4), 5.0) ', 5.0],
                ['Max(CreateArray(1,2,3,4)) ', 4],
                ['Max(5)', 5],
                ['Max(4, 5) ', 5],
                ['Min(Mul(1, 2), 5) ', 2],
                ['Min(4, 5) ', 4],
                ['Min(4)', 4],
                ['Min(1.0, two) + Max(one, 2.0)', 3.0, oneTwo],
                ['Min(CreateArray(1,2,3,4)) ', 1],
                ['Min(CreateArray(1,2,3,4), 5.0) ', 1],
                ['Sub(2, 1)', 1],
                ['Sub(2, 1, 1)', 0],
                ['Sub(2.0, 0.5)', 1.5],
                ['Mul(2, 5)', 10],
                ['Mul(2, 5, 2)', 20],
                ['Div(Mul(2, 5), 2)', 5],
                ['Div(5, 2)', 2],
                ['Div(5, 2, 2)', 1],
                ['Div(11.2, 2)', 5.6],
                ['Exp(2,2)', 4.0],
                ['Mod(5,2)', 1],
                ['Rand(1, 2)', 1],
                ['Rand(2, 3)', 2],
                ['Floor(3.51)', 3],
                ['Floor(4.00)', 4],
                ['Ceiling(3.51)', 4],
                ['Ceiling(4.00)', 4],
                ['Round(3.51)', 4],
                ['Round(3.55, 1)', 3.6],
                ['Round(3.12134, 3)', 3.121],
                ['Abs(3.12134)', 3.12134],
                ['Abs(-3.12134)', 3.12134],
                ['Abs(0)', 0],
                ['Sqrt(9)', 3],
                ['Sqrt(0)', 0],
            ],
        },
        // All the timestamp strings passed in must be in ISO Format of YYYY-MM-DDTHH:mm:ss.sssZ
        // Otherwise exceptions will be thrown out
        // All the output timestamp strings are in ISO Format of YYYY-MM-DDTHH:mm:ss.sssZ
        // Init DateTime: 2018-03-15T13:00:00:111Z
        {
            label: 'Date and time functions',
            testCases: [
                ["IsDefinite('helloworld')", false],
                ["IsDefinite('2012-12-21')", true],
                ["IsDefinite('xxxx-12-21')", false],
                ['IsDefinite(validFullDateTimex)', true],
                ['IsDefinite(invalidFullDateTimex)', false],
                ['IsTime(validHourTimex)', true],
                ['IsTime(invalidHourTimex)', false],
                ["IsDuration('PT30M')", true],
                ["IsDuration('2012-12-21T12:30')", false],
                ["IsDate('PT30M')", false],
                ["IsDate('2012-12-21T12:30')", true],
                ["IsTimeRange('PT30M')", false],
                ['IsTimeRange(validTimeRange)', true],
                ["IsDateRange('PT30M')", false],
                ["IsDateRange('2012-02')", true],
                ["IsPresent('PT30M')", false],
                ['IsPresent(validNow)', true],
                ['AddDays(timestamp, 1)', '2018-03-16T13:00:00.111Z'],
                ["AddDays(timestamp, 1,'MM-dd-yy')", '03-16-18'],
                ["AddDays(timestamp, 1,'MM/dd/yy', 'es-ES')", '03/16/18'],
                ["AddDays(timestamp, 1,'', 'es-ES')", '2018-03-16T13:00:00.111Z'],
                ['AddHours(timestamp, 1)', '2018-03-15T14:00:00.111Z'],
                ["AddHours(timestamp, 1, '', 'fr-FR')", '2018-03-15T14:00:00.111Z'],
                ["AddHours(timestamp, 1,'MM-dd-yy hh-mm')", '03-15-18 02-00'],
                ['AddMinutes(timestamp, 1)', '2018-03-15T13:01:00.111Z'],
                ["AddMinutes(timestamp, 1, 'MM-dd-yy hh-mm')", '03-15-18 01-01'],
                ["AddMinutes(timestamp, 1, 'MM-dd-yy hh-mm', 'fr-FR')", '03-15-18 01-01'],
                ['AddSeconds(timestamp, 1)', '2018-03-15T13:00:01.111Z'],
                ["AddSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss')", '03-15-18 01-00-01'],
                ["AddSeconds(timestamp, 1, 'MM-dd-yy hh-mm-ss', 'fr-FR')", '03-15-18 01-00-01'],
                ['DayOfMonth(timestamp)', 15],
                ['DayOfWeek(timestamp)', 4], //Thursday
                ['DayOfYear(timestamp)', 74],
                ['Month(timestamp)', 3],
                ['Date(timestamp)', '3/15/2018'], //Default. TODO
                ['Year(timestamp)', 2018],
                ['Length(UtcNow())', 24],
                ["FormatDateTime(notISOTimestamp, 'dd/MM/yyy')", '15/03/2018'],
                ["FormatDateTime(notISOTimestamp, 'dd/MM/yyy', 'fr-FR')", '15/03/2018'],
                ["FormatDateTime(notISOTimestamp, 'dd%MM%yyy')", '15032018'],
                ['FormatDateTime(notISOTimestamp)', '2018-03-15T13:00:00.000Z'],
                ["FormatDateTime(notISOTimestamp, 'MM-dd-yy')", '03-15-18'],
                ["FormatDateTime(notISOTimestamp, 'ddd')", 'Thu'],
                ["FormatDateTime(notISOTimestamp, 'dddd')", 'Thursday'],
                ["FormatDateTime('2018-03-15T00:00:00.000Z', 'yyyy')", '2018'],
                ["FormatDateTime('2018-03-15T00:00:00.000Z', 'yyyy-MM-dd-\\\\d')", '2018-03-15-4'],
                ["FormatDateTime('2018-03-15T00:00:00.010Z', 'FFF')", '010'],
                ["FormatDateTime('2018-03-15T00:00:00.010Z', 'FFF', 'fr-FR')", '010'],
                ["FormatDateTime('2018-03-15T09:00:00.010', 'hh')", '09'],
                ["FormatDateTime('2018-03-15T09:00:00.010', 'MMMM')", 'March'],
                ["FormatDateTime('2018-03-15T09:00:00.010', 'MMM')", 'Mar'],
                ["Length(FormatDateTime('2018-03-15T09:00:00.010', 'z'))", 5],
                ["Length(FormatDateTime('2018-03-15T09:00:00.010', 'zzz'))", 6],
                ["FormatDateTime(FormatDateTime('2018-03-15T00:00:00.000Z', 'o'), 'yyyy')", '2018'],
                ["FormatDateTime('2018-03-15T00:00:00.123Z', 'fff')", '123'],
                ["FormatDateTime('2018-03-15T11:00:00.123', 't')", 'AM'],
                ["FormatDateTime('2018-03-15T11:00:00.123', 'tt')", 'AM'],
                ["FormatDateTime('2018-03-15')", '2018-03-15T00:00:00.000Z'],
                ['FormatDateTime(timestampObj)', '2018-03-15T13:00:00.000Z'],
                ['FormatEpoch(unixTimestamp)', '2018-03-15T13:00:00.000Z'],
                ["FormatEpoch(unixTimestamp, 'MM-dd', 'es-ES')", '03-15'],
                ['FormatEpoch(unixTimestampFraction)', '2018-03-15T13:00:00.500Z'],
                ['FormatTicks(ticks)', '2020-05-06T11:47:00.000Z'],
                ["FormatTicks(ticks, '', 'en-US')", '2020-05-06T11:47:00.000Z'],
                ["SubtractFromTime(timestamp, 1, 'Year')", '2017-03-15T13:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Year', '', 'fr-FR')", '2017-03-15T13:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Month')", '2018-02-15T13:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Week')", '2018-03-08T13:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Day')", '2018-03-14T13:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Hour')", '2018-03-15T12:00:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Minute')", '2018-03-15T12:59:00.111Z'],
                ["SubtractFromTime(timestamp, 1, 'Second')", '2018-03-15T12:59:59.111Z'],
                ['DateReadBack(timestamp, AddDays(timestamp, 1))', 'tomorrow'],
                ['DateReadBack(AddDays(timestamp, 1),timestamp)', 'yesterday'],
                ["GetTimeOfDay(ConvertFromUTC('2018-03-15T11:00:00.000Z', 'W. Europe Standard Time'))", 'noon'],
                ["GetTimeOfDay('2018-03-15T00:00:00.0000000')", 'midnight'],
                ["GetTimeOfDay('2018-03-15T00:00:00.000Z')", 'midnight'],
                ["GetTimeOfDay('2018-03-15T08:00:00.000Z')", 'morning'],
                ["GetTimeOfDay('2018-03-15T12:00:00.000Z')", 'noon'],
                ["GetTimeOfDay('2018-03-15T13:00:00.000Z')", 'afternoon'],
                ["GetTimeOfDay('2018-03-15T18:00:00.000Z')", 'evening'],
                ["GetTimeOfDay('2018-03-15T22:00:00.000Z')", 'evening'],
                ["GetTimeOfDay('2018-03-15T23:00:00.000Z')", 'night'],
                ["Length(GetPastTime(1, 'Year'))", 24],
                ["Length(GetFutureTime(1, 'Year'))", 24],
                ["AddToTime('2018-01-01T08:00:00.000Z', 1, 'Day')", '2018-01-02T08:00:00.000Z'],
                ["AddToTime('2018-01-01T08:00:00.000Z', Sub(3,1), 'Week')", '2018-01-15T08:00:00.000Z'],
                ["AddToTime('2018-01-01T08:00:00.000Z', 1, 'Month', 'MM-DD-YY')", '02-01-18'],
                ["AddToTime('2018-01-01T08:00:00.000Z', 1, 'Month', 'MM-DD-YY', 'fr-FR')", '02-01-18'],
                ["ConvertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time')", '2018-02-01T18:00:00.0000000'],
                ["ConvertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time', 'MM-DD-YY')", '02-01-18'],
                ["ConvertFromUTC('2018-02-02T02:00:00.000Z', 'Pacific Standard Time', 'MM-DD-YY', 'fr-FR')", '02-01-18'],
                ["ConvertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time')", '2018-01-02T02:00:00.000Z'],
                ["ConvertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time', 'MM-DD-YY')", '01-02-18'],
                ["ConvertToUTC('2018-01-01T18:00:00.000', 'Pacific Standard Time', 'MM-DD-YY', 'en-GB')", '01-02-18'],
                ["StartOfDay('2018-03-15T13:30:30.000Z')", '2018-03-15T00:00:00.000Z'],
                ["StartOfDay('2018-03-15T13:30:30.000Z', '', 'fr-FR')", '2018-03-15T00:00:00.000Z'],
                ["StartOfHour('2018-03-15T13:30:30.000Z')", '2018-03-15T13:00:00.000Z'],
                ["StartOfHour('2018-03-15T13:30:30.000Z', '', 'es-ES')", '2018-03-15T13:00:00.000Z'],
                ["StartOfMonth('2018-03-15T13:30:30.000Z')", '2018-03-01T00:00:00.000Z'],
                ["StartOfMonth('2018-03-15T13:30:30.000Z', '', 'en-US')", '2018-03-01T00:00:00.000Z'],
                ["Ticks('2018-01-01T08:00:00.000Z')", bigInt('636503904000000000')],
                ['DateTimeDiff("2019-01-01T08:00:00.000Z","2018-01-01T08:00:00.000Z")', 315360000000000],
                ['DateTimeDiff("2017-01-01T08:00:00.000Z","2018-01-01T08:00:00.000Z")', -315360000000000],
                ['TicksToDays(2193385800000000)', 2538.6409722222224],
                ['TicksToHours(2193385800000000)', 60927.383333333331],
                ['TicksToMinutes(2193385811100000)', 3655643.0185],
                ['Resolve("T14")', '14:00:00'],
                ['Resolve("T14:20")', '14:20:00'],
                ['Resolve("T14:20:30")', '14:20:30'],
                ['Resolve("2020-12-20")', '2020-12-20'],
                ['Resolve("2020-12-20T14")', '2020-12-20 14:00:00'],
                ['Resolve("2020-12-20T14:20")', '2020-12-20 14:20:00'],
                ['Resolve("2020-12-20T14:20:30")', '2020-12-20 14:20:30'],
            ],
        },
        {
            label: 'URI parsing functions',
            testCases: [
                ["UriHost('https://www.localhost.com:8080')", 'www.localhost.com'],
                ["UriPath('http://www.contoso.com/catalog/shownew.htm?date=today')", '/catalog/shownew.htm'],
                [
                    "UriPathAndQuery('http://www.contoso.com/catalog/shownew.htm?date=today')",
                    '/catalog/shownew.htm?date=today',
                ],
                ["UriPort('http://www.localhost:8080')", 8080],
                ["UriQuery('http://www.contoso.com/catalog/shownew.htm?date=today')", '?date=today'],
                ["UriScheme('http://www.contoso.com/catalog/shownew.htm?date=today')", 'http'],
            ],
        },
        {
            label: 'Collection functions',
            testCases: [
                ['CreateArray(hello)', ['hello']],
                ['Sum(CreateArray(1, 2))', 3],
                ['Sum(CreateArray(one, two, 3))', 6.0],
                ['Average(CreateArray(1, 2))', 1.5],
                ['Average(CreateArray(one, two, 3))', 2.0],
                ["Contains('hello world', 'hello')", true],
                ["Contains('hello world', 'hellow')", false],
                ["Contains(items, 'zero')", true],
                ["Contains(items, 'hi')", false],
                ["Contains(bag, 'three')", true],
                ["Contains(bag, 'xxx')", false],
                ['Contains([{ a: 1, b: { c: 2} }, { b: 2}], { a: 1, b: { c: 2} })', true],
                ['Concat(null, [1, 2], null)', [1, 2]],
                ['Concat(CreateArray(1, 2), CreateArray(3, 4))', [1, 2, 3, 4]],
                ["Concat(['a', 'b'], ['b', 'c'], ['c', 'd'])", ['a', 'b', 'b', 'c', 'c', 'd']],
                ["Count(Split(hello,'e'))", 2],
                ["Count(CreateArray('h', 'e', 'l', 'l', 'o'))", 5],
                ["Empty('')", true],
                ['Reverse(Split(hello,"e"))', ['llo', 'h']],
                ['Reverse(CreateArray("h", "e", "l", "l", "o"))', ['o', 'l', 'l', 'e', 'h']],
                ["Empty('a')", false],
                ['Empty(bag)', false],
                ['Empty(items)', false],
                ['Empty(null)', true],
                ['Empty(undefined)', true],
                ['Empty(notexist)', true],
                ['First(items)', 'zero'],
                ["First('hello')", 'h'],
                ['First(CreateArray(0, 1, 2))', 0],
                ['First(1)', undefined],
                ['First(nestedItems).x', 1, ['nestedItems']],
                ['First(Where(IndicesAndValues(items), elt, elt.index > 1)).value', 'two'],
                ['First(Where(IndicesAndValues(bag), elt, elt.index == "three")).value', 3.0],
                ["Join(items,',')", 'zero,one,two'],
                ["Join(CreateArray('a', 'b', 'c'), '.')", 'a.b.c'],
                ["Join(CreateArray('a', 'b', 'c'), ',', ' and ')", 'a,b and c'],
                ["Join(ForEach(items, item, item), ',')", 'zero,one,two'],
                ["Join(ForEach(nestedItems, i, i.x + First(nestedItems).x), ',')", '2,3,4', ['nestedItems']],
                ["Join(ForEach(items, item, Concat(item, String(Count(items)))), ',')", 'zero3,one3,two3', ['items']],
                ['Join(ForEach(doubleNestedItems, items, Join(ForEach(items, item, item.x), ",")), ",")', '1,2,3'],
                [
                    'Join(ForEach(doubleNestedItems, items, Join(ForEach(items, item, Concat(y, String(item.x))), ",")), ",")',
                    'y1,y2,y3',
                ],
                ['Join(ForEach(dialog, item, item.key), ",")', 'x,instance,options,title,subTitle'],
                ['Join(ForEach(dialog, item => item.key), ",")', 'x,instance,options,title,subTitle'],
                ['ForEach(dialog, item, item.value)[2].xxx', 'options'],
                ['ForEach(dialog, item=>item.value)[2].xxx', 'options'],
                ['Join(ForEach(IndicesAndValues(items), item, item.value), ",")', 'zero,one,two'],
                ['Join(ForEach(IndicesAndValues(items), item=>item.value), ",")', 'zero,one,two'],
                ['Count(Where(doubleNestedItems, items, Count(Where(items, item, item.x == 1)) == 1))', 1],
                ['Count(Where(doubleNestedItems, items, Count(Where(items, item, Count(items) == 1)) == 1))', 1],
                ["Join(Select(items, item, item), ',')", 'zero,one,two'],
                ["Join(Select(items, item=>item), ',')", 'zero,one,two'],
                ["Join(Select(nestedItems, i, i.x + First(nestedItems).x), ',')", '2,3,4', ['nestedItems']],
                ["Join(Select(items, item, Concat(item, String(Count(items)))), ',')", 'zero3,one3,two3', ['items']],
                ["Join(Where(items, item, item == 'two'), ',')", 'two'],
                ["Join(Where(items, item => item == 'two'), ',')", 'two'],
                ["Join(ForEach(Where(nestedItems, item, item.x > 1), result, result.x), ',')", '2,3', ['nestedItems']],
                ['String(Where(dialog, item, item.value=="Dialog Title"))', '{"title":"Dialog Title"}'],
                ['Last(items)', 'two'],
                ["Last('hello')", 'o'],
                ['Last(CreateArray(0, 1, 2))', 2],
                ['Last(1)', undefined],
                ["Count(Union(CreateArray('a', 'b')))", 2],
                ["Count(Union(CreateArray('a', 'b'), CreateArray('b', 'c'), CreateArray('b', 'd')))", 4],
                ["Count(Intersection(CreateArray('a', 'b')))", 2],
                ["Count(Intersection(CreateArray('a', 'b'), CreateArray('b', 'c'), CreateArray('b', 'd')))", 1],
                ["Skip(CreateArray('a', 'b', 'c', 'd'), 2)", ['c', 'd']],
                ["Skip(CreateArray('a', 'b', 'c', 'd'), -1)", ['a', 'b', 'c', 'd']],
                ["Skip(CreateArray('a', 'b', 'c', 'd'), 10)", []],
                ['Take(hello, two)', 'he'],
                ["Take(CreateArray('a', 'b', 'c', 'd'), one)", ['a']],
                ["Take(CreateArray('a', 'b', 'c', 'd'), -1)", []],
                ["Take(CreateArray('a', 'b', 'c', 'd'), 10)", ['a', 'b', 'c', 'd']],
                ["SubArray(CreateArray('a', 'b', 'c', 'd'), 1, 3)", ['b', 'c']],
                ["SubArray(CreateArray('a', 'b', 'c', 'd'), 4, 4)", []],
                ["SubArray(CreateArray('a', 'b', 'c', 'd'), 1)", ['b', 'c', 'd']],
                ['Range(1, 4)', [1, 2, 3, 4]],
                ['Range(-1, 3)', [-1, 0, 1]],
                ['SortBy(items)', ['one', 'two', 'zero']],
                ["SortBy(nestedItems, 'x')[0].x", 1],
                ['SortByDescending(items)', ['zero', 'two', 'one']],
                ["SortByDescending(nestedItems, 'x')[0].x", 3],
                [
                    'Flatten(CreateArray(1,CreateArray(2),CreateArray(CreateArray(3, 4), CreateArray(5,6))))',
                    [1, 2, 3, 4, 5, 6],
                ],
                [
                    'Flatten(CreateArray(1,CreateArray(2),CreateArray(CreateArray(3, 4), CreateArray(5,6))), 1)',
                    [1, 2, [3, 4], [5, 6]],
                ],
                ['Unique(CreateArray(1, 5, 1))', [1, 5]],
                ['Any(CreateArray(1, "cool"), item, IsInteger(item))', true],
                ['Any(CreateArray("first", "cool"), item => IsInteger(item))', false],
                ['All(CreateArray(1, "cool"), item, IsInteger(item))', false],
                ['All(CreateArray(1, 2), item => IsInteger(item))', true],
                ['Any(dialog, item, item.key == "title")', true],
                ['Any(dialog, item, IsInteger(item.value))', true],
                ['All(dialog, item, item.key == "title")', false],
                ['All(dialog, item, IsInteger(item.value))', false],
            ],
        },
        {
            label: 'Object manipulation and construction functions',
            testCases: [
                ['{text:"hello"}.text', 'hello'],
                ['{name: user.name}.name', undefined],
                ['{name: user.nickname}.name', 'John'],
                [
                    "String(AddProperty(Json('{\"key1\":\"value1\"}'), 'key2','value2'))",
                    '{"key1":"value1","key2":"value2"}',
                ],
                ['ForEach(items, x, AddProperty({}, "a", x))[0].a', 'zero'],
                ['ForEach(items, x => AddProperty({}, "a", x))[0].a', 'zero'],
                ['String(AddProperty({"key1":"value1"}, \'key2\',\'value2\'))', '{"key1":"value1","key2":"value2"}'],
                ["String(SetProperty(Json('{\"key1\":\"value1\"}'), 'key1','value2'))", '{"key1":"value2"}'],
                ['String(SetProperty({"key1":"value1"}, \'key1\',\'value2\'))', '{"key1":"value2"}'],
                ["String(SetProperty({}, 'key1','value2'))", '{"key1":"value2"}'],
                ["String(SetProperty({}, 'key1','value2{}'))", '{"key1":"value2{}"}'],
                ['String([{a: 1}, {b: 2}, {c: 3}][0])', '{"a":1}'],
                ['String({obj: {"name": "adams"}})', '{"obj":{"name":"adams"}}'],
                [
                    'String({obj: {"name": "adams"}, txt: {utter: "hello"}})',
                    '{"obj":{"name":"adams"},"txt":{"utter":"hello"}}',
                ],
                ['String(RemoveProperty(Json(\'{"key1":"value1","key2":"value2"}\'), \'key2\'))', '{"key1":"value1"}'],
                ["Coalesce(nullObj,'hello',nullObj)", 'hello'],
                ["Coalesce(nullObj, false, 'hello')", false],
                ['JPath(JsonStr, pathStr )', ['Jazz', 'Accord']],
                ["JPath(JsonStr, '.automobiles[0].maker' )", ['Nissan']],
                [
                    'String(Merge(Json1, Json2))',
                    '{"FirstName":"John","LastName":"Smith","Enabled":true,"Roles":["Customer","Admin"]}',
                ],
                [
                    'String(Merge(Json1, Json2, Json3))',
                    '{"FirstName":"John","LastName":"Smith","Enabled":true,"Roles":["Customer","Admin"],"age":36}',
                ],
                ['Merge(callstack[1], callstack[2]).z', 1],
                ['Merge(callstack).z', 1],
                [
                    "String(Merge({k1:'v1'}, [{k2:'v2'}, {k3: 'v3'}], {k4:'v4'}))",
                    '{"k1":"v1","k2":"v2","k3":"v3","k4":"v4"}',
                ],
                [
                    'Xml(\'{"person": {"name": "Sophia Owen", "city": "Seattle"}}\')',
                    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<person>\n  <name>Sophia Owen</name>\n  <city>Seattle</city>\n</person>',
                ],
                ['XPath(xmlStr,"/produce/item/name")', ['<name>Gala</name>', '<name>Honeycrisp</name>']],
                ['XPath(xmlStr,"sum(/produce/item/count)")', 30],
            ],
        },
        {
            label: 'Memory access',
            testCases: [
                ["GetProperty(bag, Concat('na','me'))", 'mybag'],
                ["GetProperty('bag').index", 3],
                ["GetProperty('a:b')", 'stringa:b'],
                ["GetProperty(Concat('he', 'llo'))", 'hello'],
                ['items[2]', 'two', ['items[2]']],
                ['bag.list[bag.index - 2]', 'blue', ['bag.list', 'bag.index']],
                ['items[nestedItems[1].x]', 'two', ['items', 'nestedItems[1].x']],
                ["bag['name']", 'mybag'],
                ["bag[Substring(Concat('na','me','more'), 0, Length('name'))]", 'mybag'],
                ['items[1+1]', 'two'],
                ["GetProperty(undefined, 'p')", undefined],
                ["(GetProperty(undefined, 'p'))[1]", undefined],
            ],
        },
        {
            label: 'regex',
            testCases: [
                ["IsMatch('abc', '^[ab]+$')", false], // simple character classes ([abc]), "+" (one or more)
                ["IsMatch('abb', '^[ab]+$')", true], // simple character classes ([abc])
                ["IsMatch('123', '^[^abc]+$')", true], // complemented character classes ([^abc])
                ["IsMatch('12a', '^[^abc]+$')", false], // complemented character classes ([^abc])
                ["IsMatch('123', '^[^a-z]+$')", true], // complemented character classes ([^a-z])
                ["IsMatch('12a', '^[^a-z]+$')", false], // complemented character classes ([^a-z])
                ["IsMatch('a1', '^[a-z]?[0-9]$')", true], // "?" (zero or one)
                ["IsMatch('1', '^[a-z]?[0-9]$')", true], // "?" (zero or one)
                ["IsMatch('1', '^[a-z]*[0-9]$')", true], // "*" (zero or more)
                ["IsMatch('abc1', '^[a-z]*[0-9]$')", true], // "*" (zero or more)
                ["IsMatch('ab', '^[a-z]{1}$')", false], // "{x}" (exactly x occurrences)
                ["IsMatch('ab', '^[a-z]{1,2}$')", true], // "{x,y}" (at least x, at most y, occurrences)
                ["IsMatch('abc', '^[a-z]{1,}$')", true], // "{x,}" (x occurrences or more)
                ["IsMatch('Name', '^(?i)name$')", true], // "(?i)x" (x ignore case)
                ["IsMatch('FORTUNE', '(?i)fortune|future')", true], // "x|y" (alternation)
                ["IsMatch('FUTURE', '(?i)fortune|future')", true], // "x|y" (alternation)
                ["IsMatch('A', '(?i)fortune|future')", false], // "x|y" (alternation)
                ["IsMatch('abacaxc', 'ab.+?c')", true], // "+?" (lazy versions)
                ["IsMatch('abacaxc', 'ab.*?c')", true], // "*?" (lazy versions)
                ["IsMatch('abacaxc', 'ab.??c')", true], // "??" (lazy versions)
                ["IsMatch('12abc34', '([0-9]+)([a-z]+)([0-9]+)')", true], // "(...)" (simple group)
                ["IsMatch('12abc', '([0-9]+)([a-z]+)([0-9]+)')", false], // "(...)" (simple group)
                ['IsMatch("a", "\\\\w{1}")', true], // "\w" (match [a-zA-Z0-9_])
                ['IsMatch("1", "\\\\d{1}")', true], // "\d" (match [0-9])
                ['IsMatch("12.5", "[0-9]+(\\\\.5)")', true], // "\." (match .)
                ['IsMatch("12x5", "[0-9]+(\\\\.5)")', false], // "\." (match .)
            ],
        },
        {
            label: 'Type Checking',
            testCases: [
                ['IsString(hello)', true],
                ['IsString("Monday")', true],
                ['IsString(one)', false],
                ['IsInteger(one)', true],
                ['IsInteger(1)', true],
                ['IsInteger(1.23)', false],
                ['IsFloat(one)', false],
                ['IsFloat(1)', false],
                ['IsFloat(1.23)', true],
                ['IsArray(hello)', false],
                ['IsArray(CreateArray(1,2,3))', true],
                ['IsObject(hello)', false],
                ['IsObject(dialog)', true],
                ['IsBoolean(hello)', false],
                ['IsBoolean(1 == one)', true],
                ['IsDateTime(hello)', false],
                ['IsDateTime(timestamp)', true],
            ],
        },
        {
            label: 'StringOrValue',
            testCases: [
                ['StringOrValue("${one}")', 1.0],
                ['StringOrValue("${one} item")', '1 item'],
            ],
        },
        {
            label: 'Empty expression',
            testCases: [['', '']],
        },
        {
            label: 'SetPathToValue',
            testCases: [
                ['SetPathToValue(path.simple, 3) + path.simple', 6],
                ['SetPathToValue(path.simple, 5) + path.simple', 10],
                ['SetPathToValue(path.array[0], 7) + path.array[0]', 14],
                ['SetPathToValue(path.array[1], 9) + path.array[1]', 18],
                ['SetPathToValue(path.x, null)', null],
            ],
        },
    ];

    const mockedTimeTestCases = [
        ["UtcNow('MM-DD-YY HH', 'de-DE')", '08-01-20 00'],
        ["UtcNow('', 'de-DE')", '2020-08-01T00:12:20.000Z'],
        ["UtcNow('MM-DD-YY HH')", '08-01-20 00'],
        ["GetPastTime(1, 'Year', 'MM-dd-yy', 'de-DE')", '08-01-19'],
        ["GetPastTime(1, 'Year', '', 'de-DE')", '2019-08-01T00:12:20.000Z'],
        ["GetPastTime(1, 'Year', 'MM-dd-yy')", '08-01-19'],
        ["GetPastTime(1, 'Month', 'MM-dd-yy')", '07-01-20'],
        ["GetPastTime(1, 'Week', 'MM-dd-yy')", '07-25-20'],
        ["GetPastTime(1, 'Day', 'MM-dd-yy')", '07-31-20'],
        ["GetFutureTime(1, 'Year', 'MM-dd-yy')", '08-01-21'],
        ["GetFutureTime(1, 'Year', 'MM-dd-yy', 'de-DE')", '08-01-21'],
        ["GetFutureTime(1, 'Year', '', 'ru-RU')", '2021-08-01T00:12:20.000Z'],
        ["GetFutureTime(1, 'Month', 'MM-dd-yy')", '09-01-20'],
        ["GetFutureTime(1, 'Week', 'MM-dd-yy')", '08-08-20'],
        ["GetFutureTime(1, 'Day', 'MM-dd-yy')", '08-02-20'],
        ["GetPreviousViableDate('XXXX-07-10')", '2020-07-10'],
        ["GetPreviousViableDate('XXXX-08-10')", '2019-08-10'],
        ["GetPreviousViableDate('XXXX-07-10', 'Asia/Shanghai')", '2020-07-10'],
        ["GetPreviousViableDate('XXXX-02-29')", '2020-02-29'],
        ["GetPreviousViableDate('XXXX-02-29', 'Pacific Standard Time')", '2020-02-29'],
        ["GetNextViableDate('XXXX-07-10')", '2021-07-10'],
        ["GetNextViableDate('XXXX-08-10')", '2020-08-10'],
        ["GetNextViableDate('XXXX-07-10', 'Europe/London')", '2021-07-10'],
        ["GetNextViableDate('XXXX-02-29')", '2024-02-29'],
        ["GetNextViableDate('XXXX-02-29', 'America/Los_Angeles')", '2024-02-29'],
        ["GetNextViableTime('TXX:40:20')", 'T00:40:20'],
        ["GetNextViableTime('TXX:40:20', 'Asia/Tokyo')", 'T09:40:20'],
        ["GetNextViableTime('TXX:05:10')", 'T01:05:10'],
        ["GetNextViableTime('TXX:05:10', 'Europe/Paris')", 'T03:05:10'],
        ["GetPreviousViableTime('TXX:40:20')", 'T23:40:20'],
        ["GetPreviousViableTime('TXX:40:20', 'Eastern Standard Time')", 'T19:40:20'],
        ["GetPreviousViableTime('TXX:05:10')", 'T00:05:10'],
        ["GetPreviousViableTime('TXX:05:10', 'Central Standard Time')", 'T19:05:10'],
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
        // To evaluate expressions like "GetPastTime", we need to freeze the system clock so that every call to
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
            exp = Expression.parse('Json(x).b');
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

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('If(food, 1, 2)');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, 2);

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('food && true');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, false);

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('food || true');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, true);

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('food == "food is undefined"');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, false);

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('Not(food)');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, true);

            // in Bool(ean context, substitution is not allowed, use raw value instead
            exp = Expression.parse('Bool(food)');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, false);

            // Concat is evaluated in Bool(ean context also, use raw value
            exp = Expression.parse('If(Concat(food, "beta"), 1, 2)');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert.strictEqual(value, 1);

            // index is not Bool(ean context, but it also requires raw value
            exp = Expression.parse('a[b]');
            ({ value, error } = exp.tryEvaluate(mockMemory, options));
            assert(error !== undefined);
        });

        it('Test NumericEvaluator', function () {
            const functionName = 'Math.Sum';
            Expression.functions.add(functionName, new NumericEvaluator(functionName, (args) => args[0] + args[1]));

            const { value, error } = Expression.parse('Math.Sum(1, 2, 3)').tryEvaluate(undefined);
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
