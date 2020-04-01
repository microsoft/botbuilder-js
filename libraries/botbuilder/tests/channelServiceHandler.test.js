// const { fail, ok: assert, strictEqual } = require('assert');
// const { ActivityTypes } = require('botbuilder-core');
// const { AuthenticationConfiguration, ClaimsIdentity, SimpleCredentialProvider } = require('botframework-connector');
// const { ChannelServiceHandler } = require('../');

// const AUTH_HEADER = 'Bearer HelloWorld';
// const AUTH_CONFIG = new AuthenticationConfiguration();
// const CREDENTIALS = new SimpleCredentialProvider('', '');

// class NoAuthHandler extends ChannelServiceHandler {
//     async handleSendToConversation(authHeader, conversationId, activity) {
//         assert(authHeader, 'authHeader not received');
//         assert(conversationId, 'conversationId not received');
//         assert(activity, 'activity not received');
//         return await super.handleSendToConversation(authHeader, conversationId, activity);
//     }

//     // Override the private authenticate method to bypass auth.
//     async authenticate(authHeader) {
//         assert.strictEqual(authHeader, AUTH_HEADER);
//         return new ClaimsIdentity([]);
//     }
// }

// const createDefaultErrorMessage = (methodName) => {
//     return `ChannelServiceHandler.${ methodName }(): 501: Not Implemented`;
// };

// describe('ChannelServiceHandler', () => {
//     describe('constructor', () => {
//         it('should succeed with valid parameters', () => {
//             const channelService = 'channels';
//             const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG, channelService);
    
//             strictEqual(handler.authConfig, AUTH_CONFIG);
//             strictEqual(handler.credentialProvider, CREDENTIALS);
//             strictEqual(handler.channelService, channelService);
//         });
    
//         it('should use process.env.ChannelService if no channelService is provided', () => {
//             process.env.ChannelService = 'test';
//             const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
    
//             strictEqual(handler.authConfig, AUTH_CONFIG);
//             strictEqual(handler.credentialProvider, CREDENTIALS);
//             strictEqual(handler.channelService, 'test');
//             process.env.ChannelService = undefined;
//         });
    
//         it('should fail with invalid credentialProvider or authConfig', () => {
//             try {
//                 const handler = new NoAuthHandler();
//                 fail('Should not have successfully constructed without credentialProvider');
//             } catch (e) {
//                 strictEqual(e.message, 'BotFrameworkHttpClient(): missing credentialProvider');
//             }
    
//             try {
//                 const handler = new NoAuthHandler(CREDENTIALS);
//                 fail('Should not have successfully constructed without authConfig');
//             } catch (e) {
//                 strictEqual(e.message, 'BotFrameworkHttpClient(): missing authConfig');
//             }
    
//         });
//     });

//     describe('SendToConversation flow:', () => {
//         it('handleSendToConversation should call onSendToConversation', async () => {
//             const handler = new NoAuthHandler(CREDENTIALS, AUTH_CONFIG);
//             try {
//                 await handler.handleSendToConversation(AUTH_HEADER, 'convId', { type: ActivityTypes.Message });
//             } catch (e) {
//                 strictEqual(e.message, createDefaultErrorMessage('onSendToConversation'));
//             }
//         });
//     });
// });
