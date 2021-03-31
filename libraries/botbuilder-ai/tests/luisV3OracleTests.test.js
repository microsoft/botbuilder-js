const { LuisRecognizer } = require('../');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const luisAppId = '38330cad-f768-4619-96f9-69ea333e594b';
const fs = require('fs-extra');
const nock = require('nock');
const assert = require('assert');

// This can be any endpoint key for calling LUIS
const endpointKey = process.env.LUISAPPKEY || 'MockedKey';

// If this is true, then LUIS responses will come from oracle files.
// If it is false, the LUIS service will be called and if there are changes you will get a new oracle file.
const mockLuis = true;

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, _next) => {
            this.sent = activities;
        });
    }
}

async function TestJson(
    file,
    includeAllIntents,
    includeInstance,
    telemetryClient,
    telemetryProperties,
    telemetryMetrics,
    logPersonalInformation
) {
    if (includeAllIntents === undefined) includeAllIntents = true;
    if (includeInstance === undefined) includeInstance = true;
    if (logPersonalInformation === undefined) logPersonalInformation = true;
    if (telemetryProperties === undefined) telemetryProperties = null;

    const version = 'v3';
    const expectedPath = ExpectedPath(file);
    const oracle = GetExpected(expectedPath);
    const oldResponse = oracle[version];
    const newPath = expectedPath + '.new';
    const query = oracle['text'];
    const context = new TestContext({ text: query });
    const response = oracle[version];
    const oracleOptions = response['options'];
    const options = oracleOptions ? oracleOptions : { apiVersion: 'v3' };
    const luisRecognizer = GetLuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, options, true);

    const res = await luisRecognizer.recognize(context, telemetryProperties, telemetryMetrics);
    res.v3 = {
        response: res.luisResult,
    };
    res.v3.options = options;
    delete res.luisResult;
    if (!WithinDelta(oracle, res, 0.1, false) && res.v3 !== oldResponse) {
        fs.outputJSONSync(newPath, res, { spaces: 2 });
        assert(false, '\nReturned JSON\n  ' + newPath + '\n!= expected JSON\n  ' + expectedPath);
    } else if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
    }
    return res;
}

function GetExpected(oracle) {
    const expected = fs.readJSONSync(oracle);
    let uri = `/luis/prediction/v3.0/apps/${luisAppId}`;

    if (expected.v3.options.version) {
        uri += `/versions/${expected.v3.options.version}/predict`;
    } else {
        uri += `/slots/${expected.v3.options.slot}/predict`;
    }

    const params = `?verbose=${expected.v3.options.includeInstanceData}&log=${expected.v3.options.log}&show-all-intents=${expected.v3.options.includeAllIntents}`;
    const responseBody = expected.v3.response;

    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
            .post(uri + params)
            .reply(200, responseBody);
    }
    return expected;
}

function ExpectedPath(file) {
    return __dirname + '/TestData/LuisRecognizerV3/' + file;
}

function GetLuisRecognizer(application, options, includeApiResults) {
    const optsV3 = {
        apiVersion: 'v3',
        includeAPIResults: includeApiResults,
        ...options,
    };

    return new LuisRecognizer(application, optsV3);
}

describe('LuisRecognizer V3', function () {
    this.timeout(15000);

    afterEach(async function () {
        if (!mockLuis) {
            // If actually calling LUIS, need to throttle our requests
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    });

    if (!mockLuis && endpointKey === 'MockedKey') {
        console.warn(
            'WARNING: skipping LuisRecognizer test suite because the LUISAPPKEY environment variable is not defined'
        );
        return;
    }

    it('Composite1', async function () {
        await TestJson('Composite1.json');
    });

    it('Composite2', async function () {
        await TestJson('Composite2.json');
    });

    it('Composite3', async function () {
        await TestJson('Composite3.json');
    });

    it('DynamicListsAndList', async function () {
        await TestJson('DynamicListsAndList.json');
    });

    it('ExternalEntitiesAndBuiltin', async function () {
        await TestJson('ExternalEntitiesAndBuiltin.json');
    });

    it('ExternalEntitiesAndComposite', async function () {
        await TestJson('ExternalEntitiesAndComposite.json');
    });

    it('ExternalEntitiesAndList', async function () {
        await TestJson('ExternalEntitiesAndList.json');
    });

    it('ExternalEntitiesAndRegex', async function () {
        await TestJson('ExternalEntitiesAndRegex.json');
    });

    it('ExternalEntitiesAndSimple', async function () {
        await TestJson('ExternalEntitiesAndSimple.json');
    });

    it('ExternalEntitiesAndSimpleOverride', async function () {
        await TestJson('ExternalEntitiesAndSimpleOverride.json');
    });

    it('GeoPeopleOrdinal', async function () {
        await TestJson('GeoPeopleOrdinal.json');
    });

    it('Minimal', async function () {
        await TestJson('Minimal.json');
    });

    it('Prebuilt', async function () {
        await TestJson('Prebuilt.json');
    });

    it('Patterns', async function () {
        await TestJson('Patterns.json');
    });

    it('roles', async function () {
        await TestJson('roles.json');
    });

    it('NoEntitiesInstanceTrue', async function () {
        await TestJson('NoEntitiesInstanceTrue.json');
    });

    it('DateTimeReference', async function () {
        await TestJson('DateTimeReference.json');
    });
});

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
