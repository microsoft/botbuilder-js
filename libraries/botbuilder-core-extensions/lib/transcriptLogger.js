"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * When added, this middleware will log incoming and outgoing activitites to a ITranscriptStore.
 */
class TranscriptLoggerMiddleware {
    /**
     * Initialization for middleware turn.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to call at the end of the middleware chain.
     */
    onTurn(context, next) {
        throw new Error("Method not implemented.");
    }
}
exports.TranscriptLoggerMiddleware = TranscriptLoggerMiddleware;
class Transcript {
}
exports.Transcript = Transcript;
/**
 * Page of results.
 */
class PagedResult {
}
exports.PagedResult = PagedResult;
//# sourceMappingURL=transcriptLogger.js.map