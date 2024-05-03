export declare namespace GermanChoice {
    const LangMarker = "Ger";
    const TokenizerRegex = "[^\\w\\d\\u00E0-\\u00FC]";
    const TrueRegex = "\\b(wahr|ja|jep|j|sicher|ok|einverstanden|mit\\s+Sicherheit|sicherlich|jap|mache ich)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)";
    const FalseRegex = "\\b(falsch|nein|ne|nö|nicht\\s+ok|nicht\\s+einverstanden|n)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)";
}
