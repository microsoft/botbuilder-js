const assert = require('assert');
const { AttachmentsApi, ConversationsApi } = require('../dist')

const hostURL = process.env['HOST_URL'] || 'https://slack.botframework.com';
const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE'
};
const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE'
};

let client;

var createConversation = () => ({
    members: [ user ],
    bot: bot
});

var createActivity = () => ({
    type: 'message',
    text: 'test activity',
    recipient: user,
    from: bot
}); 

// TODO: This test fail, we need to verify the way to make a properly request to botconnector API (generate a token)
describe('ConnectorApi test', function() {
    this.timeout(100000);
    describe('CreateConversation', function() {
        it('should return a valid conversation ID', function(done) {
            client = new ConversationsApi(hostURL);
            var params = createConversation();
            params.activity = createActivity();    
            client.CreateConversation(
            {
                members: [ user ],
                bot: bot,
                activity: {
                    type: 'message',
                    text: 'test activity',
                    recipient: user,
                    from: bot
                }            
            },
            {
                headers: {                        
                    'authorization': "Bearer mockToken",// Token used in the botconnector tests. those tests are mocked with nock. 
                    'user-agent': "botframework-connector/4.0.0 ms-rest-js/0.1.0 Node/v10.14.2 OS/(x64-Windows_NT-10.0.17134) ",
                }
            }
            ).then((result) => {
                console.log(result)
                assert(!!result.id)
            })
            .then(done, done);
        });
    });
});
