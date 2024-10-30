/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface IBrowser {
    id: string;
    key: string;
    name: string;
    url: string;
}

export interface IBrowserList {
    chrome: IBrowser;
    firefox: IBrowser;
    edge: IBrowser;
}

export type BrowserKeys = keyof IBrowserList;