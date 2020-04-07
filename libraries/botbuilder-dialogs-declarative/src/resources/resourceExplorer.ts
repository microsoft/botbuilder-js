/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { normalize, dirname, join } from 'path';
import { EventEmitter } from 'events';
import { IResourceProvider } from './resourceProvider';
import { FolderResourceProvider } from './folderResourceProvider';
import { IResource } from './resource';
import { PathUtil } from '../pathUtil';
import { TypeFactory } from '../factory/typeFactory';
import { ComponentRegistration } from '../componentRegistration';

export class ResourceExplorer {
    private _factory: TypeFactory = new TypeFactory();
    private _resourceProviders: IResourceProvider[] = [];
    private _emitter: EventEmitter = new EventEmitter();

    public get resourceProviders(): IResourceProvider[] {
        return this._resourceProviders;
    }

    public get emitter(): EventEmitter {
        return this._emitter;
    }

    public loadProject(projectFile: string, ignoreFolders: string[], monitorChanges: boolean = true): ResourceExplorer {
        projectFile = normalize(projectFile);
        ignoreFolders = ignoreFolders.map((f): string => normalize(f));
        const projectFolder = dirname(projectFile);
        if (ignoreFolders) {
            this.addFolders(projectFolder, ignoreFolders, monitorChanges);
        }
        else {
            this.addResourceProvider(new FolderResourceProvider(projectFolder, true, monitorChanges));
        }

        return this;
    }

    public addResourceProvider(resourceProvider: IResourceProvider): ResourceExplorer {
        if (this._resourceProviders.some((r): boolean => r.id() === resourceProvider.id())) {
            throw Error(`${ resourceProvider.id() } has already been added as a resource`);
        }

        this._resourceProviders.push(resourceProvider);

        return this;
    }

    public addFolder(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true): ResourceExplorer {
        let folderResourceProvider: FolderResourceProvider = new FolderResourceProvider(folder, includeSubFolders, monitorChanges);
        folderResourceProvider.emitter = this._emitter;
        this.addResourceProvider(folderResourceProvider);

        return this;
    }

    public addFolders(folder: string, ignoreFolders?: string[], monitorChanges: boolean = true): ResourceExplorer {
        if (ignoreFolders) {
            folder = normalize(folder);
            this.addFolder(folder, false, monitorChanges);
            const ignoreFoldersSet = new Set<string>(ignoreFolders.map((p): string => join(folder, p)));
            const subFolders = PathUtil.GetDirectories(folder);
            for (let i = 0; i < subFolders.length; i++) {
                const subFolder = subFolders[i];
                if (!ignoreFoldersSet.has(subFolder)) {
                    this.addFolder(subFolder, true, monitorChanges);
                }
            }
        } else {
            this.addFolder(folder, true, monitorChanges);
        }

        return this;
    }

    public addComponent(component: ComponentRegistration): ResourceExplorer {
        const builders = component.getTypeBuilders();
        for (let i = 0; i < builders.length; i++) {
            const type = builders[i];
            this._factory.register(type.name, type.builder);
        }

        return this;
    }

    public getResources(fileExtension: string): IResource[] {
        let resources: IResource[] = [];
        for (const rp of this._resourceProviders) {
            for (const rpResources of rp.getResources(fileExtension)) {
                resources.push(rpResources);
            }
        }

        return resources;
    }

    public getResource(id: string): IResource {
        for (const rp of this._resourceProviders) {
            const resource: IResource = rp.getResource(id);
            if (resource) {
                return resource;
            }
        }

        return undefined;
    }

    public buildType(config: object): object {
        if (typeof config == 'object') {
            const kind = config['$kind'] || config['$type'];
            if (kind) {
                const result = this._factory.build(kind, config);
                return result;
            } else {
                for (const key in config) {
                    config[key] = this.buildType(config[key]);
                }
            }
        }
        return config;
    }

    public loadType(resource: string | IResource): object {
        if (typeof resource == 'string') {
            resource = this.getResource(resource);
        }
        const json = resource.readText();
        const result = JSON.parse(json);
        return this.buildType(result as object);
    }
}