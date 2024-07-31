export declare namespace BaseNumbers {
    const NumberReplaceToken = "@builtin.num";
    const FractionNumberReplaceToken = "@builtin.num.fraction";
    const IntegerRegexDefinition: (placeholder: string, thousandsmark: string) => string;
    const FractionNotationRegex = "((((?<=\\W|^)-\\s*)|(?<![/-])(?<=\\b))\\d+[/]\\d+(?=(\\b[^/]|$))|[\\u00BC-\\u00BE\\u2150-\\u215E])";
    const DoubleRegexDefinition: (placeholder: string, thousandsmark: string, decimalmark: string) => string;
    const PlaceHolderDefault = "(?=\\D)|\\b";
    const PlaceHolderMixed = "\\D|\\b";
    const CaseSensitiveTerms = "(?<=(\\s|\\d))(kB|K[Bb]?|M[BbM]?|G[Bb]?|B)\\b";
    const NumberMultiplierRegex = "(K|k|MM?|mil|G|T|B|b)";
    const MultiplierLookupRegex = "(k|m(il|m)?|t|g|b)";
    const CurrencyRegex = "(((?<=\\W|^)-\\s*)|(?<=\\b))\\d+\\s*(b|m|t|g)(?=\\b)";
    const CommonCurrencySymbol = "(\u00A5|\\$|\u20AC|\u00A3|\u20A9)";
}
