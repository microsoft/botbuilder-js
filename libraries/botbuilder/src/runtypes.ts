// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';

import { INodeBuffer, INodeSocket } from 'botframework-streaming';

export const INodeBufferT = t.Unknown.withGuard<INodeBuffer>(Buffer.isBuffer, { name: 'INodeBuffer' });

export const INodeSocketT = t
    .Record({
        emit: t.Function,
        end: t.Function,
        off: t.Function,
        on: t.Function,
        once: t.Function,
        pipe: t.Function,
        write: t.Function,
    })
    .withGuard((val: unknown): val is INodeSocket => val != null, { name: 'INodeSocket' });
