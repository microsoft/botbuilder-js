import { BotFrameworkAdapter, MemoryStorage, ConversationState, TurnContext } from 'botbuilder';
import { DialogSet, OAuthPrompt } from 'botbuilder-dialogs';
import * as restify from 'restify';
import { connect } from 'net';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

const connectionName = process.env.CONNECTION_NAME;

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Create empty dialog set
const dialogs = new DialogSet();

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        
        // Use this command to have the emulator send mocked tokens to the bot rather than authenticating
        // adapter.emulateOAuthCards(context, true);

        if (context.activity.type === 'message') {
            if(context.activity.text === 'signout') {
                await adapter.signOutUser(context, connectionName);
                await context.sendActivity("You are now signed out.");
            } else {
                // Create dialog context and continue executing the "current" dialog, if any.
                const state = conversationState.get(context);
                const dc = dialogs.createContext(context, state);
                await dc.continueDialog();

                // Check to see if anyone replied. If not then start dialog
                if (!context.responded) {
                    await dc.beginDialog('displayToken');
                }
            }
        } else if (context.activity.type === 'event' || context.activity.type === 'invoke') {
            // Create dialog context and continue executing the "current" dialog, if any.
            // This is important for OAuthCards because tokens can be received via TokenResponse events
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            await dc.continueDialog();
        }
    });
});

// Add a dialog to get a token for the connectrion
dialogs.add('loginPrompt', new OAuthPrompt({
    connectionName: connectionName,
    text: "Please Sign In",
    title: "Sign In",
    timeout: 300000        // User has 5 minutes to login
}));
 
// Add a dialog to display the token once the user has logged in
 dialogs.add('displayToken', [
      async function (dc) {
          await dc.beginDialog('loginPrompt');
      },
      async function (dc, token) {
          if (token) {
              // Continue with task needing access token
              await dc.context.sendActivity(`Your token is: ` + token.token);
          } else {
              await dc.context.sendActivity(`Sorry... We couldn't log you in. Try again later.`);
              await dc.endDialog();
          }
      }
 ]);
