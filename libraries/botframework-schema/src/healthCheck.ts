/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * @interface
 * An interface representing HealthCheckResponse.
 *
 */
export interface HealthCheckResponse {
    /**
     * @member {HealthResults} [healthResults] Health check results
     */
    healthResults: HealthResults;
}

/**
 * @interface
 * An interface representing HealthResults.
 *
 */
export interface HealthResults {
    /**
     * @member {boolean} [success] Boolean value representing healthy, True, or otherwise
     */
    success: boolean;

    /**
     * @member {string} [authorization] The authorization header that will be used on bot framework protocol callbacks
     */
    authorization?: string;

    /**
     * @member {string} ["user-agent"] The user-agent header that will be used on bot framework protocol callbacks
     */
    "user-agent"?: string;

    /**
     * @member {string[]} [messages] Informational messages communicating the health of the bot
     */
    messages?: string[];

    /**
     * @member {any} [diagnostics] Diagnostics information an application can include in a health check response
     */
    diagnostics?: any;
}
