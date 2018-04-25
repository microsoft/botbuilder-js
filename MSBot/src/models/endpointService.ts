import { IEndpointService, ServiceType } from '../types';
import { ConnectedService } from './connectedService';

export class EndpointService extends ConnectedService implements IEndpointService {
    public readonly type = ServiceType.Endpoint;

    public appId: string;
    public appPassword: string;
    public endpoint: string;

    constructor(source: Partial<IEndpointService>) {
        super(source);
        const { appId = '', appPassword = '', endpoint = '' } = source;
        Object.assign(this, { appId, appPassword, endpoint });
    }

    public toJSON(): Partial<IEndpointService> {
        let { appId = '', id = '', appPassword = '', endpoint = '', name = '' } = this;
        if (!id) {
            id = appId;
        }
        return { appId, id, type: ServiceType.Endpoint, appPassword, endpoint, name };
    }
}
