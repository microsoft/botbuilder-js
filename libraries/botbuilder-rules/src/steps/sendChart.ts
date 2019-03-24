/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { timingSafeEqual } from 'crypto';
import { MessageFactory } from 'botbuilder-core';

export enum ChartType {
    pie = 'p',
    concentricPie = 'pc',
    doughnutPie = 'pd',
    lines = 'lc',
    sparklines = 'ls',
    barGroupedVertically = 'bvg',
    barGroupedHorizontally = 'bhg',
    barStackedVertically = 'bvs',
    barStackedHorizontally = 'bhs',
    polar = 'pa'
}

export class SendChart extends DialogCommand {

    /**
     * Creates a new `SendChart` instance.
     */
    constructor();
    constructor(type: ChartType, dataProperty: string);
    constructor(type?: ChartType, dataProperty?: string) {
        super();
        if (type) { this.type = type }
        if (dataProperty) { this.dataProperty = dataProperty }
        this.useAnimation = true;
    }

    protected onComputeID(): string {
        return `pieChart[${this.hashedLabel(this.type + ':' + this.dataProperty)}]`;
    }

    public colors: string;

    public dataProperty: string;

    public size = '500x260';

    public type: ChartType;

    public showLabels: boolean;

    public showLegend: boolean;

    public useAnimation: boolean;

    public configure(config: DialogConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Get data property and format
        let chd = 'a:';
        let labels = '';
        const data = dc.state.getValue(this.dataProperty);
        if (Array.isArray(data)) {
            chd += data.join(',');
        } else if (typeof data == 'object') {
            let dataSep = '';
            let labelSep = '';
            for (const series in data) {
                if (data.hasOwnProperty(series)) {
                    labels += labelSep + encodeURIComponent(series.replace(' ', '+'));
                    labelSep = '|';
                    const sd = data[series];
                    if (Array.isArray(sd)) {
                        chd += dataSep;
                        chd += sd.join(',');
                        dataSep = '|';
                    } else {
                        chd += dataSep;
                        chd += sd.toString();
                        dataSep = ',';
                    }
                }
            }
        } else {
            chd += '0'
        }

        // Generate chart url
        let contentType: string;
        let url = `https://image-charts.com/chart?cht=${this.type}&chd=${chd}&chs=${this.size}`;
        if (labels.length > 0) {
            const showLegend = this.showLegend || this.type == ChartType.lines || this.type == ChartType.sparklines;
            const showLabels = this.showLabels || !showLegend;
            
            if (showLegend) {
                url += `&chdl=${labels}`;
            }

            if (showLabels) {
                url += `&chl=${labels}`;
            }
        }
        if (this.colors) {
            url += `&chco=${this.colors}`;
        }
        if (this.useAnimation) {
            url += `&chan`;
            contentType = 'image/gif';
        } else {
            url += `&chof=.png`;
            contentType = 'image/png';
        }

        // Send chart to user
        const activity = MessageFactory.contentUrl(url, contentType);
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }
}