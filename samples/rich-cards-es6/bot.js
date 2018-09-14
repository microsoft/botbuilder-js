const { CardFactory } = require('botbuilder');
const { DialogSet, ChoicePrompt, ListStyle } = require('botbuilder-dialogs');

module.exports = function createBotLogic(conversationState) {

    const dialogs = new DialogSet();

    // Create a choice prompt and change the list style
    const cardPrompt = new ChoicePrompt().style(ListStyle.list);

    // Create our prompt's choices
    const cardOptions = [
        {
            value: 'Adaptive card',
            synonyms: ['1', 'adaptive card']
        },
        {
            value: 'Animation card',
            synonyms: ['2', 'animation card']
        },
        {
            value: 'Audio card',
            synonyms: ['3', 'audio card']
        },
        {
            value: 'Hero card',
            synonyms: ['4', 'Hero card']
        },
        {
            value: 'Receipt card',
            synonyms: ['5', 'Receipt card']
        },
        {
            value: 'Signin card',
            synonyms: ['6', 'Signin card']
        },
        {
            value: 'Thumbnail card',
            synonyms: ['7', 'Thumbnail card']
        },
        {
            value: 'Video card',
            synonyms: ['8', 'video card']
        },
        {
            value: 'All cards',
            synonyms: ['9', 'all cards']
        }
    ]

    // Register the card prompt
    dialogs.add('cardPrompt', cardPrompt);

    // Create a dialog for prompting the user
    dialogs.add('cardSelector', [
        async (dialogContext) => {
            await dialogContext.prompt(
                'cardPrompt',
                'Which card would you like to choose?',
                cardOptions
            );
        },
        async (dialogContext, results) => {
            switch (results.value) {
                case 'Adaptive card':
                    await dialogContext.context.sendActivity({ attachments: [createAdaptiveCard()] });
                    break;
                case 'Animation card':
                    await dialogContext.context.sendActivity({ attachments: [createAnimationCard()] });
                    break;
                case 'Audio card':
                    await dialogContext.context.sendActivity({ attachments: [createAudioCard()] });
                    break;
                case 'Hero card':
                    await dialogContext.context.sendActivity({ attachments: [createHeroCard()] });
                    break;
                case 'Receipt card':
                    await dialogContext.context.sendActivity({ attachments: [createReceiptCard()] });
                    break;
                case 'Signin card':
                    await dialogContext.context.sendActivity({ attachments: [createSignInCard()] });
                    break;
                case 'Thumbnail card':
                    await dialogContext.context.sendActivity({ attachments: [createThumbnailCard()] });
                    break;
                case 'Video card':
                    await dialogContext.context.sendActivity({ attachments: [createVideoCard()] });
                    break;
                case 'All cards':
                    await dialogContext.context.sendActivities([
                        { attachments: [createAdaptiveCard()] },
                        { attachments: [createAnimationCard()] },
                        { attachments: [createAudioCard()] },
                        { attachments: [createHeroCard()] },
                        { attachments: [createReceiptCard()] },
                        { attachments: [createSignInCard()] },
                        { attachments: [createThumbnailCard()] },
                        { attachments: [createVideoCard()] }
                    ]);
            }
            await dialogContext.end();
        }
    ]);


    return async (context) => {
        const state = conversationState.get(context);
        const dc = dialogs.createContext(context, state);

        if (context.activity.type === 'message') {
            await dc.continueDialog();
            if (!context.responded) {
                await dc.beginDialog('cardSelector');
            }
        }
    }
}

// Methods to generate cards
function createAdaptiveCard() {
    return CardFactory.adaptiveCard({
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.0",
        "type": "AdaptiveCard",
        "speak": "Your flight is confirmed for you and 3 other passengers from San Francisco to Amsterdam on Friday, October 10 8:30 AM",
        "body": [
            {
                "type": "TextBlock",
                "text": "Passengers",
                "weight": "bolder",
                "isSubtle": false
            },
            {
                "type": "TextBlock",
                "text": "Sarah Hum",
                "separator": true
            },
            {
                "type": "TextBlock",
                "text": "Jeremy Goldberg",
                "spacing": "none"
            },
            {
                "type": "TextBlock",
                "text": "Evan Litvak",
                "spacing": "none"
            },
            {
                "type": "TextBlock",
                "text": "2 Stops",
                "weight": "bolder",
                "spacing": "medium"
            },
            {
                "type": "TextBlock",
                "text": "Fri, October 10 8:30 AM",
                "weight": "bolder",
                "spacing": "none"
            },
            {
                "type": "ColumnSet",
                "separator": true,
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "San Francisco",
                                "isSubtle": true
                            },
                            {
                                "type": "TextBlock",
                                "size": "extraLarge",
                                "color": "accent",
                                "text": "SFO",
                                "spacing": "none"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": "auto",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": " "
                            },
                            {
                                "type": "Image",
                                "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                "size": "small",
                                "spacing": "none"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "horizontalAlignment": "right",
                                "text": "Amsterdam",
                                "isSubtle": true
                            },
                            {
                                "type": "TextBlock",
                                "horizontalAlignment": "right",
                                "size": "extraLarge",
                                "color": "accent",
                                "text": "AMS",
                                "spacing": "none"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "TextBlock",
                "text": "Non-Stop",
                "weight": "bolder",
                "spacing": "medium"
            },
            {
                "type": "TextBlock",
                "text": "Fri, October 18 9:50 PM",
                "weight": "bolder",
                "spacing": "none"
            },
            {
                "type": "ColumnSet",
                "separator": true,
                "columns": [
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "Amsterdam",
                                "isSubtle": true
                            },
                            {
                                "type": "TextBlock",
                                "size": "extraLarge",
                                "color": "accent",
                                "text": "AMS",
                                "spacing": "none"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": "auto",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": " "
                            },
                            {
                                "type": "Image",
                                "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                "size": "small",
                                "spacing": "none"
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "horizontalAlignment": "right",
                                "text": "San Francisco",
                                "isSubtle": true
                            },
                            {
                                "type": "TextBlock",
                                "horizontalAlignment": "right",
                                "size": "extraLarge",
                                "color": "accent",
                                "text": "SFO",
                                "spacing": "none"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "ColumnSet",
                "spacing": "medium",
                "columns": [
                    {
                        "type": "Column",
                        "width": "1",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "Total",
                                "size": "medium",
                                "isSubtle": true
                            }
                        ]
                    },
                    {
                        "type": "Column",
                        "width": 1,
                        "items": [
                            {
                                "type": "TextBlock",
                                "horizontalAlignment": "right",
                                "text": "$4,032.54",
                                "size": "medium",
                                "weight": "bolder"
                            }
                        ]
                    }
                ]
            }
        ]
    });
}

function createAnimationCard() {
    return CardFactory.animationCard(
        'Microsoft Bot Framework',
        [
            { url: 'http://i.giphy.com/Ki55RUbOV5njy.gif' }
        ],
        [],
        {
            subtitle: 'Animation Card'
        }
    );
}

function createAudioCard() {
    return CardFactory.audioCard(
        'I am your father',
        ['http://www.wavlist.com/movies/004/father.wav'],
        CardFactory.actions([
            {
                type: 'openUrl',
                title: 'Read More',
                value: 'https://en.wikipedia.org/wiki/The_Empire_Strikes_Back'
            }
        ]),
        {
            subtitle: 'Star Wars: Episode V - The Empire Strikes Back',
            text: 'The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.',
            image: 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'
        }
    );
}

function createHeroCard() {
    return CardFactory.heroCard(
        'BotFramework Hero Card',
        CardFactory.images(['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg']),
        CardFactory.actions([
            {
                type: 'openUrl',
                title: 'Get Started',
                value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
            }
        ])
    );
}

function createReceiptCard() {
    return CardFactory.receiptCard({
        title: "John Doe",
        facts: [
            {
                key: 'Order Number',
                value: '1234'
            },
            {
                key: 'Payment Method',
                value: 'VISA 5555-****'
            }
        ],
        items: [
            {
                title: 'Data Transfer',
                price: '$38.45',
                quantity: 368,
                image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png' }
            },
            {
                title: 'App Service',
                price: '$45.00',
                quantity: 720,
                image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png' }
            }
        ],
        tax: '$7.50',
        total: '$90.95',
        buttons: CardFactory.actions([
            {
                type: 'openUrl',
                title: 'More Information',
                value: 'https://azure.microsoft.com/en-us/pricing/details/bot-service/'
            }
        ])
    })
}

function createSignInCard() {
    return CardFactory.signinCard(
        'BotFramework Sign-in Card',
        'https://login.microsoftonline.com',
        'Sign-in'
    );
}

function createThumbnailCard() {
    return CardFactory.thumbnailCard(
        'BotFramework Thumbnail Card',
        [{ url: 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg' }],
        [{
            type: 'openUrl',
            title: 'Get Started',
            value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
        }],
        {
            subtitle: 'Your bots — wherever your users are talking',
            text: 'Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.'
        }
    )
}

function createVideoCard() {
    return CardFactory.videoCard(
        'Big Buck Bunny',
        [{ url: 'http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4' }],
        [{
            type: 'openUrl',
            title: 'Lean More',
            value: 'https://peach.blender.org/'
        }],
        {
            subtitle: 'by the Blender Institute',
            text: 'Big Buck Bunny (code-named Peach) is a short computer-animated comedy film by the Blender Institute, part of the Blender Foundation. Like the foundation\'s previous film Elephants Dream, the film was made using Blender, a free software application for animation made by the same foundation. It was released as an open-source film under Creative Commons License Attribution 3.0.'
        }
    )
}