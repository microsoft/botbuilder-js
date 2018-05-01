import { IFileService, ServiceType, } from '../schema';
import { ConnectedService } from './connectedService';

export class FileService extends ConnectedService implements IFileService {
    public readonly type = ServiceType.File;
    public filePath = '';

    constructor(source: IFileService = {} as IFileService) {
        super(source);
        const { filePath = '' } = source;
        this.filePath = filePath;
    }

    public toJSON(): IFileService {
        const { name = '', id = '', filePath = '' } = this;
        return { name, id, filePath, type: ServiceType.File };
    }
}
