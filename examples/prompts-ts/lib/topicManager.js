"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Maintain an index of all registered topics.
 */
const topicsByOrder = [];
const topicsByName = {};
/**
 * Registers topics with the topics manager.
 * @param topics One or more topics to add.
 */
function addTopics(...topics) {
    // Save topic references keyed by their name.
    topics.forEach((topic) => {
        topicsByOrder.push(topic);
        topicsByName[topic.topicName] = topic;
    });
}
exports.addTopics = addTopics;
/**
 * Routes a received activity to the appropriate topic. Resolves the returned promise with
 * @param context Context for the current turn of conversation with the user.
 */
function routeActivity(context) {
    const state = context.state.conversation;
    const activeTopic = state && state.activeTopic ? topicsByName[state.activeTopic.name] : undefined;
    return new Promise((resolve, reject) => {
        function next(i) {
            if (i < topicsByOrder.length) {
                // Give topic a chance to activate itself
                const topic = topicsByOrder[i];
                if (topic.onActivity) {
                    Promise.resolve(topic.onActivity(context))
                        .then((handled) => {
                        if (handled) {
                            resolve(true);
                        }
                        else {
                            next(i + 1);
                        }
                    }, (err) => reject(err));
                }
                else {
                    next(i + 1);
                }
            }
            else if (activeTopic && activeTopic.continueTopic) {
                // Route to the current topic
                Promise.resolve(activeTopic.continueTopic(context))
                    .then(() => resolve(true), (err) => reject(err));
            }
            else {
                // Activity was NOT routed.
                resolve(false);
            }
        }
        next(0);
    });
}
exports.routeActivity = routeActivity;
