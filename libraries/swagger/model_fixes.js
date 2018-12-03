// replace.js

const fs = require('fs');
const replace = require('replace-in-file');

var modelsPaths = './connectorApi/lib/models/index.ts';
var optionalModelProperties = {
    'Activity': ['id', 'timestamp', 'localTimestamp', 'textFormat', 'attachmentLayout', 'membersAdded', 'membersRemoved', 'reactionsAdded', 'reactionsRemoved', 'topicName', 'historyDisclosed', 'locale', 'speak', 'inputHint', 'summary', 'suggestedActions', 'attachments', 'entities', 'channelData', 'action', 'replyToId', 'value', 'name', 'relatesTo', 'code', 'expiration', 'importance', 'deliveryMode', 'textHighlights'],
    'ConversationReference': ['activityId', 'user'],
    'ConversationParameters': ['members', 'topicName'],
    'SigninCard': ['text'],
    'Attachment': ['content', 'contentUrl', 'name', 'thumbnailUrl'],
    'CardImage': ['alt', 'tap'],
    'CardAction': ['channelData', 'displayText', 'image', 'text'],
    'ChannelAccount': ['aadObjectId', 'role'],
    'ConversationAccount': ['aadObjectId', 'role'],
    'MediaUrl': ['profile']
};


var replaceOptions = [
    {
        "files": "connectorApi/**/*.ts",
        "from": "as Models from \"./models\"",
        "to": "as Models from \"botframework-schema\""
    }, {
        "files": "connectorApi/**/*.ts",
        "from": "as Models from \"../models\"",
        "to": "as Models from \"botframework-schema\""
    }, {
        "files": "connectorApi/lib/models/index.ts",
        "from": "\/*\n * Code connectorApi by Microsoft (R) AutoRest Code Generator.\n * Changes may cause incorrect behavior and will be lost if the code is\n * regenerated.\n *\/",
        "to": "\/**\n * @module botbuilder\n *\/\n\/**\n * Copyright (c) Microsoft Corporation. All rights reserved.  \n * Licensed under the MIT License.\n *\/"
    }, 
    { "files": "connectorApi/lib/models/index.ts", "from": "{Buffer} [originalBase64]", "to": "{any} [originalBase64]" }, 
    { "files": "connectorApi/lib/models/index.ts", "from": ": Buffer", "to": ": any" }, 
    { "files": "connectorApi/lib/models/index.ts", "from": "{Buffer} [thumbnailBase64]", "to": "{any} [thumbnailBase64]" }, 
    { "files": "connectorApi/lib/models/index.ts", "from": ": Buffer", "to": ": any" }, 
    {
        "files": "connectorApi/**/*.ts",
        "from": "\/*\n * Code connectorApi by Microsoft (R) AutoRest Code Generator.\n * Changes may cause incorrect behavior and will be lost if the code is\n * regenerated.\n *\/",
        "to": "\/**\n * @module botbuilder\n *\/\n\/**\n * Copyright (c) Microsoft Corporation. All rights reserved.  \n * Licensed under the MIT License.\n *\/"
    }
];

function replaceNext() {
    if (replaceOptions.length === 0) {
        return Promise.resolve();
    }

    return replace(replaceOptions.shift())
        .then(changes => {
            return replaceNext();
        })
        .catch(error => {
            console.error('Error occurred:', error);
        });
}

function fixModelsProps(models, optionalModelProperties) {

    // 1. Make all properties required
    // name: string;
    models = models.replace(/\?: /g, ': ');

    // 2. Make some properties optional
    // id?: string;
    Object.keys(optionalModelProperties).forEach(modelName => {
        var requiredProperties = optionalModelProperties[modelName];

        var startIx = models.indexOf(`export interface ${modelName} {`);
        var endIx = models.indexOf('\n}', startIx) + 2;
        var model = models.substring(startIx, endIx);

        var updated = requiredProperties.reduce(
            (updated, propName) => updated.replace(`${propName}: `, `${propName}?: `),
            model);

        // console.log(interfaceName, 'OLD:\n', model, 'UPDATED:\n', updated);

        models = models.substring(0, startIx) + updated + models.substring(endIx);
    });

    // 3. get enums
    var enums = [];
    let exportEnum = 'export enum ';
    var start = models.indexOf(exportEnum);
    while(start > 0)
    {
        start = start + exportEnum.length;
        end = models.indexOf(' ', start);
        enums.push(models.substring(start, end));
        start = models.indexOf(exportEnum, end);
    }

    // 4. change enums to be EnumType|string
    for(iEnum in enums)
    {
        var target = enums[iEnum];
        models = models.replace(': '+target+';', ': '+target+' | string;');
    }

    return models;
}

replaceNext().then(() => {
    var models = fs.readFileSync(modelsPaths, 'UTF8');
    var updatedModels = fixModelsProps(models, optionalModelProperties);
    fs.writeFileSync(modelsPaths, updatedModels, { encoding: 'UTF8' });
    console.log('Model fixes completed.');
});
