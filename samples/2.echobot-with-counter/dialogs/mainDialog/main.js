const mainState = require('./main-state');

class MainDialog {
    constructor (conversationState) {
        this.state = new mainState(conversationState);
    }
    async onTurn(context) {
        if (context.activity.type === 'message') {
            // read from state.
            let count = await this.state.get(context);
            count = count === undefined ? 0 : count;
            await context.sendActivity(`${count}: You said "${context.activity.text}"`);
            // increment and set turn counter.
            this.state.set(context, ++count);
        }
        else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    }
}

module.exports = MainDialog;