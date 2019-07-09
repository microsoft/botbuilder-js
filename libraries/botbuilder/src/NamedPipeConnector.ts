/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityHandler, MiddlewareHandler, Middleware } from 'botbuilder-core';
import { BotFrameworkAdapterSettings } from './botFrameworkAdapter';
import { StreamingRequestHandler } from './StreamingRequestHandler';

export class NamedPipeConnector {
/*  The default named pipe all instances of DL ASE listen on is named bfv4.pipes
    Unfortunately this name is no longer very discriptive, but for the time being
    we're unable to change it without coordinated updates to DL ASE, which we
    currently are unable to perform.
*/
  private readonly defaultPipeName = 'bfv4.pipes';
  private readonly pipeName: string;
  private readonly bot: ActivityHandler;
  private readonly middleWare: (MiddlewareHandler|Middleware)[];

  constructor(bot: ActivityHandler, pipeName?: string, middleWare?: (MiddlewareHandler|Middleware)[]) {
    if (bot === undefined) {
      throw new Error('Undefined Argument: Bot can not be undefined.');
    } else {
      this.bot = bot;
    }

    if (pipeName === undefined) {
      this.pipeName = this.defaultPipeName;
    } else {
      this.pipeName = pipeName;
    }

    this.middleWare = middleWare;
  }

  public async processAsync(settings: BotFrameworkAdapterSettings) {
    let handler = new StreamingRequestHandler( this.bot, undefined, settings, this.middleWare);

    await handler.startNamedPipeAsync(this.pipeName);
  }
}
