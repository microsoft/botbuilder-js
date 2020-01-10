import { join } from "path";
import { readdirSync, statSync, Stats } from "fs";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class PathUtil {
    public static getAllFiles(dir: string): string[] {
        let results: string[] = [];
        let list: string[] = readdirSync(dir);
        list.forEach(file => {
            file = join(dir, file);
            var stat: Stats = statSync(file);
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(this.getAllFiles(file));
            } else {
                /* Is a file */
                results.push(file);
            }
        });
        return results;
    }
}
