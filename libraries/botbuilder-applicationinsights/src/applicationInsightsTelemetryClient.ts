/**
 * @module botbuilder-applicationinsights
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as appInsights from 'applicationinsights';
import { Activity, BotTelemetryClient, TelemetryDependency, TelemetryEvent, TelemetryException, TelemetryTrace } from 'botbuilder-core';
import * as cls from 'cls-hooked';
import * as crypto from 'crypto';
const ns: any = cls.createNamespace('my.request');

// This is the currently recommended work-around for using Application Insights with async/await
// https://github.com/Microsoft/ApplicationInsights-node.js/issues/296
// This allows AppInsights to automatically apply the appropriate context objects deep inside the async/await chain.
// tslint:disable-next-line:no-submodule-imports
import { CorrelationContext, CorrelationContextManager } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';
const origGetCurrentContext: any = CorrelationContextManager.getCurrentContext;

function getCurrentContext(): any {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    return ns.get('ctx') || origGetCurrentContext();
}

// Overwrite the built-in getCurrentContext() method with a new one.
CorrelationContextManager.getCurrentContext = getCurrentContext;

export const ApplicationInsightsWebserverMiddleware: any = (req: any, res: any, next: any): void => {

    // Check to see if the request contains an incoming request.
    // If so, set it into the Application Insights context.
    const activity: Partial<Activity> = req.body;
    if (activity && activity.id) {
        const context: CorrelationContext = appInsights.getCorrelationContext();

        // tslint:disable-next-line:no-string-literal
        context['activity'] = req.body;
    }

    ns.bindEmitter(req);
    ns.bindEmitter(res);
    ns.run((): void => {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
        ns.set('ctx', origGetCurrentContext());
        next();
    });

};

/* ApplicationInsightsTelemetryClient Class
 * This is a wrapper class around the Application Insights node client.
 * This is primarily designed to be used alongside the WaterfallDialog telemetry collection.
 * It provides a pre-configured App Insights client, and wrappers around
 * the major tracking functions, allowing it to conform to Botbuilder's generic BotTelemetryClient interface.
 * To use it, create pass in an instrumentation key:
 *
 * ```
 * const myDialog = new WaterfallDialog('my_dialog', steps);
 * const appInsightsClient = new ApplicationInsightsTelemetryClient(my_instrumentation_key);
 * myDialog.telemetryClient = appInsightsClient;
 * ```
 */
export class ApplicationInsightsTelemetryClient implements BotTelemetryClient {

    private client: appInsights.TelemetryClient;
    private config: appInsights.Configuration;

    /* The settings parameter is passed directly into appInsights.setup().
     * https://www.npmjs.com/package/applicationinsights#basic-usage
     * This function currently takes an app insights instrumentation key only.
     */
    constructor(instrumentationKey: string) {

        this.config = appInsights.setup(instrumentationKey)
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .start();

        this.client = appInsights.defaultClient;

        this.client.addTelemetryProcessor(addBotIdentifiers);
    }

    /* configuration()
     * Provides access to the Application Insights configuration that is running here.
     * Allows developers to adjust the options, for example:
     * `appInsightsClient.configuration.setAutoCollectDependencies(false)`
     */
    get configuration(): appInsights.Configuration {
        return this.config;
    }

    /* defaultClient()
     * Provides direct access to the telemetry client object, which might be necessary for some operations.
     */
    get defaultClient(): appInsights.TelemetryClient {
        return this.client;
    }

    public trackDependency(telemetry: TelemetryDependency): void {
        this.defaultClient.trackDependency(telemetry as appInsights.Contracts.DependencyTelemetry);
    }

    public trackEvent(telemetry: TelemetryEvent): void {
        this.defaultClient.trackEvent(telemetry as appInsights.Contracts.EventTelemetry);
    }

    public trackException(telemetry: TelemetryException): void {
        this.defaultClient.trackException(telemetry as appInsights.Contracts.ExceptionTelemetry);
    }

    public trackTrace(telemetry: TelemetryTrace): void {
        this.defaultClient.trackTrace(telemetry as appInsights.Contracts.TraceTelemetry);
    }

    public flush(): void {
        this.defaultClient.flush();
    }
}

/* Define the telemetry initializer function which is responsible for setting the userId. sessionId and some other values
 * so that application insights can correlate related events.
 */
function addBotIdentifiers(envelope: appInsights.Contracts.Envelope, context: { [name: string]: any }): boolean {
    if (context.correlationContext && context.correlationContext.activity) {
        const activity: Partial<Activity> = context.correlationContext.activity;
        // tslint:disable-next-line:no-string-literal
        const telemetryItem: any = envelope.data['baseData']; // TODO: update when envelope ts definition includes baseData
        const userId: string = activity.from ? activity.from.id : '';
        const channelId: string = activity.channelId || '';
        const conversationId: string = activity.conversation ? activity.conversation.id : '';
        // Hashed ID is used due to max session ID length for App Insights session Id
        const sessionId: string = conversationId ? crypto.createHash('sha256').update(conversationId).digest('base64') : '';

        // set user id and session id
        envelope.tags[appInsights.defaultClient.context.keys.userId] = channelId + userId;
        envelope.tags[appInsights.defaultClient.context.keys.sessionId] = sessionId;

        // Add additional properties
        telemetryItem.properties = telemetryItem.properties || {};
        telemetryItem.properties.activityId = activity.id;
        telemetryItem.properties.channelId = channelId;
        telemetryItem.properties.activityType = activity.type;
        telemetryItem.properties.conversationId = conversationId;
    }

    return true;
}
