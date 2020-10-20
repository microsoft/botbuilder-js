/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Time zone converter.
 * (1) From Windows (.NET) timezone to iana timezone.
 * (2) From iana timezone to windows (.NET) timezone.
 * windows ref: https://support.microsoft.com/en-us/help/22803/daylight-saving-time.
 * iana ref: https://www.iana.org/time-zones.
 */
export class TimeZoneConverter {
    private static readonly ianaToWindowsMap: Map<string, string> = new Map<string, string>();
    private static readonly windowsToIanaMap: Map<string, string> = new Map<string, string>();
    private static readonly validTimezonStr: string[] = [];
    private static readonly seperator: string = '    ';
    private static readonly mappingString: string =
        'AUS Central Standard Time,001,Australia/Darwin\
    AUS Central Standard Time,AU,Australia/Darwin\
    AUS Eastern Standard Time,001,Australia/Sydney\
    AUS Eastern Standard Time,AU,Australia/Sydney Australia/Melbourne\
    Afghanistan Standard Time,001,Asia/Kabul\
    Afghanistan Standard Time,AF,Asia/Kabul\
    Alaskan Standard Time,001,America/Anchorage\
    Alaskan Standard Time,US,America/Anchorage America/Juneau America/Metlakatla America/Nome America/Sitka America/Yakutat\
    Aleutian Standard Time,001,America/Adak\
    Aleutian Standard Time,US,America/Adak\
    Altai Standard Time,001,Asia/Barnaul\
    Altai Standard Time,RU,Asia/Barnaul\
    Arab Standard Time,001,Asia/Riyadh\
    Arab Standard Time,BH,Asia/Qatar\
    Arab Standard Time,KW,Asia/Riyadh\
    Arab Standard Time,QA,Asia/Qatar\
    Arab Standard Time,SA,Asia/Riyadh\
    Arab Standard Time,YE,Asia/Riyadh\
    Arabian Standard Time,001,Asia/Dubai\
    Arabian Standard Time,AE,Asia/Dubai\
    Arabian Standard Time,OM,Asia/Dubai\
    Arabian Standard Time,ZZ,Etc/GMT-4\
    Arabic Standard Time,001,Asia/Baghdad\
    Arabic Standard Time,IQ,Asia/Baghdad\
    Argentina Standard Time,001,America/Argentina/Buenos_Aires\
    Argentina Standard Time,AR,America/Argentina/Buenos_Aires America/Argentina/La_Rioja America/Argentina/Rio_Gallegos America/Argentina/Salta America/Argentina/San_Juan America/Argentina/San_Luis America/Argentina/Tucuman America/Argentina/Ushuaia America/Argentina/Catamarca America/Argentina/Cordoba America/Argentina/Jujuy America/Argentina/Mendoza\
    Astrakhan Standard Time,001,Europe/Astrakhan\
    Astrakhan Standard Time,RU,Europe/Astrakhan Europe/Ulyanovsk\
    Atlantic Standard Time,001,America/Halifax\
    Atlantic Standard Time,BM,Atlantic/Bermuda\
    Atlantic Standard Time,CA,America/Halifax America/Glace_Bay America/Goose_Bay America/Moncton\
    Atlantic Standard Time,GL,America/Thule\
    Aus Central W. Standard Time,001,Australia/Eucla\
    Aus Central W. Standard Time,AU,Australia/Eucla\
    Azerbaijan Standard Time,001,Asia/Baku\
    Azerbaijan Standard Time,AZ,Asia/Baku\
    Azores Standard Time,001,Atlantic/Azores\
    Azores Standard Time,GL,America/Scoresbysund\
    Azores Standard Time,PT,Atlantic/Azores\
    Bahia Standard Time,001,America/Bahia\
    Bahia Standard Time,BR,America/Bahia\
    Bangladesh Standard Time,001,Asia/Dhaka\
    Bangladesh Standard Time,BD,Asia/Dhaka\
    Bangladesh Standard Time,BT,Asia/Thimphu\
    Belarus Standard Time,001,Europe/Minsk\
    Belarus Standard Time,BY,Europe/Minsk\
    Bougainville Standard Time,001,Pacific/Bougainville\
    Bougainville Standard Time,PG,Pacific/Bougainville\
    Canada Central Standard Time,001,America/Regina\
    Canada Central Standard Time,CA,America/Regina America/Swift_Current\
    Cape Verde Standard Time,001,Atlantic/Cape_Verde\
    Cape Verde Standard Time,CV,Atlantic/Cape_Verde\
    Cape Verde Standard Time,ZZ,Etc/GMT+1\
    Caucasus Standard Time,001,Asia/Yerevan\
    Caucasus Standard Time,AM,Asia/Yerevan\
    Cen. Australia Standard Time,001,Australia/Adelaide\
    Cen. Australia Standard Time,AU,Australia/Adelaide Australia/Broken_Hill\
    Central America Standard Time,001,America/Guatemala\
    Central America Standard Time,BZ,America/Belize\
    Central America Standard Time,CR,America/Costa_Rica\
    Central America Standard Time,EC,Pacific/Galapagos\
    Central America Standard Time,GT,America/Guatemala\
    Central America Standard Time,HN,America/Tegucigalpa\
    Central America Standard Time,NI,America/Managua\
    Central America Standard Time,SV,America/El_Salvador\
    Central America Standard Time,ZZ,Etc/GMT+6\
    Central Asia Standard Time,001,Asia/Almaty\
    Central Asia Standard Time,AQ,Antarctica/Vostok\
    Central Asia Standard Time,CN,Asia/Urumqi\
    Central Asia Standard Time,DG,Indian/Chagos\
    Central Asia Standard Time,IO,Indian/Chagos\
    Central Asia Standard Time,KG,Asia/Bishkek\
    Central Asia Standard Time,KZ,Asia/Almaty Asia/Qyzylorda\
    Central Asia Standard Time,ZZ,Etc/GMT-6\
    Central Brazilian Standard Time,001,America/Cuiaba\
    Central Brazilian Standard Time,BR,America/Cuiaba America/Campo_Grande\
    Central Europe Standard Time,001,Europe/Budapest\
    Central Europe Standard Time,AL,Europe/Tirane\
    Central Europe Standard Time,CZ,Europe/Prague\
    Central Europe Standard Time,HU,Europe/Budapest\
    Central Europe Standard Time,ME,Europe/Belgrade\
    Central Europe Standard Time,RS,Europe/Belgrade\
    Central Europe Standard Time,SI,Europe/Belgrade\
    Central Europe Standard Time,SK,Europe/Prague\
    Central Europe Standard Time,XK,Europe/Belgrade\
    Central European Standard Time,001,Europe/Warsaw\
    Central European Standard Time,BA,Europe/Belgrade\
    Central European Standard Time,HR,Europe/Belgrade\
    Central European Standard Time,MK,Europe/Belgrade\
    Central European Standard Time,PL,Europe/Warsaw\
    Central Pacific Standard Time,001,Pacific/Guadalcanal\
    Central Pacific Standard Time,AU,Antarctica/Macquarie\
    Central Pacific Standard Time,FM,Pacific/Pohnpei Pacific/Kosrae\
    Central Pacific Standard Time,NC,Pacific/Noumea\
    Central Pacific Standard Time,SB,Pacific/Guadalcanal\
    Central Pacific Standard Time,VU,Pacific/Efate\
    Central Pacific Standard Time,ZZ,Etc/GMT-11\
    Central Standard Time (Mexico),001,America/Mexico_City\
    Central Standard Time (Mexico),MX,America/Mexico_City America/Bahia_Banderas America/Merida America/Monterrey\
    Central Standard Time,001,America/Chicago\
    Central Standard Time,CA,America/Winnipeg America/Rainy_River America/Rankin_Inlet America/Resolute\
    Central Standard Time,MX,America/Matamoros\
    Central Standard Time,US,America/Chicago America/Indiana/Knox America/Indiana/Tell_City America/Menominee America/North_Dakota/Beulah America/North_Dakota/Center America/North_Dakota/New_Salem\
    Central Standard Time,ZZ,CST6CDT\
    Chatham Islands Standard Time,001,Pacific/Chatham\
    Chatham Islands Standard Time,NZ,Pacific/Chatham\
    China Standard Time,001,Asia/Shanghai\
    China Standard Time,CN,Asia/Shanghai\
    China Standard Time,HK,Asia/Hong_Kong\
    China Standard Time,MO,Asia/Macau\
    Cuba Standard Time,001,America/Havana\
    Cuba Standard Time,CU,America/Havana\
    Dateline Standard Time,001,Etc/GMT+12\
    Dateline Standard Time,ZZ,Etc/GMT+12\
    E. Africa Standard Time,001,Africa/Nairobi\
    E. Africa Standard Time,AQ,Antarctica/Syowa\
    E. Africa Standard Time,DJ,Africa/Nairobi\
    E. Africa Standard Time,ER,Africa/Nairobi\
    E. Africa Standard Time,ET,Africa/Nairobi\
    E. Africa Standard Time,KE,Africa/Nairobi\
    E. Africa Standard Time,KM,Africa/Nairobi\
    E. Africa Standard Time,MG,Africa/Nairobi\
    E. Africa Standard Time,SO,Africa/Nairobi\
    E. Africa Standard Time,SS,Africa/Juba\
    E. Africa Standard Time,TZ,Africa/Nairobi\
    E. Africa Standard Time,UG,Africa/Nairobi\
    E. Africa Standard Time,YT,Africa/Nairobi\
    E. Africa Standard Time,ZZ,Etc/GMT-3\
    E. Australia Standard Time,001,Australia/Brisbane\
    E. Australia Standard Time,AU,Australia/Brisbane Australia/Lindeman\
    E. Europe Standard Time,001,Europe/Chisinau\
    E. Europe Standard Time,MD,Europe/Chisinau\
    E. South America Standard Time,001,America/Sao_Paulo\
    E. South America Standard Time,BR,America/Sao_Paulo\
    Easter Island Standard Time,001,Pacific/Easter\
    Easter Island Standard Time,CL,Pacific/Easter\
    Eastern Standard Time (Mexico),001,America/Cancun\
    Eastern Standard Time (Mexico),MX,America/Cancun\
    Eastern Standard Time,001,America/New_York\
    Eastern Standard Time,BS,America/Nassau\
    Eastern Standard Time,CA,America/Toronto America/Iqaluit America/Nipigon America/Pangnirtung America/Thunder_Bay\
    Eastern Standard Time,US,America/New_York America/Detroit America/Indiana/Petersburg America/Indiana/Vincennes America/Indiana/Winamac America/Kentucky/Monticello America/Kentucky/Louisville\
    Eastern Standard Time,ZZ,EST5EDT\
    Egypt Standard Time,001,Africa/Cairo\
    Egypt Standard Time,EG,Africa/Cairo\
    Ekaterinburg Standard Time,001,Asia/Yekaterinburg\
    Ekaterinburg Standard Time,RU,Asia/Yekaterinburg\
    FLE Standard Time,001,Europe/Kiev\
    FLE Standard Time,AX,Europe/Helsinki\
    FLE Standard Time,BG,Europe/Sofia\
    FLE Standard Time,EE,Europe/Tallinn\
    FLE Standard Time,FI,Europe/Helsinki\
    FLE Standard Time,LT,Europe/Vilnius\
    FLE Standard Time,LV,Europe/Riga\
    FLE Standard Time,UA,Europe/Kiev Europe/Uzhgorod Europe/Zaporozhye\
    Fiji Standard Time,001,Pacific/Fiji\
    Fiji Standard Time,FJ,Pacific/Fiji\
    GMT Standard Time,001,Europe/London\
    GMT Standard Time,ES,Atlantic/Canary\
    GMT Standard Time,FO,Atlantic/Faroe\
    GMT Standard Time,GB,Europe/London\
    GMT Standard Time,GG,Europe/London\
    GMT Standard Time,IC,Atlantic/Canary\
    GMT Standard Time,IE,Europe/Dublin\
    GMT Standard Time,IM,Europe/London\
    GMT Standard Time,JE,Europe/London\
    GMT Standard Time,PT,Europe/Lisbon Atlantic/Madeira\
    GTB Standard Time,001,Europe/Bucharest\
    GTB Standard Time,CY,Asia/Nicosia Asia/Famagusta\
    GTB Standard Time,GR,Europe/Athens\
    GTB Standard Time,RO,Europe/Bucharest\
    Georgian Standard Time,001,Asia/Tbilisi\
    Georgian Standard Time,GE,Asia/Tbilisi\
    Greenland Standard Time,001,America/Godthab\
    Greenland Standard Time,GL,America/Godthab\
    Greenwich Standard Time,001,Atlantic/Reykjavik\
    Greenwich Standard Time,AC,Atlantic/St_Helena\
    Greenwich Standard Time,BF,Africa/Abidjan\
    Greenwich Standard Time,CI,Africa/Abidjan\
    Greenwich Standard Time,GH,Africa/Accra\
    Greenwich Standard Time,GM,Africa/Abidjan\
    Greenwich Standard Time,GN,Africa/Abidjan\
    Greenwich Standard Time,GW,Africa/Bissau\
    Greenwich Standard Time,IS,Atlantic/Reykjavik\
    Greenwich Standard Time,LR,Africa/Monrovia\
    Greenwich Standard Time,ML,Africa/Abidjan\
    Greenwich Standard Time,MR,Africa/Abidjan\
    Greenwich Standard Time,SH,Africa/Abidjan\
    Greenwich Standard Time,SL,Africa/Abidjan\
    Greenwich Standard Time,SN,Africa/Abidjan\
    Greenwich Standard Time,TA,Atlantic/St_Helena\
    Greenwich Standard Time,TG,Africa/Abidjan\
    Haiti Standard Time,001,America/Port-au-Prince\
    Haiti Standard Time,HT,America/Port-au-Prince\
    Hawaiian Standard Time,001,Pacific/Honolulu\
    Hawaiian Standard Time,CK,Pacific/Rarotonga\
    Hawaiian Standard Time,PF,Pacific/Tahiti\
    Hawaiian Standard Time,UM,Pacific/Honolulu\
    Hawaiian Standard Time,US,Pacific/Honolulu\
    Hawaiian Standard Time,ZZ,Etc/GMT+10\
    India Standard Time,001,Asia/Kolkata\
    India Standard Time,IN,Asia/Kolkata\
    Iran Standard Time,001,Asia/Tehran\
    Iran Standard Time,IR,Asia/Tehran\
    Israel Standard Time,001,Asia/Jerusalem\
    Israel Standard Time,IL,Asia/Jerusalem\
    Jordan Standard Time,001,Asia/Amman\
    Jordan Standard Time,JO,Asia/Amman\
    Kaliningrad Standard Time,001,Europe/Kaliningrad\
    Kaliningrad Standard Time,RU,Europe/Kaliningrad\
    Kamchatka Standard Time,001,Asia/Kamchatka\
    Korea Standard Time,001,Asia/Seoul\
    Korea Standard Time,KR,Asia/Seoul\
    Libya Standard Time,001,Africa/Tripoli\
    Libya Standard Time,LY,Africa/Tripoli\
    Line Islands Standard Time,001,Pacific/Kiritimati\
    Line Islands Standard Time,KI,Pacific/Kiritimati\
    Line Islands Standard Time,ZZ,Etc/GMT-14\
    Lord Howe Standard Time,001,Australia/Lord_Howe\
    Lord Howe Standard Time,AU,Australia/Lord_Howe\
    Magadan Standard Time,001,Asia/Magadan\
    Magadan Standard Time,RU,Asia/Magadan\
    Magallanes Standard Time,001,America/Punta_Arenas\
    Magallanes Standard Time,AQ,Antarctica/Palmer\
    Magallanes Standard Time,CL,America/Punta_Arenas\
    Marquesas Standard Time,001,Pacific/Marquesas\
    Marquesas Standard Time,PF,Pacific/Marquesas\
    Mauritius Standard Time,001,Indian/Mauritius\
    Mauritius Standard Time,MU,Indian/Mauritius\
    Mauritius Standard Time,RE,Indian/Reunion\
    Mauritius Standard Time,SC,Indian/Mahe\
    Mid-Atlantic Standard Time,001,Etc/GMT+2\
    Middle East Standard Time,001,Asia/Beirut\
    Middle East Standard Time,LB,Asia/Beirut\
    Montevideo Standard Time,001,America/Montevideo\
    Montevideo Standard Time,UY,America/Montevideo\
    Morocco Standard Time,001,Africa/Casablanca\
    Morocco Standard Time,EH,Africa/El_Aaiun\
    Morocco Standard Time,MA,Africa/Casablanca\
    Mountain Standard Time (Mexico),001,America/Chihuahua\
    Mountain Standard Time (Mexico),MX,America/Chihuahua America/Mazatlan\
    Mountain Standard Time,001,America/Denver\
    Mountain Standard Time,CA,America/Edmonton America/Cambridge_Bay America/Inuvik America/Yellowknife\
    Mountain Standard Time,MX,America/Ojinaga\
    Mountain Standard Time,US,America/Denver America/Boise\
    Mountain Standard Time,ZZ,MST7MDT\
    Myanmar Standard Time,001,Asia/Yangon\
    Myanmar Standard Time,CC,Indian/Cocos\
    Myanmar Standard Time,MM,Asia/Yangon\
    N. Central Asia Standard Time,001,Asia/Novosibirsk\
    N. Central Asia Standard Time,RU,Asia/Novosibirsk\
    Namibia Standard Time,001,Africa/Windhoek\
    Namibia Standard Time,NA,Africa/Windhoek\
    Nepal Standard Time,001,Asia/Kathmandu\
    Nepal Standard Time,NP,Asia/Kathmandu\
    New Zealand Standard Time,001,Pacific/Auckland\
    New Zealand Standard Time,AQ,Pacific/Auckland\
    New Zealand Standard Time,NZ,Pacific/Auckland\
    Newfoundland Standard Time,001,America/St_Johns\
    Newfoundland Standard Time,CA,America/St_Johns\
    Norfolk Standard Time,001,Pacific/Norfolk\
    Norfolk Standard Time,NF,Pacific/Norfolk\
    North Asia East Standard Time,001,Asia/Irkutsk\
    North Asia East Standard Time,RU,Asia/Irkutsk\
    North Asia Standard Time,001,Asia/Krasnoyarsk\
    North Asia Standard Time,RU,Asia/Krasnoyarsk Asia/Novokuznetsk\
    North Korea Standard Time,001,Asia/Pyongyang\
    North Korea Standard Time,KP,Asia/Pyongyang\
    Omsk Standard Time,001,Asia/Omsk\
    Omsk Standard Time,RU,Asia/Omsk\
    Pacific SA Standard Time,001,America/Santiago\
    Pacific SA Standard Time,CL,America/Santiago\
    Pacific Standard Time (Mexico),001,America/Tijuana\
    Pacific Standard Time (Mexico),MX,America/Tijuana\
    Pacific Standard Time,001,America/Los_Angeles\
    Pacific Standard Time,CA,America/Vancouver America/Dawson America/Whitehorse\
    Pacific Standard Time,US,America/Los_Angeles\
    Pacific Standard Time,ZZ,PST8PDT\
    Pakistan Standard Time,001,Asia/Karachi\
    Pakistan Standard Time,PK,Asia/Karachi\
    Paraguay Standard Time,001,America/Asuncion\
    Paraguay Standard Time,PY,America/Asuncion\
    Romance Standard Time,001,Europe/Paris\
    Romance Standard Time,BE,Europe/Brussels\
    Romance Standard Time,DK,Europe/Copenhagen\
    Romance Standard Time,EA,Africa/Ceuta\
    Romance Standard Time,ES,Europe/Madrid Africa/Ceuta\
    Romance Standard Time,FR,Europe/Paris\
    Russia Time Zone 10,001,Asia/Srednekolymsk\
    Russia Time Zone 10,RU,Asia/Srednekolymsk\
    Russia Time Zone 11,001,Asia/Kamchatka\
    Russia Time Zone 11,RU,Asia/Kamchatka Asia/Anadyr\
    Russia Time Zone 3,001,Europe/Samara\
    Russia Time Zone 3,RU,Europe/Samara\
    Russian Standard Time,001,Europe/Moscow\
    Russian Standard Time,RU,Europe/Moscow Europe/Kirov Europe/Volgograd\
    Russian Standard Time,UA,Europe/Simferopol\
    SA Eastern Standard Time,001,America/Cayenne\
    SA Eastern Standard Time,AQ,Antarctica/Rothera\
    SA Eastern Standard Time,BR,America/Fortaleza America/Belem America/Maceio America/Recife America/Santarem\
    SA Eastern Standard Time,FK,Atlantic/Stanley\
    SA Eastern Standard Time,GF,America/Cayenne\
    SA Eastern Standard Time,SR,America/Paramaribo\
    SA Eastern Standard Time,ZZ,Etc/GMT+3\
    SA Pacific Standard Time,001,America/Bogota\
    SA Pacific Standard Time,BR,America/Rio_Branco America/Eirunepe\
    SA Pacific Standard Time,CA,America/Atikokan\
    SA Pacific Standard Time,CO,America/Bogota\
    SA Pacific Standard Time,EC,America/Guayaquil\
    SA Pacific Standard Time,JM,America/Jamaica\
    SA Pacific Standard Time,KY,America/Panama\
    SA Pacific Standard Time,PA,America/Panama\
    SA Pacific Standard Time,PE,America/Lima\
    SA Pacific Standard Time,ZZ,Etc/GMT+5\
    SA Western Standard Time,001,America/La_Paz\
    SA Western Standard Time,AG,America/Port_of_Spain\
    SA Western Standard Time,AI,America/Port_of_Spain\
    SA Western Standard Time,AW,America/Curacao\
    SA Western Standard Time,BB,America/Barbados\
    SA Western Standard Time,BL,America/Port_of_Spain\
    SA Western Standard Time,BO,America/La_Paz\
    SA Western Standard Time,BQ,America/Curacao\
    SA Western Standard Time,BR,America/Manaus America/Boa_Vista America/Porto_Velho\
    SA Western Standard Time,CA,America/Blanc-Sablon\
    SA Western Standard Time,CW,America/Curacao\
    SA Western Standard Time,DM,America/Port_of_Spain\
    SA Western Standard Time,DO,America/Santo_Domingo\
    SA Western Standard Time,GD,America/Port_of_Spain\
    SA Western Standard Time,GP,America/Port_of_Spain\
    SA Western Standard Time,GY,America/Guyana\
    SA Western Standard Time,KN,America/Port_of_Spain\
    SA Western Standard Time,LC,America/Port_of_Spain\
    SA Western Standard Time,MF,America/Port_of_Spain\
    SA Western Standard Time,MQ,America/Martinique\
    SA Western Standard Time,MS,America/Port_of_Spain\
    SA Western Standard Time,PR,America/Puerto_Rico\
    SA Western Standard Time,SX,America/Curacao\
    SA Western Standard Time,TT,America/Port_of_Spain\
    SA Western Standard Time,VC,America/Port_of_Spain\
    SA Western Standard Time,VG,America/Port_of_Spain\
    SA Western Standard Time,VI,America/Port_of_Spain\
    SA Western Standard Time,ZZ,Etc/GMT+4\
    SE Asia Standard Time,001,Asia/Bangkok\
    SE Asia Standard Time,AQ,Antarctica/Davis\
    SE Asia Standard Time,CX,Indian/Christmas\
    SE Asia Standard Time,ID,Asia/Jakarta Asia/Pontianak\
    SE Asia Standard Time,KH,Asia/Bangkok\
    SE Asia Standard Time,LA,Asia/Bangkok\
    SE Asia Standard Time,TH,Asia/Bangkok\
    SE Asia Standard Time,VN,Asia/Ho_Chi_Minh\
    SE Asia Standard Time,ZZ,Etc/GMT-7\
    Saint Pierre Standard Time,001,America/Miquelon\
    Saint Pierre Standard Time,PM,America/Miquelon\
    Sakhalin Standard Time,001,Asia/Sakhalin\
    Sakhalin Standard Time,RU,Asia/Sakhalin\
    Samoa Standard Time,001,Pacific/Apia\
    Samoa Standard Time,WS,Pacific/Apia\
    Sao Tome Standard Time,001,Africa/Sao_Tome\
    Sao Tome Standard Time,ST,Africa/Sao_Tome\
    Saratov Standard Time,001,Europe/Saratov\
    Saratov Standard Time,RU,Europe/Saratov\
    Singapore Standard Time,001,Asia/Singapore\
    Singapore Standard Time,BN,Asia/Brunei\
    Singapore Standard Time,ID,Asia/Makassar\
    Singapore Standard Time,MY,Asia/Kuala_Lumpur Asia/Kuching\
    Singapore Standard Time,PH,Asia/Manila\
    Singapore Standard Time,SG,Asia/Singapore\
    Singapore Standard Time,ZZ,Etc/GMT-8\
    South Africa Standard Time,001,Africa/Johannesburg\
    South Africa Standard Time,BI,Africa/Maputo\
    South Africa Standard Time,BW,Africa/Maputo\
    South Africa Standard Time,CD,Africa/Maputo\
    South Africa Standard Time,LS,Africa/Johannesburg\
    South Africa Standard Time,MW,Africa/Maputo\
    South Africa Standard Time,MZ,Africa/Maputo\
    South Africa Standard Time,RW,Africa/Maputo\
    South Africa Standard Time,SZ,Africa/Johannesburg\
    South Africa Standard Time,ZA,Africa/Johannesburg\
    South Africa Standard Time,ZM,Africa/Maputo\
    South Africa Standard Time,ZW,Africa/Maputo\
    South Africa Standard Time,ZZ,Etc/GMT-2\
    Sri Lanka Standard Time,001,Asia/Colombo\
    Sri Lanka Standard Time,LK,Asia/Colombo\
    Sudan Standard Time,001,Africa/Khartoum\
    Sudan Standard Time,SD,Africa/Khartoum\
    Syria Standard Time,001,Asia/Damascus\
    Syria Standard Time,SY,Asia/Damascus\
    Taipei Standard Time,001,Asia/Taipei\
    Taipei Standard Time,TW,Asia/Taipei\
    Tasmania Standard Time,001,Australia/Hobart\
    Tasmania Standard Time,AU,Australia/Hobart Australia/Currie\
    Tocantins Standard Time,001,America/Araguaina\
    Tocantins Standard Time,BR,America/Araguaina\
    Tokyo Standard Time,001,Asia/Tokyo\
    Tokyo Standard Time,ID,Asia/Jayapura\
    Tokyo Standard Time,JP,Asia/Tokyo\
    Tokyo Standard Time,PW,Pacific/Palau\
    Tokyo Standard Time,TL,Asia/Dili\
    Tokyo Standard Time,ZZ,Etc/GMT-9\
    Tomsk Standard Time,001,Asia/Tomsk\
    Tomsk Standard Time,RU,Asia/Tomsk\
    Tonga Standard Time,001,Pacific/Tongatapu\
    Tonga Standard Time,TO,Pacific/Tongatapu\
    Transbaikal Standard Time,001,Asia/Chita\
    Transbaikal Standard Time,RU,Asia/Chita\
    Turkey Standard Time,001,Europe/Istanbul\
    Turkey Standard Time,TR,Europe/Istanbul\
    Turks And Caicos Standard Time,001,America/Grand_Turk\
    Turks And Caicos Standard Time,TC,America/Grand_Turk\
    US Eastern Standard Time,001,America/Indiana/Indianapolis\
    US Eastern Standard Time,US,America/Indiana/Indianapolis America/Indiana/Marengo America/Indiana/Vevay\
    US Mountain Standard Time,001,America/Phoenix\
    US Mountain Standard Time,CA,America/Dawson_Creek America/Creston America/Fort_Nelson\
    US Mountain Standard Time,MX,America/Hermosillo\
    US Mountain Standard Time,US,America/Phoenix\
    US Mountain Standard Time,ZZ,Etc/GMT+7\
    UTC+12,001,Etc/GMT-12\
    UTC+12,KI,Pacific/Tarawa\
    UTC+12,MH,Pacific/Majuro Pacific/Kwajalein\
    UTC+12,NR,Pacific/Nauru\
    UTC+12,TV,Pacific/Funafuti\
    UTC+12,UM,Pacific/Wake\
    UTC+12,WF,Pacific/Wallis\
    UTC+12,ZZ,Etc/GMT-12\
    UTC+13,001,Etc/GMT-13\
    UTC+13,KI,Pacific/Enderbury\
    UTC+13,TK,Pacific/Fakaofo\
    UTC+13,ZZ,Etc/GMT-13\
    UTC,001,Etc/UTC\
    UTC,GL,America/Danmarkshavn\
    UTC,ZZ,Etc/UTC\
    UTC-02,001,Etc/GMT+2\
    UTC-02,BR,America/Noronha\
    UTC-02,GS,Atlantic/South_Georgia\
    UTC-02,ZZ,Etc/GMT+2\
    UTC-08,001,Etc/GMT+8\
    UTC-08,PN,Pacific/Pitcairn\
    UTC-08,ZZ,Etc/GMT+8\
    UTC-09,001,Etc/GMT+9\
    UTC-09,PF,Pacific/Gambier\
    UTC-09,ZZ,Etc/GMT+9\
    UTC-11,001,Etc/GMT+11\
    UTC-11,AS,Pacific/Pago_Pago\
    UTC-11,NU,Pacific/Niue\
    UTC-11,UM,Pacific/Pago_Pago\
    UTC-11,ZZ,Etc/GMT+11\
    Ulaanbaatar Standard Time,001,Asia/Ulaanbaatar\
    Ulaanbaatar Standard Time,MN,Asia/Ulaanbaatar Asia/Choibalsan\
    Venezuela Standard Time,001,America/Caracas\
    Venezuela Standard Time,VE,America/Caracas\
    Vladivostok Standard Time,001,Asia/Vladivostok\
    Vladivostok Standard Time,RU,Asia/Vladivostok Asia/Ust-Nera\
    W. Australia Standard Time,001,Australia/Perth\
    W. Australia Standard Time,AQ,Antarctica/Casey\
    W. Australia Standard Time,AU,Australia/Perth\
    W. Central Africa Standard Time,001,Africa/Lagos\
    W. Central Africa Standard Time,AO,Africa/Lagos\
    W. Central Africa Standard Time,BJ,Africa/Lagos\
    W. Central Africa Standard Time,CD,Africa/Lagos\
    W. Central Africa Standard Time,CF,Africa/Lagos\
    W. Central Africa Standard Time,CG,Africa/Lagos\
    W. Central Africa Standard Time,CM,Africa/Lagos\
    W. Central Africa Standard Time,DZ,Africa/Algiers\
    W. Central Africa Standard Time,GA,Africa/Lagos\
    W. Central Africa Standard Time,GQ,Africa/Lagos\
    W. Central Africa Standard Time,NE,Africa/Lagos\
    W. Central Africa Standard Time,NG,Africa/Lagos\
    W. Central Africa Standard Time,TD,Africa/Ndjamena\
    W. Central Africa Standard Time,TN,Africa/Tunis\
    W. Central Africa Standard Time,ZZ,Etc/GMT-1\
    W. Europe Standard Time,001,Europe/Berlin\
    W. Europe Standard Time,AD,Europe/Andorra\
    W. Europe Standard Time,AT,Europe/Vienna\
    W. Europe Standard Time,CH,Europe/Zurich\
    W. Europe Standard Time,DE,Europe/Berlin Europe/Zurich\
    W. Europe Standard Time,GI,Europe/Gibraltar\
    W. Europe Standard Time,IT,Europe/Rome\
    W. Europe Standard Time,LI,Europe/Zurich\
    W. Europe Standard Time,LU,Europe/Luxembourg\
    W. Europe Standard Time,MC,Europe/Monaco\
    W. Europe Standard Time,MT,Europe/Malta\
    W. Europe Standard Time,NL,Europe/Amsterdam\
    W. Europe Standard Time,NO,Europe/Oslo\
    W. Europe Standard Time,SE,Europe/Stockholm\
    W. Europe Standard Time,SJ,Europe/Oslo\
    W. Europe Standard Time,SM,Europe/Rome\
    W. Europe Standard Time,VA,Europe/Rome\
    W. Mongolia Standard Time,001,Asia/Hovd\
    W. Mongolia Standard Time,MN,Asia/Hovd\
    West Asia Standard Time,001,Asia/Tashkent\
    West Asia Standard Time,AQ,Antarctica/Mawson\
    West Asia Standard Time,KZ,Asia/Oral Asia/Aqtau Asia/Aqtobe Asia/Atyrau\
    West Asia Standard Time,MV,Indian/Maldives\
    West Asia Standard Time,TF,Indian/Kerguelen\
    West Asia Standard Time,TJ,Asia/Dushanbe\
    West Asia Standard Time,TM,Asia/Ashgabat\
    West Asia Standard Time,UZ,Asia/Tashkent Asia/Samarkand\
    West Asia Standard Time,ZZ,Etc/GMT-5\
    West Bank Standard Time,001,Asia/Hebron\
    West Bank Standard Time,PS,Asia/Hebron Asia/Gaza\
    West Pacific Standard Time,001,Pacific/Port_Moresby\
    West Pacific Standard Time,AQ,Antarctica/DumontDUrville\
    West Pacific Standard Time,FM,Pacific/Chuuk\
    West Pacific Standard Time,GU,Pacific/Guam\
    West Pacific Standard Time,MP,Pacific/Guam\
    West Pacific Standard Time,PG,Pacific/Port_Moresby\
    West Pacific Standard Time,ZZ,Etc/GMT-10\
    Yakutsk Standard Time,001,Asia/Yakutsk\
    Yakutsk Standard Time,RU,Asia/Yakutsk Asia/Khandyga';

    /**
     * convert IANA timezone format to windows timezone format.
     * @param ianaTimeZoneId IANA timezone format.
     * @returns windows timezone format.
     */
    public static ianaToWindows(ianaTimeZoneId: string): string {
        this.loadData();
        if (this.ianaToWindowsMap.has(ianaTimeZoneId)) {
            return this.ianaToWindowsMap.get(ianaTimeZoneId);
        }

        return ianaTimeZoneId;
    }

    /**
     * Convert windows timezone to iana timezone.
     * @param windowsTimeZoneId Windows timezone format.
     * @returns Iana timezone format.
     */
    public static windowsToIana(windowsTimeZoneId: string): string {
        this.loadData();
        if (this.windowsToIanaMap.has(`001|${windowsTimeZoneId}`)) {
            return this.windowsToIanaMap.get(`001|${windowsTimeZoneId}`);
        }

        return windowsTimeZoneId;
    }

    /**
     * Verify the string is windows timezone or iana string
     * @param timezoneStr time zone string
     * @returns is the string is time zone string
     */
    public static verifyTimeZoneStr(timezoneStr: string): boolean {
        this.loadData();

        return this.validTimezonStr.includes(timezoneStr);
    }

    /**
     * @private
     */
    private static loadData(): void {
        const data: string = this.mappingString;
        const lines: string[] = data.split(this.seperator);
        for (const line of lines) {
            const tokens: string[] = line.split(',');
            const windowsID: string = tokens[0];
            const territory: string = tokens[1];
            const ianaIDs: string[] = tokens[2].split(' ');
            for (const ianaID of ianaIDs) {
                if (!this.ianaToWindowsMap.has(ianaID)) {
                    this.ianaToWindowsMap.set(ianaID, windowsID);
                }

                if (!this.validTimezonStr.includes(ianaID)) {
                    this.validTimezonStr.push(ianaID);
                }
            }

            if (!this.windowsToIanaMap.has(`${territory}|${windowsID}`)) {
                this.windowsToIanaMap.set(`${territory}|${windowsID}`, ianaIDs[0]);
            }

            if (!this.validTimezonStr.includes(windowsID)) {
                this.validTimezonStr.push(windowsID);
            }
        }
    }
}
