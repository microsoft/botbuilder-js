/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HttpResponseMessage, HttpResponseMock } from './httpResponseMock';
import { HttpResponseMockMessage } from './httpResponseMockMessage';

export class SequenceResponseManager {
    private _id = 0;
    private _messages: HttpResponseMockMessage[] = [];

    public constructor(responses?: HttpResponseMock[]) {
        if (!responses?.length) {
            // Create a default message for response
            this._messages.push(new HttpResponseMockMessage());
        } else {
            this._messages.push(...responses.map((response) => new HttpResponseMockMessage(response)));
        }
    }

    public getMessage(): HttpResponseMessage {
        const result = this._messages[this._id];
        if (this._id < this._messages.length - 1) {
            this._id++;
        }

        // We create a new one here in case the consumer will dispose the object.
        return result.getMessage();
    }
}
