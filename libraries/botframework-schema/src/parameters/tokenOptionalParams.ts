/**
 * Optional Parameters.
 */
export interface TokenOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member {string} [code]
     */
    code?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };
    /**
	     * @member {string} [include]
	     */
	include?: string;
    proxyOptions?:
    {
        host: string,
        port: number,
        user: string,
        password: string
    };
}