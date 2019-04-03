/**
 * util class
 */
export class Util {
    public static Trim(str: string, char: string): string{
        if (char !== undefined) {
            return str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
        }

        return str.trim();
    }
}
