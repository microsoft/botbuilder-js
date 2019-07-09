/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityHandler } from 'botbuilder-core';
import { BotFrameworkAdapterSettings } from './botFrameworkAdapter';
import { NamedPipeServer } from 'botframework-streaming-extensions';
import { StreamingRequestHandler } from './StreamingRequestHandler';

export class NamedPipeConnector {
  private readonly pipeName: string;
  private readonly bot: ActivityHandler;
  private readonly defaultPipeName = 'bfv4.pipes';

  constructor(bot: ActivityHandler, pipeName?: string) {
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

  }

  public async processAsync(settings: BotFrameworkAdapterSettings) {
    let handler = new StreamingRequestHandler(this.bot);
    let server = new NamedPipeServer(this.pipeName, handler);
    handler.setServer(server);
    handler.adapterSettings = settings;
    await server.startAsync();
  }
}
