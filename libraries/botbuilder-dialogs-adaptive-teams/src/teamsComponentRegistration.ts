/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OnTeamsAppBasedLinkQuery } from './triggerConditions/onTeamsAppBasedLinkQuery';
import { DialogConfiguration } from 'botbuilder-dialogs';
import { ComponentRegistration } from 'botbuilder-core';
import {
    ComponentDeclarativeTypes,
    CustomDeserializer,
    DeclarativeType,
    ResourceExplorer,
} from 'botbuilder-dialogs-declarative';
import { DynamicBeginDialog, DynamicBeginDialogDeserializer } from 'botbuilder-dialogs-adaptive';

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

export class TeamsComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    protected _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];
    /**
     * Initializes a new instance of `AdaptiveComponentRegistration`.
     */
    public constructor() {
        super();

        this._addDeclarativeType<OnTeamsAppBasedLinkQuery, DialogConfiguration>(OnTeamsAppBasedLinkQuery);
    }

    /**
     * Gets adaptive `DeclarativeType` resources.
     *
     * @param resourceExplorer `ResourceExplorer` with expected path to get all resources.
     * @returns Adaptive `DeclarativeType` resources.
     */
    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        const declarativeTypes: DeclarativeType[] = [...this._declarativeTypes];
        resourceExplorer.getResources('.schema').forEach((schema) => {
            const resourceId = schema.id.replace(/.schema$/, '');
            if (resourceId.endsWith('.dialog')) {
                declarativeTypes.push({
                    kind: resourceId,
                    type: DynamicBeginDialog,
                    loader: new DynamicBeginDialogDeserializer(resourceExplorer, resourceId),
                });
            }
        });
        return declarativeTypes;
    }

    /**
     * @param type
     * @param loader
     * @protected
     */
    protected _addDeclarativeType<T, C>(type: Type<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
