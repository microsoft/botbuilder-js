// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as file from '../src/file';
import * as git from '../src/git';
import * as proc from '../src/process';
import * as workspace from '../src/workspace';
import assert from 'assert';
import path from 'path';
import sinon from 'sinon';
import { command } from '../src/execCmd';
import { isSuccess } from '../src/run';

describe('execCmd', () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    const runAndVerify = async (
        workspaces: Array<{
            name: string;
            private?: boolean;
            relPath?: string[];
            dependsOn?: string[];
            expects?: { preReadFilter?: boolean; postReadFilter?: boolean };
        }>,
        bin: string,
        args: string[] = [],
        flags: string[] = []
    ) => {
        const root = 'root';

        sandbox.mock(git).expects('gitRoot').resolves(root);

        const fileMock = sandbox.mock(file);

        const workspacePaths = workspaces.map((workspace) => {
            const relPath = workspace.relPath || ['packages', workspace.name];

            return {
                ...workspace,
                relPath,
                absPath: path.join(root, ...relPath, 'package.json'),
                cwdPath: path.join(root, ...relPath),
                posixPath: path.posix.join(root, ...relPath, 'package.json'),
            };
        });

        // Note: important that package.json lists files with posix separators
        fileMock
            .expects('readJsonFile')
            .withArgs(path.join(root, 'package.json'))
            .resolves({
                workspaces: workspacePaths.map((workspace) => path.posix.join(...workspace.relPath)),
            });

        sandbox
            .mock(workspace)
            .expects('glob')
            .withArgs(workspacePaths.map((workspace) => workspace.posixPath))
            .resolves(workspacePaths.map((workspace) => workspace.absPath));

        const procMock = sandbox.mock(proc);

        workspacePaths.forEach((workspace) => {
            if (!workspace.expects?.preReadFilter) {
                fileMock
                    .expects('readJsonFile')
                    .withArgs(workspace.absPath)
                    .resolves({
                        name: workspace.name,
                        private: workspace.private,
                        dependencies: (workspace.dependsOn ?? []).reduce(
                            (acc, name) => ({ ...acc, [name]: '1.0.0' }),
                            {}
                        ),
                    });

                if (!workspace.expects?.postReadFilter) {
                    procMock
                        .expects('execute')
                        .withArgs(bin, args, sinon.match({ cwd: workspace.cwdPath }))
                        .once()
                        .resolves({ stdout: 'hello world', stderr: '' });
                }
            }
        });

        const result = await command([bin, ...args, ...flags], true)();
        if (!isSuccess(result)) {
            assert.fail(result.message);
        }

        sandbox.verify();
    };

    it('executes commands against a set of workspaces', () =>
        runAndVerify(
            [
                {
                    name: 'foo',
                    dependsOn: ['bar'],
                },
                {
                    name: 'bar',
                },
            ],
            'echo',
            ['hello world']
        ));

    it('selects packages by path', () =>
        runAndVerify(
            [
                {
                    name: 'foo',
                },
                {
                    name: 'bar',
                    expects: {
                        preReadFilter: true,
                    },
                },
            ],
            'echo',
            ['hello world'],
            ['--path', 'packages/foo']
        ));

    it('filters packages by path', () =>
        runAndVerify(
            [
                {
                    name: 'foo',
                    expects: {
                        preReadFilter: true,
                    },
                },
                {
                    name: 'bar',
                },
            ],
            'echo',
            ['hello world'],
            ['--ignorePath', 'packages/foo']
        ));

    it('selects packages by name', () =>
        runAndVerify(
            [
                {
                    name: 'foo',
                    expects: {
                        postReadFilter: true,
                    },
                },
                {
                    name: 'bar',
                },
            ],
            'echo',
            ['hello world'],
            ['--name', 'bar']
        ));

    it('filters packages by name', () =>
        runAndVerify(
            [
                {
                    name: 'foo',
                },
                {
                    name: 'bar',
                    expects: {
                        postReadFilter: true,
                    },
                },
            ],
            'echo',
            ['hello world'],
            ['--ignoreName', 'bar']
        ));

    it('filters private packages', () =>
        runAndVerify(
            [
                {
                    name: 'public',
                },
                {
                    name: 'private',
                    private: true,
                    expects: {
                        postReadFilter: true,
                    },
                },
            ],
            'echo',
            ['hello world'],
            ['--noPrivate']
        ));

    it('executes a package with a dependency if that depedency is filtered', () =>
        runAndVerify(
            [
                {
                    name: 'public',
                    dependsOn: ['private'],
                },
                {
                    name: 'private',
                    private: true,
                    expects: {
                        postReadFilter: true,
                    },
                },
            ],
            'echo',
            ['hello world'],
            ['--noPrivate']
        ));

    it('breaks cycles', () =>
        runAndVerify(
            [
                {
                    name: 'a',
                    dependsOn: ['b', 'c'],
                },
                {
                    name: 'b',
                    dependsOn: ['a'],
                },
                {
                    name: 'c',
                },
            ],
            'echo',
            ['hello world']
        ));
});
