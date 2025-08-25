// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import { logger } from '../utils';

/**
 * Install vendor packages and dependencies.
 *
 * @param param0 Installation parameters.
 * @param param0.vendors List of vendor packages.
 * @param param0.dependencies List of dependencies.
 * @param param0.pkgDir Directory of the package.
 * @param param0.directory Directory to install vendor packages.
 * @param param0.shouldSetDependencies Conditional to know if the process should set the dependencies.
 */
export async function install({ vendors, dependencies, pkgDir, directory, shouldSetDependencies }: any) {
    for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i];

        if (!vendor.dir) {
            logger.package.vendors.vendor({
                isLast: i === vendors.length - 1,
                name: vendor.name,
                version: vendor.version,
                isUnknown: true,
            });
            continue;
        }

        const source = path.join(vendor.dir, vendor.main);
        const vendorDir = path.join(pkgDir, directory, path.basename(vendor.dir));
        const destination = path.join(vendorDir, vendor.main);

        if (!existsSync(vendorDir)) {
            await mkdir(vendorDir, { recursive: true });
        }

        logger.package.vendors.vendor({ isLast: i === vendors.length - 1, name: vendor.name, version: vendor.version });
        await copyFile(source, destination);
    }

    logger.package.dependencies.header({ dependencies: dependencies.length, shouldSetDependencies });
    for (let i = 0; i < dependencies.length; i++) {
        const { name, version } = dependencies[i];
        logger.package.dependencies.dependency({ isLast: i === dependencies.length - 1, name, version });
        if (shouldSetDependencies) {
            // Only modify package.json if the flag is set, preventing changes to local files and pushing them back to the repository.
            execSync(`npm pkg set dependencies["${name}"]="${version}"`, { cwd: pkgDir });
        }
    }
}
