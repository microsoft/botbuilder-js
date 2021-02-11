const { ok, strictEqual } = require('assert');
const sinon = require('sinon');
const { Culture } = require('@microsoft/recognizers-text-suite');
const { NullTelemetryClient } = require('botbuilder-core');
const { BoolExpression } = require('adaptive-expressions');
const { asMessageActivity, createMessageActivity } = require('botframework-schema').ActivityEx;
const { createContext } = require('./activityUtils');
const { getCodeIntentProperties, getColorIntentProperties, getGreetingIntentProperties } = require('./testTelemetryProperties');
const { validateCodeIntent, validateColorIntent, validateGreetingIntent } = require('./intentValidations')


const codeIntentText = 'intent a1 b2';
const colorIntentText = 'I would like color red and orange';
const greetingIntentTextEnUs = "howdy";
const crossTrainIntentText = "criss-cross applesauce";
const xIntentText = "x";

const expectedProperties = {
    [ codeIntentText ]: getCodeIntentProperties,
    [ colorIntentText ]: getColorIntentProperties,
    [ greetingIntentTextEnUs ]: getGreetingIntentProperties,
};

const intentValidations = {
    [ codeIntentText ]: validateCodeIntent,
    [ colorIntentText ]: validateColorIntent,
    [ greetingIntentTextEnUs ]: validateGreetingIntent
}

const spyOnTelemetryClientTrackEvent = (recognizer) => {
    const telemetryClient = new NullTelemetryClient();
    const spy = sinon.spy(telemetryClient, 'trackEvent');
    recognizer.telemetryClient = telemetryClient;

    return spy;
}

async function recognizeIntentAndValidateTelemetry({ text, callCount, recognizer, spy: spy }) {
    const dialogContext = createContext(text);
    const activity = dialogContext.context.activity;

    let result = await recognizer.recognize(dialogContext, activity);

    validateIntent(text, result);
    validateTelemetry({
        recognizer, dialogContext, spy, activity, result, callCount
    });
}
async function recognizeIntentAndValidateTelemetry_withCustomActivity({ text, callCount, recognizer, spy: spy }) {
    const dialogContext = createContext(text);
    const customActivity = createMessageActivity();
    customActivity.text = text;
    customActivity.locale = Culture.English;

    let result = await recognizer.recognize(dialogContext, customActivity);

    validateIntent(text, result);
    validateTelemetry({
        recognizer, dialogContext, spy, activity: customActivity, result, callCount
    });
}

module.exports = {
    codeIntentText,
    colorIntentText,
    crossTrainIntentText,
    greetingIntentTextEnUs,
    xIntentText,
    recognizeIntentAndValidateTelemetry,
    recognizeIntentAndValidateTelemetry_withCustomActivity,
    spyOnTelemetryClientTrackEvent
}


// **** PRIVATE **** //


const validateIntent = (text, result) => {
    if (!text in intentValidations) {
        throw new Error(`No intent validations for '${text}'`);
    }
    intentValidations[text](result);
}

const validateTelemetry = async ({ recognizer, dialogContext, spy, activity, result, callCount }) => {
    const logPii = getLogPersonalInformation(recognizer, dialogContext);
    const expectedTelemetryProps = getExpectedProps(activity, result, logPii);
    const actualTelemetryProps = spy.getCall(callCount - 1).args[0];
    
    strictEqual(spy.callCount, callCount);
    strictEqual(actualTelemetryProps.name, `${recognizer.constructor.name}Result`);
    ok(
        hasValidTelemetryProps(actualTelemetryProps.properties, expectedTelemetryProps, activity)
    );
}

const getLogPersonalInformation = (recognizer, dialogContext) => {
    return recognizer.logPersonalInformation instanceof BoolExpression
        ? recognizer.logPersonalInformation.getValue(dialogContext.state)
        : recognizer.logPersonalInformation;
}

const getExpectedProps = (activity, result, logPersonalInformation) => {
    const text = asMessageActivity(activity).text;
    const expectedProps = text in expectedProperties ? expectedProperties[text]() : {};

    if (logPersonalInformation) {
        expectedProps['Text'] = text;
        expectedProps['AlteredText'] = result.alteredText;
    }

    return expectedProps;
}

const hasValidTelemetryProps = (actual, expected, activity) => {
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

const hasValidEntities = (activity, propertyValue) => {
    const text = asMessageActivity(activity).text;
    const actualEntity = JSON.parse(propertyValue);

    if (text == codeIntentText && !'code' in actualEntity) {
        return false;
    }

    if (text == colorIntentText && !'color' in actualEntity) {
        return false;
    }

    // if (text == GreetingIntentTextEnUs && actualEntity.Count != 0)
    // {
    //     return false;
    // }

    return true;
}

