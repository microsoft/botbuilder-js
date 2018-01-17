const builder = require('../../../libraries/core');
const services = require('../../../libraries/services');
const restify = require('restify');
const config = require('./config');
const router = require('./router');

module.exports = {
    initBot: () => {
        
    },
    handleConversationUpdateEvents: function (context) {
        if (context.request.channelId === "emulator") {
            // in the emulator, the IDs should be "default-user" and "default-bot"
            var id = context.request.membersAdded[0].id.split('-')[1];
            // uncomment next line to act on "bot added"
            //if (id === "bot") context.reply('Bot added to conversation.'); 
            if (id === "user") {
                context.reply('Welcome to SDK4 Adaptive Cards example');
            }
        } else {
            var added = context.request.membersAdded[0];
            context.reply(`Added to conversation - Name:${added.name}, ID: ${added.id}`)
        }
    },
    handleOtherActivityTypes: function (context) {
        // handle all other activity types
        context.reply(`[${context.request.type} event detected]`);
    },
    formatAdaptiveCard: (text, adaptiveCard) => {
        return {
            "type": "message",
            "text": text,
            "attachments": [{
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": adaptiveCard
            }]
        }
    }
}


// END OF LINE
