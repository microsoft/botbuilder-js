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


export class ApplicationInsightsTelemetryClient implements BotTelemetryClient {

    private _telemetryClient: any;

    // TODO: Do we want to expose the post-setup options for developers to configure themselve?
    constructor(settings: any) {

        appInsights.setup(settings)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .start(); 

        this._telemetryClient = appInsights.defaultClient;

        this._telemetryClient.addTelemetryProcessor(addBotIdentifiers);
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