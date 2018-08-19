const TURN_COUNTER = 'count';
class EchoBot {
    constructor (conversationState) {
        this.turnCounter = conversationState.createProperty(TURN_COUNTER);
    }
    async dispatchActivity(context) {
        if (context.activity.type === 'message') {
            this.turnCounter++;
            await context.sendActivity(`${this.turnCounter}: You said "${context.activity.text}"`);
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    }
}

module.exports = EchoBot;