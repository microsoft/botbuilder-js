/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import type { ServiceClientCredentials } from '@azure/ms-rest-js';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { ok } from 'assert';
import { CertificateAppCredentials } from './certificateAppCredentials';

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
     * @param tenantId Optional. The oauth token tenant.
     * @param x5c Optional. Enables application developers to achieve easy certificates roll-over in Azure AD:
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     */
    constructor(
        appId: string,
        certificateThumbprint: string,
        certificatePrivateKey: string,
        tenantId?: string,
        x5c?: string
    ) {
        super();
        ok(appId?.trim(), 'CertificateServiceClientCredentialsFactory.constructor(): missing appId.');
        ok(
            certificateThumbprint?.trim(),
            'CertificateServiceClientCredentialsFactory.constructor(): missing certificateThumbprint.'
        );
        ok(
            certificatePrivateKey?.trim(),
            'CertificateServiceClientCredentialsFactory.constructor(): missing certificatePrivateKey.'
        );

        this.appId = appId;
        this.certificateThumbprint = certificateThumbprint;
        this.certificatePrivateKey = certificatePrivateKey;
        this.tenantId = tenantId;
        this.x5c = x5c;
    }

    /**
     * @inheritdoc
     */
    async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
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
            this.certificateThumbprint,
            this.certificatePrivateKey,
            this.tenantId,
            audience,
            this.x5c
        );
    }
}
