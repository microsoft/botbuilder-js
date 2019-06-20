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
    private static validTimezonStr: string [] = new Array<string>();

    public static InnaToWindows(ianaTimeZoneId: string): string {
        this.LoadData();
        if (this.ianaToWindows.has(ianaTimeZoneId)) {
            return this.ianaToWindows.get(ianaTimeZoneId);
        }

        return ianaTimeZoneId;
    }

    public static WindowsToIana(windowsTimeZoneId: string): string {
        this.LoadData();
        if (this.windowsToIana.has(`001|${windowsTimeZoneId}`)) {
            return this.windowsToIana.get(`001|${windowsTimeZoneId}`);
        }

        return windowsTimeZoneId;
    }

    public static VerifyTimeZoneStr(timezoneStr: string): boolean {
        this.LoadData();

        return this.validTimezonStr.includes(timezoneStr);
    }

    private static LoadData(): void {
        const data: string = fs.readFileSync('../botbuilder-expression/lib/WindowsIanaMapping', 'utf-8');
        const lines: string [] = data.split('\r\n');
        for (const line of lines) {
            const tokens: string[] = line.split(',');
            const windowsID: string = tokens[0];
            const territory: string = tokens[1];
            const ianaIDs: string[] = tokens[2].split(' ');
            for (const ianaID of ianaIDs) {
                if (!this.ianaToWindows.has(ianaID)) {
                    this.ianaToWindows.set(ianaID, windowsID);
                }

                if (!this.validTimezonStr.includes(ianaID)) {
                    this.validTimezonStr.push(ianaID);
                }
            }

            if (!this.windowsToIana.has(`${territory}|${windowsID}`)) {
                this.windowsToIana.set(`${territory}|${windowsID}`, ianaIDs[0]);
            }

            if (!this.validTimezonStr.includes(windowsID)) {
                this.validTimezonStr.push(windowsID);
            }
        }
    }
}
