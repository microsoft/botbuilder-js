// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * Confirmation Dialog option that is passed through `Submit` Action is executed.
 */
export interface ConfirmationDialog {
    /**
     * Dialog title.
     */
    title: string;

    /**
     * Dialog message.
     */
    message: string;
}

/**
 * Interface for location coordinates
 */
export interface Location {
    /**
     * Latitude of the location.
     */
    latitude: number;

    /**
     * Longitude of the location.
     */
    longitude: number;

    /**
     * Timestamp
     */
    timestamp?: number;

    /**
     * Accuracy of the location.
     */
    accuracy?: number;
}

/**
 * Enum value to specify the type of media.
 */
export enum MediaType {
    Image = 1,
    Audio = 4,
    Document = 8
}

/**
 * Open the quick view.
 */
export interface QuickViewCardAction {
    /**
     * Indicates this action opens the quick view.
     */
    type: 'QuickView';

    /**
     * Parameters for the quick view opened by this action
     */
    parameters: QuickViewParameters;
}

/**
 * Parameters for opening a Quick view.
 */
export interface QuickViewParameters {
    /**
     * The view of the Quick view to open.
     */
    view: string;
}

/**
* Open an external link.
*/
export interface ExternalLinkCardAction {
    /**
     * Indicates this is an external link button.
     */
    type: 'ExternalLink';

    /**
     * Parameters for the external link.
     */
    parameters: ExternalLinkActionParameters;
}

/**
 * Parameters for opening an external link.
 */
export interface ExternalLinkActionParameters {
    /**
     * Indicates whether this is a Teams Deep Link.
     */
    isTeamsDeepLink?: boolean;

    /**
     * The URL of the link.
     */
    target: string;
}

/**
 * Invoke an `Action.Submit` event.
 */
export interface SubmitCardAction {
    /**
     * Indicates this is a Submit button.
     */
    type: 'Submit';

    /**
     * Parameters passed to the Submit event handler.
     */
    parameters: SubmitCardParameters;

    /**
     * Confirmation dialog option passed to the submit handler.
     */
    confirmationDialog?: ConfirmationDialog;
}

/**
 * Invoke an `Action.Execute` event.
 */
export interface ExecuteCardAction {
    /**
     * Indicates this is an Execute button.
     */
    type: 'Execute';

    /**
     * Verb associated with this action
     */
    verb?: string;

    /**
     * Parameters passed to the Execute event handler
     */
    parameters: ExecuteCardParameters;
}

/**
 * Parameters for Execute card action.
 */
export interface ExecuteCardParameters {
    /**
     * Key value pair property that can be defined for execute card action parameters.
     */
    [key: string]: unknown;
}

/**
 * Parameters for submit card action.
 */
export interface SubmitCardParameters {
    /**
     * Key value pair property that can be defined for submit card action parameters.
     */
    [key: string]: unknown;
}

/**
 * Invoke an `VivaAction.SelectMedia` event.
 */
export interface SelectMediaCardAction {
    /**
     * Indicates this is a Viva Select Media button.
     */
    type: 'VivaAction.SelectMedia';

    /**
     * Parameters for the Select Media Action
     */
    parameters: SelectMediaActionParameters;
}

/**
 * Parameters that can be supplied with the Viva Select Media Action.
 */
export interface SelectMediaActionParameters {
    /**
     * Specify the specific media type that should be selected
     */
    mediaType: MediaType;

    /**
     * Allow multiple images to be selected.
     */
    allowMultipleCapture?: boolean;

    /**
     * Max file size that can be uploaded.
     */
    maxSizePerFile?: number;

    /**
     * File formats supported for upload.
     */
    supportedFileFormats?: string[];
}

/**
 * Invoke an `VivaAction.ShowLocation` event.
 */
export interface ShowLocationCardAction {
    /**
     * Indicates this is a Viva show Location button.
     */
    type: 'VivaAction.ShowLocation';
    /**
     * Parameters that can be supplied with the Viva Show Location Action.
     */
    parameters?: ShowLocationActionParameters;
}

/**
 * Parameters that can be supplied with the Viva Show Location Action.
 */
export interface ShowLocationActionParameters {
    /**
     * If set, show the coordinates that were passed.
     * Otherwise, show the current location.
     */
    locationCoordinates?: Location;
}

/**
 * Invoke an `VivaAction.GetLocation` event.
 */
export interface GetLocationCardAction {
    /**
     * Indicates this is a Viva Select Location button.
     */
    type: 'VivaAction.GetLocation';
    /**
     * Parameters that can be supplied with the Viva Get Location Action.
     */
    parameters?: GetLocationActionParameters;
}

/**
 * Parameters that can be supplied with the Viva Get Location Action.
 */
export interface GetLocationActionParameters {
    /**
     * If true, allow the user to choose a location by opening a map.
     * Otherwise, get the current location.
     */
    chooseLocationOnMap?: boolean;
}

/**
 * Type of handler for when a button is pressed.
 */
export type CardAction =
    | QuickViewCardAction
    | ExternalLinkCardAction
    | SubmitCardAction
    | SelectMediaCardAction
    | GetLocationCardAction
    | ShowLocationCardAction
    | ExecuteCardAction;

export type OnCardSelectionAction = QuickViewCardAction
    | ExternalLinkCardAction
    | SelectMediaCardAction
    | GetLocationCardAction
    | ShowLocationCardAction
    | ExecuteCardAction
    | undefined;