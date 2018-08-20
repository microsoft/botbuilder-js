import { IAppInsightsService } from '../schema';
import { AzureService } from './azureService';
export declare class AppInsightsService extends AzureService implements IAppInsightsService {
    instrumentationKey: string;
    applicationId: string;
    apiKeys: {
        [key: string]: string;
    };
    constructor(source?: IAppInsightsService);
    toJSON(): IAppInsightsService;
    encrypt(secret: string): void;
    decrypt(secret: string): void;
}
