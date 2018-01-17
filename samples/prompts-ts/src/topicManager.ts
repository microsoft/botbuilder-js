import { Promiseable } from 'botbuilder-core';

/**
 * Interface that topic modules should implement.
 */
export interface Topic {
    /** Name of the topic. */
    topicName: string;

    /**
     * (Optional) method that will be called anytime an activity is received. The method should
     * return `true` to indicate that it processed the activity and that no further routing should
     * occur. 
     * @param context Context for the current turn of conversation with the user.
     */
    onActivity?(context: BotContext): Promiseable<boolean>;

    /**
     * Called to continue the conversation with the user when the topic is active.
     * @param context Context for the current turn of conversation with the user.
     */
    continueTopic?(context: BotContext): Promiseable<any>;
}

/**
 * Tracks the currently active topic.
 */
export interface TopicState {
    /** Additional properties to persist for the topic. */
    [key:string]: any;

    /** Name of the topic. */
    name: string;

    /** (Optional) name of the active prompt. */
    prompt?: string;
}

/**
 * (TypeScript Only) extend ConversationState with new activeTopic field.  
 */
declare global {
    export interface ConversationState {
        /** (Optional) topic that's active. */
        activeTopic?: TopicState;
    }
}

/**
 * Maintain an index of all registered topics.
 */ 
const topicsByOrder: Topic[] = [];
const topicsByName: { [name:string]: Topic; } = {};


/**
 * Registers topics with the topics manager.
 * @param topics One or more topics to add.
 */
export function addTopics(...topics: Topic[]) {
    // Save topic references keyed by their name.
    topics.forEach((topic) => {
        topicsByOrder.push(topic);
        topicsByName[topic.topicName] = topic;
    });
}

/**
 * Routes a received activity to the appropriate topic. Resolves the returned promise with 
 * @param context Context for the current turn of conversation with the user.
 */
export function routeActivity(context: BotContext): Promise<boolean> {
    const state = context.state.conversation;
    const activeTopic = state && state.activeTopic ? topicsByName[state.activeTopic.name] : undefined;
    return new Promise((resolve, reject) => {
        function next(i: number) {
            if (i < topicsByOrder.length) {
                // Give topic a chance to activate itself
                const topic = topicsByOrder[i];
                if (topic.onActivity) {
                    Promise.resolve(topic.onActivity(context))
                           .then((handled) => {
                                if (handled) {
                                    resolve(true);
                                } else {
                                    next(i + 1);
                                }
                           }, (err) => reject(err));
                } else {
                    next(i + 1);
                }
            } else if (activeTopic && activeTopic.continueTopic) {
                // Route to the current topic
                Promise.resolve(activeTopic.continueTopic(context))
                       .then(() => resolve(true), (err) => reject(err));
            } else {
                // Activity was NOT routed.
                resolve(false);
            }
        }
        next(0);
    });
}