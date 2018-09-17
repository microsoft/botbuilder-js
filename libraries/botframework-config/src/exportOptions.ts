import { IConnectedService } from "./schema";

export interface ExportOptions {
    // should resources be downloaded info folder
    download: boolean;

    // progress callback during export
    progress?: (service: IConnectedService, command: string, index: number, total: number) => void
}