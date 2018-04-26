import { IBotConfig, IConnectedService } from '../schema';
import { ConnectedService } from './connectedService';
export declare class BotConfigModel implements Partial<IBotConfig> {
    name: string;
    description: string;
    services: IConnectedService[];
    secretKey: string;
    static serviceFromJSON(service: Partial<IConnectedService>): ConnectedService;
    static fromJSON(source?: Partial<IBotConfig>): BotConfigModel;
    toJSON(): Partial<IBotConfig>;
}
/**
 * Typed collection implementation in JS woot!
 */
export declare class ServicesCollection<T extends ConnectedService> extends Array {
    static readonly [Symbol.species]: ArrayConstructor;
    constructor(source?: IConnectedService[]);
    protected set(target: any, prop: PropertyKey, value: any, receiver: any): Function[] | Function | any;
}
