// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { existsSync } from 'fs';
import minimist from 'minimist';
import { Package } from 'botbuilder-repo-utils/src/package';
import { collectWorkspacePackages } from 'botbuilder-repo-utils/src/workspace';
import { failure, run, success } from 'botbuilder-repo-utils/src/run';
import { gitRoot } from 'botbuilder-repo-utils/src/git';
import { readJsonFile } from 'botbuilder-repo-utils/src/file';
import { install, build, actions } from './actions';
import { logger, failures } from './utils';
import { findAll, findByPackage } from './vendors';

const VENDORS_DIR = 'libraries/botbuilder-vendors/vendors';

export const command = (argv: string[]) => async () => {
    try {
        const flags = minimist(argv, {
            alias: { setDependencies: 'set-dependencies' },
            default: { setDependencies: false },
        });
        const action = flags._[0];
        if (!actions.valid(action)) {
            throw failures.actionNotFound(action);
        }

        const rootDir = await gitRoot();
        const allVendors = await findAll(path.resolve(rootDir, VENDORS_DIR));

        const pkgPath = path.join(rootDir, 'package.json');
        if (!existsSync(pkgPath)) {
            throw failures.packageJsonNotFound(pkgPath);
        }

        const pkg = await readJsonFile<Package>(pkgPath);
        if (!pkg?.workspaces?.packages) {
            throw failures.packageJsonNotFoundWithWorkspaces(pkgPath);
        }

        const workspaces = await collectWorkspacePackages(rootDir, pkg.workspaces.packages, {
            hasLocalDependencies: true,
            ignorePath: [`**/${VENDORS_DIR}/**/*`],
        });

        logger.summary({ action, vendors: allVendors.length, workspaces: workspaces.length });

        for (const { pkg, absPath } of workspaces) {
            logger.package.header({ name: pkg.name });

            const pkgDir = path.dirname(absPath);
            const directory = pkg.localDependencies!.__directory ?? 'vendors';
            delete pkg.localDependencies!.__directory;

            const { vendors, dependencies, unknown } = await findByPackage(pkg, allVendors);
            const newVendors = [...unknown, ...vendors];

            logger.package.vendors.header({ vendors: newVendors.length });

            await install({
                vendors: newVendors,
                dependencies,
                pkgDir,
                directory,
                shouldSetDependencies: flags.setDependencies,
            });
            await build({ pkgDir, vendors, directory });

            logger.package.footer();
        }

        return success();
    } catch (err: any) {
        return failure(err instanceof Error ? err.message : err);
    }
};

if (require.main === module) {
    run(command(process.argv.slice(2)));
}
