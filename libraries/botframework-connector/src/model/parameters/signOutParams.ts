/**
 * @interface
 * An interface representing UserTokenSignOutOptionalParams.
 * Optional Parameters.
*/
export interface SignOutParams {
    connectionName?: string;
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };

    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}