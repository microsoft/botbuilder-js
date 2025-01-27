// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { actions } from '../actions';

export const failures = {
    actionNotFound(action: string) {
        return new Error(
            `Unable to use the '${action}' action. Supported actions are ${actions.supported.join(' or ')}`,
        );
    },
    packageJsonNotFound(pkgPath: string) {
        return new Error(`Unable to find package.json file at ${pkgPath}`);
    },
    packageJsonNotFoundWithWorkspaces(pkgPath: string) {
        return new Error(`Unable to find package.json file with workspaces at ${pkgPath}`);
    },
    vendorPackagesNotFound(dir: string) {
        return new Error(`Unable to find vendor packages in ${dir}`);
    },
};
