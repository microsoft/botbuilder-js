[Bot Builder SDK - Dialogs](../README.md) > [DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)



# Interface: DialogResult


Result returned to the caller of one of the various stack manipulation methods and used to return the result from a final call to `DialogContext.end()` to the bots logic.

## Type parameters
#### T 

## Properties
<a id="active"></a>

###  active

**●  active**:  *`boolean`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L19)*



This will be `true` if there is still an active dialog on the stack.




___

<a id="result"></a>

### «Optional» result

**●  result**:  *`T`* 

*Defined in [libraries/botbuilder-dialogs/lib/dialogContext.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-dialogs/lib/dialogContext.d.ts#L29)*



Result returned by a dialog that was just ended. This will only be populated in certain cases:

*   The bot calls `dc.begin()` to start a new dialog and the dialog ends immediately.
*   The bot calls `dc.continue()` and a dialog that was active ends.

In all cases where it's populated, [active](#active) will be `false`.




___


