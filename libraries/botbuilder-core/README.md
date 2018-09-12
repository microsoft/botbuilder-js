# Bot Builder Core

This library contains most of the core functionality for [Botbuilder](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder),
but without any dependency on Node. As a result, this version can be used to build bots that run complete in a browser.

Unless you are building a bot _without Node_, we recommend that you `botbuilder` your app
instead of `botbuilder-core`. [Learn more here.](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder/README.md)

- [Installing](#installing)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the preview version of this package to your bot be sure include the @preview tag:

```bash
npm install --save botbuilder-core@preview
```

While this package is in preview it's possible for updates to include build breaks. To avoid having any updates break your bot it's recommended that you update the dependency table of your bots `package.json` file to lock down the specific version of the package you're using:

```JSON
{
    "dependencies": {
        "botbuilder-core": "4.0.0-preview1.2"
    }
}
```
