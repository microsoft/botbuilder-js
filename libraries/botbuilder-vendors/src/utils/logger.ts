// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { colors } from './colors';
import { padLeft, plural } from './formatting';

export const logger = {
    summary({ action, vendors, workspaces }: any) {
        console.log(
            padLeft(`
                Connecting vendors to workspaces...
                
                ${colors.blue}summary${colors.reset}
                ----------------------
                action    : ${colors.magenta}${action}${colors.reset}
                vendors   : ${colors.magenta}${vendors} ${plural(vendors, 'package')}${colors.reset}
                workspaces: ${colors.magenta}${workspaces} ${plural(workspaces, 'package')}${colors.reset}
            `),
        );
    },
    package: {
        header({ name }: any) {
            console.log(`${colors.blue}${name} ${colors.cyan}[workspace]${colors.reset}`);
        },
        footer() {
            console.log(`└─ ${colors.dim}done${colors.reset}\r\n`);
        },
        compilation: {
            header({ files }: any) {
                const tags = files > 0 ? [`${colors.green}[replaced]`] : [`${colors.red}[not found]`];
                console.log(
                    `├─ compilation: ${colors.magenta}${files} ${plural(files, 'file')} ${tags.join('')}${colors.reset}`,
                );
            },
            file: {
                header({ isLast, dir, file, references }: any) {
                    const prefix = isLast ? '└─' : '├─';
                    console.log(
                        `│  ${prefix} ${colors.cyan}${dir}/${file}: ${colors.magenta}${references} ${plural(references, 'reference')}${colors.reset}`,
                    );
                },
                reference({ isLast, isLastParent, line, from, to }: any) {
                    const prefix = isLast ? '└─' : '├─';
                    const prefixParent = isLastParent ? ' ' : '│';
                    console.log(
                        `│  ${prefixParent}  ${prefix} ${colors.dim}line:${line} | ${colors.red}${from}${colors.reset} ${colors.dim}-> ${colors.green}${to}${colors.reset}`,
                    );
                },
            },
        },
        vendors: {
            header({ vendors }: any) {
                const tags = vendors > 0 ? [`${colors.green}[linked]`] : [`${colors.red}[not found]`];
                console.log(
                    `├─ vendors: ${colors.magenta}${vendors} ${plural(vendors, 'package')} ${tags.join('')}${colors.reset}`,
                );
            },
            vendor({ isLast, name, version, isUnknown }: any) {
                const unknown = isUnknown ? `${colors.yellow}[unknown]` : '';
                console.log(packageItem({ isLast, name, version }), unknown, colors.reset);
            },
        },
        dependencies: {
            header({ dependencies, shouldSetDependencies }: any) {
                const tags = shouldSetDependencies
                    ? dependencies > 0
                        ? [`${colors.green}[added]`]
                        : [`${colors.red}[not found]`]
                    : [`${colors.blue}[skipped]`];
                tags.push(`${colors.yellow}[--set-dependencies=${shouldSetDependencies}]`);
                console.log(
                    `├─ dependencies: ${colors.magenta}${dependencies} ${plural(dependencies, 'package')} ${tags.join('')}${colors.reset}`,
                );
            },
            dependency({ isLast, name, version }: any) {
                console.log(packageItem({ isLast, name, version }));
            },
        },
    },
};

function packageItem({ isLast, name, version }: any) {
    const prefix = isLast ? '└─' : '├─';
    return `│  ${prefix} ${colors.dim}${name}@${colors.cyan}${version}${colors.reset}`;
}
