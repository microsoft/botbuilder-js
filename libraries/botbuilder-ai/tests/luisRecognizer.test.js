/* eslint-disable security/detect-non-literal-fs-filename */
const assert = require('assert');
const fs = require('fs-extra');
const nock = require('nock');
const path = require('path');
const { LuisRecognizer } = require('../');
const { TestAdapter, TurnContext } = require('botbuilder-core');

const luisAppId = '38330cad-f768-4619-96f9-69ea333e594b';

// This can be any endpoint key for calling LUIS
const endpointKey = process.env.LUISAPPKEY || 'MockedKey';

// If this is true, then LUIS responses will come from oracle files.
// If it is false, the LUIS service will be called and if there are changes you will get a new oracle file.
const mockLuis = true;

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities) => {
            this.sent = activities;
        });
    }
}

class ThrowErrorRecognizer extends LuisRecognizer {
    constructor() {
        super(
            { applicationId: luisAppId, endpointKey: endpointKey },
            { includeAllIntents: true, includeInstanceData: true },
            true
        );
    }

    recognize() {
        return new Promise((resolve, reject) => {
            reject(new Error('Test'));
        }).catch((error) => {
            this.prepareErrorMessage(error);
            throw error;
        });
    }
}

class TelemetryOverrideRecognizer extends LuisRecognizer {
    async onRecognizerResults(recognizerResult, turnContext, properties, metrics) {
        if (!("'MyImportantProperty" in properties)) {
            properties.MyImportantProperty = 'myImportantValue';
        }

        this.telemetryClient.trackEvent({
            name: 'LuisResult',
            properties: properties,
            metrics: metrics,
        });

        // Create second event
        const secondProperties = {};
        secondProperties['MyImportantProperty2'] = 'myImportantValue2';

        this.telemetryClient.trackEvent({
            name: 'MySecondEvent',
            properties: secondProperties,
        });
    }
}

class OverrideFillRecognizer extends LuisRecognizer {
    async onRecognizerResults(recognizerResult, turnContext, properties, metrics) {
        const props = await this.fillTelemetryProperties(recognizerResult, turnContext, properties);
        if (!('MyImportantProperty' in props)) {
            props.MyImportantProperty = 'myImportantValue';
        }

        this.telemetryClient.trackEvent({
            name: 'LuisResult',
            properties: props,
            metrics: metrics,
        });

        // Create second event
        const secondProperties = {
            MyImportantProperty2: 'myImportantValue2',
        };

        this.telemetryClient.trackEvent({
            name: 'MySecondEvent',
            properties: secondProperties,
        });
    }
}

async function throttle() {
    return new Promise((resolve) => {
        return mockLuis ? resolve() : setTimeout(resolve, 1000);
    });
}

function isWithinDelta(left, right, delta, compare) {
    let within = true;

    if (left == null || right == null) {
        within = left === right;
    } else if (Array.isArray(left) && Array.isArray(right)) {
        within = left.length === right.length;
        for (let i = 0; within && i < left.length; i++) {
            within = isWithinDelta(left[i], right[i], delta, compare);
        }
    } else if (typeof left === 'object' && typeof right === 'object') {
        within = Object.keys(left).length === Object.keys(right).length;

        Object.keys(left).forEach((key) => {
            within = isWithinDelta(left[key], right[key], delta, compare || key === 'score' || key === 'intents');
        });
    } else if (left !== right) {
        if (left && right && left.Type == right.Type) {
            within = false;
            if (compare && typeof left === 'number' && typeof right === 'number') {
                within = Math.abs(left - right) < delta;
            }
        } else {
            within = false;
        }
    }

    return within;
}

function getExpectedPath(file) {
    return path.join(__dirname, 'TestData', 'LuisRecognizer', file);
}

function getExpectedData(oracle) {
    const expectedData = fs.readJSONSync(oracle);

    const query = 'verbose=(true|false)&staging=false&spellCheck=false&log=true';
    const path = `/luis/v2\\.0/apps/${luisAppId}`;
    const pattern = `${path}\\?${query}`;
    // eslint-disable-next-line security/detect-non-literal-regexp
    const uri = new RegExp(pattern);
    const requestContent = expectedData.text != undefined ? `"${expectedData.text}"` : undefined;
    const responseBody = expectedData.v2;

    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
            .matchHeader('Ocp-Apim-Subscription-Key', endpointKey)
            .matchHeader('authorization', `Bearer ${endpointKey}`)
            .post(uri, requestContent)
            .reply(200, responseBody);
    }

    return expectedData;
}

function returnStatusCode(code) {
    nock('https://westus.api.cognitive.microsoft.com').post(/apps/).reply(code);
}

// To create a file to test:
// 1) Create a <name>.json file with an object { text:<query> } in it.
// 2) Run this test sith mockLuis = false which will fail and generate a <name>.json.new file.
// 3) Check the .new file and if correct, replace the original .json file with it.
async function testJson(
    file,
    {
        includeAllIntents = true,
        includeInstanceData = true,
        logPersonalInformation = true,
        telemetryClient,
        telemetryMetrics,
        telemetryProperties,
    } = {}
) {
    const expectedPath = getExpectedPath(file);
    const expectedData = getExpectedData(expectedPath);
    const newPath = expectedPath + '.new';

    const context = new TestContext({ text: expectedData.text });

    const recognizer = new LuisRecognizer(
        { applicationId: luisAppId, endpointKey },
        {
            includeAllIntents,
            includeInstanceData,
            logPersonalInformation,
            telemetryClient,
        },
        true
    );

    const result = await recognizer.recognize(context, telemetryProperties, telemetryMetrics);

    result.v2 = result.luisResult;
    delete result.luisResult;

    if (!isWithinDelta(expectedData, result, 0.1, false)) {
        fs.outputJSONSync(newPath, result, { spaces: 2 });
        assert.fail('\nReturned JSON\n  ' + newPath + '\n!= expected JSON\n  ' + getExpectedPath);
    } else if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
    }

    return result;
}

describe('LuisRecognizer', function () {
    const recognizer = new LuisRecognizer(
        { applicationId: luisAppId, endpointKey: endpointKey },
        { includeAllIntents: true },
        true
    );

    const maybeIt = !mockLuis && endpointKey === 'MockedKey' ? it.skip : it;

    beforeEach(function () {
        nock.cleanAll();
    });

    afterEach(async function () {
        nock.cleanAll();
        await throttle();
    });

    maybeIt('test built-ins composite1', async () => {
        await testJson('Composite1.json');
    });

    maybeIt('test built-ins composite2', async () => {
        await testJson('Composite2.json');
    });

    maybeIt('test built-ins composite3', async () => {
        await testJson('Composite3.json');
    });

    maybeIt('test built-ins prebuilt', async () => {
        await testJson('Prebuilt.json');
    });

    maybeIt('test patterns', async () => {
        await testJson('Patterns.json');
    });

    maybeIt('test roles', async () => {
        await testJson('roles.json');
    });

    maybeIt('should return single intent and a simple entity', async () => {
        const res = await testJson('SingleIntent_SimplyEntity.json', { includeAllIntents: false });

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
    });

    maybeIt('should return multiple intents and prebuilt entities with a single value', async () => {
        const res = await testJson('MultipleIntents_PrebuiltEntity.json', { includeAllIntents: false });

        assert(res);
        assert(res.text == 'Please deliver February 2nd 2001');
        assert(res.intents);
        assert(res.intents.Delivery);
        assert(res.intents.Delivery.score > 0 && res.intents.Delivery.score <= 1);

        assert(LuisRecognizer.topIntent(res) === 'Delivery');

        const sortedIntents = LuisRecognizer.sortedIntents(res);
        assert(sortedIntents[0].intent) === 'Delivery';
        assert(sortedIntents[sortedIntents.length - 1].intent) === 'EntityTests';

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
    });

    maybeIt('should return multiple intents and prebuilt entities with multiple values', async () => {
        const res = await testJson('MultipleIntents_PrebuiltEntitiesWithMultiValues.json', {
            includeAllIntents: false,
        });

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
    });

    maybeIt('should return multiple intents and a list entity with a single value', async () => {
        const res = await testJson('MultipleIntents_ListEntityWithSingleValue.json', { includeAllIntents: false });

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
    });

    maybeIt('should return multiple intents and a list entity with multiple values', async () => {
        const res = await testJson('MultipleIntents_ListEntityWithMultiValues.json', { includeAllIntents: false });

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
    });

    maybeIt('should return multiple intents and a single composite entity', async () => {
        const res = await testJson('MultipleIntents_CompositeEntityModel.json', { includeAllIntents: false });

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
        assert(res.entities.Address[0].State[0] === 'wa');
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
        assert(res.entities.Address[0].$instance.number[0].text === '98033');
        assert(res.entities.Address[0].$instance.State);
        assert(res.entities.Address[0].$instance.State[0].startIndex);
        assert(res.entities.Address[0].$instance.State[0].startIndex === 27);
        assert(res.entities.Address[0].$instance.State[0].endIndex);
        assert(res.entities.Address[0].$instance.State[0].endIndex === 29);
        assert(res.entities.Address[0].$instance.State[0].score);
        assert(
            res.entities.Address[0].$instance.State[0].score > 0 &&
                res.entities.Address[0].$instance.State[0].score <= 1
        );
    });

    maybeIt('should cache multiple calls to recognize()', async () => {
        const expectedData = getExpectedData(getExpectedPath('SingleIntent_SimplyEntity.json'));

        const recognizer = new LuisRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            { includeAllIntents: true, apiVersion: 'v2', includeAPIResults: true }
        );

        const context = new TestContext({ text: expectedData.text });

        let res = await recognizer.recognize(context);
        assert(res);

        res.text = 'cached';
        res = await recognizer.recognize(context);
        assert(res);
        assert(res.text === 'cached');
    });

    maybeIt('should only return $instance metadata for entities if verbose flag set', async () => {
        const res = await testJson('NoInstanceSimple.json', { includeAllIntents: false, includeInstanceData: false });

        assert(res);
        assert(res.entities);
        assert(res.entities.$instance === undefined);
    });

    maybeIt('should only return $instance metadata for composite entities if verbose flag set', async () => {
        const res = await testJson('NoInstanceComposite.json', { includeInstanceData: false });

        assert(res);
        assert(res.entities);
        assert(res.entities.$instance === undefined);
    });

    maybeIt('should only return empty intent for empty text', async () => {
        const res = await testJson('EmptyText.json');

        const top = LuisRecognizer.topIntent(res);

        assert(top === 'None'); // topIntent() converts '' to 'None'
        assert(Object.keys(res.intents).length == 1);
        assert('' in res.intents);
    });

    maybeIt('should return defaultIntent from topIntent() if results undefined', () => {
        const top = LuisRecognizer.topIntent(undefined);
        assert(top === 'None');
    });

    maybeIt('should return defaultIntent from topIntent() if intent scores below threshold', () => {
        const top = LuisRecognizer.topIntent({ intents: { TestIntent: 0.49 } }, 'None', 0.5);
        assert(top === 'None');
    });

    maybeIt('should emit trace info once per call to recognize', async () => {
        const expectedData = getExpectedData(getExpectedPath('SingleIntent_SimplyEntity.json'));

        const context = new TestContext({ text: expectedData.text });

        await recognizer.recognize(context);
        await recognizer.recognize(context);

        const res = await recognizer.recognize(context);
        assert(res);
        assert(res.text === expectedData.text);

        const traceActivity = context.sent.find((s) => s.type === 'trace' && s.name === 'LuisRecognizer');
        assert(traceActivity);

        assert(traceActivity.type === 'trace');
        assert(traceActivity.name === 'LuisRecognizer');
        assert(traceActivity.label === 'Luis Trace');
        assert(traceActivity.valueType === 'https://www.luis.ai/schemas/trace');
        assert(traceActivity.value);
        assert(traceActivity.value.luisResult);
        assert(traceActivity.value.recognizerResult);
        assert(traceActivity.value.luisOptions);
        assert(traceActivity.value.luisModel);
    });

    maybeIt('should call prepareErrorMessage when a non-200 status code is received.', async () => {
        returnStatusCode(400);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 400: The request's body or parameters are incorrect, meaning they are missing, malformed, or too large.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 401 error message.', async () => {
        returnStatusCode(401);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 401: The key used is invalid, malformed, empty, or doesn't match the region.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 403 error message.', async () => {
        returnStatusCode(403);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 403: Total monthly key quota limit exceeded.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 409 error message.', async () => {
        returnStatusCode(409);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 409: Application loading in progress, please try again.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 410 error message.', async () => {
        returnStatusCode(410);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 410: Please retrain and republish your application.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 414 error message.', async () => {
        returnStatusCode(414);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 414: The query is too long. Please reduce the query length to 500 or less characters.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw expected 429 error message.', async () => {
        returnStatusCode(429);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response 429: Too many requests.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt('should throw unexpected error message with correct status code.', async () => {
        const statusCode = 404;
        returnStatusCode(statusCode);

        const context = new TestContext({ text: 'Hello world!' });
        try {
            await recognizer.recognize(context);
            assert.fail('should have thrown');
        } catch (error) {
            const expectedError = `Response ${statusCode}: Unexpected status code received. Please verify that your LUIS application is properly setup.`;
            assert(error.message === expectedError, `unexpected error message thrown.`);
        }
    });

    maybeIt(
        '.prepareErrorMessage() should not change `error.message` if `error.response.statusCode` does not exist.',
        async () => {
            const recognizer = new ThrowErrorRecognizer();
            const context = new TestContext({ text: 'Hello world!' });
            try {
                await recognizer.recognize(context);
                assert.fail('should have thrown');
            } catch (error) {
                const expectedError = 'Test';
                assert(error.message === expectedError, `unexpected error message thrown.`);
            }
        }
    );

    maybeIt('should send user-agent header.', async () => {
        nock('https://westus.api.cognitive.microsoft.com')
            .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
            .post(/apps/)
            .reply(200, { query: null, intents: [], entities: [] });

        const context = new TestContext({ text: 'Hello world!' });
        await recognizer.recognize(context);
    });

    maybeIt('should successfully construct with valid endpoint.', () => {
        // Note this is NOT a real LUIS application ID nor a real LUIS subscription-key.
        // These are GUIDs edited to look right to the parsing and validation code.
        const mockedEndpoint =
            'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b31aeaf3-3511-495b-a07f-571fc873214b?verbose=true&timezoneOffset=-360&subscription-key=048ec46dc58e495482b0c447cfdbd291&q=';

        const recognizer = new LuisRecognizer(mockedEndpoint);

        assert(recognizer.application.applicationId === 'b31aeaf3-3511-495b-a07f-571fc873214b');
        assert(recognizer.application.endpointKey === '048ec46dc58e495482b0c447cfdbd291');
        assert(recognizer.application.endpoint === 'https://westus.api.cognitive.microsoft.com');
    });

    maybeIt('should throw an error when parsing application endpoint with no subscription-key.', () => {
        const endpointWithNoSubscriptionKey =
            'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b31aeaf3-3511-495b-a07f-571fc873214b?verbose=true&timezoneOffset=-360&q=';
        const expectedSubscriptionKey = undefined;
        try {
            new LuisRecognizer(endpointWithNoSubscriptionKey);
            assert.fail('should have thrown');
        } catch (e) {
            assert.strictEqual(
                e.message,
                `Invalid \`endpointKey\` value detected: ${expectedSubscriptionKey}\nPlease make sure your endpointKey is a valid LUIS Endpoint Key, e.g. "048ec46dc58e495482b0c447cfdbd291".`
            );
        }
    });

    const expectedApplicationId = undefined;
    maybeIt('should throw an error when parsing application endpoint with no application ID.', () => {
        const endpointWithNoAppId =
            'https://westus.api.cognitive.microsoft.com?verbose=true&timezoneOffset=-360&subscription-key=048ec46dc58e495482b0c447cfdbd291&q=';
        try {
            new LuisRecognizer(endpointWithNoAppId);
            assert(false, 'should have thrown an error.');
        } catch (e) {
            assert(
                e.message ===
                    `Invalid \`applicationId\` value detected: ${expectedApplicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`
            );
        }
    });

    maybeIt('should throw an error when parsing non-URL value.', () => {
        try {
            new LuisRecognizer('this.is.not.a.url');
            assert(false, 'should have thrown an error.');
        } catch (e) {
            assert(
                e.message ===
                    `Invalid \`applicationId\` value detected: ${expectedApplicationId}\nPlease make sure your applicationId is a valid LUIS Application Id, e.g. "b31aeaf3-3511-495b-a07f-571fc873214b".`
            );
        }
    });

    maybeIt('null telemetryClient should work.', async () => {
        const res = await testJson('SingleIntent_SimplyEntityTelemetry.json', {
            includeAllIntents: false,
        });

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
    });

    maybeIt('basic telemetry test.', async () => {
        let callCount = 0;
        const telemetryClient = {
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
                        assert('intent2' in telemetry.properties);
                        assert('intentScore' in telemetry.properties);
                        assert('intentScore2' in telemetry.properties);
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
            },
        };

        const res = await testJson('SingleIntent_SimplyEntityTelemetry.json', {
            includeAllIntents: false,
            telemetryClient,
        });

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
    });

    maybeIt('telemetry with multiple entity names returned.', async () => {
        let callCount = 0;
        const telemetryClient = {
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
                        assert('intent2' in telemetry.properties);
                        assert('intentScore' in telemetry.properties);
                        assert('intentScore2' in telemetry.properties);
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
            },
        };

        const res = await testJson('MultipleIntents_ListEntityWithMultiValuesTelemetry.json', { telemetryClient });

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
    });

    maybeIt('override telemetry properties on logging.', async () => {
        let callCount = 0;
        const telemetryClient = {
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
                        assert('intent2' in telemetry.properties);
                        assert('intentScore' in telemetry.properties);
                        assert('intentScore2' in telemetry.properties);
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
            },
        };

        const telemetryProperties = {
            test: 'testvalue',
            foo: 'foovalue',
            intent: 'MYINTENT',
        };

        const res = await testJson('SingleIntent_SimplyEntityTelemetry.json', { telemetryClient, telemetryProperties });

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
    });

    maybeIt('override telemetry by deriving LuisRecognizer.', async () => {
        let callCount = 0;
        const telemetryClient = {
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
                        assert('MyImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.MyImportantProperty === 'myImportantValue');

                        break;

                    case 2:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'MySecondEvent');
                        assert(telemetry.properties);
                        assert('MyImportantProperty2' in telemetry.properties);
                        assert(telemetry.properties['MyImportantProperty2'] === 'myImportantValue2');
                        break;

                    default:
                        console.log('Call number:' + callCount);
                        console.log(telemetry);
                        assert(false);
                        break;
                }
            },
        };

        const properties = {
            test: 'testvalue',
            foo: 'foovalue',
        };

        const metrics = {
            moo: 3.14159,
            boo: 2.11,
        };

        const expectedPath = getExpectedPath('SingleIntent_SimplyEntityTelemetry.json');
        const expectedData = getExpectedData(expectedPath);
        const newPath = expectedPath + '.new';

        const context = new TestContext({ text: expectedData.text });

        const recognizer = new TelemetryOverrideRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            {
                includeAllIntents: false,
                includeInstanceData: true,
                telemetryClient: telemetryClient,
                logPersonalInformation: true,
            },
            true
        );

        const res = await recognizer.recognize(context, properties, metrics);

        res.v2 = res.luisResult;
        delete res.luisResult;

        if (!isWithinDelta(expectedData, res, 0.1, false)) {
            fs.outputJSONSync(newPath, res, { spaces: 2 });
            assert(false, '\nReturned JSON\n  ' + newPath + '\n!= expected JSON\n  ' + expectedPath);
        }
    });

    maybeIt('override telemetry by deriving LuisRecognizer and using fill.', async () => {
        let callCount = 0;
        const telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === 'LuisResult');
                        assert(telemetry.properties);
                        assert('MyImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.MyImportantProperty === 'myImportantValue');
                        assert('test' in telemetry.properties);
                        assert(telemetry.properties['test'] === 'testvalue');
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties['foo'] === 'foovalue');
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
                        assert(telemetry.properties['MyImportantProperty2'] === 'myImportantValue2');
                        break;

                    default:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(false);
                        break;
                }
            },
        };

        const properties = {
            test: 'testvalue',
            foo: 'foovalue',
        };

        const metrics = {
            moo: 3.14159,
            boo: 2.11,
        };

        const expectedPath = getExpectedPath('SingleIntent_SimplyEntityTelemetry.json');
        const expectedData = getExpectedData(expectedPath);
        const newPath = expectedPath + '.new';

        const context = new TestContext({ text: expectedData.text });
        const recognizer = new OverrideFillRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            {
                includeAllIntents: false,
                includeInstanceData: true,
                telemetryClient: telemetryClient,
                logPersonalInformation: true,
            },
            true
        );

        const res = await recognizer.recognize(context, properties, metrics);

        res.v2 = res.luisResult;
        delete res.luisResult;

        if (!isWithinDelta(expectedData, res, 0.1, false)) {
            fs.outputJSONSync(newPath, res, { spaces: 2 });
            assert(false, '\nReturned JSON\n  ' + newPath + '\n!= expected JSON\n  ' + expectedPath);
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

    maybeIt('should accept LuisPredictionOptions passed into recognizer "recognize" method', () => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false,
        };
        const recognizer = new LuisRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            luisPredictionDefaultOptions,
            true
        );
        const mergedOptions = luisPredictionUserOptions
            ? recognizer.setLuisPredictionOptions(recognizer.options, luisPredictionUserOptions)
            : recognizer.options;
        assert(mergedOptions.includeAllIntents === false);
        assert(mergedOptions.includeInstanceData === false);
    });

    maybeIt('should accept LuisRecognizerOptions passed into recognizer "recognize" method', () => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
            apiVersion: 'v3',
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false,
            apiVersion: 'v3',
        };
        const recognizer = new LuisRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            luisPredictionDefaultOptions,
            true
        );
        const mergedOptions = recognizer.buildRecognizer(luisPredictionUserOptions);
        assert(mergedOptions.predictionOptions.includeAllIntents === false);
        assert(mergedOptions.predictionOptions.includeInstanceData === false);
    });

    maybeIt('should accept LuisRecognizerOptions passed into recognizer "recognize" method. v3 to v2', () => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
            apiVersion: 'v3',
        };
        const luisPredictionUserOptions = {
            includeAllIntents: false,
            includeInstanceData: false,
            apiVersion: 'v2',
        };
        const recognizer = new LuisRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            luisPredictionDefaultOptions,
            true
        );
        const mergedOptions = recognizer.buildRecognizer(luisPredictionUserOptions);
        assert(mergedOptions.options.includeAllIntents === false);
        assert(mergedOptions.options.includeInstanceData === false);
    });

    maybeIt('should use default Luis prediction options if no user options passed in', () => {
        const luisPredictionDefaultOptions = {
            includeAllIntents: true,
            includeInstanceData: true,
        };

        const luisPredictionUserOptions = null;
        const recognizer = new LuisRecognizer(
            { applicationId: luisAppId, endpointKey: endpointKey },
            luisPredictionDefaultOptions,
            true
        );
        const mergedOptions = luisPredictionUserOptions
            ? recognizer.setLuisPredictionOptions(recognizer.options, luisPredictionUserOptions)
            : recognizer.options;

        assert(mergedOptions.includeAllIntents === true);
        assert(mergedOptions.includeInstanceData === true);
    });
});
