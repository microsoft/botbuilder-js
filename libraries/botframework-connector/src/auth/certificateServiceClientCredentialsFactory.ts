/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ServiceClientCredentials } from '@azure/core-http';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { ok } from 'assert';
import { CertificateAppCredentials } from './certificateAppCredentials';
import { promisify } from 'util';
import * as opensslWrapper from 'openssl-wrapper';
const openssl = promisify(opensslWrapper.default);

/**
 * A Certificate implementation of the [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) abstract class.
 */
export class CertificateServiceClientCredentialsFactory extends ServiceClientCredentialsFactory {
    private readonly appId: string;
    private readonly certificateThumbprint: string;
    private readonly certificatePrivateKey: string;
    private readonly tenantId: string | null;
    private readonly x5c: string | null;

    /**
     * Initializes a new instance of the CertificateServiceClientCredentialsFactory class.
     *
     * @param appId Microsoft application Id related to the certificate.
     * @param certificateThumbprint A hex encoded thumbprint of the certificate.
     * @param certificatePrivateKey A PEM encoded certificate private key.
     * @param tenantId Tenant ID of the Azure AD tenant where the bot is created.
     *   * Required for SingleTenant app types.
     *   * Optional for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param x5c Optional. Enables application developers to achieve easy certificates roll-over in Azure AD:
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     */
    constructor(
        appId: string,
        certificateThumbprint: string,
        certificatePrivateKey: string,
        tenantId?: string,
        x5c?: string
    );

    /**
     * Initializes a new instance of the CertificateServiceClientCredentialsFactory class.
     *
     * @param appId Microsoft application Id related to the certificate.
     * @param x5c Value that enables application developers to achieve easy certificates roll-over in Azure AD
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     * @param certificatePrivateKey A PEM encoded certificate private key.
     * @param tenantId Tenant ID of the Azure AD tenant where the bot is created.
     *   * Required for SingleTenant app types.
     *   * Optional for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     */
    constructor(appId: string, x5c: string, certificatePrivateKey: string, tenantId?: string);

    /**
     * @internal
     */
    constructor(
        appId: string,
        certificateThumbprintOrx5c: string,
        certificatePrivateKey: string,
        tenantId?: string,
        x5c?: string
    ) {
        super();

        ok(appId?.trim(), 'CertificateServiceClientCredentialsFactory.constructor(): missing appId.');
        ok(
            certificatePrivateKey?.trim(),
            'CertificateServiceClientCredentialsFactory.constructor(): missing certificatePrivateKey.'
        );

        if (certificateThumbprintOrx5c?.includes('-----BEGIN CERTIFICATE-----')) {
            this.x5c = certificateThumbprintOrx5c;
        } else {
            ok(
                certificateThumbprintOrx5c?.trim(),
                'CertificateServiceClientCredentialsFactory.constructor(): missing certificateThumbprint or x5c value.'
            );
            this.certificateThumbprint = certificateThumbprintOrx5c;
            this.x5c = x5c;
        }

        this.appId = appId;
        this.certificatePrivateKey = certificatePrivateKey;
        this.tenantId = tenantId;
    }

    /**
     * @inheritdoc
     */
    async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
    }

    /**
     * @param cert Value with the certificate content.
     * @returns The thumbprint value calculated from the cert content.
     */
    private async getThumbprint(cert) {
        const fingerprintResponse = await openssl('x509', Buffer.from(cert), { fingerprint: true, noout: true });
        return Buffer.from(fingerprintResponse)
            .toString()
            .replace(/^.*Fingerprint=/, '')
            .replace(/:/g, '')
            .trim();
    }
    /**
     * @inheritdoc
     */
    async isAuthenticationDisabled(): Promise<boolean> {
        // Auth is always enabled for Certificate.
        return;
    }

    /**
     * @inheritdoc
     */
    async createCredentials(appId: string, audience: string): Promise<ServiceClientCredentials> {
        ok(
            await this.isValidAppId(appId),
            'CertificateServiceClientCredentialsFactory.createCredentials(): Invalid Managed ID.'
        );

        return new CertificateAppCredentials(
            this.appId,
            this.certificateThumbprint ?? (await this.getThumbprint(this.x5c)),
            this.certificatePrivateKey,
            this.tenantId,
            audience,
            this.x5c
        );
    }
}
