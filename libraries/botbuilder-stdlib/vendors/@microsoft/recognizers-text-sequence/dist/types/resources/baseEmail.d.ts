export declare namespace BaseEmail {
    const EmailRegex = "(([-a-zA-Z0-9_\\+\\.]+)@([-a-zA-Z\\d\\.]+)\\.([a-zA-Z\\.]{2,6}))";
    const IPv4Regex = "(?<ipv4>(\\d{1,3}\\.){3}\\d{1,3})";
    const NormalSuffixRegex = "(([0-9A-Za-z][-]*[0-9A-Za-z]*\\.)+(?<tld>[a-zA-Z][\\-a-zA-Z]{0,22}[a-zA-Z]))";
    const EmailPrefix = "(?(\"\")(\"\".+?(?<!\\\\)\"\")|(([0-9A-Za-z]((\\.(?!\\.))|[-!#\\$%&'\\*\\+/=\\?\\^\\{\\}\\|~\\w])*)(?<=[0-9A-Za-z])))";
    const EmailSuffix: string;
    const EmailRegex2: string;
}
