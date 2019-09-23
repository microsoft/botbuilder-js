const BotConnector = require('../lib');
const CustomConnectorClient = require('../lib/customConnectorApi').CustomConnectorClient;
const CustomCredentials = require('../lib/auth').CustomMicrosoftAppCredentials;
const Assert = require('assert');

(async () => {
    // AppId, Password, Client (telegram, slack, msteams, etc) to test
    const appId = '979f310a-4a1c-4bf9-839d-330fa1d795da';
    const appPassword = 'jfRVBN9[@ctilmIKR0104%[';
    const basePath = 'https://slack.botframework.com';

    // Create client with new implementation
    const newCredentials = new CustomCredentials(appId, appPassword);
    const newClient = new CustomConnectorClient(newCredentials, {baseUri:basePath});

    // Create client with old implementation
    const credentials = new BotConnector.MicrosoftAppCredentials(appId, appPassword);
    const client = new BotConnector.ConnectorClient(credentials, {
        baseUri: basePath,
        withCredentials: true
    });

    // params used by the method
    const params = {
        bot: {
            id: "BKGSYSTFG:TKGSUQHQE",
        },
        members: [
            {
                id: "UK8CH2281:TKGSUQHQE",
            }
        ]
    };

    try {
        // token creation to avoid issues with headers
        const token = await credentials.getToken(true);
        const options = {
            customHeaders: {
                'Authorization': `Bearer ${token}`
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }            
        };

        const newToken = await newCredentials.getToken(true);
        const options2 = {
            customHeaders: {
                'Authorization': `Bearer ${newToken}`
            },
            headers: {
                'Authorization': `Bearer ${newToken}`
            }            
        }

        // actual code
        const expected = await client.conversations.createConversation(params, options);
        const actual = await newClient.conversations.createConversation(params, options2); 
        console.log(expected);
        console.log("=================================\n=================================\n=================================\n")
        console.log(actual);
        // assertion
        Assert.deepStrictEqual(actual, expected);        
    } catch (error) {
        console.error(error);
    }
})();