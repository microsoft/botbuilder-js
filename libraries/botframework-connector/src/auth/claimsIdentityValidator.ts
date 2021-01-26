// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';
import { ClaimsIdentity } from './claimsIdentity';
import { ICredentialProvider } from './credentialProvider';

export interface ClaimsIdentityValidator {
    validate(
        credentials: ICredentialProvider,
        claimsIdentity: ClaimsIdentity,
        activity: Partial<Activity>
    ): Promise<void>;
}
