import { IEndpointService, ServiceType } from '../schema';
import { ConnectedService } from './connectedService';

export class EndpointService extends ConnectedService implements IEndpointService {
    public readonly type = ServiceType.Endpoint;

    public appId = '';
    public appPassword = '';
    public endpoint = '';

    constructor(source: Partial<IEndpointService>) {
        super(source);
        const { appId = '', appPassword = '', endpoint = '' } = source;
        Object.assign(this, { appId, appPassword, endpoint });

        let { id } = this;
        Object.defineProperty(this, 'id', {
            get: function () {
                return id || appId;
            },
            set: function (value) {
                id = value;
            },
            enumerable: true
        });
    }

    public toJSON(): Partial<IEndpointService> {
        let { appId = '', id = '', appPassword = '', endpoint = '', name = '' } = this;
        if (!id) {
            id = appId;
        }
        return { appId, id, type: ServiceType.Endpoint, appPassword, endpoint, name };
    }
}
