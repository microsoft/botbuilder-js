const { stub } = require('sinon');
const { NullTelemetryClient } = require('botbuilder-core');

/**
 * Create telemetry client and stub.
 * @param {Function} captureTelemetryAction telemetry action callback.
 */
function createTelemetryClientAndStub(captureTelemetryAction) {
    if (captureTelemetryAction && typeof captureTelemetryAction !== 'function') {
        throw new TypeError(`Failed test arrangement - createtelemetryClientAndStub() received ${ typeof captureTelemetryAction } instead of undefined or a function.`);
    }

    function wrapAction(...args) {
        captureTelemetryAction(...args);
    }
    
    const telemetryClient = new NullTelemetryClient();
    const trackEventStub = stub(telemetryClient, 'trackEvent');

    if (captureTelemetryAction) {
        trackEventStub.callsFake(wrapAction);
    } else {
        trackEventStub.returns({});
    }

    return [telemetryClient, trackEventStub];
}

module.exports.createTelemetryClientAndStub = createTelemetryClientAndStub;
