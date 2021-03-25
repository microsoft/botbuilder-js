// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Configuration } from './configuration';
import { FolderResourceProvider, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ok } from 'assert';

export class ConfigurationResourceExporer extends ResourceExplorer {
    private readonly folderResourceProvider: FolderResourceProvider;

    constructor(configuration: Configuration) {
        super();

        const applicationRoot = configuration.string(['applicationRoot']);
        ok(applicationRoot);

        this.folderResourceProvider = new FolderResourceProvider(this, applicationRoot, true, true);
        this.addResourceProvider(this.folderResourceProvider);
    }
}
