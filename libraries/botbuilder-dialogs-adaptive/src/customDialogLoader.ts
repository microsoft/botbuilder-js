import { DefaultLoader, ResourceExplorer } from 'botbuilder-dialogs-declarative';

export class CustomDialogLoader<T, C> extends DefaultLoader<T, C> {
    public constructor(resourceExplorer: ResourceExplorer) {
        super(resourceExplorer);
    }

    public load(value: C, type: new (...args: unknown[]) => T): T {
        const kind = value['$kind'];
        if (kind && !value['dialog']) {
            value['dialog'] = kind.replace(/\.dialog$/, '');
        }
        return super.load(value, type);
    }
}
