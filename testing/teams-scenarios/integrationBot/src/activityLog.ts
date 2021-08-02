// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Storage,
} from 'botbuilder';

import{
    Activity
} from 'botframework-schema'

/**
 * [Activity](xref:botframework-schema.Activity)'s class with a [Storage](xref:botbuilder-core.Storage) provider.
 */
export class ActivityLog  {
    private readonly _storage: Storage;

    /**
     * Initializes a new instance of the [ActivityLog](xref:integration-bot.ActivityLog) class.
     * @param storage A storage provider that stores and retrieves plain old JSON objects.
     */
    public constructor(storage: Storage) {
        this._storage = storage;
    }

    /**
     * Saves an [Activity](xref:botframework-schema.Activity) with its associated id into the storage.
     * @param activityId [Activity](xref:botframework-schema.Activity)'s Id.
     * @param activity The [Activity](xref:botframework-schema.Activity) object.
     */
    public async append(activityId: string, activity: Partial<Activity>): Promise<void> {
        if (activityId == null)
        {
            throw new TypeError("activityId is required for ActivityLog.append");
        }

        if (activity == null)
        {
            throw new TypeError("activity is required for ActivityLog.append");
        }

        let obj = { };
        obj[activityId] = { activity };

        await this._storage.write( obj );

        return;
    }

    /**
     * Retrieves an [Activity](xref:botframework-schema.Activity) from the storage by a given Id.
     * @param activityId [Activity](xref:botframework-schema.Activity)'s Id.
     * @returns The [Activity](xref:botframework-schema.Activity)'s object retrieved from storage.
     */
    public async find(activityId: string): Promise<Activity>
    {
        if (activityId == null)
        {
            throw new TypeError("activityId is required for ActivityLog.find");
        }

        var items = await this._storage.read( [ activityId ] );
        return (items && items[activityId]) ? items[activityId].activity : null;
    }
}
