/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var chai = require('chai');
var assert = chai.assert;
const parseFileContents = require('../lib/parseFileContents');
var inputFileContent = `> Definition for greeting intent
        # Greeting
        - Hi
        - Hello
        > users might say these
        - Good morning 
        - Good evening`;
var outputBlob = 
{
  "intents": [
    {
      "name": "Greeting"
    }
  ],
  "entities": [],
  "composites": [],
  "closedLists": [],
  "regex_entities": [],
  "model_features": [],
  "regex_features": [],
  "utterances": [
    {
      "text": "Hi",
      "intent": "Greeting",
      "entities": []
    },
    {
      "text": "Hello",
      "intent": "Greeting",
      "entities": []
    },
    {
      "text": "Good morning",
      "intent": "Greeting",
      "entities": []
    },
    {
      "text": "Good evening",
      "intent": "Greeting",
      "entities": []
    }
  ],
  "patterns": [],
  "patternAnyEntities": [],
  "prebuiltEntities": [],
};

describe('Comment blocks in .lu files', function() {
    it('should be parsed correctly with 1 intent and comments specified', function() {
        assert.deepEqual(parseFileContents.parseFile(inputFileContent,false, 'en-us').LUISBlob, outputBlob);
    });
});