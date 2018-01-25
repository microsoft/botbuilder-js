# Bot Framework Connector SDK for Node.js

This project provides a Node.js package that makes it easy to manage Bot Framework Connector. Right now it supports:
- **Node.js version: 6.x.x or higher**

## How to Install

```bash
npm install botframework-connector
```

## How to Use

### Client creation (with authentication), conversation initialization and activity send to user as an example

````javascript
var BotConnector = require('botframework-connector');

var credentials = new BotConnector.MicrosoftAppCredentials({
    appId: '<your-app-id>',
    appPassword: '<your-app-password>'
});

var botId = '<bot-id>';
var recipientId = '<user-id>';

var client = new BotConnector.ConnectorClient(credentials, 'https://slack.botframework.com')

client.conversations.createConversation({
    bot: { id: botId },
    members: [
        { id: recipientId }
    ],
    isGroup: false
}).then(result => {
    var conversationId = result.id;
    return client.conversations.sendToConversation(conversationId, {
        type: 'message',
        from: { id: botId },
        recipient: { id: recipientId },
        text: 'This a message from Bot Connector Client (NodeJS)'
    });
}).then(result => {
    var activityId = result.id;
    console.log('Sent reply with ActivityId:', activityId);
});
````

### API Documentation
 
 For API Documentation, please see our [API reference](https://docs.microsoft.com/en-us/Bot-Framework/rest-api/bot-framework-rest-connector-api-reference).
 
## Useful links

- [Microsoft Azure SDK for Node.js - All-up](https://github.com/WindowsAzure/azure-sdk-for-node)
- [Bot Framework - Key concepts](https://docs.microsoft.com/en-us/Bot-Framework/rest-api/bot-framework-rest-connector-concepts)