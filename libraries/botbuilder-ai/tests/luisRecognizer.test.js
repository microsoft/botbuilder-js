const assert = require('assert');
const fs = require('fs-extra');
const nock = require('nock');
const { TestAdapter, TurnContext } = require('botbuilder');
const { LuisRecognizer } = require('../');
const luisAppId = '6209a76f-e836-413b-ba92-a5772d1b2087';

// This can be any endpoint key for calling LUIS
const endpointKey = process.env.LUISAPPKEY || "MockedKey";

// If this is true, then LUIS responses will come from oracle files.
// If it is false, the LUIS service will be called and if there are changes you will get a new oracle file.
const mockLuis = true;

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
    if (token1 == null || token2 == null) {
        within = token1 == token2;
    }
    else if (Array.isArray(token1) && Array.isArray(token2)) {
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

function ExpectedPath(file) {
    return __dirname + "/TestData/LuisRecognizer/" + file;
}

function GetExpected(oracle) {
    var expected = fs.readJSONSync(oracle);
    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
            .post(/apps/)
            .reply(200, expected.luisResult);
    }
    return expected;
}

function ReturnErrorStatusCode(code) {
    nock('https://westus.api.cognitive.microsoft.com')
        .post(/apps/)
        .reply(code);
}

// To create a file to test:
// 1) Create a <name>.json file with an object { text:<query> } in it.
// 2) Run this test sith mockLuis = false which will fail and generate a <name>.json.new file.  
// 3) Check the .new file and if correct, replace the original .json file with it.
function TestJson(file, done, includeAllIntents, includeInstance) {
    if (includeAllIntents === undefined) includeAllIntents = true;
    if (includeInstance === undefined) includeInstance = true;
    var expectedPath = ExpectedPath(file);
    var expected = GetExpected(expectedPath);
    var newPath = expectedPath + ".new";
    var context = new TestContext({ text: expected.text });
    var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: includeAllIntents, includeInstanceData: includeInstance }, true);
    recognizer.recognize(context).then(res => {
        if (!WithinDelta(expected, res, 0.1, false)) {
            fs.outputJSONSync(newPath, res, { spaces: 2 });
            assert(false, "\nReturned JSON\n  " + newPath + "\n!= expected JSON\n  " + expectedPath);
        }
        else if (fs.existsSync(newPath)) {
            fs.unlinkSync(newPath);
        }
        done(res);
    });
}

describe('LuisRecognizer', function () {
    this.timeout(10000);

    if (!mockLuis && endpointKey === "MockedKey") {
        console.warn('WARNING: skipping LuisRecognizer test suite because the LUISAPPKEY environment variable is not defined');
        return;
    }

    it('test built-ins composite1', done => TestJson("Composite1.json", res => done()));
    it('test built-ins composite2', done => TestJson("Composite2.json", res => done()));
    it('test built-ins prebuilt', done => TestJson("Prebuilt.json", res => done()));
    it('test patterns', done => TestJson("Patterns.json", res => done()));
    it('should return single intent and a simple entity', done => {
        TestJson("SingleIntentSimple.json", (res) => {
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
        }, false);
    });

    it('should return multiple intents and prebuilt entities with a single value', done => {
        TestJson("MultipleIntentPrebuilt1.json", res => {
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
        })
    });

    it('should return multiple intents and prebuilt entities with multiple values', done => {
        TestJson("MultipleIntentPrebuiltMultiple.json", res => {
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
    });

    it('should return multiple intents and a list entity with a single value', done => {
        TestJson("MultipleIntentList1.json", res => {
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

    it('should return multiple intents and a list entity with multiple values', done => {
        TestJson("MultipleIntentListMultiple.json", res => {
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

    it('should return multiple intents and a single composite entity', done => {
        TestJson("MultipleIntentComposite1.json", res => {
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

    it('should cache multiple calls to recognize()', done => {
        var expected = GetExpected(ExpectedPath("SingleIntentSimple.json"));
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: expected.text });
        recognizer.recognize(context)
            .then(res => {
                assert(res);
                res.text = 'cached';
                recognizer.recognize(context).then(res => {
                    assert(res);
                    assert(res.text === 'cached');
                    done();
                });
            }, false);
    });

    it('should only return $instance metadata for entities if verbose flag set', done => {
        TestJson("NoInstanceSimple.json", res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        }, false, false);
    });

    it('should only return $instance metadata for composite entities if verbose flag set', done => {
        TestJson("NoInstanceComposite.json", res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            done();
        }, true, false);
    });

    it('should only return "None" intent for undefined text', done => {
        TestJson("EmptyText.json", res => {
            const top = LuisRecognizer.topIntent(res);
            assert(top === 'None');
            done();
        });
    });

    it('should return defaultIntent from topIntent() if results undefined', done => {
        const top = LuisRecognizer.topIntent(undefined);
        assert(top === 'None');
        done();
    });

    it('should return defaultIntent from topIntent() if intent scores below threshold', done => {
        const top = LuisRecognizer.topIntent({ intents: { TestIntent: 0.49 } }, 'None', 0.5);
        assert(top === 'None');
        done();
    });

    it('should emit trace info once per call to recognize', done => {
        var expected = GetExpected(ExpectedPath("SingleIntentSimple.json"));
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: expected.text });
        recognizer.recognize(context).then(res => {
            return recognizer.recognize(context);
        }).then(res => {
            return recognizer.recognize(context);
        }).then(res => {
            assert(res);
            assert(res.text == expected.text);
        }).then(() => {
            let luisTraceActivities = context.sent.filter(s => s.type === 'trace' && s.name === 'LuisRecognizer');
            assert(luisTraceActivities.length === 1);
            let traceActivity = luisTraceActivities[0];
            assert(traceActivity.type === 'trace');
            assert(traceActivity.name === 'LuisRecognizer');
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

    it('should call prepareErrorMessage when a non-200 status code is received.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(400);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 400: The request's body or parameters are incorrect, meaning they are missing, malformed, or too large.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 401 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(401);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 401: The key used is invalid, malformed, empty, or doesn't match the region.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 403 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(403);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 403: Total monthly key quota limit exceeded.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 409 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(409);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 409: Application loading in progress, please try again.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 410 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(410);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 410: Please retrain and republish your application.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 414 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(414);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 414: The query is too long. Please reduce the query length to 500 or less characters.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw expected 429 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(429);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response 429: Too many requests.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });

    it('should throw unexpected error message with correct status code.', done => {
        nock.cleanAll();
        const statusCode = 404;
        ReturnErrorStatusCode(statusCode);
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        var context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch((error) => {
            expectedError = `Response ${statusCode}: Unexpected status code received. Please verify that your LUIS application is properly setup.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            done();
        });
    });
});
