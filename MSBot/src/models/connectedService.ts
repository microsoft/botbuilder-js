import { IConnectedService, ServiceType } from '../schema';

export abstract class ConnectedService implements IConnectedService {
    public id = '';
    public name = '';
    public abstract readonly type: ServiceType;

    protected constructor(source: Partial<IConnectedService> = {}) {
        const { id = '', name = '' } = source;
        Object.assign(this, { id, name });
    }

    public abstract toJSON(): Partial<IConnectedService>;
}
