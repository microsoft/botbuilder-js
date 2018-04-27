# LUIS

[![npm version](https://badge.fury.io/js/luis-apis.svg)](https://badge.fury.io/js/luis-apis)

The LUIS apis tool allows communication with the LUIS endpoints via command line, node or browser project. 
Any endpoint listed in the [documentation for the LUIS Programmatic APIs v2.0](https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c2f)
is also available using the cli or the library (for node and browser projects). 

Language Understanding ([LUIS.ai](https://luis.ai/)) allows your application to understand what a person wants in their own words. LUIS uses machine learning to allow developers to build applications that can receive user input in natural language and extract meaning from it.

## Installation
### As a cli
Make sure you have node >=8.5 and npm installed on your machine. then use:

`npm install -g luis-apis`

### As a library
The LUIS apis can be installed and used as a library in any Node or UI JavaScript projects for the browser.

`npm install -s luis-apis`

You can then import and use service classes specific to the endpoint and operation you wish to call.
For example, to get the first 5 apps, do the following:
```js
import {apps} from 'luis-apis';

const appsService = new apps.Apps();
appsService.getApplicationsList({take: 5}).then(apps => {
    // handle apps
})
```

## Configuration
A configuration object is required to provide the endpoint base path, app ID, version ID and the 
authoring key to each outbound call. There are 3 ways to provide this information to the cli
1. As a `.luisrc` file in the cwd. 
The json format for the `.luisrc` file is:
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "authoringKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "versionId": "x.x.xx",
  "endpointBasePath": "https://xxxxxx.api.cognitive.microsoft.com/luis/api/v2.0"
}
```
The cli has a utility command that walks through the creation of this file:
`luis --init`
or it can be created manually.
2. As arguments to the cli. `--appId <string> --versionId <string> --authoringKey <string> --endpointBasePath <string>`
3. As environment variables. `LUIS_APP_ID, LUIS_VERSION_ID, LUIS_AUTHORING_KEY, LUIS_ENDPOINT_BASE_PATH`

You need a [LUIS](http://luis.ai/) account to get an authoring key. See [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys) for more information. 
If you have already built a LUIS application and would like to work on it with the LUIS CLI, you can appId, versionId by following instructions [here](https://github.com/Microsoft/BotBuilder-Samples/tree/master/CSharp/intelligence-LUIS). 
See [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-reference-regions) for help with endpointBasePath. 

The cli will first look for these named configuration variables in the arguments list, then inside the `.luisrc` file, 
then fallback to environment variables. 

### Securing Your Access Key
To better secure your access key, it's recommended to omit the key from the `.luisrc` 
file and instead pass it in to the `--authoringKey` argument or store it as the `LUIS_AUTHORING_KEY` 
environment variable. If security is not a concern for your particular case, all configuration items 
can be stored in the `.luisrc` for convenience.

### Overriding Configurations
Since configuration items can be passed as arguments to the cli, using arguments to specify 
the configuration will override the `.luisrc` and any environment variables that may have been specified.

### Configuring the Library for Node and the Browser
This configuration object is provided as a static property on the `ServicecBase` class for node and browser projects:
```js
import {ServiceBase} from 'luis/lib/serviceBase';
ServiceBase.config = {
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "authoringKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "versionId": "x.x.xx",
  "endpointBasePath": "https://xxxxxx.api.cognitive.microsoft.com/luis/api/v2.0"
}
```

## Cli Usage
Basic usage: `luis <action> <resource> <args...>`



### Application
| command | Description |
|---------|-------------|
|`luis add application --in applicationCreateObject.json`     | Creates a new LUIS app.|
|`luis delete application --appId <string>`     |Deletes an application.|
|`luis get application --appId <string>`     |Gets the application info.|
|`luis import application --in jSONApp.json --appName <string>`     | Imports an application to LUIS, the application's JSON should be included in the request body. Returns new application ID.|
|`luis update application --in applicationUpdateObject.json --appId <string>`     |  Updates the name or description of the application.|

### Applications
| command | Description |
|---------|-------------|
|`luis list applications  --skip <integer> --take <integer>`     | Lists all of the user applications.|

### Assistants
| command | Description |
|---------|-------------|
|`luis list assistants`     |  Gets the endpoint URLs for the prebuilt Cortana applications.|

### ClosedListEntity
| command | Description |
|---------|-------------|
|`luis add closedlistentity --in closedListModelCreateObject.json`     | Adds a list entity to the LUIS app.|
|`luis delete closedlistentity --clEntityId <string>`     |  Deletes a closed list model from the application.|
|`luis get closedlistentity --clEntityId <string>`     |  Gets information of a closed list model.|
|`luis update closedlistentity --in closedListModelPatchObject.json --clEntityId <string>`     | Adds a batch of sublists to an existing closedlist.|
|`luis update closedlistentity --in closedListModelUpdateObject.json --clEntityId <string>`     |Updates the closed list model.|

### ClosedLists
| command | Description |
|---------|-------------|
|`luis list closedlists --skip <integer> --take <integer>`     |Gets information about the closedlist models.|

### ClosedListsSublist
| command | Description |
|---------|-------------|
|`luis add closedListsSublist --in wordListCreateObject.json --clEntityId <string>`     |  Adds a list to an existing closed list|
|`luis update closedListsSublist --in wordListBaseUpdateObject.json --clEntityId <string> --subListId <string>`     | Updates one of the closed list's sublists|

### CompositeChildEntity
| command | Description |
|---------|-------------|
|`luis add compositeChildEntity children  --in body.json --cEntityId <string>`     | Creates a single child in an existing composite entity model.|
|`luis delete compositeChildEntity  --cEntityId <string> --cChildId <string>`     |  Deletes a composite entity extractor child from the application.|

### CompositeEntities
| command | Description |
|---------|-------------|
|`luis list compositeEntities --skip <integer> --take <integer>`     |Gets information about the composite entity models.|

### CompositeEntity
| command | Description |
|---------|-------------|
|`luis add compositeEntity --in hierarchicalModelCreateObject.json`     |Adds a composite entity extractor to the application.|
|`luis delete compositeEntity --cEntityId <string>`     | Deletes a composite entity extractor from the application.|
|`luis get compositeEntity --cEntityId <string>`     | Gets information about the composite entity model.|
|`luis update compositeEntity --in hierarchicalModelUpdateObject.json --cEntityId <string>`     |Updates the composite entity extractor.|

### Cultures
| command | Description |
|---------|-------------|
|`luis list cultures`     | Gets the supported LUIS application cultures.|

### CustomPrebuiltDomain
| command | Description |
|---------|-------------|
|`luis add customPrebuiltDomain --in prebuiltDomainCreateBaseObject.json`     |Adds a customizable prebuilt domain along with all of its models to this application.|
|`luis add customprebuiltdomain --in prebuiltDomainCreateObject.json`     | Adds a prebuilt domain along with its models as a new application. Returns new application ID.|
|`luis delete customPrebuiltDomain --domainName <string>`     | Deletes a prebuilt domain's models from the application.|
|`luis get customprebuiltdomain --culture <string>`     | Gets all the available custom prebuilt domains for a specific culture|

### CustomPrebuiltDomainEntities
| command | Description |
|---------|-------------|
|`luis list customPrebuiltDomainEntities`     |  Gets all custom prebuilt entities information of this application|

### CustomPrebuiltDomainEntity
| command | Description |
|---------|-------------|
|`luis add customPrebuiltDomainEntity --in prebuiltDomainModelCreateObject.json`     |  Adds a custom prebuilt entity model to the application|

### CustomPrebuiltDomains
| command | Description |
|---------|-------------|
|`luis list customprebuiltdomains`     |Gets all the available custom prebuilt domains for all cultures|

### CustomPrebuiltIntent
| command | Description |
|---------|-------------|
|`luis add customPrebuiltIntent --in prebuiltDomainModelCreateObject.json`     |  Adds a custom prebuilt intent model to the application|

### CustomPrebuiltIntents
| command | Description |
|---------|-------------|
|`luis get customPrebuiltIntents`     | Gets custom prebuilt intents information of this application|

### CustomPrebuiltModels
| command | Description |
|---------|-------------|
|`luis list customPrebuiltModels`     | Gets all custom prebuilt models information of this application|

### Domains
| command | Description |
|---------|-------------|
|`luis list domains`     |  Gets the available application domains.|

### Endpoints
| command | Description |
|---------|-------------|
|`luis list endpoints --appId <string>`     | Returns the available endpoint deployment regions and urls|

### Entities
| command | Description |
|---------|-------------|
|`luis add entity --in modelCreateObject.json`     |Adds an entity extractor to the application.|
|`luis list entities --skip <integer> --take <integer>`     |Gets information about the entity models.|
|`luis suggest entities  --entityId <string> --take <integer>`     |  Suggests examples that would improve the accuracy of the entity model.|

### Entity
| command | Description |
|---------|-------------|
|`luis delete entity --entityId <string>`     |  Deletes an entity extractor from the application.|
|`luis get entity --entityId <string>`     |  Gets information about the entity model.|
|`luis update entity --in modelUpdateObject.json --entityId <string>`     | Updates the name of an entity extractor.|

### Example
| command | Description |
|---------|-------------|
|`luis add example --in exampleLabelObject.json`     | Adds a labeled example to the application.|
|`luis delete example --exampleId <integer>`     |  Deletes the label with the specified ID.|

### Examples
| command | Description |
|---------|-------------|
|`luis add examples --in exampleLabelObjectArray.json`     |  The maximum batch size is 100 items. If the item has the ExampleId and a value between 0 - 99, the returned result will also include the ExampleId. This is helpful if items have errors. Some items can pass while others fail. The returned result will indicate each item's status.|
|`luis list examples --skip <integer> --take <integer>`     |Returns examples to be reviewed.|

### ExternalKey
| command | Description |
|---------|-------------|
|`luis update externalKeys --in externalKeyUpdateObject.json --appId <string> --versionId <string>`     | Assigns an external API key to the given application according to the specified key type.|

### ExternalKeys
| command | Description |
|---------|-------------|
|`luis list externalKeys --appId <string> --versionId <string>`     | Gets the given application versions's external keys.|

### Features
| command | Description |
|---------|-------------|
|`luis list features --skip <integer> --take <integer>`     |Gets all application version features.|

### HierarchicalChildEntity
| command | Description |
|---------|-------------|
|`luis add hierarchicalChildEntity  --in body.json --hEntityId <string>`     | Creates a single child in an existing hierarchical entity model.|
|`luis delete hierarchicalChildEntity  --hEntityId <string> --hChildId <string>`     |  Deletes a hierarchical entity extractor child from the application.|
|`luis get hierarchicalChildEntity --hEntityId <string> --hChildId <string>`     |Gets information about the hierarchical entity child model.|
|`luis update hierarchicalChildEntity --in body.json --hEntityId <string> --hChildId <string>`     |Renames a single child in an existing hierarchical entity model.|

### HierarchicalEntities
| command | Description |
|---------|-------------|
|`luis list hierarchicalEntities --skip <integer> --take <integer>`     |Gets information about the hierarchical entity models.|

### HierarchicalEntity
| command | Description |
|---------|-------------|
|`luis add hierarchicalEntity --in hierarchicalModelCreateObject.json`     |Adds a hierarchical entity extractor to the application version.|
|`luis delete hierarchicalEntity --hEntityId <string>`     | Deletes a hierarchical entity extractor from the application version.|
|`luis get hierarchicalEntity --hEntityId <string>`     | Gets information about the hierarchical entity model.|
|`luis update hierarchicalEntity --in hierarchicalModelUpdateObject.json --hEntityId <string>`     |Updates the name and children of a hierarchical entity model.|

### Intent
| command | Description |
|---------|-------------|
|`luis add intent --in modelCreateObject.json`     |Adds an intent classifier to the application.|
|`luis delete intent --intentId <string>`     |  Deletes an intent classifier from the application.|
|`luis get intent --intentId <string>`     |  Gets information about the intent model.|
|`luis update intent --in modelUpdateObject.json --intentId <string>`     | Updates the name of an intent classifier.|

### Intents
| command | Description |
|---------|-------------|
|`luis list intents --skip <integer> --take <integer>`     | Gets information about the intent models.|
|`luis suggest intents --intentId <string> --take <integer>`     | Suggests examples that would improve the accuracy of the intent model.|

### Pattern
| command | Description |
|---------|-------------|
|`luis add pattern --in patternCreateObject.json`     |Creates a new pattern feature.|
|`luis delete pattern --patternId <integer>`     |  Deletes a pattern feature from an application version.|
|`luis get pattern --patternId <integer>`     |  Gets pattern feature info.|
|`luis update pattern --in patternUpdateObject.json --patternId <integer>`     |  Updates the pattern, the name and the state of the pattern feature.|

### Patterns
| command | Description |
|---------|-------------|
|`luis list patterns --skip <integer> --take <integer>`     |Gets all application version pattern features.|

### Permissions
| command | Description |
|---------|-------------|
|`luis add permissions --in body.json`     |Users are added using their email address.|
|`luis delete permissions --in body.json`     |Users are removed using their email address.|
|`luis list permissions`     | Gets the list of user emails that have permissions to access your application.|
|`luis update permissions  --in body.json`     | If an empty list is sent, all access to other users will be removed.|

### Phraselist
| command | Description |
|---------|-------------|
|`luis add phraselist --in phraselistCreateObject.json`     |Creates a new phraselist feature.|
|`luis delete phraselist --phraselistId <integer>`     |  Deletes a phraselist feature from an application.|
|`luis get phraselist --phraselistId <integer>`     |  Gets phraselist feature info.|
|`luis update phraselist --in phraselistUpdateObject.json --phraselistId <integer>`     |  Updates the phrases, the state and the name of the phraselist feature.|

### Phraselists
| command | Description |
|---------|-------------|
|`luis list phraselists --skip <integer> --take <integer>`     |Gets all application phraselist features.|

### PrebuiltEntities
| command | Description |
|---------|-------------|
|`luis list prebuiltEntities`     |  Gets all the available prebuilt entities for the application based on the application's culture.|
|`luis list prebuiltEntities --skip <integer> --take <integer>`     | Gets information about the prebuilt entity models.|

### PrebuiltEntity
| command | Description |
|---------|-------------|
|`luis delete prebuiltEntity --prebuiltId <string>`     | Deletes a prebuilt entity extractor from the application.|
|`luis get prebuiltEntity --prebuiltId <string>`     | Gets information about the prebuilt entity model.|

### PrebuiltEntityList
| command | Description |
|---------|-------------|
|`luis add prebuiltEntityList --in prebuiltExtractorNames.json`     | Adds a list of prebuilt entity extractors to the application.|

### Querylogs
| command | Description |
|---------|-------------|
|`luis list querylogs --appId <string>`     | Gets the query logs of the past month for the application.|

### Settings
| command | Description |
|---------|-------------|
|`luis get settings --appId <string>`     |Get the application settings|
|`luis update settings --in applicationSettingUpdateObject.json --appId <string>`     | Updates the application settings|

### SublistEntity
| command | Description |
|---------|-------------|
|`luis delete sublistEntity  --clEntityId <string> --subListId <integer>`     |Deletes a sublist of a specified list entity.|

### TrainingStatus
| command | Description |
|---------|-------------|
|`luis get trainingStatus`     |  training status.|

### UnlabeledUtterance
| command | Description |
|---------|-------------|
|`luis delete unlabeledutterance --in body.json --appId <string> --versionId <string>`     |  Deleted an unlabelled utterance.|

### UsageScenarios
| command | Description |
|---------|-------------|
|`luis list usagescenarios`     | Gets the application available usage scenarios.|

### Version
| command | Description |
|---------|-------------|
|`luis clone version --in taskUpdateObject.json --appId <string> --versionId <string>`     |  Creates a new version equivalent to the current snapshot of the selected application version.|
|`luis delete versions --appId <string> --versionId <string>`     |Deletes an application version.|
|`luis export version --appId <string> --versionId <string>`     | Exports a LUIS application to JSON format.|
|`luis get version --appId <string> --versionId <string>`     | Gets the task info.|
|`luis import version  --in jSONApp.json --appId <string> --versionId <string>`     |Imports a new version into a LUIS application, the version's JSON should be included in in the request body.|
|`luis publish version --in applicationPublishObject.json --appId <string> --versionId <version> --region <region>`     |Publishes a specific version of the application.|
|`--staging`     |--staging|
|`luis train version`     | This request initiates a request asynchronously. To determine whether the training request is successful, use command: LUIS get status **Note**: The application version is not fully trained unless all the models (intents and entities) are trained successfully or are up to date. To verify training success, get the training status at least once after training is complete.|
|`luis update version --in taskUpdateObject.json --appId <string> --versionId <string>`     | Updates the name or description of the application version.|

### VersionModels
| command | Description |
|---------|-------------|
|`luis list versionModels --skip <integer> --take <integer>`     | Gets information about the application version models.|

### Versions
| command | Description |
|---------|-------------|
|`luis list versions --appId <string> --skip <integer> --take <integer>`     | Gets the application versions info.|

