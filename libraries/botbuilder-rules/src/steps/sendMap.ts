/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { MessageFactory } from 'botbuilder-core';

export enum MapType {
    aerial = 'Aerial',
    aerialWithLabels = 'AerialWithLabels',
    aerialWithLabelsOnDemand = 'AerialWithLabelsOnDemand',
    canvasDark = 'CanvasDark',
    canvasLight = 'CanvasLight',
    canvasGray = 'CanvasGray',
    road = 'Road',
    streetside = 'Streetside'
}

export interface MapCenterPoint {
    latitude: string;
    longitude: string;
}

export interface MapPushPin {
    latitude: string;
    longitude: string;
    iconStyle?: string;
    label?: string;
}

export class SendMap extends DialogCommand {

    /**
     * Creates a new `SendMap` instance.
     */
    constructor();
    constructor(apiKey: string, type: MapType, pinsProperty?: string, areaProperty?: string);
    constructor(apiKey?: string, type?: MapType, pinsProperty?: string, areaProperty?: string) {
        super();
        if (apiKey) { this.apiKey = apiKey }
        if (type) { this.type = type }
        if (pinsProperty) { this.pinsProperty = pinsProperty }
        if (areaProperty) { this.areaProperty = areaProperty }
        this.declutterPins = true;
        this.zoomLevel = 16;
    }

    protected onComputeID(): string {
        return `map[${this.hashedLabel(this.type + ':' + this.areaProperty)}]`;
    }

    public apiKey: string;

    public areaProperty: string;

    public declutterPins: boolean;

    public pinsProperty: string;

    public size = '500,260';

    public type: MapType;

    public zoomLevel: number;

    public configure(config: DialogConfiguration): this {
        return super.configure(config);
    }
    
    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Select template
        let url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/${this.type}`;
        if (this.areaProperty) {
            let area: any[] = dc.state.getValue(this.areaProperty);
            if (typeof area == 'string') { 
                area = (area as string).split(',') 
            } else if (typeof area == 'object') {
                area = this.fromCenterPoint(area as any);
            }
            if (area.length == 4) {
                url += `?ma=${area.join(',')}&ms=${this.size}`;
            } else if (area.length == 2) {
                url += `/${area.join(',')}/${this.zoomLevel}?ms=${this.size}`;
            } else {
                throw new Error(`sendMap: area property "${this.areaProperty}" contains an invalid value.`);
            }
        } else if (this.pinsProperty) {
            url += `?ms=${this.size}`;
        } else {
            throw new Error(`sendMap: must specify an area property or set of pins.`);
        }

        // Add push pins
        if (this.pinsProperty) {
            const pins: any[] = dc.state.getValue(this.pinsProperty);
            pins.forEach((pin) => {
                if (typeof pin == 'string') {
                    url += `&pp=${pin}`;
                } else if (typeof pin == 'object') {
                    url += `&pp=${this.fromPushPin(pin as any)}`;
                }
            });
        }

        if (this.declutterPins) {
            url += '&dcl=1';
        }

        // Add key and output format
        url += `&fmt=png&key=${this.apiKey}`;

        console.log(url);

        // Send chart to user
        const activity = MessageFactory.contentUrl(url, 'image/png');
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }

    private fromCenterPoint(obj: MapCenterPoint): any[] {
        return [obj.latitude, obj.longitude];
    } 

    private fromPushPin(obj: MapPushPin): string {
        return `${obj.latitude},${obj.longitude};${obj.iconStyle || ''};${obj.label ? encodeURIComponent(obj.label) : ''}`;
    } 
}