export declare namespace ChineseChoice {
    const LangMarker = "Chs";
    const TokenizerRegex = "[^\\u3040-\\u30ff\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\uff66-\\uff9f]";
    const TrueRegex = "(好[的啊呀嘞哇]|没问题|可以|中|好|同意|行|是的|是|对)|(\\uD83D\\uDC4D|\\uD83D\\uDC4C)";
    const FalseRegex = "(不行|不好|拒绝|否定|不中|不可以|不是的|不是|不对|不)|(\\uD83D\\uDC4E|\\u270B|\\uD83D\\uDD90)";
}
