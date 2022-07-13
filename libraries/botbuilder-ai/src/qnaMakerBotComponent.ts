// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { QnAMakerDialog } from './qnaMakerDialog';
import { QnAMakerRecognizer } from './qnaMakerRecognizer';

/**
 * Class which contains registration of components for QnAMaker.
 */
export class QnAMakerBotComponent extends BotComponent {
    /**
     * @param services Services collection to mimic dependency injection.
     * @param _configuration Configuration for the bot component.
     */
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        {
                            kind: QnAMakerRecognizer.$kind,
                            type: QnAMakerRecognizer,
                        },
                        {
                            kind: QnAMakerDialog.$kind,
                            type: QnAMakerDialog,
                        },
                    ];
                },
            })
        );
    }
}
