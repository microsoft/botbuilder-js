const mainState = require('./main-state');
//const TURN_COUNTER = 'turnCounter';
class MainDialog {
    constructor (conversationState) {
        this.turnCounter = new mainState(conversationState);
        //this.turnCounter = conversationState.createProperty(TURN_COUNTER);
    }
    async onTurn(context) {
        if (context.activity.type === 'message') {
            // read from state.
            let count = await this.turnCounter.count.get(context);
            count = count === undefined ? 0 : count;
            await context.sendActivity(`${count}: You said "${context.activity.text}"`);
            // increment and set turn counter.
            this.turnCounter.count.set(context, ++count);
        }
        else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    }
}

module.exports = MainDialog;