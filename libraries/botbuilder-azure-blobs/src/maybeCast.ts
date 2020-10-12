import { Newable } from 'ts-essentials';

/**
 * Maybe cast value to a particular type
 * @param value value to maybe cast
 * @param ctor optional class to perform instanceof check
 */
export function maybeCast<T>(value: unknown, ctor?: Newable<T>): T {
    if (ctor != null && value instanceof ctor) {
        return value;
    }

    return value as T;
}
