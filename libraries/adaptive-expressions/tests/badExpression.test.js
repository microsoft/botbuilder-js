/* eslint-disable @typescript-eslint/no-var-requires */
const {ExpressionParser} = require('../');
const assert = require('assert');

const invalidExpressions = [
    'hello world',
    'a+',
    'a+b*',
    'fun(a, b, c',
    'func(A,b,b,)',
    '"hello\'',
    'user.lists.{dialog.listName}',
    '\'hello\'.length()',
    '`hi` world'
];

const badExpressions =
    // General test
    ['func()', // no such func
        'length(func())', //no such function in children
        'a.func()', // no such function
        '(1.foreach)()',// error func
        '(\'str\'.foreach)()',// error func
        '\'hello\'.length()',// not support currently

        // Operators test
        'istrue + 1', // params should be number or string
        'one + two + nullObj', // Operator '+' or add cannot be applied to operands of type 'number' and null object.
        '\'1\' * 2', // params should be number
        '\'1\' - 2', // params should be number
        '\'1\' / 2', // params should be number
        '\'1\' % 2', // params should be number
        '\'1\' ^ 2', // params should be number
        '1/0', // can not divide 0

        // String functions test
        'length(one, 1)', // length can only have one param
        'length(replace(hello))', //children func error
        'replace(hello)', // replace need three parameters
        'replace(one, \'l\', \'k\')', // replace only accept string parameter
        'replace(\'hi\', 1, \'k\')', // replace only accept string parameter
        'replace(\'hi\', \'l\', 1)', // replace only accept string parameter
        'replace(\'hi\', nullObj, \'k\')', // replace oldValue must string length not less than 1
        'replaceIgnoreCase(hello)', // replaceIgnoreCase need three parameters
        'replaceIgnoreCase(\'HI\', nullObj, \'k\')', // replaceIgnoreCase oldValue must string length not less than 1
        'replaceIgnoreCase(one, \'l\', \'k\')', // replaceIgnoreCase only accept string parameter
        'replaceIgnoreCase(\'hi\', 1, \'k\')', // replaceIgnoreCase only accept string parameter
        'replaceIgnoreCase(\'hi\', \'l\', 1)', // replaceIgnoreCase only accept string parameter
        'split(hello, \'l\',  \'l\')', // split need one or two parameters
        'split(one, \'l\')', // split only accept string parameter
        'split(hello, 1)', // split only accept string parameter
        'substring(hello, 0.5)', // the second parameter of substring must be integer
        'substring(two, 0)', // the first parameter of substring must be string or null
        'substring(hello, 10)', // the start index is out of the range of the string length
        'substring(hello, 0, hello)', // length is not integer
        'substring(hello, 0, \'hello\')', // length is not integer
        'substring(hello, 0, 10)', // the length of substring is out of the range of the original string
        'toLower(one)', // the parameter of toLower must be string
        'toLower(\'hi\', 1)', // should have 1 param
        'toUpper(one)', // the parameter of toUpper must be string
        'toUpper(\'hi\', 1)', // should have 1 param
        'trim(one)', // the parameter of trim must be string
        'trim(\'hi\', 1)', // should have 1 param
        'endsWith(hello, one)',// should have string params
        'endsWith(one, hello)',// should have string params
        'endsWith(hello)',// should have two params
        'startsWith(hello, one)',// should have string params
        'startsWith(one, hello)',// should have string params
        'startsWith(hello)',// should have two params
        'countWord(hello, 1)',// should have one param
        'countWord(one)',// should have string param
        'countWord(one)',// should have string param
        'addOrdinal(one + 0.5)',// should have Integer param
        'addOrdinal(one, two)',// should have one param
        'newGuid(one)',// should have no parameters
        'EOL(one)',// should have no parameters
        'indexOf(hello)',// should have two parameters
        'indexOf(hello, world, one)', // should have two parameters
        'indexOf(hello, one)', // second parameter should be string
        'indexOf(one, hello)', // first parameter should be list or string
        'lastIndexOf(hello)',// should have two parameters
        'lastIndexOf(hello, world, one)', // should have two parameters
        'lastIndexOf(hello, one)', // second parameter should be string
        'lastIndexOf(one, hello)', // first parameter should be list or string
        'sentenceCase(hello, hello)', // should have one parameters
        'sentenceCase(one)', // first parameter should be string
        'titleCase(hello, hello)', // should have one parameters
        'titleCase(one)', // first parameter should be string

        // Logical comparison functions test
        'greater(one, hello)', // string and integer are not comparable
        'greater(one)', // greater need two parameters
        'greaterOrEquals(one, hello)', // string and integer are not comparable
        'greaterOrEquals(one)', // function need two parameters
        'less(false, true)', //string or number parameters are needed
        'less(one, hello)', // string and integer are not comparable
        'less(one)', // function need two parameters
        'lessOrEquals(one, hello)', // string and integer are not comparable
        'lessOrEquals(one)', // function need two parameters
        'equals(one)', // equals must accept two parameters
        'exists(1, 2)', // function need one parameter
        //"if(!exists(one), one, hello)", // the second and third parameters of if must the same type
        'not(false, one)', // function need one parameter

        // Conversion functions test
        'float(hello)', // param shoud be float format string
        'float(hello, 1)', // shold have 1 param
        'int(hello)', // param shoud be int format string
        'int(1, 1)', // shold have 1 param
        'string(hello, 1)', // shold have 1 param
        'bool(false, 1)', // shold have 1 param
        'array()', // should have 1 param
        'array(hello, world)', // should have 1 param
        'array(false)', // param should be string
        'binary()', // should have 1 param
        'binary(hello, world)', // should have 1 param
        'binary(false)', // param should be string
        'dataUri()', // should have 1 param
        'dataUri(hello, world)', // should have 1 param
        'dataUri(false)', // param should be string
        'dataUriToBinary()', // should have 1 param
        'dataUriToBinary(hello, world)', // should have 1 param
        'dataUriToBinary(false)', // param should be string
        'dataUriToString()', // should have 1 param
        'dataUriToString(hello, world)', // should have 1 param
        'dataUriToString(false)', // param should be string
        'uriComponentToString()', // should have 1 param
        'uriComponentToString(hello, world)', // should have 1 param
        'uriComponentToString(false)', // param should be string
        'base64()', // should have 1 param
        'base64(hello, world)', // should have 1 param
        'base64ToBinary()', // should have 1 param
        'base64ToBinary(hello, world)', // should have 1 param
        'base64ToBinary(false)', // param should be string
        'base64ToString()', // should have 1 param
        'base64ToString(hello, world)', // should have 1 param
        'base64ToString(false)', // param should be string
        'formatNumber(1,2,3)', // invalid locale type
        'formatNumber(hello,2.0)', // the first parameter should be a number
        'uriComponent()', // should have 1 param
        'uriComponent(hello, world)', // should have 1 param
        'uriComponent(false)', // param should be string

        // Math functions test
        'max(hello, one)', // param should be number
        'max()', // function need 1 or more than 1 parameters
        'min(hello, one)', // param should be number
        'min()', // function need 1 or more than 1 parameters
        'add(istrue, 2)', // param should be number or string
        'add()', // arg count doesn't match
        'add(one)', // add function need two or more parameters
        'sub(hello, 2)', // param should be number
        'sub()', // arg count doesn't match
        'sub(five, six)', // no such variables
        'sub(one)', // sub function need two or more parameters
        'mul(hello, one)', // param should be number
        'mul(one)', // mul function need two or more parameters
        'div(one, 0)', // one cannot be divided by zero
        'div(one)', // div function need two or more parameters
        'div(hello, one)', // string hello cannot be divided
        'exp(2, hello)', // exp cannot accept parameter of string
        'mod(1, 0)', // mod cannot accept zero as the second parameter
        'mod(5.5, 2)', //  param should be integer
        'mod(5, 2.1)', //  param should be integer
        'mod(5, 2.1 ,3)', // need two params
        'rand(5, 6.1)', //  param should be integer
        'rand(5)', // need two params
        'rand(7, 6)', //  minvalue cannot be greater than maxValue
        'sum(items)', // should have number parameters
        'range(one)', // should have two params
        'range(one, two, three)', // should have two params
        'range(one, hello)', // params should be integer
        'range(hello, one)', // params should be integer
        'range(one, 0)', // second param should be more than 0
        'floor(hello)', // should have a numeric parameter
        'floor(1.2, 2)', // should have only 1 numeric parameter
        'ceiling(hello)', // should have a numeric parameter
        'ceiling(1.2, 2)', // should have only 1 numeric parameter
        'round(hello)', // should have numeric parameters
        'round(1.333, hello)', // should have numeric parameters
        'ceiling(1.2, 2.1)', // the second parameter should be integer
        'ceiling(1.2, -2)', // the second parameter should be integer not less than 0
        'ceiling(1.2, 16)', // the second parameter should be integer not greater than 15
        'ceiling(1.2, 12, 7)', // should have one or two numeric parameters

        // Date and time function test
        'isDefinite(12345)', // should hava a string or a TimexProperty parameter
        'isDefinite(\'world\', 123445)', // should have only one parameter
        'isTime(123445)', // should hava a string or a TimexProperty parameter
        'isTime(\'world\', 123445)', // should have only one parameter
        'isDuration(123445)', // should hava a string or a TimexProperty parameter
        'isDuration(\'world\', 123445)', // should have only one parameter
        'isDate(123445)', // should hava a string or a TimexProperty parameter
        'isDate(\'world\', 123445)', // should have only one parameter
        'isTimeRange(123445)', // should hava a string or a TimexProperty parameter
        'isTimeRange(\'world\', 123445)', // should have only one parameter
        'isDateRange(123445)', // should hava a string or a TimexProperty parameter
        'isDateRange(\'world\', 123445)', // should have only one parameter
        'isPresent(123445)', // should hava a string or a TimexProperty parameter
        'isPresent(\'world\', 123445)', // should have only one parameter
        'addDays(\'errortime\', 1)',// error datetime format
        'addDays(timestamp, \'hi\')',// second param should be integer
        'addDays(timestamp)',// should have 2 or 3 params
        'addDays(timestamp, 1,\'yyyy\', 2)',// should have 2 or 3 params
        'addDays(notISOTimestamp, 1)', // not ISO datetime format
        'addHours(\'errortime\', 1)',// error datetime format
        'addHours(timestamp, \'hi\')',// second param should be integer
        'addHours(timestamp)',// should have 2 or 3 params
        'addHours(timestamp, 1,\'yyyy\', 2)',// should have 2 or 3 params
        'addHours(notISOTimestamp, 1)', // not ISO datetime format
        'addMinutes(\'errortime\', 1)',// error datetime format
        'addMinutes(timestamp, \'hi\')',// second param should be integer
        'addMinutes(timestamp)',// should have 2 or 3 params
        'addMinutes(timestamp, 1,\'yyyy\', 2)',// should have 2 or 3 params
        'addMinutes(notISOTimestamp, 1)', // not ISO datetime format
        'addSeconds(\'errortime\', 1)',// error datetime format
        'addSeconds(timestamp, \'hi\')',// second param should be integer
        'addSeconds(timestamp)',// should have 2 or 3 params
        'addSeconds(timestamp, 1,\'yyyy\', 2)',// should have 2 or 3 params
        'addSeconds(notISOTimestamp, 1)', // not ISO datetime format
        'dayOfMonth(\'errortime\')', // error datetime format
        'dayOfMonth(timestamp, 1)', //should have 1 param
        'dayOfMonth(notISOTimestamp)', // not ISO datetime format
        'dayOfWeek(\'errortime\')', // error datetime format
        'dayOfWeek(timestamp, 1)', //should have 1 param
        'dayOfWeek(notISOTimestamp)', // not ISO datetime format
        'dayOfYear(\'errortime\')', // error datetime format
        'dayOfYear(timestamp, 1)', //should have 1 param
        'dayOfYear(notISOTimestamp)', // not ISO datetime format
        'month(\'errortime\')', // error datetime format
        'month(timestamp, 1)', //should have 1 param
        'month(noISOTimestamp)', // not ISO datetime format
        'date(\'errortime\')', // error datetime format
        'date(timestamp, 1)', //should have 1 param
        'date(noISOTimestamp)', // not ISO datetime format
        'year(\'errortime\')', // error datetime format
        'year(timestamp, 1)', // should have 1 param
        'year(noISOTimestamp)', // not ISO datetime format
        'formatDateTime(\'errortime\')', // error datetime format
        'formatDateTime(timestamp, \'yyyy\', 1)', // should have 2 or 3 params
        'formatDateTime(notValidTimestamp)', // not valid timestamp
        'formatDateTime(notValidTimestamp2)', // not valid timestamp
        'formatDateTime(notValidTimestamp3)', // not valid timestamp
        'formatDateTime({})', // error valid datetime
        'formatDateTime(timestamp, 1)', // invalid format string
        'formatEpoch(\'time\')', // error string
        'formatEpoch(timestamp, \'yyyy\', 1)', // should have 1 or 2 params
        'formatTicks(\'string\')', // String is not valid
        'formatTicks({})', // object is not valid
        'subtractFromTime(\'errortime\', 1, \'yyyy\')', // error datetime format
        'subtractFromTime(timestamp, 1, \'W\')', // error time unit
        'subtractFromTime(timestamp, timestamp, \'W\')', // error parameters format
        'subtractFromTime(timestamp, \'1\', \'yyyy\')', // second param should be integer
        'subtractFromTime(timestamp, \'yyyy\')', // should have 3 or 4 params
        'subtractFromTime(noISOTimestamp, 1, \'Year\')',
        'dateReadBack(\'errortime\', \'errortime\')', // error datetime format
        'dateReadBack(timestamp)', // shold have two params
        'dateReadBack(timestamp, \'errortime\')', // second param is invalid timestamp format
        'dateReadBack(notISOTimestamp, addDays(timestamp, 1))', // not ISO datetime format
        'getTimeOfDay(\'errortime\')', // error datetime format
        'getTimeOfDay(timestamp, timestamp)', // should have 1 param
        'getTimeOfDay(notISOTimestamp)', // not ISO datetime format
        'getPastTime(1, \'W\')',// error time unit
        'getPastTime(timestamp, \'W\')',// error parameters format
        'getPastTime(\'yyyy\', \'1\')',// second param should be integer
        'getPastTime(\'yyyy\')',// should have 2 or 3 params
        'getFutureTime(1, \'W\')',// error time unit
        'getFutureTime(timestamp, \'W\')',// error parameters format
        'getFutureTime(\'yyyy\', \'1\')',// second param should be integer
        'getFutureTime(\'yyyy\')',// should have 2 or 3 params
        'convertFromUTC(notValidTimestamp, \'Pacific Standard Time\')', // invalid timestamp
        'convertFromUTC(\'2018-02-02T02:00:00.000Z\', \'Pacific Time\')', // invalid timezone
        'convertToUTC(notValidTimestamp, \'Pacific Standard Time\')',  // invalid timestamp
        'convertToUTC(\'2018-02-02T02:00:00.000\', \'Pacific Time\')', // invalid timezone
        //"startOfDay(timeStamp, 'A')", // invalid format, due to change of moment package, this will no longer throw exception
        'startOfDay(notValidTimeStamp)', // invalid timestamp
        //"startOfHour(timeStamp, 'A')", // invalid format, due to change of moment package, this will no longer throw exception
        'startOfHour(notValidTimeStamp)', // invalid timestamp
        //"startOfMonth(timeStamp, 'A')", // invalid format, due to change of moment package, this will no longer throw exception
        'startOfMonth(notValidTimeStamp)', // invalid timestamp
        'ticks(notValidTimeStamp)', // not valid timestamp
        'ticks()', // should have one parameters
        'dateTimeDiff(notValidTimeStamp,"2018-01-01T08:00:00.000Z")', // the first parameter is not a valid timestamp
        'dateTimeDiff("2017-01-01T08:00:00.000Z",notValidTimeStamp)', // the second parameter is not a valid timestamp
        'dateTimeDiff("2017-01-01T08:00:00.000Z","2018-01-01T08:00:00.000Z", "years")', // should only have 2 parameters
        'ticksToDays(12.12)', //should have an integer parameter
        'ticksToHours(12.12)', //should have an integer parameter
        'ticksToMinutes(12.12)', //should have an integer parameter

        // collection functions test
        'sum(items, \'hello\')',//should have 1 parameter
        'sum(\'hello\')',//first param should be list
        'average(items, \'hello\')',//should have 1 parameter
        'average(\'hello\')',//first param should be list
        'average(hello)', // first param should be list
        'contains(\'hello world\', \'hello\', \'new\')',//should have 2 parameter
        'count(items, 1)', //should have 1 parameter
        'count(1)', //first param should be string, array or map
        'empty(1,2)', //should have two params
        'first(items,2)', //should have 1 param
        'last(items,2)', //should have 1 param
        'join(items, \'p1\', \'p2\',\'p3\')',//builtin function should have 2-3 params, 
        'join(hello, \'hi\')',// first param must list
        'join(items, 1)',// second param must string 
        'join(items, \'1\', 2)',// second param must string 
        'foreach(hello, item, item)',// first arg is not list or struture
        'foreach(items, item)',//should have three parameters
        'foreach(items, item, item2, item3)',//should have three parameters
        'foreach(items, add(1), item)',// Second paramter of foreach is not an identifier
        'foreach(items, 1, item)', // Second paramter error
        'foreach(items, x, sum(x))', // third paramter error
        'select(hello, item, item)', // first arg is not list
        'select(items, item)', // should have three parameters
        'select(items, item, item2, item3)', // should have three parameters
        'select(items, add(1), item)', // second paramter of foreach is not an identifier
        'select(items, 1, item)', // second paramter error
        'select(items, x, sum(x))', // third paramter error
        'where(hello, item, item)', // first arg is not list or structure
        'where(items, item)', //should have three parameters
        'where(items, item, item2, item3)', //should have three parameters
        'where(items, add(1), item)', // Second paramter of where is not an identifier
        'where(items, 1, item)', // Second paramter error
        'where(items, x, sum(x))', // third paramter error
        'indicesAndValues(items, 1)', // should only have one parameter
        'indicesAndValues(1)', // shoud have array param
        'union(one, two)', // should have collection param
        'intersection(one, two)', // should have collection param
        'skip(hello)', // should have two parameters
        'skip(hello, world, one)', // should have two parameters
        'skip(hello, one)', // first param should be array
        'skip(items, hello)', // second param should be integer
        'skip(items, one + 0.5)', // second param should be integer
        'take(hello)', // should have two parameters
        'take(hello, world, one)', //should have two parameters
        'take(one, two)', // first param should be array or string
        'take(items, hello)', // second param should be integer
        'take(hello, one + 0.5)', // second param should be integer
        'subArray(hello)', // should have 2 or 3 params
        'subArray(one, two, hello, world)', // should have 2 or 3 params
        'subArray(hello, two)', // first param should be array
        'subArray(items, hello)', // second param should be integer
        'subArray(items, one, hello)', // third param should be integer
        'sortBy(hello, \'x\')', // first param should be list
        'sortBy(createArray(\'H\',\'e\',\'l\',\'l\',\'o\'), 1)', // second param should be string
        'sortBy(createArray(\'H\',\'e\',\'l\',\'l\',\'o\'), \'x\', hi)', //second param should be string

        //uri parsing functions
        'uriHost(relativeUri)',
        'uriPath(relativeUri)',
        'uriPathAndQuery(relatibeUri)',
        'uriPort(relatibeUri)',
        'uriQuery(relatibeUri)',
        'uriScheme(relatibeUri)',

        // Object manipulation and construction functions test
        'json(1,2)', //should have 1 parameter
        'json(1)',//should be string parameter
        'json(\'{"key1":value1"}\')', // invalid json format string 
        'addProperty(json(\'{"key1":"value1"}\'), \'key2\',\'value2\',\'key3\')', //should have 3 parameter
        'addProperty(json(\'{"key1":"value1"}\'), 1,\'value2\')', // second param should be string
        'setProperty(json(\'{"key1":"value1"}\'), \'key2\',\'value2\',\'key3\')', //should have 3 parameter
        'setProperty(json(\'{"key1":"value1"}\'), 1,\'value2\')', // second param should be string
        'removeProperty(json(\'{"key1":"value1","key2":"value2"}\'), 1))',// second param should be string
        'removeProperty(json(\'{"key1":"value1","key2":"value2"}\'), \'1\', \'2\'))',// should have 2 parameter
        'coalesce()', // should have at least 1 parameter
        'jPath(hello)',// should have two params
        'jPath(hello, \'.key\')', //bad json
        'jPath(json(\'{"key1":"value1","key2":"value2"}\'), \'getTotal\')', //bad path
        'merge(json(\'{"key1":"value1","key2":"value2"}\'))', // should have at least 2 arguments
        'merge(json2, jarray1)', // should only have JSON object arguments
        'merge(jarray1, json2)', // should only have JSON object arguments

        // Memory access test
        'getProperty(bag, 1)',// second param should be string
        'getProperty(1)', // if getProperty contains only one parameter, the parameter should be string
        'Accessor(1)',// first param should be string
        'Accessor(bag, 1)', // second should be object
        'one[0]',  // one is not list
        'items[3]', // index out of range
        'items[one+0.5]', // index is not integer

        // regex test
        'isMatch(\'^[a-z]+$\')',// should have 2 parameter
        'isMatch(\'abC\', one)',// second param should be string
        'isMatch(1, \'^[a-z]+$\')', // first param should be string
        'isMatch(\'abC\', \'^[a-z+$\')',// bad regular expression

        // SetPathToValue tests
        'setPathToValue(2+3, 4)', // Not a real path
        'setPathToValue(a)', // Missing value

        //Type Checking
        'isString(hello, hello)', // should have one parameter
        'isInteger(one, hello)', // should have one parameter
        'isFloat(1.324, hello)', // should have one parameter
        'isArray(createArray(1,2,3), hello)', // should have one parameter
        'isBoolean(true, false)', // should have one parameter
        'isDateTime("2018-03-15T13:00:00.111Z", hello)', // should have one parameter
        'isObject({}, false)', // should have one parameter
    ];

const scope = {
    one: 1.0,
    two: 2.0,
    hello: 'hello',
    world: 'world',
    istrue: true,
    nullObj: undefined,
    bag:
    {
        three: 3.0,
        set:
        {
            four: 4.0,
        },
        list: ['red', 'blue'],
        index: 3,
        name: 'mybag'
    },
    items: ['zero', 'one', 'two'],
    nestedItems:
        [
            {x: 1},
            {x: 2},
            {x: 3},
        ],
    timestamp: '2018-03-15T13:00:00.111Z',
    noISOTimestamp: '2018-03-15T13:00:00Z',
    notValidTimestamp: '2018timestmap',
    notValidTimestamp2: '1521118800',
    notValidTimestamp3: '20181115',
    relativeUri: '../catalog/shownew.htm?date=today',
    json2: {
        'Enabled': true,
        'Roles': [ 'User', 'Admin' ]
    },
    jarray1: ['a', 'b'],
    turn:
    {
        recognized: {
            entities:
            {
                city: 'Seattle'
            },
            intents:
            {
                BookFlight: 'BookFlight'
            }
        }
    },
    dialog:
    {
        result:
        {
            title: 'Dialog Title',
            subTitle: 'Dialog Sub Title'
        }
    },
};

describe('expression functional test', () => {
    it('should get exception results for bad expressions', () => {
        for (const expression of badExpressions) {
            let isFail = false;
            const input = expression;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                var {value: actual, error} = new ExpressionParser().parse(input).tryEvaluate(scope);
                if (error === undefined) {
                    isFail = true;
                } else {
                    console.log(error);
                }
            } catch (e) {
                console.log(e.message);
            }

            if (isFail) {
                assert.fail(`Test method ${input} did not throw expected exception`);
            }
        }
    });

    it('should get exception results for invalid expressions', () => {
        for (const expression of invalidExpressions) {
            const input = expression;
            try {
                new ExpressionParser().parse(input);
                assert.fail(`Test expression ${input} did not throw expected exception`);
            } catch (e) {
                console.log(e.message);
            }
        }
    });
});