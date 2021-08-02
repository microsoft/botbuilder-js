// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    TeamsActivityHandler,
    TurnContext,
    FileInfoCard,
    FileConsentCard,
    FileConsentCardResponse
} from 'botbuilder';

/**
 * You can install this bot at any scope. You can @mention the bot and it will present you with the file prompt.
 * You can accept and the file will be uploaded, or you can decline and it won't.
 */
export class FileUploadBot extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the [FileUploadBot](xref:teams-file-bot.FileUploadBot) class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await this.sendFileCard(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * @protected
     */
    protected async handleTeamsFileConsentAccept(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        try {
            await this.sendFile(fileConsentCardResponse);
            await this.fileUploadCompleted(context, fileConsentCardResponse);
        }
        catch (err) {
            await this.fileUploadFailed(context, err.toString());
        }
    }

    /**
     * @protected
     */
    protected async handleTeamsFileConsentDecline(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let reply = this.createReply(context.activity);
        reply.textFormat = "xml";
        reply.text = `Declined. We won't upload file <b>${fileConsentCardResponse.context["filename"]}</b>.`;
        await context.sendActivity(reply);
    }

    /**
     * @private
     */
    private createReply(activity, text = null, locale = null) : Activity {
        return {
            type: 'message',
            from: { id: activity.recipient.id, name: activity.recipient.name },
            recipient: { id: activity.from.id, name: activity.from.name },
            replyToId: activity.id,
            serviceUrl: activity.serviceUrl,
            channelId: activity.channelId,
            conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
            text: text || '',
            locale: locale || activity.locale
        } as Activity;
    }

    /**
     * @private
     */
    private async sendFile(fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        const request = require("request");
        const fs = require('fs');
        let context = fileConsentCardResponse.context;
        let path = require('path');
        let filePath = path.join('files', context["filename"]);
        let stats = fs.statSync(filePath);
        let fileSizeInBytes = stats['size'];
        fs.createReadStream(filePath).pipe(request.put(fileConsentCardResponse.uploadInfo.uploadUrl));
    }

    /**
     * @private
     */
    private async sendFileCard(context: TurnContext): Promise<void> {
        let filename = "teams-logo.png";
        let fs = require('fs');
        let path = require('path');
        let stats = fs.statSync(path.join('files', filename));
        let fileSizeInBytes = stats['size'];

        let fileContext = {
            filename: filename
        };

        let attachment = {
            content: <FileConsentCard>{
                description: 'This is the file I want to send you',
                fileSizeInBytes: fileSizeInBytes,
                acceptContext: fileContext,
                declineContext: fileContext
            },
            contentType: 'application/vnd.microsoft.teams.card.file.consent',
            name: filename
        } as Attachment;

        var replyActivity = this.createReply(context.activity);
        replyActivity.attachments = [ attachment ];
        await context.sendActivity(replyActivity);
    }

    /**
     * @private
     */
    private async fileUploadCompleted(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let fileUploadInfoName = fileConsentCardResponse.uploadInfo.name;
        let downloadCard = <FileInfoCard>{
            uniqueId: fileConsentCardResponse.uploadInfo.uniqueId,
            fileType: fileConsentCardResponse.uploadInfo.fileType,
        };

        let attachment = <Attachment>{
            content: downloadCard,
            contentType: 'application/vnd.microsoft.teams.card.file.info',
            name: fileUploadInfoName,
            contentUrl: fileConsentCardResponse.uploadInfo.contentUrl,
        };

        let reply = this.createReply(context.activity, `<b>File uploaded.</b> Your file <b>${fileUploadInfoName}</b> is ready to download`);
        reply.textFormat = 'xml';
        reply.attachments = [attachment];
        await context.sendActivity(reply);
    }

    /**
     * @private
     */
    private async fileUploadFailed(context: TurnContext, error: string): Promise<void> {
        let reply = this.createReply(context.activity, `<b>File upload failed.</b> Error: <pre>${error}</pre>`);
        reply.textFormat = 'xml';
        await context.sendActivity(reply);
    }
}
