import { IConnectedService, ServiceType } from '../schema';
export declare abstract class ConnectedService implements IConnectedService {
    id: string;
    name: string;
    readonly abstract type: ServiceType;
    protected constructor(source?: IConnectedService);
    abstract toJSON(): IConnectedService;
}
