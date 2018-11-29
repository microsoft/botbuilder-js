/**
 * @module botbuilder-applicationinsights
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotTelemetryClient, Severity } from 'botbuilder-core';
const appInsights = require('applicationinsights');
const cls = require('cls-hooked');
const ns = cls.createNamespace('my.request');

// This is the currently recommended work-around for using Application Insights with async/await
// https://github.com/Microsoft/ApplicationInsights-node.js/issues/296
// This allows AppInsights to automatically apply the appropriate context objects deep inside the async/await chain.
const correlationContextManager = require('applicationinsights/out/AutoCollection/CorrelationContextManager').CorrelationContextManager;
const origGetCurrentContext = correlationContextManager.getCurrentContext;

function getCurrentContext(){
  return ns.get('ctx') || origGetCurrentContext();
}

// Overwrite the built-in getCurrentContext() method with a new one.
correlationContextManager.getCurrentContext = getCurrentContext;

export const ApplicationInsightsWebserverMiddleware = function (req, res, next) {

  // Check to see if the request contains an incoming request.
  // If so, set it into the Application Insights context.
  const activity = req.body;
  if (activity && activity.id) {
    const context = appInsights.getCorrelationContext();
    context.activity = req.body;
  }

  ns.bindEmitter(req);
  ns.bindEmitter(res);
  ns.run(function(){
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

    private _telemetryClient: any;
    private _configuration: any;

    /* The settings parameter is passed directly into appInsights.setup().
     * https://www.npmjs.com/package/applicationinsights#basic-usage
     * This function currently takes an app insights instrumentation key only.
     */
    constructor(settings: any) {

        this._configuration = appInsights.setup(settings);

        this._configuration.setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .start(); 

        this._telemetryClient = appInsights.defaultClient;

        this._telemetryClient.addTelemetryProcessor(addBotIdentifiers);
    }

    /* configuration() 
     * Provides access to the Application Insights configuration that is running here.
     * Allows developers to adjust the options, for example:
     * `appInsightsClient.configuration.setAutoCollectDependencies(false)`
     */
    get configuration() {
        return this._configuration;
    }

    /* defaultClient()
     * Provides direct access to the telemetry client object, which might be necessary for some operations.
     */
    get defaultClient() {
        return this._telemetryClient;
    }
    

    trackDependency(telemetry: { id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number}) {
        this._telemetryClient.trackDependency(telemetry);
    }

    trackEvent(telemetry: { name: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number } })  {
        this._telemetryClient.trackEvent(telemetry);
    }

    trackException(telemetry: { exception: Error, handledAt?: string, properties?: {[key:string]:string}, measurements?: {[key:string]:number}, severityLevel?: Severity})  {
        this._telemetryClient.trackException(telemetry)
    }

    trackTrace(telemetry: { message: string, properties?: {[key:string]:string}, severityLevel?: Severity }) {
        this._telemetryClient.trackTrace(telemetry);
    }

    flush()  {
        this._telemetryClient.flush();
    }

}

/* Define the telemetry initializer function which is responsible for setting the userId. sessionId and some other values
 * so that application insights can correlate related events.
 */
function addBotIdentifiers(envelope, context) {
    if (context.correlationContext && context.correlationContext.activity) {
        const activity = context.correlationContext.activity;
        const telemetryItem = envelope.data.baseData;
        const userId = activity.from ? activity.from.id : '';
        const channelId = activity.channelId || '';
        const conversationId = activity.conversation ? activity.conversation.id : '';

        // set user id and session id
        envelope.tags[appInsights.defaultClient.context.keys.userId] = channelId + userId;
        envelope.tags[appInsights.defaultClient.context.keys.sessionId] = conversationId;

        // Add additional properties
        telemetryItem.properties = telemetryItem.properties || {};
        telemetryItem.properties["activityId"] = activity.id;
        telemetryItem.properties["channelId"] = channelId;
        telemetryItem.properties["activityType"] = activity.type;
    }
}