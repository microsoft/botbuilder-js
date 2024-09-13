export declare namespace BasePhoneNumbers {
    const NumberReplaceToken = "@builtin.phonenumber";
    const GeneralPhoneNumberRegex = "(\\b(((\\d[\\s]?){7,15}\\d))(?!-)\\b)|(\\(\\d{5}\\)\\s?\\d{5,6})|\\+\\d{2}\\(\\d\\)\\d{10}";
    const BRPhoneNumberRegex = "(((\\B\\(\\s?))\\d{2,3}(\\s?\\))|(\\b\\d{2,3}))\\s?\\d{4,5}-?\\d{3,5}(?!-)\\b";
    const UKPhoneNumberRegex = "(((\\b(00)|\\B\\+)\\s?)?(\\b\\d{2}\\s?)?((\\s?\\(0\\)[-\\s]?|\\b|(?<=(\\b^#)\\d{2}))\\d{2,5}|\\(0\\d{3,4}\\))[/-]?\\s?(\\d{5,8}|\\d{3,4}[-\\s]?\\d{3,4})(?!-)\\b)";
    const DEPhoneNumberRegex = "((\\+\\d{2}\\s?((\\(0\\))?\\d\\s?)?|\\b)(\\d{2,4}\\s?[-/]?[\\s\\d]{7,10}\\d)(?!-)\\b)";
    const USPhoneNumberRegex = "((((\\B\\+)|\\b)1(\\s|-)?)|\\b)?(\\(\\d{3}\\)[-\\s]?|\\b\\d{3}\\s?[-\\.]?\\s?)\\d{3}\\s?[-\\.]?\\s?\\d{4}(\\s?(x|X|ext)\\s?\\d{3,5})?(?!-)\\b";
    const CNPhoneNumberRegex = "((\\b00\\s?)?\\+?86\\s?-?\\s?)?(((\\b|(?<=86))\\d{2,5}\\s?-?\\s?|\\(\\d{2,5}\\)\\s?)\\d{4}\\s?-?\\s?\\d{4}(\\s?-?\\s?\\d{4})?|(\\b|(?<=86))\\d{3}\\s?-?\\s?\\d{4}\\s?-?\\s?\\d{4})(?!-)\\b";
    const DKPhoneNumberRegex = "((\\(\\s?(\\+\\s?|00)45\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)45\\s?)|\\b)(\\s?\\(0\\)\\s?)?((\\d{8})|(\\d{4}\\s?-?\\s?\\d{4,6})|((\\d{2}[\\s-]){3}\\d{2})|(\\d{2}\\s?-?\\s?\\d{3}\\s?-?\\s?\\d{3}))(?!-)\\b";
    const ITPhoneNumberRegex = "((\\(\\s?(\\+\\s?|00)39\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)39\\s?)|\\b)((0[\\d\\s-]{4,12}\\d)|(3[\\d\\s-]{7,12}\\d))(?!-)\\b";
    const NLPhoneNumberRegex = "((((\\(\\s?(\\+\\s?|00)31\\s?\\)\\s?)|(((?<!\\d)\\+\\s?|\\b00)31\\s?))?(((\\b|(?<=31))0?\\d{1,3}|\\(\\s?0?\\d{1,3}\\s?\\)|\\(0\\)[-\\s]?\\d{1,3})\\s?-?[\\d\\s]{5,11}\\d))|\\b\\d{10,12})(?!-)\\b";
    const SpecialPhoneNumberRegex = "\\b(\\d{3,4}[/-]\\d{1,4}[/-]\\d{3,4})\\b";
    const TypicalDeductionRegexList: string[];
    const PhoneNumberMaskRegex = "([0-9A-E]{2}(\\s[0-9A-E]{2}){7})";
    const CountryCodeRegex = "^(\\(\\s?(\\+\\s?|00)\\d{1,3}\\s?\\)|(\\+\\s?|00)\\d{1,3})";
    const AreaCodeIndicatorRegex = "\\(";
    const FormatIndicatorRegex = "(\\s|-|/|\\.)+";
    const SeparatorCharList: string[];
}
