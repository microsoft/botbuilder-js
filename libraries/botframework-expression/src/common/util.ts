export abstract class Util {
    public static Trim(str: string, char: string) {
        if (char) {
            return str.replace(new RegExp("^\\" + char + "+|\\" + char + "+$", "g"), "");
        }
        return str.trim();
    }
}
