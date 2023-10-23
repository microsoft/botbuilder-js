// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Names of the components allowed in a card view.
 */
export type CardComponentName =
  | 'text'
  | 'cardButton'
  | 'cardBar'
  | 'textInput'
  | 'searchBox'
  | 'searchFooter';

/**
 * Base card view component.
 *
 * @public
 */
export interface BaseCardComponent {
  /**
   * Unique component name.
   * For example, "textInput"
   */
  componentName: CardComponentName;
  /**
   * Optional unique identifier of the component's instance.
   */
  id?: string;
}
