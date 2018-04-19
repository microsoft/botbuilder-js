# Project

QnAMaker is command line tool and library for interacting with QnAMaker service using the QnAMaker REST API

## Installation

### As a cli
Make sure you have node >=8.5 and npm installed on your machine. then use:

`npm i -g qnamaker`

### As a library
The QnAMaker apis can be installed and used as a library in any Node or UI JavaScript projects for the browser.

`npm i -s qnamaker`

You can then import and use service classes specific to the endpoint and operation you wish to call.

## Command line usage

QnA Maker cli for interacting with the QnA Maker api - © 2018 Microsoft Corporation

|Commands|  |
|----|----|
| qnamaker create --in createKnowledgeBase.json --bot      |Creates a new knowledge base.|
| qnamaker publish                                         |Publish all unpublished in the knowledgebase to the prod endpoint|
| qnamaker update --in updateKnowledgeBase.json            |Add or delete QnA Pairs and / or URLs to an existing knowledge base.|
| qnamaker get                                             |Downloads all the data associated with the specified knowledge base.|
| qnamaker delete                                          |Deletes the specified knowledge base and all data associated with it.|
| qnamaker ask --question "how do I turn it on" --top 5    |Returns the list of answers for the given question sorted in descending order of ranking score.|
| qnamaker train --in trainKnowledgeBase.json              |train the model |
| qnamaker get alterations                                 |Downloads all word alterations (synonyms) that have been automatically mined or added by the user.|
| qnamaker update alterations --in updateAlterations.json |Replaces word alterations (synonyms) for the KB with the give records.|


|Configuration and Overrides|description|
|---|---|
| --kbid <kbid>                                                                             |Specifies the public qnamaker knowledgebase id. Overrides the .qnamakerrc value and the QNAMAKER_KBID environment variable.|
| --subscriptionKey <key>                                                                   |Specifies the qnamaker subscription key (from qnamaker.ai portal user settings page). Overrides the .qnamakerrc value and the QNAMAKER_SUBSCRIPTION_KEY environment variable.|
| --endpointBasePath <path>                                                                 |Specifies the base URI for all requests. Overrides the .qnamakerrc value and the QNAMAKER_ENDPOINT_BASE_PATH environment variable.|

|Global Arguments | description |
| ---- | --- |
| --help,    -h |  this help file.|
| --version, -v | the version of this cli tool|

## Configuration
A configuration object is required to provide the endpoint base path, app ID, version ID and the 
authoring key to each outbound call. There are 3 ways to provide this information to the cli

1. As a `.qnamakerrc` file in the cwd. 
The json format for the `.qnamakerrc` file is:
```json
{
  "knowledgeBaseID": "xxxxxxx-xxxxx-xxxx-xxxx-xxxxxxxx",
  "subscriptionKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "endpointBasePath": "https://westus.api.cognitive.microsoft.com/qnamaker/v2.0"
}
```

> NOTE: Simply run `qnamaker --init` to answer simple questions to create your .qnamakerrc file

2. As arguments to the cli. `--kbid <string> --subscriptionKey <string> --endpointBasePath <string>`

3. As environment variables. `QNAMAKER_KBID, QNAMAKER_SUBSCRIPTION_KEY, QNAMAKER_ENDPOINT_BASE_PATH`

The cli will first look for these named configuration variables in the arguments list, then inside the `.qnamakerrc` file, then fallback to environment variables. 

### Securing Your Access Key
To better secure your access key, it's recommended to omit the key from the `.qnamakerrc` 
file and instead pass it in to the `--subscriptionKey` argument or store it as the `QNAMAKER_SUBSCRIPTION_KEY` 
environment variable. If security is not a concern for your particular case, all configuration items 
can be stored in the `.qnamaker` for convenience.

### Overriding Configurations
Since configuration items can be passed as arguments to the cli, using arguments to specify 
the configuration will override the `.qnamakerrc` and any environment variables that may have been specified.

