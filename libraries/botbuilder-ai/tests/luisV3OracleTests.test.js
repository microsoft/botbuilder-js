const { LuisRecognizer } = require('../');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const luisAppId = '38330cad-f768-4619-96f9-69ea333e594b';
const fs = require('fs-extra');
const nock = require('nock');
const assert = require('assert');

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

function TestJson(file, done, includeAllIntents, includeInstance, telemetryClient, telemetryProperties, telemetryMetrics, logPersonalInformation) {
    if (includeAllIntents === undefined) includeAllIntents = true;
    if (includeInstance === undefined) includeInstance = true;
    if (logPersonalInformation === undefined) logPersonalInformation = true;
    if (telemetryProperties === undefined) telemetryProperties = null;

    const version = 'v3';
    let expectedPath = ExpectedPath(file);
    const oracle = GetExpected(expectedPath);
    const oldResponse = oracle[version];
    const newPath = expectedPath + ".new";
    const query = oracle['text'];
    const context = new TestContext({ text: query });
    const response = oracle[version];
    const oracleOptions = response['options'];
    const options = oracleOptions ? oracleOptions : {apiVersion: 'v3'};
    const luisRecognizer = GetLuisRecognizer({ applicationId: luisAppId, endpointKey: endpointKey }, options, true)

    luisRecognizer.recognize(context, telemetryProperties, telemetryMetrics).then(res => {
        res.v3 = {
            response: res.luisResult
        }
        res.v3.options = options;
        delete res.luisResult;
        if (!WithinDelta(oracle, res, 0.1, false) && res.v3 !== oldResponse) {
            fs.outputJSONSync(newPath, res, { spaces: 2 });
            assert(false, "\nReturned JSON\n  " + newPath + "\n!= expected JSON\n  " + expectedPath);
        }
        else if (fs.existsSync(newPath)) {
            fs.unlinkSync(newPath);
        }
        done(res);
    });
}


function GetExpected(oracle) {
    let expected = fs.readJSONSync(oracle);
    let uri = `/luis/prediction/v3.0/apps/${luisAppId}` ;

    if (expected.v3.options.version) {
        uri += `/versions/${expected.v3.options.version}/predict`
    } else {
        uri += `/slots/${expected.v3.options.slot}/predict`
    }
    
    const params = `?verbose=${expected.v3.options.includeInstanceData}&log=${expected.v3.options.log}&show-all-intents=${expected.v3.options.includeAllIntents}`;
    var responseBody = expected.v3.response;

    if (mockLuis) {
        nock('https://westus.api.cognitive.microsoft.com')
        .post(uri + params)
        .reply(200, responseBody);
    }
    return expected;
}

function ExpectedPath(file) {
    return __dirname + "/TestData/LuisRecognizerV3/" + file;
}

function GetLuisRecognizer(application, options, includeApiResults ) {
    const optsV3 = {
        apiVersion: 'v3',
        includeAPIResults: includeApiResults,
        ...options
    }

    return new LuisRecognizer(application, optsV3);
}

function throttle(callback) {
    if (mockLuis) {
        callback();
    } else {
        // If actually calling LUIS, need to throttle our requests
        setTimeout(callback, 1000);
    }
}

describe('LuisRecognizer V3', function () {
    this.timeout(15000);

    if (!mockLuis && endpointKey === "MockedKey") {
        console.warn('WARNING: skipping LuisRecognizer test suite because the LUISAPPKEY environment variable is not defined');
        return;
    }

    it('Composite1', done => TestJson("Composite1.json", res => throttle(done)));

    it('Composite2', done => TestJson("Composite2.json", res => throttle(done)));

    it('Composite 3', done => TestJson("Composite3.json", res => throttle(done)));

    it('DynamicLists', done => TestJson("DynamicListsAndList.json", res => throttle(done)));

    it('ExternalEntitiesAndBuiltin', done => TestJson("ExternalEntitiesAndBuiltin.json", res => throttle(done)));

    it('ExternalEntitiesAndComposite', done => TestJson("ExternalEntitiesAndComposite.json", res => throttle(done)));

    it('ExternalEntitiesAndList', done => TestJson("ExternalEntitiesAndList.json", res => throttle(done)));

    it('ExternalEntitiesAndRegex', done => TestJson("ExternalEntitiesAndRegex.json", res => throttle(done)));

    it('ExternalEntitiesAndSimple', done => TestJson("ExternalEntitiesAndSimple.json", res => throttle(done)));

    it('ExternalEntitiesAndSimpleOverride', done => TestJson("ExternalEntitiesAndSimpleOverride.json", res => throttle(done)));

    it('GeoPeopleOrdinal', done => TestJson("GeoPeopleOrdinal.json", res => throttle(done)));

    it('Minimal', done => TestJson("Minimal.json", res => throttle(done)));

    it('Prebuilt', done => TestJson("Prebuilt.json", res => throttle(done)));

    it('Patterns', done => TestJson("Patterns.json", res => throttle(done)));

    it('roles', done => TestJson("roles.json", res => throttle(done)));

    it('NoEntitiesInstanceTrue', done => TestJson("NoEntitiesInstanceTrue.json", res => throttle(done)));

    it('DateTimeReference', done => TestJson("DateTimeReference.json", res => throttle(done)));

})


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