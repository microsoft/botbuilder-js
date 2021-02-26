const { ok, strictEqual } = require('assert');
const sinon = require('sinon');
const { NullTelemetryClient } = require('botbuilder-core');
const { BoolExpression } = require('adaptive-expressions');
const { asMessageActivity, createMessageActivity } = require('botframework-schema').ActivityEx;
const { createContext } = require('./activityUtils');
const {
    getCodeIntentProperties,
    getColorIntentProperties,
    getGreetingIntentProperties,
    getChooseIntentProperties,
    getXIntentProperties,
} = require('./testTelemetryProperties');
const {
    validateCodeIntent,
    validateColorIntent,
    validateChooseIntent,
    validateGreetingIntent,
    validateXIntent,
} = require('./intentValidations');

const codeIntentText = 'intent a1 b2';
const colorIntentText = 'I would like color red and orange';
const greetingIntentTextEnUs = 'howdy';
const crossTrainText = 'criss-cross applesauce';
const xIntentText = 'x';

/**
 * Get the expected properties based on the text/utterance that we run the recognizer against.
 */
const expectedProperties = {
    [codeIntentText]: getCodeIntentProperties,
    [colorIntentText]: getColorIntentProperties,
    [greetingIntentTextEnUs]: getGreetingIntentProperties,
    [crossTrainText]: getChooseIntentProperties,
    [xIntentText]: getXIntentProperties,
};

/**
 * Run the expected validations based on intent recognized.
 */
const intentValidations = {
    [codeIntentText]: validateCodeIntent,
    [colorIntentText]: validateColorIntent,
    [greetingIntentTextEnUs]: validateGreetingIntent,
    [crossTrainText]: validateChooseIntent,
    [xIntentText]: validateXIntent,
};

const spyOnTelemetryClientTrackEvent = (recognizer) => {
    const telemetryClient = new NullTelemetryClient();
    const spy = sinon.spy(telemetryClient, 'trackEvent');
    recognizer.telemetryClient = telemetryClient;

    return spy;
};

/**
 * Calls the recognizer's `recognize` method and validates that appropriate telemetry properties are logged.
 *
 * @param {*} configuration Configuration used to call recognizer's recognize method and validate telemetry logged.
 */
async function recognizeIntentAndValidateTelemetry({ text, callCount, recognizer, spy: spy }) {
    const dialogContext = createContext(text);
    const activity = dialogContext.context.activity;

    let result = await recognizer.recognize(dialogContext, activity);

    validateIntent(text, result);
    validateTelemetry({
        recognizer,
        dialogContext,
        spy,
        activity,
        result,
        callCount,
    });
}

/**
 * Calls the recognizer's `recognize` method and validates that appropriate telemetry properties are logged,
 * using a custom activity, separate from the activity found in `DialogContext.context`
 *
 * @param {*} configuration Configuration used to call recognizer's recognize method and validate telemetry logged.
 */
async function recognizeIntentAndValidateTelemetry_withCustomActivity({ text, callCount, recognizer, spy: spy }) {
    const dialogContext = createContext(text);
    const customActivity = createMessageActivity();
    customActivity.text = text;
    customActivity.locale = 'en-us';

    let result = await recognizer.recognize(dialogContext, customActivity);

    validateIntent(text, result);
    validateTelemetry({
        recognizer,
        dialogContext,
        spy,
        activity: customActivity,
        result,
        callCount,
    });
}

module.exports = {
    codeIntentText,
    colorIntentText,
    crossTrainText,
    greetingIntentTextEnUs,
    xIntentText,
    recognizeIntentAndValidateTelemetry,
    recognizeIntentAndValidateTelemetry_withCustomActivity,
    spyOnTelemetryClientTrackEvent,
};

// **** PRIVATE **** //

const validateIntent = (text, result) => {
    if (!(text in intentValidations)) {
        throw new Error(`No intent validations for '${text}'`);
    }
    intentValidations[text](result);
};

const validateTelemetry = async ({ recognizer, dialogContext, spy, activity, result, callCount }) => {
    const logPii = getLogPersonalInformation(recognizer, dialogContext);
    const expectedTelemetryProps = getExpectedProps(activity, result, logPii);
    const actualTelemetryProps = spy.getCall(callCount - 1).args[0];

    strictEqual(spy.callCount, callCount);
    strictEqual(actualTelemetryProps.name, `${recognizer.constructor.name}Result`);
    ok(
        hasValidTelemetryProps(actualTelemetryProps.properties, expectedTelemetryProps),
        'Expected telemetry property did not match actual telemetry property logged.'
    );
};

const getLogPersonalInformation = (recognizer, dialogContext) => {
    return recognizer.logPersonalInformation instanceof BoolExpression
        ? recognizer.logPersonalInformation.getValue(dialogContext.state)
        : recognizer.logPersonalInformation;
};

const getExpectedProps = (activity, result, logPersonalInformation) => {
    const text = asMessageActivity(activity).text;
    const expectedProps = text in expectedProperties ? expectedProperties[text]() : {};

    if (logPersonalInformation) {
        expectedProps['Text'] = text;
        expectedProps['AlteredText'] = result.alteredText;
    }

    return expectedProps;
};

const hasValidTelemetryProps = (actual, expected) => {
    if (Object.keys(actual).length !== Object.keys(expected).length) {
        return false;
    }

    return Object.entries(actual).every(([key, value]) => expected[key] === value);
};
