
const assert = require('assert');
const fs = require('fs-extra');
const { TestAdapter, TurnContext } = require('botbuilder');
const { LuisRecognizer } = require('../');
const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;
const LuisBaseUri = "https://westus.api.cognitive.microsoft.com/luis";

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

function WithinDelta(token1, token2, delta, compare) {
    var within = true;
    if (Array.isArray(token1) && Array.isArray(token2)) {
        within = token1.length == token2.length;
        for (var i = 0; within && i < token1.length; ++i) {
            within = WithinDelta(token1[i], token2[i], delta, compare);
        }
    }
    else if (typeof token1 === "object" && typeof token2 === "object") {
        Object.keys(token2).forEach(k => token2[k] === undefined && delete token2[k]);
        within = Object.keys(token1).length === Object.keys(token2).length;
        Object.keys(token1).forEach(function (key) {
            if (!within) return;
            within = WithinDelta(token1[key], token2[key], delta, compare || key === "score" || key === "intents");
        });
    }
    else if (token1 !== token2) {
        if (token1 !== undefined && token2 != undefined && token1.Type == token2.Type) {
            within = false;
            if (compare &&
                typeof token1 === "number" && typeof token2 === "number") {
                within = Math.abs(token1 - token2) < delta;
            }
        }
        else {
            within = false;
        }
    }
    return within;
}

// To create a file to test:
// 1) Create a <name>.json file with an object { Text:<query> } in it.
// 2) Run this test which will fail and generate a <name>.json.new file.
// 3) Check the .new file and if correct, replace the original .json file with it.
function TestJson(file, done) {

    var expectedPath = __dirname + "/TestData/" + file;
    var expected = fs.readJSONSync(expectedPath);
    var newPath = expectedPath + ".new";
    var context = new TestContext({ text: expected.text });
    var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
    recognizer.recognize(context).then(res => {
        if (!WithinDelta(expected, res, 0.01, false)) {
            fs.outputJSONSync(newPath, res, { spaces: 2 });
            assert(false, "\nReturned JSON\n  " + newPath + "\n!= expected JSON\n  " + expectedPath);
        }
        else if (fs.existsSync(newPath)) {
            fs.unlinkSync(newPath);
        }
        done();
    });
}

describe('LuisRecognizer', function () {
    this.timeout(10000);

    if (!luisAppId) {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPKEY environment variable is not defined');
        return;
    }

    it('test built-ins composite1', function (done) {
        TestJson("Composite1.json", done);
    });

    it('test built-ins composite2', function (done) {
        TestJson("Composite2.json", done);
    });

    it('test built-ins prebuilt', function (done) {
        TestJson("Prebuilt.json", done);
    });

    it('test patterns', function (done) {
        TestJson("Patterns.json", done);
    });

   it('should return multiple intents and a simple entity', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'My name is Emad');
            assert(Object.keys(res.intents).length == 1);
            assert(res.intents.SpecifyName);
            assert(res.intents.SpecifyName.score > 0 && res.intents.SpecifyName.score <= 1);
            assert(res.entities);
            assert(res.entities.Name);
            assert(res.entities.Name[0] === 'emad');
            assert(res.entities.$instance);
            assert(res.entities.$instance.Name);
            assert(res.entities.$instance.Name[0].startIndex === 11);
            assert(res.entities.$instance.Name[0].endIndex === 15);
            assert(res.entities.$instance.Name[0].score > 0 && res.entities.$instance.Name[0].score <= 1);
            done();
        });
    });

    it('should return multiple intents and prebuilt entities with a single value', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
        var context = new TestContext({ text: 'Please deliver February 2nd 2001' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'Please deliver February 2nd 2001');
            assert(res.intents);
            assert(res.intents.Delivery);
            assert(res.intents.Delivery.score > 0 && res.intents.Delivery.score <= 1);
            assert(LuisRecognizer.topIntent(res) === 'Delivery');
            assert(res.entities);
            assert(res.entities.number);
            assert(res.entities.number[0] === 2001);
            assert(res.entities.datetime);
            assert(res.entities.datetime[0].timex[0] === '2001-02-02');
            assert(res.entities.$instance);
            assert(res.entities.$instance.number);
            assert(res.entities.$instance.number[0].startIndex === 28);
            assert(res.entities.$instance.number[0].endIndex === 32);
            assert(res.entities.$instance.number[0].text);
            assert(res.entities.$instance.number[0].text === '2001');
            assert(res.entities.$instance.datetime);
            assert(res.entities.$instance.datetime[0].startIndex === 15);
            assert(res.entities.$instance.datetime[0].endIndex === 32);
            assert(res.entities.$instance.datetime[0].text);
            assert(res.entities.$instance.datetime[0].text === 'february 2nd 2001');
            done();
        });
    });

    it('should return multiple intents and prebuilt entities with multiple values', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
        var context = new TestContext({ text: 'Please deliver February 2nd 2001 in room 201' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'Please deliver February 2nd 2001 in room 201');
            assert(res.intents);
            assert(res.intents.Delivery);
            assert(res.intents.Delivery.score > 0 && res.intents.Delivery.score <= 1);
            assert(res.entities);
            assert(res.entities.number);
            assert(res.entities.number.length == 2);
            assert(res.entities.number.indexOf(2001) > -1);
            assert(res.entities.number.indexOf(201) > -1);
            assert(res.entities.datetime);
            assert(res.entities.datetime[0].timex[0] === '2001-02-02');
            done();
        });
    })


    it('should return multiple intents and a list entity with a single value', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
        var context = new TestContext({ text: 'I want to travel on united' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'I want to travel on united');
            assert(res.intents);
            assert(res.intents.Travel);
            assert(res.intents.Travel.score > 0 && res.intents.Travel.score <= 1);
            assert(res.entities);
            assert(res.entities.Airline);
            assert(res.entities.Airline[0][0] === 'United');
            assert(res.entities.$instance);
            assert(res.entities.$instance.Airline);
            assert(res.entities.$instance.Airline[0].startIndex);
            assert(res.entities.$instance.Airline[0].startIndex === 20);
            assert(res.entities.$instance.Airline[0].endIndex);
            assert(res.entities.$instance.Airline[0].endIndex === 26);
            assert(res.entities.$instance.Airline[0].text);
            assert(res.entities.$instance.Airline[0].text === 'united');
            done();
        });
    });

    it('should return multiple intents and a list entity with multiple values', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
        var context = new TestContext({ text: 'I want to travel on DL' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'I want to travel on DL');
            assert(res.intents);
            assert(res.intents.Travel);
            assert(res.intents.Travel.score > 0 && res.intents.Travel.score <= 1);
            assert(res.entities);
            assert(res.entities.Airline[0]);
            assert(res.entities.Airline[0].length == 2);
            assert(res.entities.Airline[0].indexOf('Delta') > -1);
            assert(res.entities.Airline[0].indexOf('Virgin') > -1);
            assert(res.entities.$instance);
            assert(res.entities.$instance.Airline);
            assert(res.entities.$instance.Airline[0].startIndex);
            assert(res.entities.$instance.Airline[0].startIndex === 20);
            assert(res.entities.$instance.Airline[0].endIndex);
            assert(res.entities.$instance.Airline[0].endIndex === 22);
            assert(res.entities.$instance.Airline[0].text);
            assert(res.entities.$instance.Airline[0].text === 'dl');
            done();
        });
    });

    it('should return multiple intents and a single composite entity', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true, options: { verbose: true } });
        var context = new TestContext({ text: 'Please deliver it to 98033 WA' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.text == 'Please deliver it to 98033 WA');
            assert(res.intents);
            assert(res.intents.Delivery);
            assert(res.intents.Delivery.score > 0 && res.intents.Delivery.score <= 1);
            assert(res.entities);
            assert(res.entities.number === undefined);
            assert(res.entities.State === undefined);
            assert(res.entities.Address);
            assert(res.entities.Address[0].number[0] === 98033);
            assert(res.entities.Address[0].State);
            assert(res.entities.Address[0].State[0] === "wa");
            assert(res.entities.$instance);
            assert(res.entities.$instance.number === undefined);
            assert(res.entities.$instance.State === undefined);
            assert(res.entities.$instance.Address);
            assert(res.entities.$instance.Address[0].startIndex);
            assert(res.entities.$instance.Address[0].startIndex === 21);
            assert(res.entities.$instance.Address[0].endIndex);
            assert(res.entities.$instance.Address[0].endIndex === 29);
            assert(res.entities.$instance.Address[0].score);
            assert(res.entities.$instance.Address[0].score > 0 && res.entities.$instance.Address[0].score <= 1);
            assert(res.entities.Address[0].$instance.number);
            assert(res.entities.Address[0].$instance.number[0].startIndex);
            assert(res.entities.Address[0].$instance.number[0].startIndex === 21);
            assert(res.entities.Address[0].$instance.number[0].endIndex);
            assert(res.entities.Address[0].$instance.number[0].endIndex === 26);
            assert(res.entities.Address[0].$instance.number[0].text);
            assert(res.entities.Address[0].$instance.number[0].text === "98033");
            assert(res.entities.Address[0].$instance.State);
            assert(res.entities.Address[0].$instance.State[0].startIndex);
            assert(res.entities.Address[0].$instance.State[0].startIndex === 27);
            assert(res.entities.Address[0].$instance.State[0].endIndex);
            assert(res.entities.Address[0].$instance.State[0].endIndex === 29);
            assert(res.entities.Address[0].$instance.State[0].score);
            assert(res.entities.Address[0].$instance.State[0].score > 0 && res.entities.Address[0].$instance.State[0].score <= 1);
            done();
        });
    });

    it('should run as a piece of middleware', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.onTurn(context, () => {
            const res = recognizer.get(context);
            assert(res);
            assert(res.text == 'My name is Emad');
            done();
        });
    });

    it('should cache multiple calls to recognize()', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
            assert(res);
            res.text = 'cached';
            recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.text === 'cached');
                done();
            });
        });
    });

    it('should only return $instance metadata for entities if verbose flag set', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        });
    });

    it('should only return $instance metadata for composite entities if verbose flag set', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text: 'Please deliver it to 98033 WA' });
        recognizer.recognize(context).then(res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        });
    });

    it('should only return "None" intent for undefined text', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: false });
        var context = new TestContext({ text: undefined });
        recognizer.recognize(context).then(res => {
            const top = LuisRecognizer.topIntent(res);
            assert(top === 'None');
            done();
        });
    });

    it('should return defaultIntent from topIntent() if results undefined', function (done) {
        const top = LuisRecognizer.topIntent(undefined);
        assert(top === 'None');
        done();
    });

    it('should return defaultIntent from topIntent() if intent scores below threshold', function (done) {
        const top = LuisRecognizer.topIntent({ intents: { TestIntent: 0.49 } }, 'None', 0.5);
        assert(top === 'None');
        done();
    });

    it('should emit trace info once per call to recognize', function (done) {
        var recognizer = new LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey, verbose: true });
        var context = new TestContext({ text: 'My name is Emad' });
        recognizer.recognize(context).then(res => {
            return recognizer.recognize(context);
        }).then(res => {
            return recognizer.recognize(context);
        }).then(res => {
            assert(res);
            assert(res.text == 'My name is Emad');
        }).then(() => {
            let luisTraceActivities = context.sent.filter(s => s.type === 'trace' && s.name === 'LuisRecognizerMiddleware');
            assert(luisTraceActivities.length === 1);
            let traceActivity = luisTraceActivities[0];
            assert(traceActivity.type === 'trace');
            assert(traceActivity.name === 'LuisRecognizerMiddleware');
            assert(traceActivity.label === 'Luis Trace');
            assert(traceActivity.valueType === 'https://www.luis.ai/schemas/trace');
            assert(traceActivity.value);
            assert(traceActivity.value.luisResult);
            assert(traceActivity.value.recognizerResult);
            assert(traceActivity.value.luisOptions);
            assert(traceActivity.value.luisModel);
            done();
        });
    });

});
