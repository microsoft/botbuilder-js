/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog } from 'botbuilder-dialogs';
import { CustomDeserializer, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { BeginDialogConfiguration, DynamicBeginDialog } from './actions';

/**
 * Internal serializer for `DynamicBeginDialog` which bind the x.dialog resourceId to the DynamicBeginDialog.dialog property.
 */
export class DynamicBeginDialogDeserializer
    implements CustomDeserializer<DynamicBeginDialog, BeginDialogConfiguration> {
    /**
     * Intializes an instance of `DynamicBeginDialogDeserializer`.
     *
     * @param _resourceExplorer The `ResourceExplorer` used by the deserializer.
     * @param _resourceId The resource id of the dynamic dialog.
     */
    constructor(private readonly _resourceExplorer: ResourceExplorer, private readonly _resourceId: string) {}

    /**
     * The method that loads the configuration object to a `DynamicBeginDialog` object.
     *
     * @param config The configuration object to deserialize.
     * @param type The object type that the configuration will be deserialized to.
     * @returns A `DynamicBeginDialog` object created from the configuration.
     */
    load(config: BeginDialogConfiguration, type: { new (...args: unknown[]): DynamicBeginDialog }): DynamicBeginDialog {
        config.dialog = this._resourceExplorer.loadType<Dialog>(this._resourceId);
        return Object.entries(config).reduce((instance, [key, value]) => {
            let converter = instance.getConverter(key as keyof BeginDialogConfiguration);
            if (converter) {
                if (typeof converter === 'function') {
                    converter = new converter(this._resourceExplorer);
                }
                instance[`${key}`] = converter.convert(value);
            } else {
                instance[`${key}`] = value;
            }
            return instance;
        }, new type());
    }
}
