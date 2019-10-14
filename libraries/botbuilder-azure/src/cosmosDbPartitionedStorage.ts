/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems } from 'botbuilder';
import { Container, CosmosClient, CosmosClientOptions } from '@azure/cosmos';
import { CosmosDbKeyEscape } from './cosmosDbKeyEscape';
import * as semaphore from 'semaphore';

const _semaphore: semaphore.Semaphore = semaphore(1);

/**
 * Cosmos DB Partitioned Storage Options.
 */
export interface CosmosDbPartitionedStorageOptions {
    /**
     * The CosmosDB endpoint.
     */
    cosmosDbEndpoint: string;
    /**
     * The authentication key for Cosmos DB.
     */
    authKey: string;
    /**
     * The database identifier for Cosmos DB instance.
     */
    databaseId: string;
    /**
     * The container identifier.
     */
    containerId: string;
    /**
     * The options for the CosmosClient.
     */
    cosmosClientOptions?: CosmosClientOptions;
    /**
     * The throughput set when creating the Container. Defaults to 400.
     */
    containerThroughput?: number;
}

/**
 * @private
 * Internal data structure for storing items in a CosmosDB Collection.
 */
class DocumentStoreItem {
    /**
     * Gets the PartitionKey path to be used for this document type.
     */
    public static get partitionKeyPath(): string {
        return '/id';
    }
    /**
     * Gets or sets the sanitized Id/Key used as PrimaryKey.
     */
    public id: string
    /**
     * Gets or sets the un-sanitized Id/Key.
     * 
     */
    public realId: string 
    /**
     * Gets or sets the persisted object.
     */
    public document: object
    /**
     * Gets or sets the ETag information for handling optimistic concurrency updates.
     */
    public eTag: string
    /**
     * Gets the PartitionKey value for the document.
     */
    public get partitionKey(): string {
        return this.id;
    }

    // We can't make the partitionKey optional AND have it auto-get this.realId, so we'll use a constructor
    public constructor(storeItem: { id: string; realId: string; document: object; eTag?: string}) {
        for (let prop in storeItem) {
            this[prop] = storeItem[prop];
        }
    }
}

/**
 * Implements an CosmosDB based storage provider using partitioning for a bot.
 */
export class CosmosDbPartitionedStorage implements Storage {
    private container: Container;
    private readonly cosmosDbStorageOptions: CosmosDbPartitionedStorageOptions;
    private client: CosmosClient;

    /**
     * Initializes a new instance of the <see cref="CosmosDbPartitionedStorage"/> class.
     * using the provided CosmosDB credentials, database ID, and container ID.
     *
     * @param cosmosDbStorageOptions Cosmos DB partitioned storage configuration options.
     */
    public constructor(cosmosDbStorageOptions: CosmosDbPartitionedStorageOptions) {
        if (!cosmosDbStorageOptions) { throw new ReferenceError('CosmosDbPartitionedStorageOptions is required.'); }
        if (!cosmosDbStorageOptions.cosmosDbEndpoint) { throw new ReferenceError('cosmosDbEndpoint for CosmosDB is required.'); }
        if (!cosmosDbStorageOptions.authKey) { throw new ReferenceError('authKey for CosmosDB is required.'); }
        if (!cosmosDbStorageOptions.databaseId) { throw new ReferenceError('databaseId is for CosmosDB required.'); }
        if (!cosmosDbStorageOptions.containerId) { throw new ReferenceError('containerId for CosmosDB is required.'); }

        this.cosmosDbStorageOptions = cosmosDbStorageOptions;
    }

    public async read(keys: string[]): Promise<StoreItems> {
        if (!keys) { throw new ReferenceError(`Keys are required when reading.`); }
        else if (keys.length === 0) { return {}; }

        await this.initialize();

        const storeItems: StoreItems = {};

        await Promise.all(keys.map(async (k: string): Promise<void> => {
            try {
                const escapedKey = CosmosDbKeyEscape.escapeKey(k);

                const readItemResponse = await this.container.item(escapedKey, escapedKey).read<DocumentStoreItem>();
                const documentStoreItem = readItemResponse.resource;
                if (documentStoreItem) {
                    storeItems[documentStoreItem.realId] = documentStoreItem.document;
                    storeItems[documentStoreItem.realId].eTag = documentStoreItem._etag;
                }
            } catch (err) {
                // When an item is not found a CosmosException is thrown, but we want to
                // return an empty collection so in this instance we catch and do not rethrow.
                // Throw for any other exception.
                if (err.code === 404) { }
                // Throw unique error for 400s
                else if (err.code === 400) {
                    this.throwInformativeError(`Error reading from container. You might be attempting to read from a non-partitioned 
                    container or a container that does not use '/id' as the partitionKeyPath`, err);
                } else {
                    this.throwInformativeError('Error reading from container', err);
                }
            }
        }));

        return storeItems;
    }

    public async write(changes: StoreItems): Promise<void> {
        if (!changes) { throw new ReferenceError(`Changes are required when writing.`); }
        else if (changes.length === 0) { return; }

        await this.initialize();

        await Promise.all(Object.keys(changes).map(async (k: string): Promise<void> => {
            const changesCopy: any = {...changes[k]};

            // Remove eTag from JSON object that was copied from IStoreItem.
            // The ETag information is updated as an _etag attribute in the document metadata.
            delete changesCopy.eTag;
            const documentChange = new DocumentStoreItem({
                id: CosmosDbKeyEscape.escapeKey(k),
                realId: k,
                document: changesCopy
            });

            const eTag: string = changes[k].eTag;
            const ac = eTag !== '*' && eTag != null && eTag.length > 0 ? { accessCondition: { type: 'IfMatch', condition: eTag } } : undefined;
            try {
                await this.container.items
                    .upsert(documentChange, ac);
            } catch (err) {
                this.throwInformativeError('Error upserting document', err);
            }
        }));
    }

    public async delete(keys: string[]): Promise<void> {

        await this.initialize();

        await Promise.all(keys.map(async (k: string): Promise<void> => {
            const escapedKey = CosmosDbKeyEscape.escapeKey(k);
            try {
                await this.container
                    .item(escapedKey, escapedKey)
                    .delete();
            } catch (err) {
                // If trying to delete a document that doesn't exist, do nothing. Otherwise, throw
                if (err.code === 404) { } 
                else {
                    this.throwInformativeError('Unable to delete document', err);
                }
            }
        }));
    }

    /**
     * Connects to the CosmosDB database and creates / gets the container.
     */
    public async initialize(): Promise<void> {
        if (!this.container) {

            if (!this.client) {
                this.client = new CosmosClient({
                    endpoint: this.cosmosDbStorageOptions.cosmosDbEndpoint,
                    key: this.cosmosDbStorageOptions.authKey,
                    ...this.cosmosDbStorageOptions,
                });
            }

            if (!this.container) {
                this.container = await new Promise((resolve: Function): void => {
                    _semaphore.take(async (): Promise<void> => {
                        const result = await this.client
                            .database(this.cosmosDbStorageOptions.databaseId)
                            .containers.createIfNotExists({
                                id: this.cosmosDbStorageOptions.containerId,
                                partitionKey: {
                                    paths: [DocumentStoreItem.partitionKeyPath]
                                },
                                throughput: this.cosmosDbStorageOptions.containerThroughput
                            });
                        _semaphore.leave();
                        resolve(result.container);
                    });
                });
            }
        }
    }

    /**
     * The Cosmos JS SDK doesn't return very descriptive errors and not all errors contain a body. 
     * This provides more detailed errors and err['message'] prevents ReferenceError
     */
    private throwInformativeError(prependedMessage: string, err: Error|object|string): void {
        if (typeof err === 'string') {
            err = new Error(err);
        }
        err['message'] = `[${ prependedMessage }] ${ err['message'] }`;
        throw err;
    }
}