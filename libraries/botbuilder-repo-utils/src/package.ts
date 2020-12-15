// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Represents a package.json file
export interface Package {
    name: string;
    version: string;

    preview?: boolean;
    private?: boolean;
    deprecated?: boolean;
    internal?: boolean;

    workspaces?: string[];

    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;

    scripts?: Record<string, string>;
}
