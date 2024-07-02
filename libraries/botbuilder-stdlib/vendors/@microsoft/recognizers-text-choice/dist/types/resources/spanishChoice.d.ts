export declare namespace SpanishChoice {
    const LangMarker = "Spa";
    const TokenizerRegex = "[^\\w\\d\\u00E0-\\u00FC]";
    const TrueRegex = "\\b(verdad|verdadero|sí|sip|s|si|cierto|por supuesto|ok)\\b|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)";
    const FalseRegex = "\\b(falso|no|nop|n|no)\\b|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)";
}
