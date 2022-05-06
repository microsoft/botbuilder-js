/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { ComponentRegistration } from 'botbuilder-core';
import { QnAMakerBotComponent } from './qnaMakerBotComponent';
import { ServiceCollection, noOpConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';

/**
 * Define component assets for QnAMaker.
 */
export class QnAMakerComponentRegistration extends ComponentRegistration {
    private readonly services = new ServiceCollection({
        declarativeTypes: [],
    });

    /**
     * Create an instance of QnAMakerComponentRegistration.
     */
    constructor() {
        super();

        new QnAMakerBotComponent().configureServices(this.services, noOpConfiguration);
    }

    /**
     * Get declarative types for QnAMaker component registration.
     *
     * @param _resourceExplorer resource explorer
     * @returns component registrations
     */
    getDeclarativeTypes(_resourceExplorer: unknown): ComponentDeclarativeTypes[] {
        return this.services.mustMakeInstance<ComponentDeclarativeTypes[]>('declarativeTypes');
    }
}
