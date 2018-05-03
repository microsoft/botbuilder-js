"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_core_1 = require("botbuilder-core");
/**
 * When added, this middleware will log incoming and outgoing activities to a ITranscriptStore.
 */
class TranscriptLoggerMiddleware {
    /**
     * Middleware for logging incoming and outgoing activities to a transcript store.
     * @param logger Transcript logger
     */
    constructor(logger) {
        this.transcript = [];
        if (!logger) {
            throw new Error('TranscriptLoggerMiddleware requires a TranscriptLogger instance.');
        }
        this.logger = logger;
    }
    /**
     * Initialization for middleware turn.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to call at the end of the middleware chain.
     */
    onTurn(context, next) {
        // log incoming activity at beginning of turn
        if (context.activity) {
            if (!context.activity.from.role) {
                context.activity.from.role = 'user';
            }
            this.logActivity(this.cloneActivity(context.activity));
        }
        // hook up onSend pipeline
        context.onSendActivities((ctx, activities, next) => {
            // run full pipeline
            let responses = next();
            activities.forEach(a => this.logActivity(this.cloneActivity(a)));
            return responses;
        });
        // hook up update activity pipeline
        context.onUpdateActivity((ctx, activity, next) => {
            // run full pipeline
            let response = next();
            // add Message Update activity
            let updateActivity = this.cloneActivity(activity);
            updateActivity.type = botbuilder_core_1.ActivityTypes.MessageUpdate;
            this.logActivity(updateActivity);
            return response;
        });
        // hook up delete activity pipeline
        context.onDeleteActivity((ctx, reference, next) => {
            // run full pipeline
            next();
            // add MessageDelete activity
            // log as MessageDelete activity
            let deleteActivity = botbuilder_core_1.TurnContext.applyConversationReference({
                type: botbuilder_core_1.ActivityTypes.MessageDelete,
                id: reference.activityId
            }, reference, false);
            this.logActivity(deleteActivity);
        });
        // process bot logic
        next().then(() => {
            // flush transcript at end of turn
            while (this.transcript.length > 0) {
                try {
                    var activity = this.transcript.shift();
                    this.logger.logActivity(activity);
                }
                catch (err) {
                    console.error('Transcript logActivity failed', err);
                }
            }
        });
    }
    /**
     * Logs the Activity.
     * @param activity Activity to log.
     */
    logActivity(activity) {
        if (!activity.timestamp) {
            activity.timestamp = new Date();
        }
        this.transcript.push(activity);
    }
    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    cloneActivity(activity) {
        return JSON.parse(JSON.stringify(activity));
    }
}
exports.TranscriptLoggerMiddleware = TranscriptLoggerMiddleware;
/**
 * ConsoleTranscriptLogger , writes activities to Console output.
 */
class ConsoleTranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity) {
        if (!activity)
            throw new Error('Activity is required.');
        console.log('Activity Log:', activity);
    }
}
exports.ConsoleTranscriptLogger = ConsoleTranscriptLogger;
/**
 * Metadata for a stored transcript.
 */
class Transcript {
}
exports.Transcript = Transcript;
/**
 * Page of results.
 * @param T type of items being paged in.
 */
class PagedResult {
    constructor() {
        /**
         * Page of items.
         */
        this.items = [];
    }
}
exports.PagedResult = PagedResult;
//# sourceMappingURL=transcriptLogger.js.map