// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Configuration } from './configuration';
import { ComponentDeclarativeTypes, FolderResourceProvider, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ok } from 'assert';

export class ConfigurationResourceExporer extends ResourceExplorer {
    private readonly folderResourceProvider: FolderResourceProvider;

    constructor(configuration: Configuration, declarativeTypes: ComponentDeclarativeTypes[]) {
        super({ declarativeTypes });

        const applicationRoot = configuration.string(['applicationRoot']);
        ok(applicationRoot);

        this.folderResourceProvider = new FolderResourceProvider(
            this,
            applicationRoot,
            true,
            configuration.string(['NODE_ENV']) === 'dev' // watch in dev only!
        );

        this.addResourceProvider(this.folderResourceProvider);
    }
}
