This library contains the core of Bot Framework Streaming Extensions, which extends the 3.0 Bot Framework protocol to communicate over multiplexed, persistent, connections such as named pipes or WebSocket.

- [Installing](#installing)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the latest published version of this package to your bot:

```bash
npm install --save botframework-streaming
```

#### Use the Daily Build

To get access to the daily builds of this library, configure npm to use the MyGet feed before installing.

```bash
npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/
```

To reset the registry in order to get the latest published version, run:
```bash
npm config set registry https://registry.npmjs.org/