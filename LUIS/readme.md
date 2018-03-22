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
Basic usage: `luis <api group> [<subgroup> [<subgroup>]] <action> [--<args> --<globalArgs>]]]`

Where `<api group>` is one of the following:

| API Group                                 | Description                                                   |
| :---------------------------------------- | --------------------------------------------------------------|
| apps                                      | Adding, listing, exporting, publishing and updating LUIS apps |
| examples                                  | Adding, removing and updating labeled examples to the app     |
| features                                  | Adding, removing, and updating pattern and phraselist feature info |
| models                                    | Interacting with LUIS models                                  |
| permissions                               | Interacting with access lists                                 |
| train                                     | Retrieving training status or training the configured app version|
| versions                                  | Assigning, cloning, deleting, importing and exporting app versions|

Where `<action>` is one of the following:

| Action                                    | Description                                                    
| :-----------------------------------------|-----------------------------------------------------------------|
| get,    g                                 | Retrieves or reads the specified `<target>` or `<subtarget>` where applicable |
| create, c                                 | Creates a new resource at the `<target>` or `<subtarget>` where applicable |
| list,   l                                 | Retrieves a list of `<target>` or `<subtarget>` (`--skip` and `--take` pagination arguments are optional) |
| update, u                                 | Updates an existing resource at `<target>` or `<subtarget>` where applicable |
| patch,  p                                 | Updates a partial resource at `<target>` or `<subtarget>` where applicable |
| delete, d                                 | Deletes a resource at `<target>` or `<subtarget>` where applicable |

Arguments may be one or more of the following:

|                                           |                                                                  |
| :-----------------------------------------|------------------------------------------------------------------|
| --appId                                   | Specifies the application id. This can optionally be specified in the .luisrc |
| --versionId                               | Specifies the version id. This can optionally be specified in the .luisrc |

Global Arguments:

|                                           |                                                                  |
| :-----------------------------------------|------------------------------------------------------------------|
| -- help, -h                               | Prints this help file. Use `<api group> [<target>] -h` to see specific details on an `<api group>`
| --!                                       | Dumps absolutely all documented commands to the console with descriptions |
| --init, -i                                | Initializes the .luisrc file with settings specific to your LUIS instance |
| --version, -v                             | Prints the version of this cli tool |