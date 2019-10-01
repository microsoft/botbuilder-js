// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

import { BotTelemetryClient, NullTelemetryClient, TelemetryLoggerMiddleware } from 'botbuilder-core';
import { Middleware } from 'botbuilder-core';
import { TurnContext } from 'botbuilder-core';
import { TelemetryClient } from 'applicationinsights';
import { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';
import * as appInsights from 'applicationinsights';

/**
 * Middleware for storing the incoming activity to be made available to Application Insights and optionally run the TelemetryLoggerMiddleware.
 * Uses the botTelemetryClient interface.
 */
export class TelemetryInitializerMiddleware implements Middleware {

    private readonly _telemetryClient: BotTelemetryClient;

    // tslint:disable:variable-name
    private readonly _logActivityTelemetry: boolean;
    private readonly _logPersonalInformation: boolean;
    // tslint:enable:variable-name

    /**
     * Initializes a new instance of the TelemetryInitializerMiddleware class.
     * @param _telemetryClient The TelemetryClient used by the TelemetryLoggerMiddleware for logging activity telemetry.
     * * @param _logActivityTelemetry (Optional) Enable/Disable logging of activity telemetry.
     * * @param _logPersonalInformation (Optional) Enable/Disable logging original message name within Application Insights.
     */
    constructor(telemetryClient: TelemetryClient, logActivityTelemetry: boolean = false, logPersonalInformation: boolean = false) {
        this._telemetryClient = telemetryClient || new NullTelemetryClient();
        this._logActivityTelemetry = logActivityTelemetry;
    }

    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    public get logActivityTelemetry(): boolean { return this._logActivityTelemetry; }

    /**
     * Gets the currently configured botTelemetryClient that logs the events.
     */
    public get telemetryClient(): BotTelemetryClient { return this._telemetryClient; }

    /**
     * Logs events based on incoming and outgoing activities using the botTelemetryClient class.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context === null) {
            throw new Error('context is null');
        }

        if (context.activity && context.activity.id) {
            const correlationContext: CorrelationContext = appInsights.getCorrelationContext();
            correlationContext['activity'] = context.activity;
        }

        if(this._logActivityTelemetry)
        {
            let activityLogger = new TelemetryLoggerMiddleware(this._telemetryClient, this._logPersonalInformation);
            await activityLogger.onTurn(context, next);
        }
        else if (next !== null) {
            await next();
        }
    }
}