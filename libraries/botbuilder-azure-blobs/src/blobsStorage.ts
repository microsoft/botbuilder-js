/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import getStream from 'get-stream';
import pmap from 'p-map';
import { ContainerClient, StoragePipelineOptions } from '@azure/storage-blob';
import { Storage, StoreItems, isStoreItems } from 'botbuilder';
import { ignoreError, isStatusCodeError } from './ignoreError';
import { sanitizeBlobKey } from './sanitizeBlobKey';

/**
 * BlobsStorage provides a [Storage](xref:botbuilder-core.Storage) implementation backed by Azure Blob Storage
 */
export class BlobsStorage implements Storage {
    private readonly _containerClient: ContainerClient;
    private readonly _concurrency: number;
    private _initializePromise: Promise<unknown>;

    /**
     * Constructs a BlobsStorage instance.
     *
     * @param connectionString Azure Blob Storage connection string
     * @param containerName Azure Blob Storage container name
     * @param options Azure Blob Storage [StoragePipelineOptions](xref:@azure/storage-blob.StoragePipelineOptions) options
     */
    constructor(connectionString: string, containerName: string, options?: StoragePipelineOptions) {
        if (typeof connectionString !== 'string') {
            throw new Error('connectionString is required and must be a string');
        }

        if (typeof containerName !== 'string') {
            throw new Error('containerName is required and must be a string');
        }

        this._containerClient = new ContainerClient(connectionString, containerName, options);

        // At most one promise at a time to be friendly to local emulator users
        this._concurrency = connectionString.trim() === 'UseDevelopmentStorage=true;' ? 1 : Infinity;
    }

    /**
     * Returns a promise that resolves when the container is accessible
     * @private
     */
    private _initialize(): Promise<unknown> {
        if (!this._initializePromise) {
            this._initializePromise = this._containerClient.createIfNotExists();
        }
        return this._initializePromise;
    }

    async read(keys: string[]): Promise<StoreItems> {
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

    async write(changes: StoreItems): Promise<void> {
        if (!isStoreItems(changes)) {
            throw new Error('changes argument is required');
        }

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

    async delete(keys: string[]): Promise<void> {
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
