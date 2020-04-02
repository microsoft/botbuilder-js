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
import { DoOnce } from './doOnce';

const _doOnce: DoOnce<Container> = new DoOnce<Container>();

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
    /**
     * The suffix to be added to every key. See cosmosDbKeyEscape.escapeKey
     * 
     * Note: compatibilityMode must be set to 'false' to use a KeySuffix.
     * When KeySuffix is used, keys will NOT be truncated but an exception will
     * be thrown if the key length is longer than allowed by CosmosDb.
     * 
     * The keySuffix must contain only valid ComosDb key characters.
     * (e.g. not: '\\', '?', '/', '#', '*')
     */
    keySuffix?: string;
    /**
    * Early version of CosmosDb had a max key length of 255.  Keys longer than
    * this were truncated in cosmosDbKeyEscape.escapeKey.  This remains the default
    * behavior of cosmosDbPartitionedStorage, but can be overridden by setting
    * compatibilityMode to false. 
    * 
    * compatibilityMode cannot be true if keySuffix is used.
    */
    compatibilityMode?: boolean;
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
    private compatabilityModePartitionKey: boolean = false;

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
        // In order to support collections previously restricted to max key length of 255, we default
        // compatabilityMode to 'true'.  No compatibilityMode is opt-in only.
        if (typeof cosmosDbStorageOptions.compatibilityMode === "undefined") {
            cosmosDbStorageOptions.compatibilityMode = true;
        }
        if (cosmosDbStorageOptions.keySuffix) {
            if (cosmosDbStorageOptions.compatibilityMode){
                throw new ReferenceError('compatibilityMode cannot be true while using a keySuffix.');
            }
            // In order to reduce key complexity, we do not allow invalid characters in a KeySuffix
            // If the keySuffix has invalid characters, the escaped key will not match
            const suffixEscaped = CosmosDbKeyEscape.escapeKey(cosmosDbStorageOptions.keySuffix);
            if (cosmosDbStorageOptions.keySuffix !== suffixEscaped) {
                throw new ReferenceError(`Cannot use invalid Row Key characters: ${cosmosDbStorageOptions.keySuffix} in keySuffix`);
            }
        }

        this.cosmosDbStorageOptions = cosmosDbStorageOptions;
    }

    public async read(keys: string[]): Promise<StoreItems> {
        if (!keys) { throw new ReferenceError(`Keys are required when reading.`); }
        else if (keys.length === 0) { return {}; }

        await this.initialize();

        const storeItems: StoreItems = {};

        await Promise.all(keys.map(async (k: string): Promise<void> => {
            try {
                const escapedKey = CosmosDbKeyEscape.escapeKey(k, this.cosmosDbStorageOptions.keySuffix, this.cosmosDbStorageOptions.compatibilityMode);

                const readItemResponse = await this.container.item(escapedKey, this.getPartitionKey(escapedKey)).read<DocumentStoreItem>();
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
                id: CosmosDbKeyEscape.escapeKey(k, this.cosmosDbStorageOptions.keySuffix, this.cosmosDbStorageOptions.compatibilityMode),
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
            const escapedKey = CosmosDbKeyEscape.escapeKey(k, this.cosmosDbStorageOptions.keySuffix, this.cosmosDbStorageOptions.compatibilityMode);
            try {
                await this.container
                    .item(escapedKey, this.getPartitionKey(escapedKey))
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
                    ...this.cosmosDbStorageOptions.cosmosClientOptions,
                });
            }
            const dbAndContainerKey = `${ this.cosmosDbStorageOptions.databaseId }-${ this.cosmosDbStorageOptions.containerId }`;
            this.container = await _doOnce.waitFor(dbAndContainerKey, async (): Promise<Container> => await this.getOrCreateContainer());
        }
    }
    
    private async getOrCreateContainer(): Promise<Container> {
        let createIfNotExists = !this.cosmosDbStorageOptions.compatibilityMode;
        let container;
        if(this.cosmosDbStorageOptions.compatibilityMode) {
            try {
                container = await this.client
                                    .database(this.cosmosDbStorageOptions.databaseId)
                                    .container(this.cosmosDbStorageOptions.containerId);
                const partitionKeyPath = await container.readPartitionKeyDefinition();
                const paths = partitionKeyPath.resource.paths;
                if(paths) {
                    // Containers created with CosmosDbStorage had no partition key set, so the default was '/_partitionKey'.
                    if (paths.indexOf('/_partitionKey') !== -1) {
                        this.compatabilityModePartitionKey = true;
                    }
                    else if (paths.indexOf(DocumentStoreItem.partitionKeyPath) === -1) {
                        // We are not supporting custom Partition Key Paths.
                        new Error(`Custom Partition Key Paths are not supported. ${this.cosmosDbStorageOptions.containerId} has a custom Partition Key Path of ${paths[0]}.`);
                    }
                } else {
                    this.compatabilityModePartitionKey = true;
                }
                return container;
            } catch (err) {
                createIfNotExists = true;
            }
        }

        if (createIfNotExists) {
            const result = await this.client
                .database(this.cosmosDbStorageOptions.databaseId)
                .containers.createIfNotExists({
                    id: this.cosmosDbStorageOptions.containerId,
                    partitionKey: {
                        paths: [DocumentStoreItem.partitionKeyPath]
                    },
                    throughput: this.cosmosDbStorageOptions.containerThroughput
                });
            return result.container;
        }
    }

    private getPartitionKey(key) {
        return this.compatabilityModePartitionKey ? undefined : key;
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
