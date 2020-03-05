const assert = require('assert');
const fs = require('fs-extra');
const nock = require('nock');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { LuisRecognizer } = require('../');
const luisAppId = '38330cad-f768-4619-96f9-69ea333e594b';

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

class ThrowErrorRecognizer extends LuisRecognizer {
    constructor() {
        super({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true, includeInstanceData: true }, true);
    }

    recognize(turnContext) {
        return new Promise((resolve, reject) => {
            reject(new Error('Test'));
        }).catch(error => {
            this.prepareErrorMessage(error);
            throw error;
        });
    }
}

function throttle(callback) {
    if (mockLuis) {
        callback();
    } else {
        // If actually calling LUIS, need to throttle our requests
        setTimeout(callback, 1000);
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

    var query = 'verbose=(true|false)&staging=false&spellCheck=false&log=true';
    var path = `/luis/v2\\.0/apps/${luisAppId}`;
    var pattern = `${path}\\?${query}`;
    var uri = new RegExp(pattern);
    var requestContent = expected.text != undefined ? `"${expected.text}"` : undefined;
    var responseBody = expected.v2;

    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
            .matchHeader('Ocp-Apim-Subscription-Key', endpointKey)
            .matchHeader('authorization', `Bearer ${endpointKey}`)
            .post(uri, requestContent)
            .reply(200, responseBody);
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
function TestJson(file, done, includeAllIntents, includeInstance, telemetryClient, telemetryProperties, telemetryMetrics, logPersonalInformation) {
    if (includeAllIntents === undefined) includeAllIntents = true;
    if (includeInstance === undefined) includeInstance = true;
    if (logPersonalInformation === undefined) logPersonalInformation = true;
    if (telemetryProperties === undefined) telemetryProperties = null;
    var expectedPath = ExpectedPath(file);
    var expected = GetExpected(expectedPath);
    var newPath = expectedPath + ".new";
    var context = new TestContext({ text: expected.text });
    var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey },
        { includeAllIntents: includeAllIntents, includeInstanceData: includeInstance, telemetryClient: telemetryClient, logPersonalInformation: logPersonalInformation }, true);
    recognizer.recognize(context, telemetryProperties, telemetryMetrics).then(res => {
        res.v2 = res.luisResult;
        delete res.luisResult;
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
    this.timeout(15000);

    if (!mockLuis && endpointKey === "MockedKey") {
        console.warn('WARNING: skipping LuisRecognizer test suite because the LUISAPPKEY environment variable is not defined');
        return;
    }

    it('test built-ins composite1', done => TestJson("Composite1.json", res => throttle(done)));
    it('test built-ins composite2', done => TestJson("Composite2.json", res => throttle(done)));
    it('test built-ins composite3', done => TestJson("Composite3.json", res => throttle(done)));
    it('test built-ins prebuilt', done => TestJson("Prebuilt.json", res => throttle(done)));
    it('test patterns', done => TestJson("Patterns.json", res => throttle(done)));
    it('test roles', done => TestJson("roles.json", res => throttle(done)));
    it('should return single intent and a simple entity', done => {
        TestJson("SingleIntent_SimplyEntity.json", (res) => {
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
            throttle(done);
        }, false);
    });

    it('should return multiple intents and prebuilt entities with a single value', done => {
        TestJson("MultipleIntents_PrebuiltEntity.json", res => {
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
            throttle(done);
        }, false);
    });

    it('should return multiple intents and prebuilt entities with multiple values', done => {
        TestJson("MultipleIntents_PrebuiltEntitiesWithMultiValues.json", res => {
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
            throttle(done);
        }, false);
    });

    it('should return multiple intents and a list entity with a single value', done => {
        TestJson("MultipleIntents_ListEntityWithSingleValue.json", res => {
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
            throttle(done);
        }, false);
    });

    it('should return multiple intents and a list entity with multiple values', done => {
        TestJson("MultipleIntents_ListEntityWithMultiValues.json", res => {
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
            throttle(done);
        }, false);
    });

    it('should return multiple intents and a single composite entity', done => {
        TestJson("MultipleIntents_CompositeEntityModel.json", res => {
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
            throttle(done);
        }, false);
    });

    it('should cache multiple calls to recognize()', done => {
        var expected = GetExpected(ExpectedPath("SingleIntent_SimplyEntity.json"));
        var recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true, apiVersion: 'v2', includeAPIResults: true});
        var context = new TestContext({ text: expected.text });
        recognizer.recognize(context)
            .then(res => {
                assert(res);
                res.text = 'cached';
                recognizer.recognize(context).then(res => {
                    assert(res);
                    assert(res.text === 'cached');
                    throttle(done);
                });
            }, false);
    });

    it('should only return $instance metadata for entities if verbose flag set', done => {
        TestJson("NoInstanceSimple.json", res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            throttle(done);
        }, false, false);
    });

    it('should only return $instance metadata for composite entities if verbose flag set', done => {
        TestJson("NoInstanceComposite.json", res => {
            assert(res);
            assert(res.entities);
            assert(res.entities.$instance === undefined);
            throttle(done);
        }, true, false);
    });

    it('should only return empty intent for empty text', done => {
        TestJson("EmptyText.json", res => {
            const top = LuisRecognizer.topIntent(res);
            assert(top === 'None'); // topIntent() converts '' to 'None'
            assert(Object.keys(res.intents).length == 1)
            assert('' in res.intents);
            throttle(done);
        });
    });

    it('should return defaultIntent from topIntent() if results undefined', done => {
        const top = LuisRecognizer.topIntent(undefined);
        assert(top === 'None');
        throttle(done);
    });

    it('should return defaultIntent from topIntent() if intent scores below threshold', done => {
        const top = LuisRecognizer.topIntent({ intents: { TestIntent: 0.49 } }, 'None', 0.5);
        assert(top === 'None');
        throttle(done);
    });

    it('should emit trace info once per call to recognize', done => {
        var expected = GetExpected(ExpectedPath("SingleIntent_SimplyEntity.json"));
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
            throttle(done);
        });
    });

    it('should call prepareErrorMessage when a non-200 status code is received.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(400);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 400: The request's body or parameters are incorrect, meaning they are missing, malformed, or too large.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 401 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(401);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 401: The key used is invalid, malformed, empty, or doesn't match the region.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 403 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(403);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 403: Total monthly key quota limit exceeded.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 409 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(409);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 409: Application loading in progress, please try again.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 410 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(410);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 410: Please retrain and republish your application.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 414 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(414);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 414: The query is too long. Please reduce the query length to 500 or less characters.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw expected 429 error message.', done => {
        nock.cleanAll();
        ReturnErrorStatusCode(429);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response 429: Too many requests.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should throw unexpected error message with correct status code.', done => {
        nock.cleanAll();
        const statusCode = 404;
        ReturnErrorStatusCode(statusCode);
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).catch(error => {
            expectedError = `Response ${statusCode}: Unexpected status code received. Please verify that your LUIS application is properly setup.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
            nock.cleanAll();
            throttle(done);
        });
    });

    it('.prepareErrorMessage() should not change `error.message` if `error.response.statusCode` does not exist.',
        done => {
            const recognizer = new ThrowErrorRecognizer();
            const context = new TestContext({ text: 'Hello world!' });
            recognizer.recognize(context).catch(error => {
                expectedError = 'Test';
                assert(error.message === expectedError, `unexpected error message thrown.`);
                throttle(done);
            })
        });

    it('should send user-agent header.', done => {
        nock.cleanAll();
        nock('https://westus.api.cognitive.microsoft.com')
            .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
            .post(/apps/)
            .reply(200, { query: null, intents: [], entities: [] });
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, { includeAllIntents: true }, true);
        const context = new TestContext({ text: 'Hello world!' });
        recognizer.recognize(context).then(res => {
            nock.cleanAll();
            throttle(done);
        });
    });

    it('should successfully construct with valid endpoint.', () => {
        // Note this is NOT a real LUIS application ID nor a real LUIS subscription-key.
        // These are GUIDs edited to look right to the parsing and validation code.
        const mockedEndpoint = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b31aeaf3-3511-495b-a07f-571fc873214b?verbose=true&timezoneOffset=-360&subscription-key=048ec46dc58e495482b0c447cfdbd291&q=';

        const recognizer = new LuisRecognizer(mockedEndpoint);

        assert(recognizer.application.applicationId === 'b31aeaf3-3511-495b-a07f-571fc873214b');
        assert(recognizer.application.endpointKey === '048ec46dc58e495482b0c447cfdbd291');
        assert(recognizer.application.endpoint === 'https://westus.api.cognitive.microsoft.com');
    });

    it('should throw an error when parsing application endpoint with no subscription-key.', () => {
        const endpointWithNoSubscriptionKey = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b31aeaf3-3511-495b-a07f-571fc873214b?verbose=true&timezoneOffset=-360&q=';
        const expectedSubscriptionKey = undefined;
        try {
            const recognizer = new LuisRecognizer(endpointWithNoSubscriptionKey);
            assert(false, 'should have thrown an error.');
        } catch (e) {
            assert(e.message === `Invalid \`endpointKey\` value detected: ${expectedSubscriptionKey}\nPlease make sure your endpointKey is a valid LUIS Endpoint Key, e.g. "048ec46dc58e495482b0c447cfdbd291".`);
        }
    });

    const expectedApplicationId = undefined;
    it('should throw an error when parsing application endpoint with no application ID.', () => {
        const endpointWithNoAppId = 'https://westus.api.cognitive.microsoft.com?verbose=true&timezoneOffset=-360&subscription-key=048ec46dc58e495482b0c447cfdbd291&q=';
        try {
            const recognizer = new LuisRecognizer(endpointWithNoAppId);
            assert(false, 'should have thrown an error.');
        } catch (e) {
            assert(e.message === `Invalid \`applicationId\` value detected: ${expectedApplicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`);
        }
    });

    it('should throw an error when parsing non-URL value.', () => {
        try {
            const recognizer = new LuisRecognizer('this.is.not.a.url');
            assert(false, 'should have thrown an error.');
        } catch (e) {
            assert(e.message === `Invalid \`applicationId\` value detected: ${expectedApplicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`);
        }
    });

    it('null telemetryClient should work.', () => {
        TestJson("SingleIntent_SimplyEntityTelemetry.json", (res) => {
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
        }, includeAllIntents = false, includeInstance = true, telemetryClient = null, telemetryProperties = null, logPersonalInformation = true);
    });

    it('basic telemetry test.', () => {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('applicationId' in telemetry.properties);
                        assert('intent' in telemetry.properties);
                        assert('intentScore' in telemetry.properties);
                        assert('sentimentLabel' in telemetry.properties);
                        assert('sentimentScore' in telemetry.properties);
                        assert('entities' in telemetry.properties);
                        assert('question' in telemetry.properties);
                        assert(telemetry.properties.question === 'My name is Emad');
                        break;

                    default:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(false);
                        break;
                }
            }
        }

        TestJson("SingleIntent_SimplyEntityTelemetry.json", (res) => {
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
        }, includeAllIntents = false, includeInstance = true, telemetryClient = telemetryClient, telemetryProperties = null, logPersonalInformation = true);
    });

    it('telemetry with multiple entity names returned.', () => {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('applicationId' in telemetry.properties);
                        assert('intent' in telemetry.properties);
                        assert('intentScore' in telemetry.properties);
                        assert('sentimentLabel' in telemetry.properties);
                        assert('sentimentScore' in telemetry.properties);
                        assert('entities' in telemetry.properties);
                        assert('question' in telemetry.properties);
                        assert(telemetry.properties.question === 'I want to travel on DL');
                        break;

                    default:
                        console.log('Call number:' + callCount);
                        console.log(telemetry);
                        assert(false);
                        break;
                }
            }
        }

        TestJson("MultipleIntents_ListEntityWithMultiValuesTelemetry.json", (res) => {
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
        }, includeAllIntents = true, includeInstance = true, telemetryClient = telemetryClient, telemetryProperties = null, logPersonalInformation = true);
    });

    it('override telemetry properties on logging.', () => {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('test' in telemetry.properties);
                        assert(telemetry.properties['test'] === 'testvalue');
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties['foo'] === 'foovalue');
                        assert('applicationId' in telemetry.properties);
                        assert('intent' in telemetry.properties);
                        assert(telemetry.properties['intent'] === 'MYINTENT');
                        assert('intentScore' in telemetry.properties);
                        assert('sentimentLabel' in telemetry.properties);
                        assert('sentimentScore' in telemetry.properties);
                        assert('entities' in telemetry.properties);
                        assert('question' in telemetry.properties);
                        assert(telemetry.properties.question === 'My name is Emad');
                        break;

                    default:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(false);
                        break;
                }
            }
        }

        const properties = {};
        properties["test"] = "testvalue";
        properties["foo"] = "foovalue";
        properties["intent"] = "MYINTENT";

        TestJson("SingleIntent_SimplyEntityTelemetry.json", (res) => {
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
        }, includeAllIntents = false, includeInstance = true, telemetryClient = telemetryClient, telemetryProperties = properties, logPersonalInformation = true);
    });

    it('override telemetry by deriving LuisRecognizer.', () => {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('test' in telemetry.properties);
                        assert(telemetry.properties['test'] === "testvalue");
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties['foo'] === "foovalue");
                        assert('MyImportantProperty' in telemetry.properties);
                        assert(telemetry.properties['MyImportantProperty'] === "myImportantValue");

                        break;

                    case 2:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'MySecondEvent');
                        assert(telemetry.properties);
                        assert('MyImportantProperty2' in telemetry.properties);
                        assert(telemetry.properties['MyImportantProperty2'] === "myImportantValue2");
                        break;

                    default:
                        console.log('Call number:' + callCount);
                        console.log(telemetry);
                        assert(false);
                        break;
                }
            }
        }

        const properties = {};
        properties["test"] = "testvalue";
        properties["foo"] = "foovalue";
        const metrics = {};
        metrics["moo"] = 3.14159;
        metrics["boo"] = 2.11;

        var expectedPath = ExpectedPath("SingleIntent_SimplyEntityTelemetry.json");
        var expected = GetExpected(expectedPath);
        var newPath = expectedPath + ".new";
        var context = new TestContext({ text: expected.text });
        var recognizer = new telemetryOverrideRecognizer({ applicationId: luisAppId, endpointKey: endpointKey },
            { includeAllIntents: false, includeInstanceData: true, telemetryClient: telemetryClient, logPersonalInformation: true }, true);
        recognizer.recognize(context, properties, metrics).then(res => {
            res.v2 = res.luisResult;
            delete res.luisResult;
            if (!WithinDelta(expected, res, 0.1, false)) {
                fs.outputJSONSync(newPath, res, { spaces: 2 });
                assert(false, "\nReturned JSON\n  " + newPath + "\n!= expected JSON\n  " + expectedPath);
            }
        });

    });

    it('override telemetry by deriving LuisRecognizer and using fill.', () => {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('MyImportantProperty' in telemetry.properties);
                        assert(telemetry.properties['MyImportantProperty'] === "myImportantValue");
                        assert('test' in telemetry.properties);
                        assert(telemetry.properties['test'] === "testvalue");
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties['foo'] === "foovalue");
                        assert('moo' in telemetry.metrics);
                        assert(telemetry.metrics['moo'] === 3.14159);
                        assert('boo' in telemetry.metrics);
                        assert(telemetry.metrics['boo'] === 2.11);
                        break;

                    case 2:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'MySecondEvent');
                        assert(telemetry.properties);
                        assert('MyImportantProperty2' in telemetry.properties);
                        assert(telemetry.properties['MyImportantProperty2'] === "myImportantValue2");
                        break;

                    default:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(false);
                        break;
                }
            }
        }

        var properties = {};
        properties["test"] = "testvalue";
        properties["foo"] = "foovalue";
        var metrics = {};
        metrics["moo"] = 3.14159;
        metrics["boo"] = 2.11;

        var expectedPath = ExpectedPath("SingleIntent_SimplyEntityTelemetry.json");
        var expected = GetExpected(expectedPath);
        var newPath = expectedPath + ".new";
        var context = new TestContext({ text: expected.text });
        var recognizer = new overrideFillRecognizer({ applicationId: luisAppId, endpointKey: endpointKey },
            { includeAllIntents: false, includeInstanceData: true, telemetryClient: telemetryClient, logPersonalInformation: true }, true);
        recognizer.recognize(context, properties, metrics).then(res => {
            res.v2 = res.luisResult;
            delete res.luisResult;
            if (!WithinDelta(expected, res, 0.1, false)) {
                fs.outputJSONSync(newPath, res, { spaces: 2 });
                assert(false, "\nReturned JSON\n  " + newPath + "\n!= expected JSON\n  " + expectedPath);
            }
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
        });
    });

    it('should accept LuisPredictionOptions passed into recognizer "recognize" method', done => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false
        };
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, luisPredictionDefaultOptions, true);
        const mergedOptions = luisPredictionUserOptions ? recognizer.setLuisPredictionOptions(recognizer.options, luisPredictionUserOptions) : recognizer.options;
        assert(mergedOptions.includeAllIntents === false);
        assert(mergedOptions.includeInstanceData === false);
        throttle(done);
    });

    it('should accept LuisRecognizerOptions passed into recognizer "recognize" method', done => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
            apiVersion: 'v3'
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false,
            apiVersion: 'v3'
        };
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, luisPredictionDefaultOptions, true);
        const mergedOptions = recognizer.buildRecognizer(luisPredictionUserOptions)
        assert(mergedOptions.predictionOptions.includeAllIntents === false);
        assert(mergedOptions.predictionOptions.includeInstanceData === false);
        throttle(done);
    });

    it('should accept LuisRecognizerOptions passed into recognizer "recognize" method. v3 to v2', done => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
            apiVersion: 'v3'
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false,
            apiVersion: 'v2'
        };
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, luisPredictionDefaultOptions, true);
        const mergedOptions = recognizer.buildRecognizer(luisPredictionUserOptions)
        assert(mergedOptions.options.includeAllIntents === false);
        assert(mergedOptions.options.includeInstanceData === false);
        throttle(done);
    });

    it('should use default Luis prediction options if no user options passed in', done => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true
        };
        const luisPredictionUserOptions = null;
        const recognizer = new LuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, luisPredictionDefaultOptions, true);
        const mergedOptions = luisPredictionUserOptions ? recognizer.setLuisPredictionOptions(recognizer.options, luisPredictionUserOptions) : recognizer.options;
        assert(mergedOptions.includeAllIntents === true);
        assert(mergedOptions.includeInstanceData === true);
        throttle(done);
    });
});

class telemetryOverrideRecognizer extends LuisRecognizer {
    async onRecognizerResults(recognizerResult, turnContext, properties, metrics) {
        if (!("'MyImportantProperty" in properties)) {
            properties["MyImportantProperty"] = "myImportantValue";
        }
        this.telemetryClient.trackEvent({
            name: "LuisResult",
            properties: properties,
            metrics: metrics
        });

        // Create second event
        const secondProperties = {};
        secondProperties["MyImportantProperty2"] = "myImportantValue2";

        this.telemetryClient.trackEvent({
            name: "MySecondEvent",
            properties: secondProperties
        });
    }
}

class overrideFillRecognizer extends LuisRecognizer {
    async onRecognizerResults(recognizerResult, turnContext, properties, metrics) {
        var props = await this.fillTelemetryProperties(recognizerResult, turnContext, properties);
        if (!("MyImportantProperty" in props)) {
            props["MyImportantProperty"] = "myImportantValue";
        }

        this.telemetryClient.trackEvent({
            name: "LuisResult",
            properties: props,
            metrics: metrics
        });

        // Create second event
        const secondProperties = {};
        secondProperties["MyImportantProperty2"] = "myImportantValue2";

        this.telemetryClient.trackEvent({
            name: "MySecondEvent",
            properties: secondProperties
        });
    }
}

