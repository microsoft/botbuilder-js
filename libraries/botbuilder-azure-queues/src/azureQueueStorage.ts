// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { QueueClient } from '@azure/storage-queue';
import { Activity, QueueStorage } from 'botbuilder-core';

/**
 * Service used to add messages to an Azure Storage Queues.
 */
export class AzureQueueStorage extends QueueStorage {
    private _initializePromise: Promise<unknown>;
    private readonly _queueClient: QueueClient;

    /**
     * Initializes a new instance of the AzureQueueStorage class.
     *
     * @param {string} queuesStorageConnectionString Azure storage connection string.
     * @param {string} queueName Name of the storage queue where entities will be queued.
     */
    constructor(queuesStorageConnectionString: string, queueName: string) {
        super();
        if (!queuesStorageConnectionString) {
            throw new Error('queuesStorageConnectionString cannot be empty');
        }

        if (!queueName) {
            throw new Error('queueName cannot be empty');
        }

        this._queueClient = new QueueClient(queuesStorageConnectionString, queueName);
    }

    /**
     * Queue an Activity to an Azure storage queues. The visibility timeout specifies how long the message should be visible
     * to Dequeue and Peek operations. The message content must be a UTF-8 encoded string that is up to 64KB in size.
     *
     * @param {Partial<Activity>} activity The [Activity](xref:botframework-core.Activity) to be queued for later processing.
     * @param {number} visibilityTimeout Default value of 0. Cannot be larger than 7 days.
     * @param {number} messageTimeToLive Specifies the time-to-live interval for the message.
     * @returns {Promise<string>} [QueueSendMessageResponse](xref:@azure/storage-queue.QueueSendMessageResponse) as a JSON string.
     */
    async queueActivity(
        activity: Partial<Activity>,
        visibilityTimeout?: number,
        messageTimeToLive?: number
    ): Promise<string> {
        await this._initialize();

        // Convert activity to base64 string
        const activityString = JSON.stringify(activity);
        const message = Buffer.from(activityString).toString('base64');
        const receipt = await this._queueClient.sendMessage(message, {
            visibilityTimeout,
            messageTimeToLive,
        });

        return JSON.stringify(receipt);
    }

    private _initialize(): Promise<unknown> {
        if (!this._initializePromise) {
            this._initializePromise = this._queueClient.createIfNotExists();
        }
        return this._initializePromise;
    }
}
