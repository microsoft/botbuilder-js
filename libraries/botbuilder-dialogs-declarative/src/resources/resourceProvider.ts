/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */


import { IResource } from './resource';

export interface IResourceProvider {
    id(): string;
    getResource(id: string): IResource;
    getResources(ex: string): IResource[];
}