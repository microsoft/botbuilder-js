// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as file from '../src/file';
import * as git from '../src/git';
import * as workspace from '../src/workspace';
import assert from 'assert';
import dayjs from 'dayjs';
import path from 'path';
import sinon from 'sinon';
import { Package } from '../src/package';
import { command, getPackageVersion } from '../src/updateVersions';
import { isSuccess } from '../src/run';

describe('updateVersions', () => {
    describe('getPackageVersion', () => {
        const newVersion = '1.2.3';

        const defaultOptions = { deprecated: 'DEPRECATED', preview: 'PREVIEW' };

        const previewPackage = { preview: true };
        const deprecatedPackage = { deprecated: true };

        const testCases: Array<{
            expected: string;
            label: string;
            options: Partial<Record<'buildLabel' | 'commitSha' | 'date' | 'deprecated' | 'preview', string>>;
            pkg?: Partial<Package>;
        }> = [
            {
                label: 'standard package with defaults',
                options: defaultOptions,
                expected: newVersion,
            },
            {
                label: 'standard package with date',
                options: { ...defaultOptions, date: 'DATE' },
                expected: `${newVersion}-date-DATE`,
            },
            {
                label: 'standard package with commitSha',
                options: { ...defaultOptions, commitSha: 'COMMIT' },
                expected: `${newVersion}-sha-COMMIT`,
            },
            {
                label: 'standard package with date and commitSha',
                options: { ...defaultOptions, commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-date-DATE.sha-COMMIT`,
            },
            {
                label: 'standard package with date, commitSha, and buildLabel',
                options: { ...defaultOptions, buildLabel: 'BUILD', commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-BUILD.date-DATE.sha-COMMIT`,
            },
            {
                label: 'preview package with defaults',
                pkg: previewPackage,
                options: defaultOptions,
                expected: `${newVersion}-PREVIEW`,
            },
            {
                label: 'preview package with date',
                pkg: previewPackage,
                options: { ...defaultOptions, date: 'DATE' },
                expected: `${newVersion}-PREVIEW.date-DATE`,
            },
            {
                label: 'preview package with commitSha',
                pkg: previewPackage,
                options: { ...defaultOptions, commitSha: 'COMMIT' },
                expected: `${newVersion}-PREVIEW.sha-COMMIT`,
            },
            {
                label: 'preview package with date and commitSha',
                pkg: previewPackage,
                options: { ...defaultOptions, commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-PREVIEW.date-DATE.sha-COMMIT`,
            },
            {
                label: 'preview package with date, commitSha, and build label',
                pkg: previewPackage,
                options: { ...defaultOptions, buildLabel: 'BUILD', commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-BUILD.PREVIEW.date-DATE.sha-COMMIT`,
            },
            {
                label: 'deprecated package with defaults',
                pkg: deprecatedPackage,
                options: defaultOptions,
                expected: `${newVersion}-DEPRECATED`,
            },
            {
                label: 'deprecated package with date',
                pkg: deprecatedPackage,
                options: { ...defaultOptions, date: 'DATE' },
                expected: `${newVersion}-DEPRECATED.date-DATE`,
            },
            {
                label: 'deprecated package with commitSha',
                pkg: deprecatedPackage,
                options: { ...defaultOptions, commitSha: 'COMMIT' },
                expected: `${newVersion}-DEPRECATED.sha-COMMIT`,
            },
            {
                label: 'deprecated package with date and commitSha',
                pkg: deprecatedPackage,
                options: { ...defaultOptions, commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-DEPRECATED.date-DATE.sha-COMMIT`,
            },
            {
                label: 'deprecated package with date, commitSha, and buildLabel',
                pkg: deprecatedPackage,
                options: { ...defaultOptions, buildLabel: 'BUILD', commitSha: 'COMMIT', date: 'DATE' },
                expected: `${newVersion}-BUILD.DEPRECATED.date-DATE.sha-COMMIT`,
            },
        ];

        testCases.forEach((testCase) => {
            it(testCase.label, () => {
                const actual = getPackageVersion(testCase.pkg ?? {}, newVersion, testCase.options);
                assert.strictEqual(actual, testCase.expected);
            });
        });
    });

    describe('command', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        const packageVersion = '1.2.3';

        const dummyVersion = '0.0.0';

        const runAndVerify = async (
            workspaces: Array<{
                name: string;
                expectedVersion: string;
                expectedDependencies?: Record<string, string>;
                preview?: boolean;
                deprecated?: boolean;
                dependsOn?: string[];
            }>,
            args: string[] = [],
            { commitSha = '' } = {}
        ) => {
            const root = 'root';

            const gitMock = sandbox.mock(git);

            gitMock.expects('gitRoot').resolves(root);

            if (commitSha) {
                gitMock.expects('gitSha').resolves(commitSha);
            }

            const fileMock = sandbox.mock(file);

            const workspacePaths = workspaces.map((workspace) => {
                const relPath = ['packages', workspace.name];

                return {
                    ...workspace,
                    relPath,
                    absPath: path.join(root, ...relPath, 'package.json'),
                    posixPath: path.posix.join(root, ...relPath, 'package.json'),
                };
            });

            // Note: important that package.json lists files with posix separators
            fileMock
                .expects('readJsonFile')
                .withArgs(path.join(root, 'package.json'))
                .resolves({
                    version: packageVersion,
                    workspaces: workspacePaths.map((workspace) => path.posix.join(...workspace.relPath)),
                });

            sandbox
                .mock(workspace)
                .expects('glob')
                .withArgs(workspacePaths.map((workspace) => workspace.posixPath))
                .resolves(workspacePaths.map((workspace) => workspace.absPath));

            workspacePaths.forEach((workspace) => {
                fileMock
                    .expects('readJsonFile')
                    .withArgs(workspace.absPath)
                    .resolves({
                        name: workspace.name,
                        preview: workspace.preview,
                        deprecated: workspace.deprecated,
                        dependencies: (workspace.dependsOn ?? []).reduce(
                            (acc, name) => ({ ...acc, [name]: dummyVersion }),
                            {}
                        ),
                    });

                let packageMatch = sinon.match.hasOwn('version', workspace.expectedVersion);
                if (workspace.expectedDependencies) {
                    packageMatch = packageMatch.and(
                        sinon.match.hasOwn('dependencies', sinon.match(workspace.expectedDependencies))
                    );
                }

                fileMock.expects('writeJsonFile').withArgs(workspace.absPath, packageMatch).once().resolves();
            });

            const result = await command(args, true)();
            if (!isSuccess(result)) {
                assert.fail(result.message);
            }

            sandbox.verify();
        };

        it('updates packages properly', () =>
            runAndVerify([
                {
                    name: 'a',
                    dependsOn: ['b', 'c'],
                    expectedVersion: packageVersion,
                    expectedDependencies: {
                        b: `${packageVersion}-preview`,
                        c: `${packageVersion}-deprecated`,
                    },
                },
                {
                    name: 'b',
                    preview: true,
                    expectedVersion: `${packageVersion}-preview`,
                },
                {
                    name: 'c',
                    deprecated: true,
                    dependsOn: ['d'],
                    expectedVersion: `${packageVersion}-deprecated`,
                    expectedDependencies: {
                        d: dummyVersion,
                    },
                },
            ]));

        it('overrides package version', async () => {
            const expectedVersion = '3.2.1';
            const expectedPreviewVersion = `${expectedVersion}-preview`;
            const expectedDeprecatedVersion = `${expectedVersion}-deprecated`;

            await runAndVerify(
                [
                    {
                        name: 'a',
                        dependsOn: ['b', 'c'],
                        expectedVersion,
                        expectedDependencies: {
                            b: expectedPreviewVersion,
                            c: expectedDeprecatedVersion,
                        },
                    },
                    {
                        name: 'b',
                        preview: true,
                        expectedVersion: expectedPreviewVersion,
                    },
                    {
                        name: 'c',
                        deprecated: true,
                        dependsOn: ['d'],
                        expectedVersion: expectedDeprecatedVersion,
                        expectedDependencies: {
                            d: dummyVersion,
                        },
                    },
                ],
                [expectedVersion]
            );
        });

        it('includes git commit sha and date', async () => {
            const dateFormat = 'YYYYMM';
            const formattedDate = dayjs().format(dateFormat);

            const expectedVersion = `${packageVersion}-dev.date-${formattedDate}.sha-COMMIT`;
            const expectedPreviewVersion = `${packageVersion}-dev.preview.date-${formattedDate}.sha-COMMIT`;
            const expectedDeprecatedVersion = `${packageVersion}-dev.deprecated.date-${formattedDate}.sha-COMMIT`;

            await runAndVerify(
                [
                    {
                        name: 'a',
                        dependsOn: ['b', 'c'],
                        expectedVersion,
                        expectedDependencies: {
                            b: expectedPreviewVersion,
                            c: expectedDeprecatedVersion,
                        },
                    },
                    {
                        name: 'b',
                        preview: true,
                        expectedVersion: expectedPreviewVersion,
                    },
                    {
                        name: 'c',
                        deprecated: true,
                        dependsOn: ['d'],
                        expectedVersion: expectedDeprecatedVersion,
                        expectedDependencies: {
                            d: dummyVersion,
                        },
                    },
                ],
                ['--buildLabel', 'dev', '--git', 'true', '--date', dateFormat],
                { commitSha: 'COMMIT' }
            );
        });
    });
});
