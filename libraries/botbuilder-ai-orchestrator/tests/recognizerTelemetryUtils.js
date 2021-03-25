const { ok, strictEqual } = require('assert');
const sinon = require('sinon');
const { NullTelemetryClient } = require('botbuilder-core');
const { BoolExpression } = require('adaptive-expressions');
const { asMessageActivity } = require('botframework-schema').ActivityEx;

const orchestratorIntentText = 'Hello, Orc!';

const spyOnTelemetryClientTrackEvent = (recognizer) => {
    const telemetryClient = new NullTelemetryClient();
    const spy = sinon.spy(telemetryClient, 'trackEvent');
    recognizer.telemetryClient = telemetryClient;

    return spy;
};

const getLogPersonalInformation = (recognizer, dialogContext) => {
    const result =
        recognizer.logPersonalInformation instanceof BoolExpression
            ? recognizer.logPersonalInformation.getValue(dialogContext.state)
            : recognizer.logPersonalInformation;
    if (result == undefined) return false;
    return result;
};

const validateTelemetry = async ({ recognizer, dialogContext, spy, activity, result, callCount }) => {
    const logPii = getLogPersonalInformation(recognizer, dialogContext);
    const expectedTelemetryProps = getExpectedProps(activity, result, logPii);
    const actualTelemetryProps = spy.getCall(callCount - 1).args[0];

    strictEqual(spy.callCount, callCount);
    strictEqual(actualTelemetryProps.name, `${recognizer.constructor.name}Result`);
    ok(hasValidTelemetryProps(actualTelemetryProps.properties, expectedTelemetryProps));
};

module.exports = {
    orchestratorIntentText,
    getLogPersonalInformation,
    spyOnTelemetryClientTrackEvent,
    validateTelemetry,
};

// **** PRIVATE **** //
const getOrchestratorIntentProps = () => ({
    TopIntent: 'mockLabel',
    TopIntentScore: '0.9',
    NextIntent: 'mockLabel2',
    NextIntentScore: '0.8',
    Intents: JSON.stringify({ mockLabel: { score: 0.9 }, mockLabel2: { score: 0.8 } }),
    Entities: '{}',
    AdditionalProperties: JSON.stringify({
        result: [
            { score: 0.9, label: { name: 'mockLabel' } },
            { score: 0.8, label: { name: 'mockLabel2' } },
        ],
    }),
});

const getExpectedProps = (activity, result, logPersonalInformation) => {
    const text = asMessageActivity(activity).text;
    const expectedProps = text === orchestratorIntentText ? getOrchestratorIntentProps() : {};

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
