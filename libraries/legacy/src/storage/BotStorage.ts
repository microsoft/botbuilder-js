// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as utils from '../utils';

export interface IBotStorageContext {
    userId?: string;
    conversationId?: string;
    address?: IAddress;
    persistUserData: boolean;
    persistConversationData: boolean;
}

export interface IBotStorageData {
    userData?: any;
    conversationData?: any;
    privateConversationData?: any;
}

export interface IBotStorage {
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;
}

export class MemoryBotStorage implements IBotStorage {
    private userStore: { [id: string]: string; } = {};
    private conversationStore: { [id: string]: string; } = {};

    public getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void {
        var data: IBotStorageData = {};
        if (context.userId) {
            // Read userData
            if (context.persistUserData) {
                if (this.userStore.hasOwnProperty(context.userId)) {
                    data.userData = JSON.parse(this.userStore[context.userId]);
                } else {
                    data.userData = null;
                }
            }
            if (context.conversationId) {
                // Read privateConversationData
                var key = context.userId + ':' + context.conversationId;
                if (this.conversationStore.hasOwnProperty(key)) {
                    data.privateConversationData = JSON.parse(this.conversationStore[key]);
                } else {
                    data.privateConversationData = null;
                }
            }
        }
        if (context.persistConversationData && context.conversationId) {
            // Read conversationData
            if (this.conversationStore.hasOwnProperty(context.conversationId)) {
                data.conversationData = JSON.parse(this.conversationStore[context.conversationId]);
            } else {
                data.conversationData = null;
            }
        }
        callback(null, data);
    }

    public saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void {
        if (context.userId) {
            // Write userData
            if (context.persistUserData) {
                this.userStore[context.userId] = JSON.stringify(data.userData || {});
            }
            if (context.conversationId) {
                // Write privateConversationData
                var key = context.userId + ':' + context.conversationId;
                this.conversationStore[key] = JSON.stringify(data.privateConversationData || {});
            }
        }
        if (context.persistConversationData && context.conversationId) {
            // Write conversationData
            this.conversationStore[context.conversationId] = JSON.stringify(data.conversationData || {});
        }
        callback(null);
    }

    public deleteData(context: IBotStorageContext): void {
        if (context.userId && this.userStore.hasOwnProperty(context.userId)) {
            if (context.conversationId) {
                // Delete specified conversation
                if (this.conversationStore.hasOwnProperty(context.conversationId)) {
                    delete this.conversationStore[context.conversationId];
                }
            } else {
                // Delete user and all their conversations
                delete this.userStore[context.userId];
                for (var key in this.conversationStore) {
                    if (key.indexOf(context.userId + ':') == 0) {
                        delete this.conversationStore[key];
                    }
                }                
            }
        }
    }
}