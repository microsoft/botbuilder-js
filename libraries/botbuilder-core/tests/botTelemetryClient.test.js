const { ok, strictEqual } = require('assert');
const { Severity, telemetryTrackDialogView } = require('../');

describe('BotTelemetryClient', function() {
    this.timeout(3000);

    describe('"telemetryTrackDialogView" helper', () => {
        it('should call client.trackPageView if it exists', () => {
            const testClient = {
                trackPageView({ name, properties, metrics }) {
                    ok(name);
                    ok(properties);
                    ok(metrics);
                }
            };
            const testProps = { description: 'value' };
            const testMetrics = { duration: 1 };
            telemetryTrackDialogView(testClient, 'dialogName', testProps, testMetrics);
        });

        it('should call client.trackTrace if trackPageView is not supported', () => {
            const testClient = {
                trackTrace({ message, severityLevel }) {
                    ok(message);
                    strictEqual(severityLevel, Severity.Information);
                }
            };
            telemetryTrackDialogView(testClient, 'dialogName');
        });

        it('should throw TypeError if trackTrace and trackPageView do not exist', () => {
            try {
                telemetryTrackDialogView(undefined, 'dialogName');
            } catch (err) {
                strictEqual(err.message, '"telemetryClient" parameter does not have methods trackPageView() or trackTrace()');
            }

            try {
                telemetryTrackDialogView({}, 'dialogName');
            } catch (err) {
                strictEqual(err.message, '"telemetryClient" parameter does not have methods trackPageView() or trackTrace()');
            }

        });
    });
});
