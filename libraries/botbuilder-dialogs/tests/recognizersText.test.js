const assert = require('assert');
const Recognizers = require('@microsoft/recognizers-text-suite');
let culture;

before(function() {
    culture = Recognizers.Culture.English;
})

describe('Unit test suite for `Recognizers-Text` module', function() {
    it('should return a culture code of `en-us`', function(done) {
        assert(culture === 'en-us');
        done();
    });
    it('should recognize a number', function(done) {
        const result = Recognizers.recognizeNumber('I have twenty two apples.', culture);
        assert(result[0].resolution.value === '22');
        assert(result[0].text === 'twenty two');
        assert(result[0].typeName === 'number');
        done();
    });
    it('should recognize an ordinal number', function(done) {
        const result = Recognizers.recognizeOrdinal('Eleventh time is a charm.', culture);
        assert(result[0].resolution.value === '11');
        assert(result[0].text === 'Eleventh');
        assert(result[0].typeName === 'ordinal');
        done();
    });
    it('should recognize a percent', function(done) {
        const result = Recognizers.recognizePercentage('Theres a seventy percent chance of rain.', culture);
        assert(result[0].resolution.value === '70%');
        assert(result[0].text === 'seventy percent');
        assert(result[0].typeName === 'percentage');
        done();
    });
    it('should recognize an age', function(done) {
        const result = Recognizers.recognizeAge('When Im sixty four years old.', culture);
        assert(result[0].resolution.value === '64');
        assert(result[0].text === 'sixty four years old');
        assert(result[0].typeName === 'age');
        done();
    });
    it('should recognize a currency', function(done) {
        const result = Recognizers.recognizeCurrency('Interest expense in the 1988 third quarter was $75.3 million', culture);
        assert(result[0].resolution.value === '75300000');
        assert(result[0].resolution.unit === 'Dollar');
        assert(result[0].text === '$75.3 million');
        assert(result[0].typeName === 'currency');
        done();
    });
    it('should recognize a dimension', function(done) {
        const result = Recognizers.recognizeDimension('The six-mile trip to my airport hotel that had taken 20 minutes earlier in the day took more than three hours.', culture);
        assert(result[0].resolution.value === '6');
        assert(result[0].resolution.unit === 'Mile');
        assert(result[0].text === 'six-mile');
        assert(result[0].typeName === 'dimension');
        done();
    });
    it('should recognize a temperature', function(done) {
        const result = Recognizers.recognizeTemperature('Set the temperature to 30 degrees celsius', culture);
        assert(result[0].resolution.value === '30');
        assert(result[0].resolution.unit === 'C');
        assert(result[0].text === '30 degrees celsius');
        assert(result[0].typeName === 'temperature');
        done();
    });
    it('should recognize a datetime', function(done) {
        const result = Recognizers.recognizeDateTime('Ill go back at 8pm today', culture);
        assert(result[0].resolution.values[0].value === '2019-06-12 20:00:00');
        assert(result[0].resolution.values[0].timex === '2019-06-12T20');
        assert(result[0].resolution.values[0].type === 'datetime');
        assert(result[0].text === '8pm today');
        assert(result[0].typeName === 'datetimeV2.datetime');
        done();
    });
    it('should recognize a phone number', function(done) {
        const result = Recognizers.recognizePhoneNumber('My phone number is (904) 316-2049', culture);
        assert(result[0].resolution.value === '(904) 316-2049');
        assert(result[0].text === '(904) 316-2049');
        assert(result[0].typeName === 'phonenumber');
        done();
    });
    it('should recognize an IP address', function(done) {
        const result = Recognizers.recognizeIpAddress('My Ip is 8.8.8.8', culture);
        assert(result[0].resolution.value === '8.8.8.8');
        assert(result[0].resolution.type === 'ipv4');
        assert(result[0].typeName === 'ip');
        done();
    });
    it('should recognize a boolean value', function(done) {
        const result = Recognizers.recognizeBoolean('yup yes I need that', culture);
        assert(result[0].resolution.value === true);
        assert(result[0].text === 'yes');
        assert(result[0].typeName === 'boolean');
        done();
    });
})