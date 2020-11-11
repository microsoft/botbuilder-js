// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import minimist from 'minimist';
import moment from 'moment';
import path from 'path';
import { Package } from './package';
import { collectWorkspacePackages } from './workspace';
import { failure, isFailure, Result, run, success } from './run';
import { gitRoot, gitSha } from './git';
import { readJsonFile, writeJsonFile } from './file';

const GIT_SHA_LENGTH = 12;

/**
 * Computes the final version identifier components for a package.
 * @param pkg package.json data
 * @param newVersion new version requested
 * @param options options to control versioning
 */
const getPackageVersion = (
    pkg: Package,
    newVersion: string,
    options: Record<'commitSha' | 'date' | 'deprecated' | 'preview', string | undefined>
): string => {
    const extra = [options.commitSha, options.date];

    if (pkg.deprecated) {
        extra.unshift(options.deprecated);
    } else if (pkg.preview) {
        extra.unshift(options.preview);
    }

    return R.compact([newVersion, R.compact(extra).join('.')]).join('-');
};

run(async () => {
    // Obtain the path of the repo root, useful for constructing absolute paths
    const repoRoot = await gitRoot();

    const packageFile = await readJsonFile<Package>(path.join(repoRoot, 'package.json'));
    if (!packageFile) {
        return failure('package.json not found', 20);
    }

    // Parse process.argv for all configuration options
    const {
        _: [maybeNewVersion],
        ...flags
    } = minimist(process.argv.slice(2), {
        default: {
            deprecated: 'deprecated',
            git: 'false',
            preview: 'preview',
        },
        string: ['date', 'deprecated', 'git', 'preview'],
    });

    // If `maybeNewVersion` is falsy use version from the root packge.json file
    const newVersion = maybeNewVersion || packageFile.version;
    if (!newVersion) {
        return failure('unable to resolve new version', 21);
    }

    // Fetch and format date, if instructed
    const date = flags.date ? moment().format(flags.date) : undefined;

    // Read git commit sha if instructed (JSON.parse properly coerces strings to boolean)
    const commitSha = JSON.parse(flags.git) ? await gitSha(GIT_SHA_LENGTH) : undefined;

    // Collect all non-private workspaces from the repo root. Returns workspaces with absolute paths.
    const workspaces = await collectWorkspacePackages(repoRoot, packageFile.workspaces, { noPrivate: true });

    // Build an object mapping a package name to its new, updated version
    const workspaceVersions = workspaces.reduce<Record<string, string>>(
        (acc, { pkg }) => ({
            ...acc,
            [pkg.name]: getPackageVersion(pkg, newVersion, {
                commitSha,
                date,
                deprecated: flags.deprecated,
                preview: flags.preview,
            }),
        }),
        {}
    );

    // Rewrites the version for any dependencies found in `workspaceVersions`
    const rewriteWithNewVersions = (dependencies: Record<string, string>) =>
        R.mapValues(dependencies, (value, key) => workspaceVersions[key] ?? value);

    // Rewrite package.json files by updating version as well as dependencies and devDependencies.
    const results = await Promise.all<Result>(
        workspaces.map(async ({ absPath, pkg }) => {
            const newVersion = workspaceVersions[pkg.name];

            if (newVersion) {
                console.log(`Updating ${pkg.name} to ${newVersion}`);
                pkg.version = newVersion;
            }

            if (pkg.dependencies) {
                pkg.dependencies = rewriteWithNewVersions(pkg.dependencies);
            }

            if (pkg.devDependencies) {
                pkg.devDependencies = rewriteWithNewVersions(pkg.devDependencies);
            }

            try {
                await writeJsonFile(absPath, pkg);
                return success();
            } catch (err) {
                return failure(err instanceof Error ? err.message : err, 22);
            }
        })
    );

    return results.find(isFailure) ?? success();
});
