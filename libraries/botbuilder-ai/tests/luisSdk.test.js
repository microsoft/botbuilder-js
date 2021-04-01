const assert = require('assert');
const fs = require('fs-extra');
const nock = require('nock');
const { LUISRuntimeClient } = require('@azure/cognitiveservices-luis-runtime');
const msRest = require('@azure/ms-rest-js');

const applicationId = '756de20e-f1e6-4dca-b80a-406a31d7054b';
// This can be any endpoint key for calling LUIS
const endpointKey = process.env.LUISAPPKEY || '77fe817cc79f48bd9323a0b4eafef9fa';

// If this is true, then LUIS responses will come from oracle files.
// If it is false, the LUIS service will be called and if there are changes you will get a new oracle file.
const mockLuis = true;

const baseUrl = 'https://westus.api.cognitive.microsoft.com';
const creds = new msRest.TokenCredentials(endpointKey);

function ExpectedPath(file) {
    return __dirname + '/TestData/LuisSdk/' + file;
}

function GetExpected(oracle) {
    const expected = fs.readJSONSync(oracle);

    const query = 'verbose=(true|false)(&staging=false&spellCheck=false&log=true|)';
    const path = `/luis/v2\\.0/apps/${applicationId}`;
    const pattern = `${path}\\?${query}`;
    const uri = new RegExp(pattern); // eslint-disable-line security/detect-non-literal-regexp
    const requestContent = expected.text != undefined ? `"${expected.text}"` : undefined;
    const responseBody = expected;

    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
            .matchHeader('ocp-apim-subscription-key', endpointKey)
            .matchHeader('authorization', `Bearer ${endpointKey}`)
            .post(uri, requestContent)
            .reply(200, responseBody);
    }
    return expected;
}

function WithinDelta(token1, token2, delta, compare) {
    let within = true;
    if (token1 == null || token2 == null) {
        within = token1 == token2;
    } else if (Array.isArray(token1) && Array.isArray(token2)) {
        within = token1.length == token2.length;
        for (let i = 0; within && i < token1.length; ++i) {
            within = WithinDelta(token1[i], token2[i], delta, compare);
        }
    } else if (typeof token1 === 'object' && typeof token2 === 'object') {
        Object.keys(token2).forEach((k) => token2[k] === undefined && delete token2[k]);
        within = Object.keys(token1).length === Object.keys(token2).length;
        Object.keys(token1).forEach(function (key) {
            if (!within) return;
            within = WithinDelta(token1[key], token2[key], delta, compare || key === 'score' || key === 'intents');
        });
    } else if (token1 !== token2) {
        if (token1 !== undefined && token2 != undefined && token1.Type == token2.Type) {
            within = false;
            if (compare && typeof token1 === 'number' && typeof token2 === 'number') {
                within = Math.abs(token1 - token2) < delta;
            }
        } else {
            within = false;
        }
    }
    return within;
}

// To create a file to test:
// 1) Create a <name>.json file with an object { text:<query> } in it.
// 2) Run this test sith mockLuis = false which will fail and generate a <name>.json.new file.
// 3) Check the .new file and if correct, replace the original .json file with it.
async function TestJson(file, includeAllIntents = true, includeInstance = true) {
    const expectedPath = ExpectedPath(file);
    const expected = GetExpected(expectedPath);

    const newPath = expectedPath + '.new';

    const client = new LUISRuntimeClient(creds, baseUrl);
    const result = await client.prediction.resolve(applicationId, expected.query, {
        includeAllIntents: includeAllIntents,
        includeInstance: includeInstance,
        verbose: true,
        customHeaders: {
            'Ocp-Apim-Subscription-Key': endpointKey,
            'User-Agent': 'botbuilder',
        },
    });
    result.v2 = result.luisResult;
    delete result.luisResult;
    if (!WithinDelta(expected, result, 0.1, false)) {
        fs.outputJSONSync(newPath, result, { spaces: 2 });
        assert(false, '\nReturned JSON\n ' + newPath + '\n!= expected JSON\n ' + expectedPath);
    } else if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
    }
    return result;
}

function findIntent(key, data) {
    let i;
    const len = data.length;
    for (i = 0; i < len; i++) {
        if (data[i] && data[i].intent == key) {
            return data[i];
        }
    }
    return null;
}
function findEntityByType(key, data) {
    let i;
    const len = data.length;
    for (i = 0; i < len; i++) {
        if (data[i] && data[i].type == key) {
            return data[i];
        }
    }
    return null;
}
function findEntity(key, data) {
    let i;
    const len = data.length;
    for (i = 0; i < len; i++) {
        if (data[i] && data[i].entity == key) {
            return data[i];
        }
    }
    return null;
}

function findCompositeByParentType(key, data) {
    let i;
    const len = data.length;
    for (i = 0; i < len; i++) {
        if (data[i] && data[i].parentType == key) {
            return data[i];
        }
    }
    return null;
}

describe('LuisPredict', function () {
    this.timeout(10000);
    if (!mockLuis && endpointKey === 'MockedKey') {
        console.warn(
            'WARNING: skipping LuisRecognizer test suite because the LUISAPPKEY environment variable is not defined'
        );
        return;
    }
    it('test built-ins composite1', async function () {
        await TestJson('Composite1.json');
    });
    it('test built-ins composite2', async function () {
        await TestJson('Composite2.json');
    });
    it('test built-ins composite3', async function () {
        await TestJson('Composite3.json');
    });
    it('test built-ins prebuilt', async function () {
        await TestJson('Prebuilt.json');
    });
    it('test patterns', async function () {
        await TestJson('Patterns.json');
    });
    it('should return single intent and a simple entity', async function () {
        const result = await TestJson('SingleIntent_SimplyEntity.json', false);

        assert(result);
        assert(result.query == 'My name is Emad');
        const specifyName = findIntent('SpecifyName', result.intents);
        assert(specifyName != null);
        assert(specifyName.score > 0 && specifyName.score <= 1);
        assert(result.entities);
        const name = findEntityByType('Name', result.entities);
        assert(name);
        assert(name.entity === 'emad');
        assert(name.startIndex === 11);
        assert(name.endIndex === 14);
        assert(name.score > 0 && name.score <= 1);
    });

    it('should return multiple intents and prebuilt entities with a single value', async function () {
        const result = await TestJson('MultipleIntents_PrebuiltEntity.json');

        assert(result);
        assert(result.query == 'Please deliver February 2nd 2001');
        assert(result.intents);
        const delivery = findIntent('Delivery', result.intents);
        assert(delivery != null);
        assert(delivery.score > 0 && delivery.score <= 1);
        assert(result.topScoringIntent.intent == 'Delivery');
        assert(result.entities);
        const year = findEntity('2001', result.entities);
        assert(year);
        assert(year.type == 'builtin.number');
        assert(year.startIndex == 28);
        assert(year.endIndex == 31);
        const dateTime = findEntityByType('builtin.datetimeV2.date', result.entities);
        assert(dateTime.startIndex == 15);
        assert(dateTime.endIndex == 31);
    });

    it('should return multiple intents and prebuilt entities with multiple values', async function () {
        const result = await TestJson('MultipleIntents_PrebuiltEntitiesWithMultiValues.json');

        assert(result);
        assert(result.query == 'Please deliver February 2nd 2001 in room 201');
        assert(result.intents);
        const deliveryIntent = findIntent('Delivery', result.intents);
        assert(deliveryIntent != null);
        assert(deliveryIntent.score > 0 && deliveryIntent.score <= 1);
        assert(result.entities);
        const dateTime = findEntityByType('builtin.datetimeV2.date', result.entities);
        assert(dateTime.startIndex == 15);
        assert(dateTime.endIndex == 31);
        const builtin = findEntityByType('builtin.dimension', result.entities);
        assert(builtin.startIndex == 28);
        assert(builtin.endIndex == 34);
    });

    it('should return multiple intents and a list entity with a single value', async function () {
        const result = await TestJson('MultipleIntents_ListEntityWithSingleValue.json');

        assert(result);
        assert(result.query == 'I want to travel on united');
        assert(result.intents);
        const travelIntent = findIntent('Travel', result.intents);
        assert(travelIntent != null);
        assert(travelIntent.score > 0 && travelIntent.score <= 1);
        assert(result.entities);
        const airline = findEntityByType('Airline', result.entities);
        assert(airline);
        assert(airline.entity == 'united');
        assert(airline.startIndex);
        assert(airline.startIndex == 20);
        assert(airline.endIndex);
        assert(airline.endIndex == 25);
    });

    it('should return multiple intents and a list entity with multiple values', async function () {
        const result = await TestJson('MultipleIntents_ListEntityWithMultiValues.json');

        assert(result);
        assert(result.query == 'I want to travel on DL');
        assert(result.intents);
        const travelIntent = findIntent('Travel', result.intents);
        assert(travelIntent != null);
        assert(travelIntent.score > 0 && travelIntent.score <= 1);
        assert(result.entities);
        const builtIn = findEntityByType('builtin.dimension', result.entities);
        assert(builtIn);
        assert(builtIn.startIndex);
        assert(builtIn.startIndex == 20);
        assert(builtIn.endIndex);
        assert(builtIn.endIndex == 21);
        const airline = findEntityByType('Airline', result.entities);
        assert(airline);
        assert(airline.startIndex);
        assert(airline.startIndex == 20);
        assert(airline.endIndex);
        assert(airline.endIndex == 21);
    });

    it('should return multiple intents and a single composite entity', async function () {
        const result = await TestJson('MultipleIntents_CompositeEntityModel.json');

        assert(result);
        assert(result.query == 'Please deliver it to 98033 WA');
        assert(result.intents);
        const deliveryIntent = findIntent('Delivery', result.intents);
        assert(deliveryIntent != null);
        assert(deliveryIntent.score > 0 && deliveryIntent.score <= 1);
        assert(result.entities);
        const stateEntity = findEntityByType('State', result.entities);
        assert(stateEntity.entity === 'wa');
        assert(stateEntity.startIndex == 27);
        assert(stateEntity.endIndex == 28);
        assert(stateEntity);
        const addressEntity = findEntityByType('Address', result.entities);
        assert(addressEntity);
        assert(addressEntity.entity === '98033 wa');
        assert(addressEntity.startIndex == 21);
        assert(addressEntity.endIndex == 28);
        const addressNumber = findEntityByType('builtin.number', result.entities);
        assert(addressNumber);
        assert(addressNumber.entity === '98033');
        assert(addressNumber.startIndex == 21);
        assert(addressNumber.endIndex == 25);
        const composite = findCompositeByParentType('Address', result.compositeEntities);
        assert(composite.value === '98033 wa');
    });
});
