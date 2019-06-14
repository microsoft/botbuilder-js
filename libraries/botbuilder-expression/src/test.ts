// tslint:disable-next-line: missing-jsdoc
import * as fs from 'fs';
import * as readline from 'readline';
import * as moment from 'moment';
import * as timezone from 'moment-timezone';
import * as timezoneConveter from './TimezoneConverter'

let ts: moment.Moment = moment("2014-06-01T12:00:00Z");
let ctz: string = timezoneConveter.TimeZoneConverter.WindowsToIana('Pacific Standard Time');
console.log(ctz);
console.log(timezoneConveter.TimeZoneConverter.VerifyTimeZoneStr('Pacific Standard Time'));



