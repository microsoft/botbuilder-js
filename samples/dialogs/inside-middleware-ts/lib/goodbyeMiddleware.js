"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const GoodbyeStackName = 'goodbyeStack';
class GoodbyeMiddleware {
    receiveActivity(context, next) {
        // Ensure we only respond to messages
        if (context.request.type !== 'message') {
            return next();
        }
        // Intercept the message if we're prompting the user.
        return dialogs.continue(context).then(() => {
            // Ensure the utterance handled by an active dialog
            if (!context.responded) {
                // Check for user to say "goodbye"
                const utterance = (context.request.text || '').trim().toLowerCase();
                if (utterance === 'goodbye') {
                    // Start confirmation dialog
                    return dialogs.begin(context, 'confirmGoodbye');
                }
                else {
                    return next();
                }
            }
            else {
                // Prevent further processing since we're in a dialog with the user.
                return Promise.resolve();
            }
        });
    }
}
exports.GoodbyeMiddleware = GoodbyeMiddleware;
// Create dialogs for middleware. Uses its own namespace isolated stack to avoid collisions with 
// the bot or other middleware.
const dialogs = new botbuilder_dialogs_1.DialogSet(GoodbyeStackName);
dialogs.add('confirmGoodbye', [
    function (context) {
        const options = { style: botbuilder_dialogs_1.ListStyle.none };
        return dialogs.prompt(context, 'confirmPrompt', `This will end any active tasks. Are you sure?`, options);
    },
    function (context, value) {
        if (value) {
            // Reset conversation state
            context.reply(`Ok... Goodbye`);
            context.state.conversation = {};
        }
        else {
            context.reply(`Ok...`);
        }
        return dialogs.end(context);
    }
]);
dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
//# sourceMappingURL=goodbyeMiddleware.js.map