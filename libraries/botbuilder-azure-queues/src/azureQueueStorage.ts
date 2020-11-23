// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QueueClient } from '@azure/storage-queue';
import { Activity, QueueStorage } from 'botbuilder-core';

/**
 * Service used to add messages to an Azure Storage Queues.
 */
export class AzureQueueStorage extends QueueStorage {
    private _createQueueIfNotExists = true;
    private readonly _queueClient: QueueClient;

    /**
     * Initializes a new instance of the AzureQueueStorage class.
     *
     * @param {string} queuesStorageConnectionString Azure storage connection string.
     * @param {string} queueName Name of the storage queue where entities will be queued.
     */
    public constructor(queuesStorageConnectionString: string, queueName: string) {
        super();
        if (!queuesStorageConnectionString) {
            throw new Error(`queuesStorageConnectionString cannot be empty`);
        }

        if (!queueName) {
            throw new Error(`queueName cannot be empty`);
        }

        this._queueClient = new QueueClient(queuesStorageConnectionString, queueName);
    }

    /**
     * Queue an Activity to an Azure storage queues. The visibility timeout specifies how long the message should be visible
     * to Dequeue and Peek operations. The message content must be a UTF-8 encoded string that is up to 64KB in size.
     *
     * @param {Partial<Activity>} activity The [Activity]{xref:botframework-core.Activity} to be queued for later processing.
     * @param {number} visibilityTimeout Default value of 0. Cannot be larger than 7 days.
     * @param {number} messageTimeToLive Specifies the time-to-live interval for the message.
     * @returns {Promise<string>} [QueueSendMessageResponse]{xref:@azure/storage-queue.QueueSendMessageResponse} as a JSON string.
     */
    public async queueActivity(
        activity: Partial<Activity>,
        visibilityTimeout?: number,
        messageTimeToLive?: number
    ): Promise<string> {
        if (this._createQueueIfNotExists) {
            // This is an optimization flag to check if the container call has been made.
            // It is okay if this is called more than once.
            this._createQueueIfNotExists = false;
            await this._queueClient.createIfNotExists();
        }

        // Convert activity to base64 string
        const message = btoa(unescape(encodeURIComponent(JSON.stringify(activity))));
        const receipt = await this._queueClient.sendMessage(message, {
            visibilityTimeout,
            messageTimeToLive,
        });

        return JSON.stringify(receipt);
    }
}