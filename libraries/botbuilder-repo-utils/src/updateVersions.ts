// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as R from 'remeda';
import minimist from 'minimist';
import dayjs from 'dayjs';
import path from 'path';
import { Package } from './package';
import { collectWorkspacePackages } from './workspace';
import { failure, isFailure, Result, run, success } from './run';
import { gitRoot, gitSha } from './git';
import { readJsonFile, writeJsonFile } from './file';

// Represents options for controlling package version update
export interface PackageVersionOptions {
    buildLabel?: string;
    commitSha?: string;
    date?: string;
    deprecated?: string;
    internal?: string;
    preview?: string;
}

export class PackageVersion {
    constructor(readonly version: string, readonly metadata: string) {}

    toString(): string {
        return R.compact([this.version, this.metadata]).join('+');
    }
}

/**
 * Computes the final version identifier components for a package.
 *
 * @param {Partial<Package>} pkg package.json data
 * @param {string} newVersion new version requested
 * @param {PackageVersionOptions} options options to control versioning
 * @returns {string} updated package version
 */
export const getPackageVersion = (
    pkg: Partial<Package>,
    newVersion: string,
    options: PackageVersionOptions
): PackageVersion => {
    const prerelease = [];

    if (pkg.deprecated) {
        prerelease.push(options.deprecated);
    } else if (pkg.internal) {
        prerelease.push(options.internal);
    } else if (pkg.preview) {
        prerelease.push(options.preview);
    }

    if (options.buildLabel) {
        prerelease.push(options.buildLabel);
    }

    if (options.commitSha) {
        prerelease.push(options.commitSha);
    }

    const metadata = [];

    if (options.date) {
        metadata.push(`date-${options.date}`);
    }

    return new PackageVersion(
        R.compact([newVersion, R.compact(prerelease).join('.')]).join('-'),
        R.compact(metadata).join('.')
    );
};

export const command = (argv: string[], quiet = false) => async (): Promise<Result> => {
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
    } = minimist(argv, {
        default: {
            deprecated: 'deprecated',
            git: 'false',
            internal: 'internal',
            preview: 'preview',
        },
        string: ['buildLabel', 'date', 'deprecated', 'git', 'internal', 'preview'],
    });

    // If `maybeNewVersion` is falsy use version from the root packge.json file
    const newVersion = maybeNewVersion || packageFile.version;
    if (!newVersion) {
        return failure('unable to resolve new version', 21);
    }

    // Fetch and format date, if instructed
    const date = flags.date ? dayjs().format(flags.date) : undefined;

    // Read git commit sha if instructed (JSON.parse properly coerces strings to boolean)
    const commitSha = JSON.parse(flags.git) ? await gitSha('HEAD') : undefined;

    // Collect all non-private workspaces from the repo root. Returns workspaces with absolute paths.
    const workspaces = await collectWorkspacePackages(repoRoot, packageFile.workspaces, { noPrivate: true });

    // Build an object mapping a package name to its new, updated version
    const workspaceVersions = workspaces.reduce<Record<string, PackageVersion>>(
        (acc, { pkg }) => ({
            ...acc,
            [pkg.name]: getPackageVersion(pkg, newVersion, {
                buildLabel: flags.buildLabel,
                commitSha,
                date,
                deprecated: flags.deprecated,
                internal: flags.internal,
                preview: flags.preview,
            }),
        }),
        {}
    );

    // Rewrites the version for any dependencies found in `workspaceVersions`
    const rewriteWithNewVersions = (dependencies: Record<string, string>) =>
        R.mapValues(dependencies, (value, key) => workspaceVersions[key]?.version ?? value);

    // Rewrite package.json files by updating version as well as dependencies and devDependencies.
    const results = await Promise.all<Result>(
        workspaces.map(async ({ absPath, pkg }) => {
            const newVersion = workspaceVersions[pkg.name];

            if (newVersion) {
                if (!quiet) {
                    console.log(`Updating ${pkg.name} to ${newVersion}`);
                }
                pkg.version = newVersion.toString();
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
};

if (require.main === module) {
    run(command(process.argv.slice(2)));
}
