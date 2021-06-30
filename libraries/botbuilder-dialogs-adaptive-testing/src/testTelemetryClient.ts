import {
    BotTelemetryClient,
    TelemetryDependency,
    TelemetryEvent,
    TelemetryException,
    TelemetryTrace,
} from 'botbuilder-core';

/**
 * A test bot telemetry client that implements [BotTelemetryClient](xref:botbuilder-core.BotTelemetryClient).
 */
export class TestTelemetryClient implements BotTelemetryClient {

    //Trace all events happened in trackEvents method
    public invocations: string[] = [];
    /**
     * Creates a new instance of the [TestTelemetryClient](xref:botbuilder-dialogs-adaptive-testing.TestTelemetryClient) class.
     * @param settings Optional. Settings for the telemetry client.
     */
    constructor(settings?: any) {
        // noop
    }

    /**
     * Sends information about an external dependency (outgoing call) in the application.
     * @param telemetry An object implementing [TelemetryDependency](xref:botbuilder-core.TelemetryDependency).
     */
    trackDependency(telemetry: TelemetryDependency) {
        // noop
    }

    /**
     * Logs custom events with extensible named fields.
     * @param telemetry An object implementing [TelemetryEvent](xref:botbuilder-core.TelemetryEvent).
     */
    trackEvent(telemetry: TelemetryEvent) {
        this.invocations.push(telemetry.name);
    }

    /**
     * Logs a system exception.
     * @param telemetry An object implementing [TelemetryException](xref:botbuilder-core.TelemetryException).
     */
    trackException(telemetry: TelemetryException) {
        // noop
    }

    /**
     * Sends a trace message.
     * @param telemetry An object implementing [TelemetryTrace](xref:botbuilder-core.TelemetryTrace).
     */
    trackTrace(telemetry: TelemetryTrace) {
        // noop
    }

    /**
     * Flushes the in-memory buffer and any metrics being pre-aggregated.
     */
    flush() {
        // noop
    }
}
