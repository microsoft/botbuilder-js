# Bot Builder Azure

Azure extensions for Microsoft BotBuilder.

- [Installing](#installing)
- [Basic Use](#use)
- [Documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Class Reference](https://docs.microsoft.com/en-us/javascript/api/botbuilder-azure/)
- [GitHub Repo](https://github.com/Microsoft/botbuilder-js)
- [Report Issues](https://github.com/Microsoft/botbuilder-js/issues)

## Installing
To add the preview version of this package to your bot be sure include the @preview tag:

```bash
npm install --save botbuilder-azure@preview
```

While this package is in preview it's possible for updates to include build breaks. To avoid having any updates break your bot it's recommended that you update the dependency table of your bots `package.json` file to lock down the specific version of the package you're using:

```JSON
{
    "dependencies": {
        "botbuilder": "4.0.0-preview1.2",
        "botbuilder-azure": "4.0.0-preview1.2"
    }
}
```

## What's Included

This module contains interfaces to use common Azure services to back Botbuilder's state storage.
It currently supports Cosmos DB ([`CosmosDbStorage()`](https://docs.microsoft.com/en-us/javascript/api/botbuilder-azure/cosmosdbstorage)) and Azure Blob Storage ([`BlobStorage()`](https://docs.microsoft.com/en-us/javascript/api/botbuilder-azure/blobstorage)).

Also included is an interface to store and retrieve chat transcripts in blog storage called [AzureBlobTranscriptStore()](https://docs.microsoft.com/en-us/javascript/api/botbuilder-azure/azureblobtranscriptstore)

## Use

Import the module into your app.
```
const { BlobStorage } = require('botbuilder-azure');
```

Configure the storage driver to work with your Azure resources.
```
const blobStorage = new BlobStorage(options);
```

Pass the storage driver into your state managers:
```
const userState = new UserState(blobStorage);
const conversationState = new ConverationState(blobStorage);
```