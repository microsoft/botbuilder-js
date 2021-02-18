const { ok, strictEqual } = require('assert');
const sinon = require('sinon');
const { NullTelemetryClient } = require('botbuilder-core');
const { BoolExpression } = require('adaptive-expressions');
const { asMessageActivity } = require('botframework-schema').ActivityEx;

const qnaIntentText = 'how do I clean the stove?';

const spyOnTelemetryClientTrackEvent = (recognizer) => {
    const telemetryClient = new NullTelemetryClient();
    const spy = sinon.spy(telemetryClient, 'trackEvent');
    recognizer.telemetryClient = telemetryClient;

    return spy;
};

const getLogPersonalInformation = (recognizer, dialogContext) => {
    return recognizer.logPersonalInformation instanceof BoolExpression
        ? recognizer.logPersonalInformation.getValue(dialogContext.state)
        : recognizer.logPersonalInformation;
};

const validateTelemetry = async ({ recognizer, dialogContext, spy, activity, result, callCount }) => {
    const logPii = getLogPersonalInformation(recognizer, dialogContext);
    const expectedTelemetryProps = getExpectedProps(activity, result, logPii);
    const actualTelemetryProps = spy.getCall(callCount - 1).args[0];

    strictEqual(spy.callCount, callCount);
    strictEqual(actualTelemetryProps.name, `${recognizer.constructor.name}Result`);
    ok(hasValidTelemetryProps(actualTelemetryProps.properties, expectedTelemetryProps, activity));
};

module.exports = {
    qnaIntentText,
    getLogPersonalInformation,
    spyOnTelemetryClientTrackEvent,
    validateTelemetry,
};

// **** PRIVATE **** //

const getQnAIntentProps = () => {
    return {
        TopIntent: 'QnAMatch',
        TopIntentScore: '1',
        Intents: '{"QnAMatch":{"score":1}}',
        Entities:
            '{"answer":["BaseCamp: You can use a damp rag to clean around the Power Pack"],"$instance":{"answer":[{"questions":["how do I clean the stove?"],"answer":"BaseCamp: You can use a damp rag to clean around the Power Pack","score":1,"id":5,"source":"Editorial","metadata":[],"context":{"isContextOnly":true,"prompts":[{"displayOrder":0,"qnaId":55,"qna":null,"displayText":"Where can I buy?"}]},"startIndex":0,"endIndex":25}]}}',
        AdditionalProperties:
            '{"answers":[{"questions":["how do I clean the stove?"],"answer":"BaseCamp: You can use a damp rag to clean around the Power Pack","score":1,"id":5,"source":"Editorial","metadata":[],"context":{"isContextOnly":true,"prompts":[{"displayOrder":0,"qnaId":55,"qna":null,"displayText":"Where can I buy?"}]},"startIndex":0,"endIndex":25}]}',
    };
};

const getExpectedProps = (activity, result, logPersonalInformation) => {
    const text = asMessageActivity(activity).text;
    const expectedProps = text === qnaIntentText ? getQnAIntentProps() : {};

    if (logPersonalInformation) {
        expectedProps['Text'] = text;
        expectedProps['AlteredText'] = result.alteredText;
    }

    return expectedProps;
};

const hasValidTelemetryProps = (actual, expected, activity) => {
    if (Object.keys(actual).length !== Object.keys(expected).length) {
        return false;
    }

    for (let property in actual) {
        if (!property in expected) {
            return false;
        }

        if (property === 'Entities') {
            if (!hasValidEntities(activity, actual[property])) {
                return false;
            }
        } else {
            if (actual[property] !== expected[property]) {
                return false;
            }
        }
    }

    return true;
};

const hasValidEntities = (activity, propertyValue) => {
    const text = asMessageActivity(activity).text;
    const actualEntity = JSON.parse(propertyValue);

    if (text == qnaIntentText && !'answer' in actualEntity) {
        return false;
    }

    return true;
};
