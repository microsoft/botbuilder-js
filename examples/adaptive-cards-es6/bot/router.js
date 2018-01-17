let utils = require('./utils');
let cards = require('./cards');

let cardNames = [];
for (const card in cards) {
    cardNames.push(cards[card].name);
}

function handleConversationUpdateEvents (context) {
    if (context.request.channelId === "emulator") {
        // in the emulator, the IDs should be "default-user" and "default-bot"
        var id = context.request.membersAdded[0].id.split('-')[1];
        // uncomment next line to act on "bot added"
        //if (id === "bot") context.reply('Bot added to conversation.'); 
        if (id === "user") {
            context.reply('Welcome to SDK4 Adaptive Cards example');
            context.reply('Enter "cards" for available demos.')
        }
    } else {
        var added = context.request.membersAdded[0];
        context.reply(`Added to conversation - Name:${added.name}, ID: ${added.id}`)
    }
}

function handleOtherActivityTypes (context) {
    // handle all other activity types
    context.reply(`[${context.request.type} event detected]`);
}

function formatAdaptiveCard (card) {
    //let cardContent = JSON.stringify(card.content);
    let adaptiveCard = {
        "type": "message",
        "text": "Example: " + card.name,
        "attachments": [{
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": card.content
        }]
    }
    return adaptiveCard;
}

module.exports = {
    route: (context) => {
        if (context.request.type === 'message') {
            let messageText = context.request.text;
            if (/cards/i.test(messageText)) {
                context.reply('Enter a card name from the list:');
                context.reply(cardNames.join('\n\n'));
            } else if (new RegExp(cards.activityUpdate.name, 'i').test(messageText)) {
                let card = formatAdaptiveCard(cards.activityUpdate)
                context.reply(card);
            } else if (new RegExp(cards.calendarReminder.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.calendarReminder));
            } else if (new RegExp(cards.flightItinerary.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.flightItinerary));
            } else if (new RegExp(cards.flightUpdate.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.flightUpdate));
            } else if (new RegExp(cards.foodOrder.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.foodOrder));
            } else if (new RegExp(cards.imageGallery.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.imageGallery));
            } else if (new RegExp(cards.inputForm.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.inputForm));
            } else if (new RegExp(cards.inputs.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.inputs));
            } else if (new RegExp(cards.restaurant.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.restaurant));
            } else if (new RegExp(cards.solitaire.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.solitaire));
            } else if (new RegExp(cards.sportsGameUpdate.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.sportsGameUpdate));
            } else if (new RegExp(cards.stockUpdate.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.stockUpdate));
            } else if (new RegExp(cards.weatherCompact.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.weatherCompact));
            } else if (new RegExp(cards.weatherLarge.name, 'i').test(messageText)) {
                context.reply(formatAdaptiveCard(cards.weatherLarge));
            } else {
                context.reply('Type "cards" for list of example names.');
            }
        }
        else if (context.request.type === 'conversationUpdate') handleConversationUpdateEvents(context);
        else handleOtherActivityTypes(context);
    }
}


// END OF LINE
