import * as builder from 'botbuilder';

export interface IDialog {
    id: String;
    name: String;
    waterfall: builder.IDialogWaterfallStep[];
}