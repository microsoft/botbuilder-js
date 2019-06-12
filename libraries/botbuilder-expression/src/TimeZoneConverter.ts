/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
/**
 * Convert TimeZone between Windows and Iana.
 */
export class TimeZoneConverter {
    private static ianaToWindows: Map<string, string> = new Map<string, string>();
    private static windowsToIana: Map<string, string> = new Map<string, string>();

    public static InnaToWindows(ianaTimeZoneId: string): string {
        this.LoadData();
        if (this.ianaToWindows.has(ianaTimeZoneId)) {
            return this.ianaToWindows[ianaTimeZoneId];
        }

        return ianaTimeZoneId;
    }

    public static WindowsToIana(windowsTimeZoneId: string): string {
        this.LoadData();
        if (this.ianaToWindows.has(`001|${windowsTimeZoneId}`)) {
            return this.ianaToWindows[`001|${windowsTimeZoneId}`];
        }

        return windowsTimeZoneId;
    }

    private static LoadData(): void {
        const data: string  = fs.readFileSync('WindowsIanaMapping', 'utf-8');
        for (const line of data) {
            const tokens: string[] = line.split(',');
            const windowsID: string = tokens[0];
            const territory: string = tokens[1];
            const ianaIDs: string[] = tokens[2].split(' ');
            for (const ianaID of ianaIDs) {
                if (!this.ianaToWindows.has(ianaID)) {
                    this.ianaToWindows.set(ianaID, windowsID);
                }
            }

            if (!this.windowsToIana.has(`${territory}|${windowsID}`)) {
                this.windowsToIana.set(`${territory}|${windowsID}`, ianaIDs[0]);
            }

        }
    }
}
