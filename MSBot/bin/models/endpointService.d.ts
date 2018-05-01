import { IEndpointService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';
export declare class EndpointService extends ConnectedService implements IEndpointService {
    readonly type: ServiceType;
    appId: string;
    appPassword: string;
    endpoint: string;
    constructor(source: IEndpointService);
    toJSON(): IEndpointService;
}
