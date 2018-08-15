import { IEndpointService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class EndpointService extends ConnectedService implements IEndpointService {
    readonly type: ServiceTypes;
    appId: string;
    appPassword: string;
    endpoint: string;
    constructor(source: IEndpointService);
    toJSON(): IEndpointService;
    encrypt(secret: string, iv?: string): void;
    decrypt(secret: string, iv?: string): void;
}
