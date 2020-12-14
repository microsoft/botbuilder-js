/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OnTeamsAppBasedLinkQuery } from './triggerConditions/onTeamsAppBasedLinkQuery';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { AdaptiveComponentRegistration, OnActivityConfiguration } from 'botbuilder-dialogs-adaptive';

export class TeamsComponentRegistration extends AdaptiveComponentRegistration implements ComponentDeclarativeTypes {
    /**
     * Initializes a new instance of `TeamsComponentRegistration`.
     */
    public constructor() {
        super();

        this._addDeclarativeType<OnTeamsAppBasedLinkQuery, OnActivityConfiguration>(OnTeamsAppBasedLinkQuery);
    }
}
