// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import getStream from 'get-stream';
import pmap from 'p-map';
import { ContainerClient, StoragePipelineOptions } from '@azure/storage-blob';
import { Storage, StoreItems, assertStoreItems } from 'botbuilder-core';
import { assert } from 'botbuilder-stdlib/lib/types';
import { ignoreError, isStatusCodeError } from './ignoreError';
import { sanitizeBlobKey } from './sanitizeBlobKey';

/**
 * Optional settings for BlobsStorage
 */
export interface BlobsStorageOptions {
    /**
     * [StoragePipelineOptions](xref:@azure/storage-blob.StoragePipelineOptions) to pass to azure blob
     * storage client
     */
    storagePipelineOptions?: StoragePipelineOptions;
}

/**
 * BlobsStorage provides a [Storage](xref:botbuilder-core.Storage) implementation backed by Azure Blob Storage
 */
export class BlobsStorage implements Storage {
    private readonly _containerClient: ContainerClient;
    private readonly _concurrency = Infinity;
    private _initializePromise: Promise<unknown>;

    /**
     * Constructs a BlobsStorage instance.
     *
     * @param {string} connectionString Azure Blob Storage connection string
     * @param {string} containerName Azure Blob Storage container name
     * @param {BlobsStorageOptions} options Other options for BlobsStorage
     */
    constructor(connectionString: string, containerName: string, options?: BlobsStorageOptions) {
        assert.string(connectionString, ['connectionString']);
        assert.string(containerName, ['containerName']);

        this._containerClient = new ContainerClient(connectionString, containerName, options?.storagePipelineOptions);

        // At most one promise at a time to be friendly to local emulator users
        if (connectionString.trim() === 'UseDevelopmentStorage=true;') {
            this._concurrency = 1;
        }
    }

    private _initialize(): Promise<unknown> {
        if (!this._initializePromise) {
            this._initializePromise = this._containerClient.createIfNotExists();
        }
        return this._initializePromise;
    }

    /**
     * Loads store items from storage.
     *
     * @param {string[]} keys Array of item keys to read
     * @returns {Promise<StoreItems>} The fetched [StoreItems](xref:botbuilder-core.StoreItems)
     */
    async read(keys: string[]): Promise<StoreItems> {
        assert.arrayOfString(keys, ['keys']);

        await this._initialize();

        return (
            await pmap<string, { key: string; value?: Record<string, unknown> }>(
                keys,
                async (key) => {
                    const blob = await ignoreError(
                        this._containerClient.getBlobClient(sanitizeBlobKey(key)).download(),
                        isStatusCodeError(404)
                    );

                    if (!blob) {
                        return { key, value: null };
                    }

                    const { etag: eTag, readableStreamBody: stream } = blob;

                    const contents = await getStream(stream);
                    const parsed = JSON.parse(contents);

                    return { key, value: { ...parsed, eTag } };
                },
                {
                    concurrency: this._concurrency,
                }
            )
        ).reduce((acc, { key, value }) => (value ? { ...acc, [key]: value } : acc), {});
    }

    /**
     * Saves store items to storage.
     *
     * @param {StoreItems} changes Map of [StoreItems](xref:botbuilder-core.StoreItems) to write to storage
     * @returns {Promise<void>} A promise representing the async operation
     */
    async write(changes: StoreItems): Promise<void> {
        assertStoreItems(changes, ['changes']);

        await this._initialize();

        await pmap(
            Object.entries(changes),
            ([key, { eTag = '', ...change }]) => {
                const blob = this._containerClient.getBlockBlobClient(sanitizeBlobKey(key));
                const serialized = JSON.stringify(change);

                return blob.upload(serialized, serialized.length, {
                    conditions: typeof eTag === 'string' && eTag !== '*' ? { ifMatch: eTag } : {},
                });
            },
            {
                concurrency: this._concurrency,
            }
        );
    }

    /**
     * Removes store items from storage.
     *
     * @param {string[]} keys Array of item keys to remove from the store
     * @returns {Promise<void>} A promise representing the async operation
     */
    async delete(keys: string[]): Promise<void> {
        assert.arrayOfString(keys, ['keys']);

        await this._initialize();

        await pmap(
            keys,
            (key) => ignoreError(this._containerClient.deleteBlob(sanitizeBlobKey(key)), isStatusCodeError(404)),
            {
                concurrency: this._concurrency,
            }
        );
    }
}
