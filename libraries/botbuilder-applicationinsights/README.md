# Bot Builder Application Insights

Application Insights extensions for Microsoft BotBuilder.

- [Installing](#installing)
- [Basic Use](#use)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-azure/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the latest version of this package to your bot:

```bash
npm install --save botbuilder-applicationinsights
```

#### Use the Daily Build

To get access to the daily builds of this library, configure npm to use the MyGet feed before installing.

```bash
npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/
```

To reset the registry in order to get the latest published version, run:
```bash
npm config set registry https://registry.npmjs.org/
```

## What's Included

This module contains interfaces to use the Application Insights services to back Bot Builder's metrics and reporting needs.

Using this module along with the `dialog.telemetryClient` property will create Waterfall Dialogs that emit Application Insights
events for each step of the dialog, and which can automatically be correlated with all other actions taken to fufill an incoming request.

## Use

Import the module into your app. Make sure to import both the `ApplicationInsightsTelemetryClient` class and the `ApplicationInsightsWebserverMiddleware` function.
In order to function properly, it is recommended that you import this module as early as possible in your application code -- preferably as the first import.

```javascript
const { ApplicationInsightsTelemetryClient, ApplicationInsightsWebserverMiddleware } = require('botbuilder-applicationinsights');
```

Create an instance of the ApplicationInsightsTelemetryClient. This requires an `Instrumentation Key` which can be acquired by creating
the Application Insights instance within the Azure portal. This key should be stored in the environment, or in your applications .bot file.

The resulting `appInsightsClient` can be used to track events, traces, and other information to Application Insights.

```javascript
const appInsightsClient = new ApplicationInsightsTelemetryClient(process.env.instrumentationKey);
```
Now, bind the ApplicationInsightsWebserverMiddleware to your webserver. The example below shows this being used with Restify,
though this should also work with Express and other webserver modules that follow the Express middleware pattern.

This middleware will ensure that Application Insights has the appropriate information to correlate activities to the
original incoming message, user and session that triggered them.

```javascript
let server = restify.createServer();
server.use(ApplicationInsightsWebserverMiddleware);
```

### Configure Options

By default, the `botbuilder-applicationinsights` is configured to automatically track and correlate data from many parts of your application.
If you would like to tune the settings of your client, use the configuration functions documented [here as part of the official Application Insights client](https://github.com/Microsoft/ApplicationInsights-node.js#configuration), but call them from the `appInsightsClient.configuration` property as seen below:

```javascript
// enable application insights to capture console.log output and send it as trace events
appInsightsClient.configuration.setAutoCollectConsole(true, true);
```

### Use with Waterfall Dialogs

As of version `4.2`, Waterfall Dialogs included in [botbuilder-dialogs](https://github.com/Microsoft/botbuilder-js/tree/main/libraries/botbuilder-dialogs) can 
tracked automatically with a properly configured telemetry client.  To use Application Insights to track a waterfall dialog, set the `dialog.telemetryClient` property:

```javascript
const myDialog = new WaterfallDialog(DIALOG_ID, array_of_steps);
myDialog.telemetryClient = appInsightsClient;
```

You may also set the `telemetryClient` field on `DialogSet` and `ComponentDialog` objects. Setting the property on these classes will apply it to all contained dialogs automatically.

Once enabled, expect to see `WaterfallStart`, `WaterfallStep`, `WaterfallComplete` and `WaterfallCancel` events logged in Application Insights.
These custom events will also include the dialog id, a unique instance id for each use of the dialog, and the name of the dialog step.

### Use Directly

This telemetry client includes access to the common event types used by Application Insights. The signatures for these functions match the [official
Application Insights client module](https://github.com/Microsoft/ApplicationInsights-node.js#track-custom-telemetry).

```javascript
appInsightsClient.trackEvent({name: "my custom event", properties: {customProperty: "custom property value"}});
appInsightsClient.trackException({exception: new Error("handled exceptions can be logged with this method")});
appInsightsClient.trackTrace({message: "trace message"});
appInsightsClient.trackDependency({target:"http://dbname", name:"select customers proc", data:"SELECT * FROM Customers", duration:231, resultCode:0, success: true, dependencyTypeName: "ZSQL"});
```

## Learn More
Learn how to build great bots.

* [BotTelemetryClient class interface](https://github.com/Microsoft/botbuilder-js/tree/main/libraries/botbuilder-core/src/botTelemetryClient.ts)
* [Application Insights official client](https://github.com/Microsoft/ApplicationInsights-node.js)
