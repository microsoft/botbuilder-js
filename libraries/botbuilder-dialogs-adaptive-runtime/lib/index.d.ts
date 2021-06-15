import { Configuration } from './configuration';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
/**
 * Construct all runtime services.
 *
 * @param applicationRoot absolute path to root of application
 * @param configuration a fully initialized configuration instance to use
 * @returns service collection and configuration
 */
export declare function getRuntimeServices(applicationRoot: string, configuration: Configuration): Promise<[ServiceCollection, Configuration]>;
/**
 * Construct all runtime services.
 *
 * @param applicationRoot absolute path to root of application
 * @param settingsDirectory directory where settings files are located
 * @returns service collection and configuration
 */
export declare function getRuntimeServices(applicationRoot: string, settingsDirectory: string): Promise<[ServiceCollection, Configuration]>;
export { Configuration };
//# sourceMappingURL=index.d.ts.map