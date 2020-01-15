/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */


import { IResource } from './resource';


export interface IResourceProvider {
    id(): string;
    getResource(id: string): Promise<IResource>;
    getResources(ex: string): Promise<IResource[]>;
}