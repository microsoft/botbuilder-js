export declare namespace FrenchChoice {
    const LangMarker = "Fr";
    const TokenizerRegex = "[^\\w\\d\\u00E0-\\u00FC]";
    const TrueRegex = "\\b(s[uû]r|ouais|oui|yep|y|sure|approuver|accepter|consentir|d'accord|ça march[eé])\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)";
    const FalseRegex = "\\b(faux|nan|non|pas\\s+d'accord|pas\\s+concorder|n'est\\s+pas\\s+(correct|ok)|pas)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)";
}
