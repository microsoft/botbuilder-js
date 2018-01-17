/**
 * @module botbuilder
 */
/** second comment block */

export interface LocalizedEntities {
    boolean_choices: string;
    number_exp: RegExp;
    number_terms: string;
    number_ordinals: string;
    number_reverse_ordinals: string;
}

/**
 * Finds the entity parsing rules for a specific locale.
 *
 * @param locale Users preferred locale.
 * @param defaultLocale (Optional) default locale to use if users locale isn't supported. This defaults to 'en'.
 */
export function find(locale: string, defaultLocale?: string): LocalizedEntities|undefined
{
    if (!defaultLocale) {
        defaultLocale = 'en';
    }
    if (!locale) {
        locale = defaultLocale;
    }
    const pos = locale.indexOf('-');
    const parentLocale = pos > 0 ? locale.substr(0, pos) : locale;
    return locales[locale] || locales[parentLocale] || locales[defaultLocale];
}
const locales: { [locale: string]: LocalizedEntities; } = {};

locales['en'] = {
    boolean_choices: "true=y,yes,yep,sure,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nope,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

locales['de'] = {
    boolean_choices: "true=y,yes,ja,richtig,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nein,falsch,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=null|1=eins|2=zwei|3=drei|4=vier|5=fünf|6=sechs|7=sieben|8=acht|9=neun|10=zehn|11=elf|12=zwölf|13=dreizehn|14=vierzehn|15=fünfzehn|16=sechzehn|17=siebzehn|18=achtzehn|19=neunzehn|20=zwanzig",
    number_ordinals: "1=1st,erste|2=2nd,2nd one,zweite|3=3rd,dritte|4=4th,vierte|5=5th,fünfte|6=6th,sechste|7=7th,siebte|8=8th,achte|9=9th,neunte|10=10th,zehnte",
    number_reverse_ordinals: "-1=letzte,zuletzt|-2=vorletzte,daneben, zweite von letzter|-3=dritter von letzter,drittel bis zum letzten|-4=vierte von letzter,vierte bis zuletzt|-5=fünfte vom letzten,fünfte bis zuletzt"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['es'] = {
    boolean_choices: "true=y,yes,s,sí,si,vale,ok,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,falso,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

locales['fr'] = {
    boolean_choices: "true=y,yes,oui,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,non,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zéro,zero|1=un,une|2=deux|3=trois|4=quatre|5=cinq|6=six|7=sept|8=huit|9=neuf|10=dix|11=onze|12=douze|13=treize|14=quatorze|15=quinze|16=seize|17=dix-sept|18=dix-huit|19=dix-neuf|20=vingt",
    number_ordinals: "1=1er,1re,premier,premiere,première|2=2e,2ème,2eme,deuxieme,deuxième,second,seconde|3=3e,3ème,3eme,troisieme,troisième|4=4e,4ème,4eme,quatrieme,quatrième|5=5e,5ème,5eme,cinquieme,cinquième|6=6e,6ème,6eme,sixieme,sixième|7=7e,7ème,7eme,septieme,septième|8=8e,8ème,8eme,huitieme,huitième|9=9e,9ème,9eme,neuvieme,neuvième|10=10e,10ème,10eme,dixieme,dixième",
    number_reverse_ordinals: "-1=dernier,derniere,dernière|-2=avant-dernier,avant-derniere,avant-dernière",
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['it'] = {
    boolean_choices: "true=y,yes,sì,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['nl'] = {
    boolean_choices: "true=y,yes,ja,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,nee,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['pt'] = {
    boolean_choices: "true=y,yes,sim,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,não,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['ru'] = {
    boolean_choices: "true=y,yes,да,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,нет,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['tr'] = {
    boolean_choices: "true=y,yes,evet,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,hayır,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};

// #LOCALIZE: number_terms, number_ordinals, number_reverse_ordinals
locales['zh-hans'] = {
    boolean_choices: "true=y,yes,\u662f,\u786e\u8ba4,\u662f\u7684,\u597d\u7684,\u597d,\u6ca1\u95ee\u9898,\u5bf9,\u5bf9\u7684,\uD83D\uDC4D,\uD83D\uDC4C|false=n,no,\u4e0d,\u4e0d\u662f,\u4e0d\u5bf9,\u4e0d\u77e5\u9053,\u4e0d\u884c,\uD83D\uDC4E,\u270B,\uD83D\uDD90",
    number_exp: /[+-]?(?:\d+\.?\d*|\d*\.?\d+)/ig,
    number_terms: "0=zero|1=one|2=two|3=three|4=four|5=five|6=six|7=seven|8=eight|9=nine|10=ten|11=eleven|12=twelve|13=thirteen|14=fourteen|15=fifteen|16=sixteen|17=seventeen|18=eighteen|19=nineteen|20=twenty",
    number_ordinals: "1=1st,first,first one|2=2nd,2nd one,second,second one|3=3rd,third|4=4th,fourth|5=5th,fifth|6=6th,sixth|7=7th,seventh|8=8th,eighth|9=9th,ninth|10=10th,tenth",
    number_reverse_ordinals: "-1=last,last one|-2=next to last,second to last,second from last|-3=third to last,third from last|-4=fourth to last,fourth from last|-5=fifth to last,fifth from last"
};
