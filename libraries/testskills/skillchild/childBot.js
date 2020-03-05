
const { ActivityHandler } = require('botbuilder');

class ChildBot extends ActivityHandler {

    constructor() {
        super();

        this.onMessage(async (context, next) => {
            await context.sendActivity('hello from child');
            await next();
        });
    }
}

module.exports.ChildBot = ChildBot;
