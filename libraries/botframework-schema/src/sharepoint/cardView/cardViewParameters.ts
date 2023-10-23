// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CardImage } from './cardImage';
import { CardBarComponent } from './cardBarComponent';
import { CardButtonComponent } from './cardButtonComponent';
import { CardSearchBoxComponent } from './cardSearchBoxComponent';
import { CardSearchFooterComponent } from './cardSearchFooterComponent';
import { CardTextComponent } from './cardTextComponent';
import { CardTextInputComponent } from './cardTextInputComponent';

/**
 * The actions-only footer parameters for the card view.
 */
export type CardViewActionsFooterParameters =
    | [CardButtonComponent]
    | [CardButtonComponent, CardButtonComponent]
    | undefined;

/**
 * The footer parameters for the card view. Can contain either 0 to 2 buttons or a single text input.
 */
export type CardViewFooterParameters = CardViewActionsFooterParameters | [CardTextInputComponent];

/**
 * Base parameters for the card view.
 */
export interface BaseCardViewParameters {
    /**
     * Card view title area (card bar) components.
     */
    cardBar: [CardBarComponent];
}

/**
* The parameters for the card view with text or empty body.
*/
export interface TextCardViewParameters extends BaseCardViewParameters {
    /**
     * Card View type
     */
    cardViewType: 'text';
    /**
     * Header area components.
     */
    header: [CardTextComponent];
    /**
     * Body area components.
     */
    body: [CardTextComponent] | undefined;
    /**
     * Footer area components.
     */
    footer?: CardViewFooterParameters;

    /**
     * Image displayed on the card.
     */
    image?: CardImage;
}

export interface TextInputCardViewParameters extends BaseCardViewParameters {
    /**
     * Card View type
     */
    cardViewType: 'textInput';
    /**
     * Header area components.
     */
    header: [CardTextComponent];
    /**
     * Body area components.
     */
    body: [CardTextInputComponent];
    /**
     * Footer area components.
     */
    footer?: CardViewActionsFooterParameters;
    /**
     * Image displayed on the card.
     */
    image?: CardImage;
}

export interface SearchCardViewParameters extends BaseCardViewParameters {
    /**
     * Card View type
     */
    cardViewType: 'search';
    /**
     * Header area components. Contains a single text field.
     */
    header: [CardTextComponent];
    /**
     * Body area components. Contains a single search box.
     */
    body: [CardSearchBoxComponent];
    /**
     * Footer area components. Contains a single search footer.
     */
    footer?: [CardSearchFooterComponent];
}

/**
* The parameters for the card view with text or empty body.

*/
export interface SignInCardViewParameters extends BaseCardViewParameters {
    /**
     * Card View type
     */
    cardViewType: 'signIn';
    /**
     * Header area components.
     */
    header: [CardTextComponent];
    /**
     * Body area components.
     */
    body: [CardTextComponent] | undefined;
    /**
     * Footer area components.
     */
    footer?: [CardButtonComponent];
}

export type CardViewParameters = TextCardViewParameters | TextInputCardViewParameters | SearchCardViewParameters | SignInCardViewParameters;

/**
* Helper method to create a Basic Card View.
* @param configuration - basic card view configuration.
*/
export function BasicCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    footer?: CardViewFooterParameters
): TextCardViewParameters {
    return {
        cardViewType: 'text',
        body: undefined,
        cardBar: [cardBar],
        header: [header],
        footer: footer
    };
}

/**
 * Helper method to create a Primary Text Card View.
 * @param configuration - primary text card view configuration.
 */
export function PrimaryTextCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    body: CardTextComponent,
    footer?: CardViewFooterParameters
): TextCardViewParameters {
    return {
        cardViewType: 'text',
        cardBar: [cardBar],
        header: [header],
        body: [body],
        footer: footer
    };
}

/**
 * Helper method to create an Image Card View.
 * @param configuration - image card view configuration.
 */
export function ImageCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    image: CardImage,
    footer?: CardViewFooterParameters
): TextCardViewParameters {
    return {
        cardViewType: 'text',
        image: image,
        cardBar: [cardBar],
        header: [header],
        body: undefined,
        footer: footer
    };
}

/**
 * Helper method to create an Text Input Card View.
 * @param configuration - text input card view configuration.
 */
export function TextInputCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    body: CardTextInputComponent,
    footer?: CardViewActionsFooterParameters
): TextInputCardViewParameters {
    return {
        cardViewType: 'textInput',
        cardBar: [cardBar],
        header: [header],
        body: [body],
        footer: footer
    };
}

export function SignInCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    body: CardTextComponent,
    footer: [CardButtonComponent]
): SignInCardViewParameters {
    return {
        cardViewType: 'signIn',
        cardBar: [cardBar],
        header: [header],
        body: [body],
        footer: footer
    };
}