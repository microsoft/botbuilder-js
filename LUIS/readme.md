# LUIS

The LUIS apis tool allows communication with the LUIS endpoints via command line, node or browser project. 
Any endpoint listed in the [documentation for the LUIS Programmatic APIs v2.0](https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c2f)
is also available using the cli or the library (for node and browser projects). 

## Installation
### As a cli
Make sure you have node >=8.5 and npm installed on your machine. then use:

`npm i -g luis-apis`

### As a library
The LUIS apis can be installed and used as a library in any Node or UI JavaScript projects for the browser.

`npm i -s luis-apis`

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

To get available actions you can simply do
```
>luis -h
LUIS Command Line Interface - © 2018 Microsoft Corporation

Available actions are:
 add                                     add a resource
 clone                                   clone a resource
 delete                                  delete a resource
 export                                  export resources
 get                                     get a resource
 import                                  import resources
 list                                    list resources
 publish                                 publish resource
 suggest                                 suggest resources
 train                                   train resource
 update                                  update resources

Configuration and Overrides:
 --appId                                 Specifies the public LUIS application id. Overrides the .luisrc value and the LUIS_APP_ID environment variable.
 --authoringKey                          Specifies the LUIS authoring  key (from luis.ai portal user settings page). Overrides the .luisrc value and the LUIS_AUTHORING_KEY environment variable.
 --versionId                             Specifies the version id. Overrides the .luisrc value and the LUIS_VERSION_ID environment variable.
 --endpointBasePath                      Specifies the base URI for all requests. Overrides the .luisrc value and the LUIS_ENDPOINT_BASE_PATH environment variable.

Global Arguments:
 --help,    -h                           Prints this help file.
 --!                                     Dumps absolutely all documented commands to the console with descriptions
 --init,    -i                           Initializes the .luisrc file with settings specific to your LUIS instance
 --version, -v                           Prints the version of this cli tool
```



To get the resources that an action can perform on you add the resource like this:

```
>luis add --help
C:\source\github\botbuilder-tools\LUIS>luis list --help
LUIS Command Line Interface - © 2018 Microsoft Corporation

Available resources for list:
 applications
 assistants
 closedLists
 compositeEntities
 cultures
 customPrebuiltDomainEntities
 customPrebuiltDomains
 customPrebuiltModels
 domains
 endpoints
 entities
 examples
 externalKeys
 features
 hierarchicalEntities
 intents
 patterns
 permissions
 phraselists
 prebuiltEntities
 querylogs
 usageScenarios
 versions

Configuration and Overrides:
 --appId                                 Specifies the public LUIS application id. Overrides the .luisrc value and the LUIS_APP_ID environment variable.
 --authoringKey                          Specifies the LUIS authoring  key (from luis.ai portal user settings page). Overrides the .luisrc value and the LUIS_AUTHORING_KEY environment variable.
 --versionId                             Specifies the version id. Overrides the .luisrc value and the LUIS_VERSION_ID environment variable.
 --endpointBasePath                      Specifies the base URI for all requests. Overrides the .luisrc value and the LUIS_ENDPOINT_BASE_PATH environment variable.

Global Arguments:
 --help,    -h                           Prints this help file.
 --!                                     Dumps absolutely all documented commands to the console with descriptions
 --init,    -i                           Initializes the .luisrc file with settings specific to your LUIS instance
 --version, -v                           Prints the version of this cli tool
```

To get help for an individual operation, add the resource with -h like this:

```
>luis list applications -h
LUIS Command Line Interface - © 2018 Microsoft Corporation

Lists all of the user applications.

Usage:
luis list applications  --skip <integer> --take <integer>

Command arguments are:
 --skip <integer>                        The number of entries to skip. Default value is 0.
 --take <integer>                        The number of entries to return. Maximum page size is 500. Default is 100.

Configuration and Overrides:
 --appId                                 Specifies the public LUIS application id. Overrides the .luisrc value and the LUIS_APP_ID environment variable.
 --authoringKey                          Specifies the LUIS authoring  key (from luis.ai portal user settings page). Overrides the .luisrc value and the LUIS_AUTHORING_KEY environment variable.
 --versionId                             Specifies the version id. Overrides the .luisrc value and the LUIS_VERSION_ID environment variable.
 --endpointBasePath                      Specifies the base URI for all requests. Overrides the .luisrc value and the LUIS_ENDPOINT_BASE_PATH environment variable.

Global Arguments:
 --help,    -h                           Prints this help file.
 --!                                     Dumps absolutely all documented commands to the console with descriptions
 --init,    -i                           Initializes the .luisrc file with settings specific to your LUIS instance
 --version, -v                           Prints the version of this cli tool
```



