// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { Package } from './package';
import { collectWorkspacePackages } from './workspace';
import { failure, isFailure, Result, run, success } from './run';
import { gitRoot } from './gitRoot';
import { readJsonFile, writeJsonFile } from './file';

run(async () => {
    const newVersion = process.argv[2];
    if (!newVersion) {
        return failure(1, 'Must provide new version as a command line argument');
    }

    // Obtain the path of the repo root, useful for constructing absolute paths
    const repoRoot = await gitRoot();

    // Read package.json from repo root
    const rootPackage = await readJsonFile<Package>(path.join(repoRoot, 'package.json'));
    if (!rootPackage) {
        return failure(2, 'root package.json not found');
    }

    // Collect all workspaces from the repo root. Returns workspaces with absolute paths.
    const workspaces = await collectWorkspacePackages(repoRoot, rootPackage.workspaces ?? []);

    // Build an object mapping a package name to its new, updated version. Take care to
    // omit private packages: we don't publish these so there is no use updating the versions.
    const workspaceVersions = workspaces.reduce<Record<string, string>>((acc, { contents }) => {
        if (!contents || contents.private) {
            return acc;
        }

        let version = newVersion;

        if (contents.deprecated) {
            version = `${version}-deprecated`;
        } else if (contents.preview) {
            version = `${version}-preview`;
        }

        return { ...acc, [contents.name]: version };
    }, {});

    // This method will map over the depdencies, replacing any that are found in the workspaceVersions
    // map built above.
    const updateDependencyVersions = (dependencies: Record<string, string>): Record<string, string> => {
        return Object.entries(dependencies).reduce((acc, [dependency, version]) => {
            const newVersion = workspaceVersions[dependency];
            return { ...acc, [dependency]: newVersion ?? version };
        }, {});
    };

    // Go ahead and rewrite package.json files for packages by updating version as well as
    // dependencies and devDependencies.
    const results = await Promise.all<Result>(
        workspaces.map(async ({ absolutePath, contents }) => {
            // Skip private packages
            if (!contents || contents.private) {
                return success();
            }

            // Rewrite version, if it exists
            const newVersion = workspaceVersions[contents.name];
            if (newVersion) {
                contents.version = newVersion;
            }

            // Rewrite dependencies with new versions
            if (contents.dependencies) {
                contents.dependencies = updateDependencyVersions(contents.dependencies);
            }

            // Rewrite devDependencies with new versions
            if (contents.devDependencies) {
                contents.devDependencies = updateDependencyVersions(contents.devDependencies);
            }

            // Commit changes
            try {
                await writeJsonFile(absolutePath, contents);
                return success();
            } catch (err) {
                return failure(3, err instanceof Error ? err.message : err);
            }
        })
    );

    return results.find(isFailure) ?? success();
});
