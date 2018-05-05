/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports.tests = {
    "qna": {
        "lufile":``
    },
    "phraselist": {
        "lufile": `$ChocolateType:phraseList
        - m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix
        
        
        $question:PhraseList interchangeable
        - are you
        - you are
        `,
        "luisJSON": {
          "intents": [],
          "entities": [],
          "composites": [],
          "closedLists": [],
          "regex_entities": [],
          "model_features": [
            {
              "name": "ChocolateType",
              "mode": false,
              "words": "m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix",
              "activated": true
            },
            {
              "name": "question",
              "mode": true,
              "words": "are you,you are",
              "activated": true
            }
          ],
          "regex_features": [],
          "utterances": [],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [],
        }
        },
    "all-entity-types": {
        "lufile":`$userName:simple
        $PREBUILT:datetimeV2
        $PREBUILT:age
        $PREBUILT:dimension
        $PREBUILT:email
        $PREBUILT:money
        $PREBUILT:number
        $PREBUILT:ordinal
        $PREBUILT:percentage
        $PREBUILT:phoneNumber
        $PREBUILT:temperature
        $PREBUILT:url
        $commPreference:call=
            - phone call
            - give me a ring
            - ring
            - call
            - cell phone
            - phone
        `,
        "luisJSON":{
          "intents": [],
          "entities": [
            {
              "name": "userName",
              "roles": []
            }
          ],
          "composites": [],
          "closedLists": [
            {
              "name": "commPreference",
              "subLists": [
                {
                  "canonicalForm": "call",
                  "list": [
                    "phone call",
                    "give me a ring",
                    "ring",
                    "call",
                    "cell phone",
                    "phone"
                  ]
                }
              ],
              "roles": []
            }
          ],
          "regex_entities": [],
          "model_features": [],
          "regex_features": [],
          "utterances": [],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [
            {
              "name": "datetimeV2",
              "roles": []
            },
            {
              "name": "age",
              "roles": []
            },
            {
              "name": "dimension",
              "roles": []
            },
            {
              "name": "email",
              "roles": []
            },
            {
              "name": "money",
              "roles": []
            },
            {
              "name": "number",
              "roles": []
            },
            {
              "name": "ordinal",
              "roles": []
            },
            {
              "name": "percentage",
              "roles": []
            },
            {
              "name": "phoneNumber",
              "roles": []
            },
            {
              "name": "temperature",
              "roles": []
            },
            {
              "name": "url",
              "roles": []
            }
          ],
        }
    },
    "3-intents-patterns":{
        "lufile":`> Doing everything as a pattern
        # AskForUserName
        - {userName}
        - I'm {userName}
        - call me {userName}
        - my name is {userName}
        - {userName} is my name
        - you can call me {userName}`,
        "luisJSON":{
          "intents": [
            {
              "name": "AskForUserName"
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
              "text": "{userName}",
              "intent": "AskForUserName",
              "entities": []
            }
          ],
          "patterns": [
            {
              "pattern": "{userName}",
              "intent": "AskForUserName"
            },
            {
              "pattern": "I'm {userName}",
              "intent": "AskForUserName"
            },
            {
              "pattern": "call me {userName}",
              "intent": "AskForUserName"
            },
            {
              "pattern": "my name is {userName}",
              "intent": "AskForUserName"
            },
            {
              "pattern": "{userName} is my name",
              "intent": "AskForUserName"
            },
            {
              "pattern": "you can call me {userName}",
              "intent": "AskForUserName"
            }
          ],
          "patternAnyEntities": [
            {
              "name": "userName",
              "explicitList": [],
              "roles": []
            }
          ],
          "prebuiltEntities": [],
        }
    },
    "2-intent": {
        "lufile":`# Greeting
        - Hi
        - Hello
        - Good morning
        - Good evening
        
        # Help
        - help
        - I need help
        - please help`,
        "luisJSON": {
          "intents": [
            {
              "name": "Greeting"
            },
            {
              "name": "Help"
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
            },
            {
              "text": "help",
              "intent": "Help",
              "entities": []
            },
            {
              "text": "I need help",
              "intent": "Help",
              "entities": []
            },
            {
              "text": "please help",
              "intent": "Help",
              "entities": []
            }
          ],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [],
        }
    },
    "2-intent-scattered-list": {
        "lufile":`> These are defined as patterns with commPreference as list entity type
        # CommunicationPreference
        - set phone call as my communication preference
        - I prefer to receive text messages
        
        > you can break up list entity definitions into multiple chunks, interleaved within a .lu file or even spread across .lu files.
        $commPreference:call=
            - phone call
            - give me a ring
            - ring
            - call
            - cell phone
            - phone
        
        # Help
        - can you help
        
        $commPreference:text=
            - message
            - text
            - sms
            - text message
        
        $commPreference:fax=
            - fax
            - fascimile`,
            "luisJSON": {
              "intents": [
                {
                  "name": "CommunicationPreference"
                },
                {
                  "name": "Help"
                }
              ],
              "entities": [],
              "composites": [],
              "closedLists": [
                {
                  "name": "commPreference",
                  "subLists": [
                    {
                      "canonicalForm": "call",
                      "list": [
                        "phone call",
                        "give me a ring",
                        "ring",
                        "call",
                        "cell phone",
                        "phone"
                      ]
                    },
                    {
                      "canonicalForm": "text",
                      "list": [
                        "message",
                        "text",
                        "sms",
                        "text message"
                      ]
                    },
                    {
                      "canonicalForm": "fax",
                      "list": [
                        "fax",
                        "fascimile"
                      ]
                    }
                  ],
                  "roles": []
                }
              ],
              "regex_entities": [],
              "model_features": [],
              "regex_features": [],
              "utterances": [
                {
                  "text": "set phone call as my communication preference",
                  "intent": "CommunicationPreference",
                  "entities": []
                },
                {
                  "text": "I prefer to receive text messages",
                  "intent": "CommunicationPreference",
                  "entities": []
                },
                {
                  "text": "can you help",
                  "intent": "Help",
                  "entities": []
                }
              ],
              "patterns": [],
              "patternAnyEntities": [],
              "prebuiltEntities": [],
            }
    },
    "1-intent": {
        "lufile":`# Greeting
        - Hi
        - Hello
        - Good morning
        - Good evening`,
        "luisJSON": {
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
        }
    },
    "1-intent-prebuilt-entity":{
        "lufile":`$PREBUILT:datetimeV2

        # CreateAlarm
        - create an alarm
        - create an alarm for 7AM
        - set an alarm for 7AM next thursday`,
        "luisJSON":{
          "intents": [
            {
              "name": "CreateAlarm"
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
              "text": "create an alarm",
              "intent": "CreateAlarm",
              "entities": []
            },
            {
              "text": "create an alarm for 7AM",
              "intent": "CreateAlarm",
              "entities": []
            },
            {
              "text": "set an alarm for 7AM next thursday",
              "intent": "CreateAlarm",
              "entities": []
            }
          ],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [
            {
              "name": "datetimeV2",
              "roles": []
            }
          ],
        }
    },
    "1-intent-patern-prebuilt":{
        "lufile":`> add these as patterns
        # DeleteAlarm
        - delete alarm
        - (delete|remove) the {alarmTime} alarm
        
        > alarmTime is a role for prebuilt datetimev2 entity
        $alarmTime:datetimeV2`,
        "luisJSON":{
          "intents": [
            {
              "name": "DeleteAlarm"
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
              "text": "delete alarm",
              "intent": "DeleteAlarm",
              "entities": []
            }
          ],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [
            {
              "name": "datetimeV2",
              "roles": []
            },
            {
              "type": "datetimeV2",
              "roles": [
                "alarmTime"
              ]
            }
          ],
        }
    },
    "1-intent-pattern-patternAny": {
        "lufile":`> These are defined as patterns with commPreference as pattern.any entity type
        # CommunicationPreference
        - set {commPreference} as my communication preference
        - I prefer to receive {commPreference}`,
        "luisJSON":{
          "intents": [
            {
              "name": "CommunicationPreference"
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
              "text": "set {commPreference} as my communication preference",
              "intent": "CommunicationPreference",
              "entities": []
            }
          ],
          "patterns": [
            {
              "pattern": "set {commPreference} as my communication preference",
              "intent": "CommunicationPreference"
            },
            {
              "pattern": "I prefer to receive {commPreference}",
              "intent": "CommunicationPreference"
            }
          ],
          "patternAnyEntities": [
            {
              "name": "commPreference",
              "explicitList": [],
              "roles": []
            }
          ],
          "prebuiltEntities": [],
        }
    },
    "1-intent-pattern-list": {
        "lufile":`> These are defined as patterns with commPreference as pattern.any entity type
        # CommunicationPreference
        - set {commPreference} as my communication preference
        - I prefer to receive {commPreference}
        
        $commPreference:call=
            - phone call
            - give me a ring
            - ring
            - call
            - cell phone
            - phone
        `,
        "luisJSON":{
          "intents": [
            {
              "name": "CommunicationPreference"
            }
          ],
          "entities": [],
          "composites": [],
          "closedLists": [
            {
              "name": "commPreference",
              "subLists": [
                {
                  "canonicalForm": "call",
                  "list": [
                    "phone call",
                    "give me a ring",
                    "ring",
                    "call",
                    "cell phone",
                    "phone"
                  ]
                }
              ],
              "roles": []
            }
          ],
          "regex_entities": [],
          "model_features": [],
          "regex_features": [],
          "utterances": [
            {
              "text": "set {commPreference} as my communication preference",
              "intent": "CommunicationPreference",
              "entities": []
            }
          ],
          "patterns": [
            {
              "pattern": "set {commPreference} as my communication preference",
              "intent": "CommunicationPreference"
            },
            {
              "pattern": "I prefer to receive {commPreference}",
              "intent": "CommunicationPreference"
            }
          ],
          "patternAnyEntities": [],
          "prebuiltEntities": [],
        }
    },
    "1-intent-labelled-utterances": {
        "lufile":`# AskForUserName
        - {userName=vishwac}
        - I'm {userName=vishwac}
        - call me {userName=vishwac}
        - my name is {userName=vishwac}
        - {userName=vishwac} is my name
        - you can call me {userName=vishwac}`,
        "luisJSON": {
          "intents": [
            {
              "name": "AskForUserName"
            }
          ],
          "entities": [
            {
              "name": "userName",
              "roles": []
            }
          ],
          "composites": [],
          "closedLists": [],
          "regex_entities": [],
          "model_features": [],
          "regex_features": [],
          "utterances": [
            {
              "text": "vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 0,
                  "endPos": 6
                }
              ]
            },
            {
              "text": "I'm vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 4,
                  "endPos": 10
                }
              ]
            },
            {
              "text": "call me vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 8,
                  "endPos": 14
                }
              ]
            },
            {
              "text": "my name is vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 11,
                  "endPos": 17
                }
              ]
            },
            {
              "text": "vishwac is my name",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 0,
                  "endPos": 6
                }
              ]
            },
            {
              "text": "you can call me vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 16,
                  "endPos": 22
                }
              ]
            }
          ],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [],
        }
    },
    "1-intent-1-entity": {
        "lufile": `# AskForUserName
        - {userName=vishwac}
        - I'm {userName=vishwac}
        - call me {userName=vishwac}
        - my name is {userName=vishwac}
        - {userName=vishwac} is my name
        - you can call me {userName=vishwac}
        
        $userName:simple`,
        "luisJSON": {
          "intents": [
            {
              "name": "AskForUserName"
            }
          ],
          "entities": [
            {
              "name": "userName",
              "roles": []
            }
          ],
          "composites": [],
          "closedLists": [],
          "regex_entities": [],
          "model_features": [],
          "regex_features": [],
          "utterances": [
            {
              "text": "vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 0,
                  "endPos": 6
                }
              ]
            },
            {
              "text": "I'm vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 4,
                  "endPos": 10
                }
              ]
            },
            {
              "text": "call me vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 8,
                  "endPos": 14
                }
              ]
            },
            {
              "text": "my name is vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 11,
                  "endPos": 17
                }
              ]
            },
            {
              "text": "vishwac is my name",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 0,
                  "endPos": 6
                }
              ]
            },
            {
              "text": "you can call me vishwac",
              "intent": "AskForUserName",
              "entities": [
                {
                  "entity": "userName",
                  "startPos": 16,
                  "endPos": 22
                }
              ]
            }
          ],
          "patterns": [],
          "patternAnyEntities": [],
          "prebuiltEntities": [],
        }
    }
};
