import { normalize, join, resolve } from "path";
import { readdirSync, statSync, lstatSync, Stats } from "fs";

export class PathUtil {
    public static IsDirectory = source => lstatSync(source).isDirectory()
    public static GetDirectories = source => readdirSync(source).map(name => join(source, name)).filter(PathUtil.IsDirectory)

    public static GetAllFiles(dir: string): string[] {
        let results: string[] = [];
        let list: string[] = readdirSync(dir);
        list.forEach(file => {
            file = join(dir, file);
            var stat: Stats = statSync(file);
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results = results.concat(this.GetAllFiles(file));
            } else {
                /* Is a file */
                results.push(file);
            }
        });
        return results;
    }
}
