import { normalize, join } from "path";
import { readdirSync, statSync, lstatSync } from "fs";

export class PathUtil {
    public IsDirectory = source => lstatSync(source).isDirectory()
    public GetDirectories = source => readdirSync(source).map(name => join(source, name)).filter(this.IsDirectory)
}