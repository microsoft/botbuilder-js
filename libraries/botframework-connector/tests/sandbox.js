const BotConnector = require('../lib');
const CustomConnectorClient = require('../lib/customConnectorApi').CustomConnectorClient;
const Assert = require('assert');

(async () => {
    // AppId, Password, Client (telegram, slack, msteams, etc) to test
    const appId = '979f310a-4a1c-4bf9-839d-330fa1d795da';
    const appPassword = 'jfRVBN9[@ctilmIKR0104%[';
    const basePath = 'https://slack.botframework.com';

    // Create client with new implementation
    const newClient = new CustomConnectorClient({
        appId: appId,
        appPassword: appPassword
    }, {
        baseUri: basePath
    });

    // Create client with old implementation
    const credentials = new BotConnector.MicrosoftAppCredentials(appId, appPassword);
    const client = new BotConnector.ConnectorClient(credentials, {
        baseUri: basePath,
        withCredentials: true
    });

    // params used by the method
   

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

        const params = {
            bot: {
                id: "BKGSYSTFG:TKGSUQHQE",
                // name: "bot's name"
            },
            members: [
                {
                    id: "UK8CH2281:TKGSUQHQE",
                    // name: "recipient's name"
                }
            ]
        };

        // actual code
        const expected = await client.conversations.createConversation(params, options);
        const actual = await newClient.conversations.createConversation(params, options); 

        // assertion
        Assert.deepStrictEqual(actual, expected);
    } catch (error) {
        console.error(error);
    }
})();