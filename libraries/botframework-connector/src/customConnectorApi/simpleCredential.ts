export class SimpleCredential {
    appId: string;
    appPassword: string

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appPassword = appPassword;
    }
}