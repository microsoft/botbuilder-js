export declare namespace BaseURL {
    const ProtocolRegex = "((https?|ftp):\\/\\/)";
    const PortRegex = "(:\\d{1,5})";
    const ExtractionRestrictionRegex = "(?<=\\s|[\\'\"\"\\(\\[:]|^)";
    const UrlPrefixRegex: string;
    const UrlSuffixRegex: string;
    const UrlRegex: string;
    const UrlRegex2 = "((ht|f)tp(s?)\\:\\/\\/|www\\.)[0-9a-zA-Z]([-.\\w]*[0-9a-zA-Z])*(\\.(?<Tld>[0-9a-zA-Z]+))+(:(0-9)*)*(\\/?)([a-zA-Z0-9\\-\\.\\?\\,\\'\\/\\\\\\+&amp;%\\$#_=@]*)?";
    const IpUrlRegex: string;
    const TldList: string[];
}
