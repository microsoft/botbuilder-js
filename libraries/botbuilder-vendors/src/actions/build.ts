// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { readJsonFile } from 'botbuilder-repo-utils/src/file';
import { glob } from 'fast-glob';
import { logger } from '../utils';

/**
 * Connect vendor packages to the workspace compiled code.
 *
 * @param param0 Connection parameters.
 * @param param0.pkgDir Directory of the package.
 * @param param0.vendors List of vendor packages.
 * @param param0.directory Directory to install vendor packages.
 */
export async function build({ pkgDir, vendors, directory }: any) {
    if (vendors.length === 0) {
        logger.package.compilation.header({ files: 0 });
        return;
    }

    const tsconfig = await readJsonFile<any>(path.join(pkgDir, 'tsconfig.json'));
    const configDir = tsconfig.compilerOptions.outDir;
    const outDir = path.resolve(pkgDir, configDir);
    const files = await glob(`**/*.js`, { cwd: outDir });

    // Find and replace all vendor references in the compiled files
    const references: Record<string, any> = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(outDir, file);
        const content = await readFile(filePath, 'utf8');

        for (const vendor of vendors) {
            const vendorDir = path.join(pkgDir, directory, path.basename(vendor.dir));
            const relative = path.relative(path.dirname(filePath), vendorDir).split(path.sep).join('/');
            const from = `require("${vendor.name}")`;
            const to = `require("${relative}")`;
            if (!content.includes(from)) {
                continue;
            }
            const line = content.split('\n').findIndex((line) => line.includes(from)) + 1;
            references[file] ??= [];
            references[file].push({ from, to, line });
            const newContent = content.replace(from, to);
            await writeFile(filePath, newContent, 'utf8');
        }
    }

    // Log the replaced references
    const entries = Object.entries(references);
    logger.package.compilation.header({ files: entries.length });
    for (let i = 0; i < entries.length; i++) {
        const [file, refs] = entries[i];
        logger.package.compilation.file.header({
            isLast: i === entries.length - 1,
            dir: configDir,
            file,
            references: refs.length,
        });
        for (let j = 0; j < refs.length; j++) {
            const { line, from, to } = refs[j];
            logger.package.compilation.file.reference({
                isLast: j === refs.length - 1,
                isLastParent: i === entries.length - 1,
                line,
                from,
                to,
            });
        }
    }
}
