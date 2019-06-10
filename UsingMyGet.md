# Using MyGet to consume daily builds
The BotBuilder SDK daily build feed is found on [MyGet](https://botbuilder.myget.org). For Node development, use the [js daily build feed](https://botbuilder.myget.org/gallery/botbuilder-v4-js-daily). 

To consume the latest daily builds of the Bot Framework, you'll need to configure npm to use the MyGet feed before installing.


# Configure NPM registry

Use the following command to set the NPM registry to access the MyGet feed.

- npm config set registry https://botbuilder.myget.org/F/botbuilder-v4-js-daily/npm/

To reset the registry in order to get the latest published version, run:

- npm config set registry https://registry.npmjs.org/
