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
     * @param tenantId Optional. The oauth token tenant.
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     */
    constructor(appId: string, certificateThumbprintOrx5c?: string, certificatePrivateKey?: string, tenantId?: string);

    /**
     * Initializes a new instance of the CertificateServiceClientCredentialsFactory class.
     *
     * @param appId Microsoft application Id related to the certificate.
     * @param x5c Value that enables application developers to achieve easy certificates roll-over in Azure AD
     * @param certificatePrivateKey A PEM encoded certificate private key.
     * @param tenantId Optional. The oauth token tenant.
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     */
    constructor(appId: string, certificateThumbprintOrx5c?: string, certificatePrivateKey?: string, tenantId?: string);

    /**
     * @internal
     */
    constructor(appId: string, certificateThumbprintOrx5c?: string, certificatePrivateKey?: string, tenantId?: string) {
        super();

        ok(appId?.trim(), 'CertificateServiceClientCredentialsFactory.constructor(): missing appId.');
        ok(
            certificateThumbprintOrx5c?.trim(),
            'CertificateServiceClientCredentialsFactory.constructor(): missing certificateThumbprint or x5c value.'
        );
        ok(
            certificatePrivateKey?.trim(),
            'CertificateServiceClientCredentialsFactory.constructor(): missing certificatePrivateKey.'
        );

        this.appId = appId;
        this.certificateThumbprint = certificateThumbprintOrx5c?.length <= 40 ? certificateThumbprintOrx5c : undefined;
        this.certificatePrivateKey = certificatePrivateKey;
        this.tenantId = tenantId;
        this.x5c = certificateThumbprintOrx5c?.length > 40 ? certificateThumbprintOrx5c : undefined;
    }

    /**
     * @inheritdoc
     */
    async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
    }

    /**
     * @param cert Value with the certificate content.
     * @returns the thumbprint value calculated from the cert content.
     */
    async getThumbprint(cert) {
        const certString = Buffer.from(cert).toString();
        const begin = certString.lastIndexOf('-----BEGIN CERTIFICATE-----');
        const end = certString.lastIndexOf('-----END CERTIFICATE-----') + '-----END CERTIFICATE-----'.length;
        const certificate = certString.slice(begin, end);

        const fingerprintResponse = await openssl('x509', Buffer.from(certificate), { fingerprint: true, noout: true });
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
