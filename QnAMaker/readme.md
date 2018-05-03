# QnAMaker

[![npm version](https://badge.fury.io/js/qnamaker.svg)](https://badge.fury.io/js/qnamaker)

QnAMaker is a command line tool and a library for interacting with QnAMaker service using the QnAMaker REST API.

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher

## Installation

### As a CLI
Make sure you have Node.js >=8.5 and npm installed on your machine, then use:

`npm install -g qnamaker`

### As a library
The QnAMaker APIs can be installed and used as a library in any Node.js or JavaScript UI projects for the browser:

`npm install -s qnamaker`

You can then import and use service classes specific to the endpoint and operation you wish to call.

## Command line usage

| Command                                                  | Description                                                                                         |
|----------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| **Alterations**                                          |                                                                                                     |
| `qnamaker list alterations`                              | Download all word alterations (synonyms) that have been automatically mined or added by the user.   |
| `qnamaker replace alterations --in wordAlterations.json` | Replace word alterations (synonyms) for the KB with the give records.                               |
| **Endpointkeys**                                         |                                                                                                     |
| `qnamaker list endpointkeys`                             | List all the currently valid endpointKeys for querying your private endpoint.                       |
| `qnamaker refresh endpointkeys --keyType <string>`       | Re-generate an endpoint key, in case you suspect your keys have been compromised.                   |
| **KB**                                                   |                                                                                                     |
| `qnamaker create kb --in createKbPayload.json`           | Create a new knowledge base.                                                                        |
| `qnamaker delete kb --kbId <string>`                     | Delete a knowledge base by id.                                                                      |
| `qnamaker export kb --kbId <string> --environment <string>`       | Export a knowledge base by ID.                                                             |
| `qnamaker get kb --kbId <string>`                        | Get metadata about a knowledge base.                                                                |
| `qnamaker publish kb --kbId <string>`                    | Publish all unpublished in the knowledge base to the prod endpoint.                                 |
| `qnamaker replace kb --in replaceKb.json --kbId <string>`| Replace knowledge base contents with new contents.                                                  |
| `qnamaker update kb --in updateKb.json --kbId <string>`  | Add or delete QnA pairs and / or URLs to an existing knowledge base.                                |
| **KBs**                                                  |                                                                                                     |
| `qnamaker list kbs`                                      | List all of your knowledge bases.                                                                   |
| **Legacykb**                                             |                                                                                                     |
| `qnamaker export legacykb --kbId <legacyKB>`             | Export legacy knowledge base (requires legacy `--kbid` and `--subscriptionKey` to be passed in).    |
| **Operationdetails**                                     |                                                                                                     |
| `qnamaker get operationdetails --operationId <string>`   | Get details of a specific long running operation.                                                   |
| **Query**                                                |                                                                                                     |
| `qnamaker query --question "how do I turn it on" --top 5`| Return the list of answers for the given question sorted in descending order of ranking score.      |


## Configuration
A configuration object is required to provide the endpoint base path, app ID, version ID and the 
authoring key to each outbound call. There are 3 ways to provide this information to the CLI:

1. As a `.qnamakerrc` file in the cwd. 
The JSON format for the `.qnamakerrc` file:
```json
{
  "subscriptionKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "kbId": "xxxxxxx-xxxxx-xxxx-xxxx-xxxxxxxx",
  "hostname": "https://xxxxxx.azurewebsites.net",
  "endpointKey": "xxxxxxx-xxxxx-xxxx-xxxx-xxxxxxxx"
}
```

> NOTE: Simply run `qnamaker init` to answer simple questions to create your .qnamakerrc file

2. As arguments to the CLI: `--kbId <string> --subscriptionKey <string>`

3. As environment variables: `QNAMAKER_KBID`, `QNAMAKER_SUBSCRIPTION_KEY`, `QNAMAKER_ENDPOINTKEY`, `QNAMAKER_HOSTNAME`

The CLI will first look for these named configuration variables in the arguments list, then inside the `.qnamakerrc` file, then fallback to the environment variables. 

### Securing Your Access Key
To better secure your access key, it is recommended to omit the key from the `.qnamakerrc` 
file and instead pass it in to the `--subscriptionKey` argument or store it as the `QNAMAKER_SUBSCRIPTION_KEY` 
environment variable. If security is not a concern for your particular case, all configuration items 
can be stored in the `.qnamakerrc` for convenience.

### Overriding Configurations
Since configuration items can be passed as arguments to the CLI, using arguments to specify 
the configuration will override the `.qnamakerrc` and any environment variables that may have been specified.

