/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * The date time recognizer can recognize a wide variety of time expressions.
 *
 * @summary
 * The LUIS recognizer handles time expressions like "next monday" and extracts them into objects with a
 * type and an array of timex expressions.
 *
 * More information on timex can be found here: http://www.timeml.org/publications/timeMLdocs/timeml_1.2.1.html#timex3
 *
 * More information on the library which does the recognition can be found here: https://github.com/Microsoft/Recognizers-Text
 */
export interface DateTimeSpec {
    /**
     * Type of expression.
     *
     * @summary
     * Example types include:
     *
     * - **time**: simple time expression like "3pm".
     * - **date**: simple date like "july 3rd".
     * - **datetime**: combination of date and time like "march 23 2pm".
     * - **timerange**: a range of time like "2pm to 4pm".
     * - **daterange**: a range of dates like "march 23rd to 24th".
     * - **datetimerange**: a range of dates and times like "july 3rd 2pm to 5th 4pm".
     * - **set**: a recurrence like "every monday".
     */
    type: string;

    /**
     * Timex expressions
     */
    timex: string[];
}
