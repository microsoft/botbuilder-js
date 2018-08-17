import { IAzureStorageService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';
export declare class AzureStorageService extends ConnectedService implements IAzureStorageService {
    readonly type: ServiceTypes;
    tenantId: string;
    subscriptionId: string;
    resourceGroup: string;
    connectionString: string;
    constructor(source?: IAzureStorageService);
    toJSON(): IAzureStorageService;
    encrypt(secret: string): void;
    decrypt(secret: string): void;
}
