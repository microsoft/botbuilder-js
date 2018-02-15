const activitiesById = {};

export class WebChatAdapter {
    post(activities) {
        activitiesById[activities[0].replyToId] = activities;
        activities.forEach(activity => Object.assign(activity, {id: activity.replyToId, from: {id: "The Bot"}}));
        return Promise.resolve(activities);
    }

    onReceive(activity) {
        // overwritten by bot
    }

    getMessagePipelineToBot() {
        return async activity => {
            // Activity from the web chat is missing
            // data needed for the BotStateManager.
            const id = Date.now();
            activity = Object.assign({id, conversation: {id: "The Bot"}, channelId: 1}, activity);
            await this.onReceive(activity);
            const replyFromBot = activitiesById[id];
            return Promise.resolve(replyFromBot);
        }
    }
}