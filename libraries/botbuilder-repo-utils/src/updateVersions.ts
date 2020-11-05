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

const GIT_SHA_REF = 'HEAD';
const GIT_SHA_LENGTH = 12;

// Computes the final version identifier components for a package.
const getPackageVersion = (
    pkg: Package,
    newVersion: string,
    options: Record<'commitSha' | 'date' | 'deprecated' | 'preview', string | undefined>
): string[] => {
    const version: Array<string | undefined> = [newVersion];

    if (pkg.deprecated) {
        version.push(options.deprecated);
    } else if (pkg.preview) {
        version.push(options.preview);
    }

    return R.compact([...version, options.date, options.commitSha]);
};

run(async () => {
    // Obtain the path of the repo root, useful for constructing absolute paths
    const repoRoot = await gitRoot();

    const [lernaFile, packageFile] = await Promise.all([
        readJsonFile<Record<'lerna', string>>(path.join(repoRoot, 'lerna.json')),
        readJsonFile<Package>(path.join(repoRoot, 'package.json')),
    ]);

    if (!lernaFile) {
        return failure(1, 'lerna.json not found');
    }

    if (!packageFile) {
        return failure(2, 'package.json not found');
    }

    // Parse process.argv for all configuration options
    const {
        _: [maybeNewVersion],
        dateFormat,
        includeGitSha,
        deprecated,
        join,
        preview,
    } = minimist(process.argv.slice(2), {
        alias: {
            date: 'dateFormat',
            git: 'includeGitSha',
        },
        default: {
            dateFormat: '',
            deprecated: 'deprecated',
            includeGitSha: 'false',
            join: '-',
            preview: 'preview',
        },
        string: ['dateFormat', 'deprecated', 'includeGitSha', 'preview', 'join'],
    });

    // If `maybeNewVersion` is falsy use version from the lerna.json file
    const newVersion = maybeNewVersion || lernaFile.lerna;
    if (!newVersion) {
        return failure(3, 'unable to resolve new version');
    }

    // Fetch and format date, if instructed
    const date = dateFormat ? moment().format(dateFormat) : undefined;

    // Read git commit sha if instructed (JSON.parse properly coerces strings to boolean)
    const commitSha = JSON.parse(includeGitSha) ? await gitSha(GIT_SHA_REF, GIT_SHA_LENGTH) : undefined;

    // Collect all non-private workspaces from the repo root. Returns workspaces with absolute paths.
    const workspaces = (await collectWorkspacePackages(repoRoot, packageFile.workspaces ?? [])).filter(
        ({ pkg }) => !pkg.private
    );

    // Build an object mapping a package name to its new, updated version
    const workspaceVersions = workspaces.reduce<Record<string, string>>(
        (acc, { pkg }) => ({
            ...acc,
            [pkg.name]: getPackageVersion(pkg, newVersion, { commitSha, date, deprecated, preview }).join(join),
        }),
        {}
    );

    // Rewrites the version for any dependencies found in `workspaceVersions`
    const rewriteWithNewVersions = (dependencies: Record<string, string>) =>
        // eslint-disable-next-line security/detect-object-injection
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
                return failure(4, err instanceof Error ? err.message : err);
            }
        })
    );

    return results.find(isFailure) ?? success();
});
