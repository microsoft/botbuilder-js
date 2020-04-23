/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Templates } from './templates';

/**
 * Multi locale Template Manager for language generation. This template manager will enumerate multi-locale LG files and will select
 * the appropriate template using the current culture to perform template evaluation.
 */
export class MultiLanguageLG {
    public languagePolicy: Map<string, string[]>;
    public lgPerLocale: Map<string, Templates>;

    private readonly locales = [
        '','aa','aa-dj','aa-er','aa-et','af','af-na','af-za','agq','agq-cm','ak','ak-gh','am','am-et','ar','ar-001',
        'ar-ae','ar-bh','ar-dj','ar-dz','ar-eg','ar-er','ar-il','ar-iq','ar-jo','ar-km','ar-kw','ar-lb','ar-ly','ar-ma',
        'ar-mr','ar-om','ar-ps','ar-qa','ar-sa','ar-sd','ar-so','ar-ss','ar-sy','ar-td','ar-tn','ar-ye','arn','arn-cl',
        'as','as-in','asa','asa-tz','ast','ast-es','az','az-cyrl','az-cyrl-az','az-latn','az-latn-az','ba','ba-ru','bas',
        'bas-cm','be','be-by','bem','bem-zm','bez','bez-tz','bg','bg-bg','bin','bin-ng','bm','bm-latn','bm-latn-ml','bn',
        'bn-bd','bn-in','bo','bo-cn','bo-in','br','br-fr','brx','brx-in','bs','bs-cyrl','bs-cyrl-ba','bs-latn',
        'bs-latn-ba','byn','byn-er','ca','ca-ad','ca-es','ca-es-valencia','ca-fr','ca-it','ce','ce-ru','cgg','cgg-ug',
        'chr','chr-cher','chr-cher-us','co','co-fr','cs','cs-cz','cu','cu-ru','cy','cy-gb','da','da-dk','da-gl','dav',
        'dav-ke','de','de-at','de-be','de-ch','de-de','de-it','de-li','de-lu','dje','dje-ne','dsb','dsb-de','dua',
        'dua-cm','dv','dv-mv','dyo','dyo-sn','dz','dz-bt','ebu','ebu-ke','ee','ee-gh','ee-tg','el','el-cy','el-gr','en',
        'en-001','en-029','en-150','en-ag','en-ai','en-as','en-at','en-au','en-bb','en-be','en-bi','en-bm','en-bs',
        'en-bw','en-bz','en-ca','en-cc','en-ch','en-ck','en-cm','en-cx','en-cy','en-de','en-dk','en-dm','en-er','en-fi',
        'en-fj','en-fk','en-fm','en-gb','en-gd','en-gg','en-gh','en-gi','en-gm','en-gu','en-gy','en-hk','en-id','en-ie',
        'en-il','en-im','en-in','en-io','en-je','en-jm','en-ke','en-ki','en-kn','en-ky','en-lc','en-lr','en-ls','en-mg',
        'en-mh','en-mo','en-mp','en-ms','en-mt','en-mu','en-mw','en-my','en-na','en-nf','en-ng','en-nl','en-nr','en-nu',
        'en-nz','en-pg','en-ph','en-pk','en-pn','en-pr','en-pw','en-rw','en-sb','en-sc','en-sd','en-se','en-sg','en-sh',
        'en-si','en-sl','en-ss','en-sx','en-sz','en-tc','en-tk','en-to','en-tt','en-tv','en-tz','en-ug','en-um','en-us',
        'en-vc','en-vg','en-vi','en-vu','en-ws','en-za','en-zm','en-zw','eo','eo-001','es','es-419','es-ar','es-bo',
        'es-br','es-bz','es-cl','es-co','es-cr','es-cu','es-do','es-ec','es-es','es-gq','es-gt','es-hn','es-mx','es-ni',
        'es-pa','es-pe','es-ph','es-pr','es-py','es-sv','es-us','es-uy','es-ve','et','et-ee','eu','eu-es','ewo','ewo-cm',
        'fa','fa-ir','ff','ff-latn','ff-latn-bf','ff-latn-cm','ff-latn-gh','ff-latn-gm','ff-latn-gn','ff-latn-gw',
        'ff-latn-lr','ff-latn-mr','ff-latn-ne','ff-latn-ng','ff-latn-sl','ff-latn-sn','fi','fi-fi','fil','fil-ph','fo',
        'fo-dk','fo-fo','fr','fr-029','fr-be','fr-bf','fr-bi','fr-bj','fr-bl','fr-ca','fr-cd','fr-cf','fr-cg','fr-ch',
        'fr-ci','fr-cm','fr-dj','fr-dz','fr-fr','fr-ga','fr-gf','fr-gn','fr-gp','fr-gq','fr-ht','fr-km','fr-lu','fr-ma',
        'fr-mc','fr-mf','fr-mg','fr-ml','fr-mq','fr-mr','fr-mu','fr-nc','fr-ne','fr-pf','fr-pm','fr-re','fr-rw','fr-sc',
        'fr-sn','fr-sy','fr-td','fr-tg','fr-tn','fr-vu','fr-wf','fr-yt','fur','fur-it','fy','fy-nl','ga','ga-ie','gd',
        'gd-gb','gl','gl-es','gn','gn-py','gsw','gsw-ch','gsw-fr','gsw-li','gu','gu-in','guz','guz-ke','gv','gv-im','ha',
        'ha-latn','ha-latn-gh','ha-latn-ne','ha-latn-ng','haw','haw-us','he','he-il','hi','hi-in','hr','hr-ba','hr-hr',
        'hsb','hsb-de','hu','hu-hu','hy','hy-am','ia','ia-001','ibb','ibb-ng','id','id-id','ig','ig-ng','ii','ii-cn',
        'is','is-is','it','it-ch','it-it','it-sm','it-va','iu','iu-cans','iu-cans-ca','iu-latn','iu-latn-ca','ja',
        'ja-jp','jgo','jgo-cm','jmc','jmc-tz','jv','jv-java','jv-java-id','jv-latn','jv-latn-id','ka','ka-ge','kab',
        'kab-dz','kam','kam-ke','kde','kde-tz','kea','kea-cv','khq','khq-ml','ki','ki-ke','kk','kk-kz','kkj','kkj-cm',
        'kl','kl-gl','kln','kln-ke','km','km-kh','kn','kn-in','ko','ko-kp','ko-kr','kok','kok-in','kr','kr-latn',
        'kr-latn-ng','ks','ks-arab','ks-arab-in','ks-deva','ks-deva-in','ksb','ksb-tz','ksf','ksf-cm','ksh','ksh-de',
        'ku','ku-arab','ku-arab-iq','ku-arab-ir','kw','kw-gb','ky','ky-kg','la','la-001','lag','lag-tz','lb','lb-lu',
        'lg','lg-ug','lkt','lkt-us','ln','ln-ao','ln-cd','ln-cf','ln-cg','lo','lo-la','lrc','lrc-iq','lrc-ir','lt',
        'lt-lt','lu','lu-cd','luo','luo-ke','luy','luy-ke','lv','lv-lv','mas','mas-ke','mas-tz','mer','mer-ke','mfe',
        'mfe-mu','mg','mg-mg','mgh','mgh-mz','mgo','mgo-cm','mi','mi-nz','mk','mk-mk','ml','ml-in','mn','mn-cyrl',
        'mn-mn','mn-mong','mn-mong-cn','mn-mong-mn','mni','mni-in','moh','moh-ca','mr','mr-in','ms','ms-bn','ms-my',
        'ms-sg','mt','mt-mt','mua','mua-cm','my','my-mm','mzn','mzn-ir','naq','naq-na','nb','nb-no','nb-sj','nd','nd-zw',
        'nds','nds-de','nds-nl','ne','ne-in','ne-np','nl','nl-aw','nl-be','nl-bq','nl-cw','nl-nl','nl-sr','nl-sx','nmg',
        'nmg-cm','nn','nn-no','nnh','nnh-cm','no','nqo','nqo-gn','nr','nr-za','nso','nso-za','nus','nus-ss','nyn',
        'nyn-ug','oc','oc-fr','om','om-et','om-ke','or','or-in','os','os-ge','os-ru','pa','pa-arab','pa-arab-pk',
        'pa-guru','pa-in','pap','pap-029','pl','pl-pl','prg','prg-001','prs','prs-af','ps','ps-af','pt','pt-ao','pt-br',
        'pt-ch','pt-cv','pt-gq','pt-gw','pt-lu','pt-mo','pt-mz','pt-pt','pt-st','pt-tl','quc','quc-latn','quc-latn-gt',
        'quz','quz-bo','quz-ec','quz-pe','rm','rm-ch','rn','rn-bi','ro','ro-md','ro-ro','rof','rof-tz','ru','ru-by',
        'ru-kg','ru-kz','ru-md','ru-ru','ru-ua','rw','rw-rw','rwk','rwk-tz','sa','sa-in','sah','sah-ru','saq','saq-ke',
        'sbp','sbp-tz','sd','sd-arab','sd-arab-pk','sd-deva','sd-deva-in','se','se-fi','se-no','se-se','seh','seh-mz',
        'ses','ses-ml','sg','sg-cf','shi','shi-latn','shi-latn-ma','shi-tfng','shi-tfng-ma','si','si-lk','sk','sk-sk',
        'sl','sl-si','sma','sma-no','sma-se','smj','smj-no','smj-se','smn','smn-fi','sms','sms-fi','sn','sn-latn',
        'sn-latn-zw','so','so-dj','so-et','so-ke','so-so','sq','sq-al','sq-mk','sq-xk','sr','sr-cyrl','sr-cyrl-ba',
        'sr-cyrl-me','sr-cyrl-rs','sr-cyrl-xk','sr-latn','sr-latn-ba','sr-latn-me','sr-latn-rs','sr-latn-xk','ss',
        'ss-sz','ss-za','ssy','ssy-er','st','st-ls','st-za','sv','sv-ax','sv-fi','sv-se','sw','sw-cd','sw-ke','sw-tz',
        'sw-ug','syr','syr-sy','ta','ta-in','ta-lk','ta-my','ta-sg','te','te-in','teo','teo-ke','teo-ug','tg','tg-cyrl',
        'tg-cyrl-tj','th','th-th','ti','ti-er','ti-et','tig','tig-er','tk','tk-tm','tn','tn-bw','tn-za','to','to-to',
        'tr','tr-cy','tr-tr','ts','ts-za','tt','tt-ru','twq','twq-ne','tzm','tzm-arab','tzm-arab-ma','tzm-latn',
        'tzm-latn-dz','tzm-latn-ma','tzm-tfng','tzm-tfng-ma','ug','ug-cn','uk','uk-ua','ur','ur-in','ur-pk','uz',
        'uz-arab','uz-arab-af','uz-cyrl','uz-cyrl-uz','uz-latn','uz-latn-uz','vai','vai-latn','vai-latn-lr','vai-vaii',
        'vai-vaii-lr','ve','ve-za','vi','vi-vn','vo','vo-001','vun','vun-tz','wae','wae-ch','wal','wal-et','wo','wo-sn',
        'xh','xh-za','xog','xog-ug','yav','yav-cm','yi','yi-001','yo','yo-bj','yo-ng','zgh','zgh-tfng','zgh-tfng-ma',
        'zh','zh-cn','zh-hans','zh-hans-hk','zh-hans-mo','zh-hant','zh-hk','zh-mo','zh-sg','zh-tw','zu','zu-za'];

    /**
     * Initializes a new instance of the MultiLanguageLG class.
     * @param templatesPerLocale A map of LG file templates per locale.
     * @param filePerLocale A map of locale and LG file.
     * @param defaultLanguage Default language.
     */
    public constructor(templatesPerLocale: Map<string, Templates> | undefined, filePerLocale: Map<string, string> | undefined, defaultLanguage?: string) {
        if (templatesPerLocale !== undefined) {
            this.lgPerLocale = templatesPerLocale;
        } else if (filePerLocale === undefined){
            throw new Error(`input is empty`);
        } else {
            this.lgPerLocale = new Map<string, Templates>();
            for (const item of filePerLocale.entries()) {
                this.lgPerLocale.set(item[0], Templates.parseFile(item[1]));
            }
        }

        let defaultLanguageArray = defaultLanguage === undefined ? [''] : [defaultLanguage];
        this.languagePolicy = this.getDefaultPolicy(defaultLanguageArray);
    }

    /**
     * Generate template evaluate result.
     * @param template Template name.
     * @param data Scope data.
     * @param locale Locale info.
     */
    public generate(template: string, data?: object, locale?: string): any {
        if (!template) {
            throw new Error('template is empty');
        }

        if (!locale) {
            locale = '';
        }

        if (this.lgPerLocale.has(locale)) {
            return this.lgPerLocale.get(locale).evaluate(template, data);
        }

        let fallbackLocales: string[] = [];

        if (this.languagePolicy.has(locale)) {
            fallbackLocales.push(...this.languagePolicy.get(locale));
        }

        if (locale !== '' && this.languagePolicy.has('')) {
            fallbackLocales.push(...this.languagePolicy.get(''));
        }

        if (fallbackLocales.length === 0) {
            throw new Error(`No supported language found for ${ locale }`);
        }



        for (const fallBackLocale of fallbackLocales) {
            if (this.lgPerLocale.has(fallBackLocale)) {
                return this.lgPerLocale.get(fallBackLocale).evaluate(template, data);
            }
        }

        throw new Error(`No LG responses found for locale: ${ locale }`);
    }

    private  getDefaultPolicy(defaultLanguages: string[]): Map<string, string[]> {
        if (defaultLanguages === undefined) {
            defaultLanguages = [''];
        }

        var result = new Map<string, string[]>();
        for (const locale of this.locales) {
            let lang = locale.toLowerCase();
            const fallback: string[] = [];
            while (lang) {
                fallback.push(lang);
                const i = lang.lastIndexOf('-');
                if (i > 0) {
                    lang = lang.substr(0, i);
                } else {
                    break;
                }
            }

            if (locale === '') {
                // here we set the default
                fallback.push(...defaultLanguages);
            }
            result.set(locale, fallback);
        }
    
        return result;
    }
}
