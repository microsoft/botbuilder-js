# LUDown

[![npm version](https://badge.fury.io/js/ludown.svg)](https://badge.fury.io/js/ludown)

.lu files help describe language understanding components for your bot. LUDown is a command line tool that helps convert .lu file(s) into JSON files that you can then use to create your [LUIS](http://luis.ai) app or [QnAMaker](http://qnamaker.ai) knowledge base. 

Language Understanding ([LUIS.ai](https://luis.ai/)) allows your application to understand what a person wants in their own words. LUIS uses machine learning to allow developers to build applications that can receive user input in natural language and extract meaning from it.

[QnA Maker](http://qnamaker.ai) enables you to go from FAQ to bot in minutes. With QnA Maker you can build, train and publish a simple question and answer bot based on FAQ URLs, structured documents or editorial content in minutes.

The .lu file and the LUDown tool serve several use cases:
- Quick, simple and easy way to bootstrap language understanding for your bot.
- Describe intents, entities, utterances and patterns for your bot in simple markdown documents.
- The language understanding definition for your bot lives with the rest of your code. You can use other CLI tools like luis to create a new LUIS app using the .lu files.
- Group language understanding documents by language and locale to easily manage localization.
- Define question and answer pairs for your bot.
- Works in conjunction with other Microsoft Bot Builder tools, like [LUIS CLI](../LUIS) and [QnAMaker CLI](../QnAMaker).

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher

## Installation

To install:
```bash
npm i -g ludown
```

Checkout the [examples](examples) folder for example .lu files.

Also see the [here](ChitChat) to add Small talk/ chit-chat capabilities to your bot.

## Docs
- [Ludown commands](docs/commands.md)
- [.lu File Format](docs/lu-file-format.md)
- [Creating LUIS JSON model file](docs/create-luis-json.md)
- [Creating QnA Maker KB model file](docs/create-qna-json.md)
- [Recreating .lu files with Refresh command](docs/refresh-command.md)
- [Adding small talk/ chit-chat capabilities to your bot](ChitChat/README.MD)

## CLI return codes
This CLI writes to stderr on error and stdout otherwise. CLI also returns the following codes based on the outcome of parsing.

| Interpretation            | Return Code   |
|---------------------------|-------------  |
|SUCCESS                    |  0            |
|UNKNOWN_OPTIONS            |  1            |  
|INVALID_INTENT             |  2            |  
|INVALID_LINE               |  3            |  
|OUTPUT_FOLDER_INVALID      |  4            |
|OUTPUT_FILE_EXISTS         |  5            |
|FILE_OPEN_ERROR            |  6            |
|INVALID_INPUT_FILE         |  7            |
|NO_LU_FILES_FOUND          |  8            |
|UNABLE_TO_WRITE_FILE       |  9            |
|DUPLICATE_ENTITIES         | 10            |
|INVALID_INPUT              | 11            |
|INVALID_URL_REF            | 12            |
|INVALID_LU_FILE_REF        | 13            |
|INVALID_QNA_FILTER_DEF     | 14            |
|INVALID_QNA_QUESTION_DEF   | 15            |
|INVALID_UTTERANCE_DEF      | 16            |
|MISSING_LABELLED_VALUE     | 17            |
|SYNONYMS_NOT_A_LIST        | 18            |
|PHRASELIST_NOT_A_LIST      | 19            |
|UNKNOWN_ERROR              | 99            |

