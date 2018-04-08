/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports.tests = {
    "qna": {
        "lufile":`// This is a QnA definition. follows ? <question> <answer> format.
        ? How can I change the default message from QnA Maker?
        You can change the default message if you use the QnAMakerDialog. See this for details: https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle
        
        ? How do I programmatically update my KB?
        You can use our REST apis to manage your KB. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa
        
        // You can add URLs for QnA maker to ingest using the #URL reference scheme
        #url('https://docs.microsoft.com/en-in/azure/cognitive-services/qnamaker/faqs')
        
        // You can define multilple questions for single answer as well
        ? Who is your ceo?
        ? get me your ceo info
        Vishwac
        `,
        "qnaJSON":{
            "qnaPairs": [
              {
                "answer": "You can change the default message if you use the QnAMakerDialog. See this for details: https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle",
                "question": "How can I change the default message from QnA Maker?"
              },
              {
                "answer": "You can use our REST apis to manage your KB. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa",
                "question": "How do I programmatically update my KB?"
              },
              {
                "answer": "Vishwac",
                "question": "Who is your ceo?"
              },
              {
                "answer": "Vishwac",
                "question": "get me your ceo info"
              }
            ],
            "urls": [
              "https://docs.microsoft.com/en-in/azure/cognitive-services/qnamaker/faqs"
            ],
          },
          "qnatsv": `How can I change the default message from QnA Maker?	You can change the default message if you use the QnAMakerDialog. See this for details: https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle	 Editorial 
          How do I programmatically update my KB?	You can use our REST apis to manage your KB. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa	 Editorial 
          Who is your ceo?	Vishwac	 Editorial 
          get me your ceo info	Vishwac	 Editorial 
          `
    },
    "phraselist": {
        "lufile": `$ChocolateType:phraseList
        m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix
        
        `,
        "luisJSON": {
            "intents": [],
            "entities": [],
            "composites": [],
            "closedLists": [],
            "bing_entities": [],
            "model_features": [
              {
                "name": "ChocolateType",
                "mode": false,
                "words": "m&m,mars,mints,spearmings,payday,jelly,kit kat,kitkat,twix",
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
        $r1:age
        $r2:age
        $e1:dimension
        $e2:email
        $commPreference:list
        call:
            phone call
            give me a ring
            ring
            call
            cell phone
            phone
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
            "bing_entities": [
              "datetimeV2",
              "age",
              "dimension",
              "email",
              "money",
              "number",
              "ordinal",
              "percentage",
              "phoneNumber",
              "temperature",
              "url"
            ],
            "model_features": [],
            "regex_features": [],
            "utterances": [],
            "patterns": [],
            "patternAnyEntities": [],
            "prebuiltEntities": [
              {
                "type": "age",
                "roles": [
                  "r1",
                  "r2"
                ]
              },
              {
                "type": "dimension",
                "roles": [
                  "e1"
                ]
              },
              {
                "type": "email",
                "roles": [
                  "e2"
                ]
              }
            ],
          }
    },
    "3-intents-patterns":{
        "lufile":`// Doing everything as a pattern
        #Greeting
        ~Hi
        ~Hello
        ~Good morning
        ~Good evening
        
        #Help
        ~help
        ~I need help
        ~please help
        
        // username will be added as a pattern.any entity
        #AskForUserName
        ~{userName}
        ~I'm {userName}
        ~call me {userName}
        ~my name is {userName}
        ~{userName} is my name
        ~you can call me {userName}`,
        "luisJSON":{
            "intents": [
              {
                "name": "Greeting"
              },
              {
                "name": "Help"
              },
              {
                "name": "AskForUserName"
              }
            ],
            "entities": [],
            "composites": [],
            "closedLists": [],
            "bing_entities": [],
            "model_features": [],
            "regex_features": [],
            "utterances": [],
            "patterns": [
              {
                "text": "Hi",
                "intent": "Greeting"
              },
              {
                "text": "Hello",
                "intent": "Greeting"
              },
              {
                "text": "Good morning",
                "intent": "Greeting"
              },
              {
                "text": "Good evening",
                "intent": "Greeting"
              },
              {
                "text": "help",
                "intent": "Help"
              },
              {
                "text": "I need help",
                "intent": "Help"
              },
              {
                "text": "please help",
                "intent": "Help"
              },
              {
                "text": "{userName}",
                "intent": "AskForUserName"
              },
              {
                "text": "I'm {userName}",
                "intent": "AskForUserName"
              },
              {
                "text": "call me {userName}",
                "intent": "AskForUserName"
              },
              {
                "text": "my name is {userName}",
                "intent": "AskForUserName"
              },
              {
                "text": "{userName} is my name",
                "intent": "AskForUserName"
              },
              {
                "text": "you can call me {userName}",
                "intent": "AskForUserName"
              }
            ],
            "patternAnyEntities": [
              {
                "name": "userName",
                "roles": []
              }
            ],
            "prebuiltEntities": [],
          }
    },
    "2-intent": {
        "lufile":`#Greeting
        Hi
        Hello
        Good morning
        Good evening
        
        #Help
        help
        I need help
        please help`,
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
            "bing_entities": [],
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
        "lufile":`// These are defined as patterns with commPreference as list entity type
        #CommunicationPreference
        ~set {commPreference} as my communication preference
        ~I prefer to receive {commPreference}
        
        // you can break up list entity definitions into multiple chunks, interleaved within a .lu file or even spread across .lu files.
        $commPreference:list
        call:
            phone call
            give me a ring
            ring
            call
            cell phone
            phone
        
        #Help
        can you help
        
        $commPreference:list
        text:
            message
            text
            sms
            text message
        
        $commPreference:list
        fax:
            fax
            fascimile`,
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
                "bing_entities": [],
                "model_features": [],
                "regex_features": [],
                "utterances": [
                  {
                    "text": "can you help",
                    "intent": "Help",
                    "entities": []
                  }
                ],
                "patterns": [
                  {
                    "text": "set {commPreference} as my communication preference",
                    "intent": "CommunicationPreference"
                  },
                  {
                    "text": "I prefer to receive {commPreference}",
                    "intent": "CommunicationPreference"
                  }
                ],
                "patternAnyEntities": [],
                "prebuiltEntities": [],
                
              }
    },
    "1-intent": {
        "lufile":`#Greeting
        Hi
        Hello
        Good morning
        Good evening`,
        "luisJSON": {
            "intents": [
              {
                "name": "Greeting"
              }
            ],
            "entities": [],
            "composites": [],
            "closedLists": [],
            "bing_entities": [],
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

        #CreateAlarm
        create an alarm
        create an alarm for 7AM
        set an alarm for 7AM next thursday`,
        "luisJSON":{
            "intents": [
              {
                "name": "CreateAlarm"
              }
            ],
            "entities": [],
            "composites": [],
            "closedLists": [],
            "bing_entities": [
              "datetimeV2"
            ],
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
            "prebuiltEntities": [],
          }
    },
    "1-intent-patern-prebuilt":{
        "lufile":`// add these as patterns
        #DeleteAlarm
        ~delete alarm
        ~(delete|remove) the {alarmTime} alarm
        
        // alarmTime is a role for prebuilt datetimev2 entity
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
            "bing_entities": [
              "datetimeV2"
            ],
            "model_features": [],
            "regex_features": [],
            "utterances": [],
            "patterns": [
              {
                "text": "delete alarm",
                "intent": "DeleteAlarm"
              },
              {
                "text": "(delete|remove) the {alarmTime} alarm",
                "intent": "DeleteAlarm"
              }
            ],
            "patternAnyEntities": [],
            "prebuiltEntities": [
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
        "lufile":`// These are defined as patterns with commPreference as pattern.any entity type
        #CommunicationPreference
        ~set {commPreference} as my communication preference
        ~I prefer to receive {commPreference}`,
        "luisJSON":{
            "intents": [
              {
                "name": "CommunicationPreference"
              }
            ],
            "entities": [],
            "composites": [],
            "closedLists": [],
            "bing_entities": [],
            "model_features": [],
            "regex_features": [],
            "utterances": [],
            "patterns": [
              {
                "text": "set {commPreference} as my communication preference",
                "intent": "CommunicationPreference"
              },
              {
                "text": "I prefer to receive {commPreference}",
                "intent": "CommunicationPreference"
              }
            ],
            "patternAnyEntities": [
              {
                "name": "commPreference",
                "roles": []
              }
            ],
            "prebuiltEntities": [],
          }
    },
    "1-intent-pattern-list": {
        "lufile":`// These are defined as patterns with commPreference as pattern.any entity type
        #CommunicationPreference
        ~set {commPreference} as my communication preference
        ~I prefer to receive {commPreference}
        
        $commPreference:list
        call:
            phone call
            give me a ring
            ring
            call
            cell phone
            phone
        text:
            message
            text
            sms
            text message`,
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
                  },
                  {
                    "canonicalForm": "text",
                    "list": [
                      "message",
                      "text",
                      "sms",
                      "text message"
                    ]
                  }
                ],
                "roles": []
              }
            ],
            "bing_entities": [],
            "model_features": [],
            "regex_features": [],
            "utterances": [],
            "patterns": [
              {
                "text": "set {commPreference} as my communication preference",
                "intent": "CommunicationPreference"
              },
              {
                "text": "I prefer to receive {commPreference}",
                "intent": "CommunicationPreference"
              }
            ],
            "patternAnyEntities": [],
            "prebuiltEntities": [],
          }
    },
    "1-intent-labelled-utterances": {
        "lufile":`#AskForUserName
        {userName:vishwac}
        I'm {userName:vishwac}
        call me {userName:vishwac}
        my name is {userName:vishwac}
        {userName:vishwac} is my name
        you can call me {userName:vishwac}`,
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
            "bing_entities": [],
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
        "lufile": `#AskForUserName
        {userName:vishwac}
        I'm {userName:vishwac}
        call me {userName:vishwac}
        my name is {userName:vishwac}
        {userName:vishwac} is my name
        you can call me {userName:vishwac}
        
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
            "bing_entities": [],
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
