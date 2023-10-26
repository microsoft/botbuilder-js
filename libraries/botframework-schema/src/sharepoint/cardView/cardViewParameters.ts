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

/**
 * The parameters for the card view with text input in the body.
 */
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

/**
 * The parameters for the search card view.
 */
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
 * The parameters for the sign in card view.
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

/**
 * Card View Parameters.
 */
export type CardViewParameters =
    | TextCardViewParameters
    | TextInputCardViewParameters
    | SearchCardViewParameters
    | SignInCardViewParameters;

/**
 * Helper method to create a Basic Card View.
 * The Basic Text card view displays the following:
 * - Card bar
 * - One primary text field
 * - Zero or one button in the Medium card size, up to two buttons in Large card size; or text input.
 *
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param footer - up to two buttons or text input to display as footer
 * @returns basic card view parameters.
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
        footer: footer,
    };
}

/**
 * Helper method to create a Primary Text Card View.
 * The Primary Text card view displays the following:
 * - Card bar
 * - One primary text field
 * - One description text field
 * - Zero or one button in the Medium card size, up to two buttons in Large card size; or text input.
 *
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param body - text component to display as body
 * @param footer - up to two buttons or text input to display as footer
 * @returns primary text card view parameters.
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
        footer: footer,
    };
}

/**
 * Helper method to create an Image Card View.
 * The Image Card view displays the following:
 * - Card bar
 * - One primary text field
 * - One image
 * - Zero buttons in the Medium card size, up to two buttons in Large card size; or text input.
 *
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param image - image to display
 * @param footer - up to two buttons or text input to display as footer
 * @returns image card view parameters
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
        footer: footer,
    };
}

/**
 * Helper method to create an Text Input Card View.
 * The Text Input Card view displays the following:
 * - Card bar
 * - One primary text field
 * - Zero or one image
 * - Zero text input in Medium card size if image is presented, one text input in Medium card size if no image is presented, one text input in Large card size
 * - Zero buttons in the Medium card size if image is presented, one button in Medium card size if no image is presented, up to two buttons in Large card size; or text input.
 *
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param body - text input component to display as body
 * @param footer - up to two buttons to display as footer
 * @returns text input card view parameters
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
        footer: footer,
    };
}

/**
 * Helper method to create a Search Card View.
 * The Search Card view displays the following:
 * - Card bar
 * - One primary text field
 * - One search box
 * - One search footer
 *
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param body - search box component to display as body
 * @param footer - search footer component to display as footer
 * @returns search card view parameters
 */
export function SearchCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    body: CardSearchBoxComponent,
    footer: CardSearchFooterComponent
): SearchCardViewParameters {
    return {
        cardViewType: 'search',
        cardBar: [cardBar],
        header: [header],
        body: [body],
        footer: [footer],
    };
}

/**
 * Helper method to create a Sign In Card View.
 * The Sign In Card view displays the following:
 * - Card bar
 * - One primary text field
 * - One description text field
 * - Two buttons.
 *
 * @remarks The first button (sign in button) is always displayed based on the signInText property of the Adaptive Card Extension. Here you should specify the second button (sign in complete button) to display.
 * @param cardBar - card bar component
 * @param header - text component to display as header
 * @param body - text component to display as body
 * @param footer - sign in complete button to display as footer
 * @returns sign in card view parameters
 */
export function SignInCardView(
    cardBar: CardBarComponent,
    header: CardTextComponent,
    body: CardTextComponent,
    footer: CardButtonComponent
): SignInCardViewParameters {
    return {
        cardViewType: 'signIn',
        cardBar: [cardBar],
        header: [header],
        body: [body],
        footer: [footer],
    };
}
