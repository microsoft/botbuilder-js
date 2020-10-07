import { DefaultLoader, ResourceExplorer } from 'botbuilder-dialogs-declarative';

export class CustomDialogLoader extends DefaultLoader {
    public constructor(resourceExplorer: ResourceExplorer) {
        super(resourceExplorer);
    }

    public load(value: any, type: new () => {}): any {
        const kind = value['$kind'];
        if (kind && !value['dialog']) {
            value['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.load(value, type);
    }
}
