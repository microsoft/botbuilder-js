const { ok, strictEqual } = require('assert');
const sinon = require('sinon');
const { DialogContext } = require('botbuilder-dialogs');
const { NullTelemetryClient } = require('botbuilder-core');
const { BoolExpression } = require('adaptive-expressions');
const { getCodeIntentProperties } = require('./testTelemetryProperties');
const asMessageActivity = require('botframework-schema').ActivityEx.asMessageActivity;
const { createContext, createMessageActivity } = require('./activityUtils');

const codeIntentText = 'intent a1 b2';
const colorIntentText = 'I would like color red and orange';
const greetingIntentTextEnUs = "howdy";
const crossTrainIntentText = "criss-cross applesauce";
const xIntentText = "x";

// how do I make it resolve the string from codeIntentText to be the key
const expectedProperties = {
    [ codeIntentText ]: getCodeIntentProperties
};

// string text, AdaptiveRecognizer recognizer, Mock<IBotTelemetryClient> telemetryClient, int callCount
async function recognizeIntentAndValidateTelemetry(text, recognizer) {
    const dialogContext = createContext(text);
    const activity = dialogContext.context.activity;
    
    const telemetryClient = new NullTelemetryClient();
    const spy = sinon.spy(telemetryClient, 'trackEvent');
    recognizer.telemetryClient = telemetryClient;

    let result = await recognizer.recognize(dialogContext, activity);

    // TODO - validate intent

    const validationConfig = {
        activity,
        dialogContext,
        recognizer,
        result,
        spy,
        telemetryClient, 
    };

    // ValidateTelemetry(recognizer, telemetryClient, dc, activity, result, callCount);
    validateTelemetry(validationConfig);
}

// function validateTelemetry(recognizer, telemetryClient, dialogContext, result, callCount) {
async function validateTelemetry(validationConfig) {
    const { recognizer, spy, dialogContext, activity, result } = validationConfig;
    const eventName = `${recognizer.constructor.name}Result`;
    const logPersonalInformation = recognizer.logPersonalInformation instanceof BoolExpression
        ? recognizer.logPersonalInformation.getValue(dialogContext.state)
        : recognizer.logPersonalInformation;
    
    const expectedTelemetryProps = getExpectedProps(activity, result, logPersonalInformation);
    const actualTelemetryProps = spy.getCall(0).args[0];
    
    ok(spy.calledOnce);
    strictEqual(actualTelemetryProps.name, eventName);
    ok(hasValidTelemetryProps(actualTelemetryProps.properties, expectedTelemetryProps, activity));
}

function hasValidTelemetryProps(actual, expected, activity) {
    if (Object.keys(actual).length !== Object.keys(expected).length) {
        return false;
    }

    for (let property in actual) {
        if (!property in expected) {
            return false;
        }

        if (property === 'Entities') {
            if(!hasValidEntities(activity, actual[property])) {
                return false;
            }
        } else {
            if (actual[property] !== expected[property]) {
                return false;
            }
        }
    }

    return true;
}

function hasValidEntities(activity, propertyValue) {
    const text = asMessageActivity(activity).text;
    const actualEntity = JSON.parse(propertyValue);

    if (text == codeIntentText && !text in actualEntity) {
        return false;
    }

    // if (text == ColorIntentText && !actualEntity.ContainsKey("color"))
    // {
    //     return false;
    // }

    // if (text == GreetingIntentTextEnUs && actualEntity.Count != 0)
    // {
    //     return false;
    // }

    return true;
}

module.exports = {
    codeIntentText: codeIntentText,
    colorIntentText: colorIntentText,
    crossTrainIntentText: crossTrainIntentText,
    greetingIntentTextEnUs: greetingIntentTextEnUs,
    xIntentText: xIntentText,
    recognizeIntentAndValidateTelemetry: recognizeIntentAndValidateTelemetry,
    // validateTelemetry: validateTelemetry
}


// **** PRIVATE **** //
function getExpectedProps(activity, result, logPersonalInformation) {
    const text = asMessageActivity(activity).text;
    const expectedProps = text in expectedProperties ? expectedProperties[text]() : {};

    if (logPersonalInformation) {
        expectedProps['Text'] = text;
        expectedProps['AlteredText'] = result.alteredText;
    }

    return expectedProps;
}

