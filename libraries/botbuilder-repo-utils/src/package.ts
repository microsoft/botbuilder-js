// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Represents a package.json file
export interface Package {
    name: string;
    version: string;
    main: string;

    preview?: boolean;
    private?: boolean;
    deprecated?: boolean;
    internal?: boolean;

    workspaces?: { packages: string[]; generators: string[] };

    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    localDependencies?: Record<string, string>;

    scripts?: Record<string, string>;
}

export interface Dependency {
    name: string;
    version: string;
}
