export declare namespace JapaneseChoice {
    const LangMarker = "Jpn";
    const TokenizerRegex = "[^\\w\\d\\u3040-\\u309f\\u30a0-\\u30ff\\uff00-\\uff9f\\u4e00-\\u9faf\\u3400-\\u4dbf]";
    const TrueRegex = "(はい(！)*|そうです|よい(です)*)|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)";
    const FalseRegex = "(いいえ|ではありません|ではない|じゃない|じゃありません)|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)";
}
