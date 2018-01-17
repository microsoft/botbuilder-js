/**
 * 
 * Your bot's business logic goes here
 * 
 * DOCS: https://review.docs.microsoft.com/en-us/botframework/abs2/?branch=post-build
 * 
*/

var GuessOutcomeSoundEffect = {
    Correct1: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/effects/Ding%20.mp3"
    },
    Correct2: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/effects/DingDingDing.mp3"
    },
    wrong: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/effects/Wrong%20Buzzer%20-%20Sound%20Effect.mp3"
    }
};

var guessTheGrooveMasterList = {
    1: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/0001.mp3",
        artist:"Cake",
        title:"Short skirt long jacket",
        hint:"The band is American alternative rock from Sacramento"
    },
    2: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/0002.mp3",
        artist:"Franz Ferdinand",
        title:"Take me out",
        hint:"A Scottish indie rock band who have put out four studio albums"
    },
    3: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/0003.mp3",
        artist:"Jay Z featuring Beyonce",
        title:"Bonnie and Clyde",
        hint:"An American rapper and businessman who has sold more than 100 million records"
    },
    4: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/0004.mp3",
        artist:"Nelly",
        title:"Air force ones",
        hint:"I "
    },
    5: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/0005.mp3",
        artist:"Phoenix",
        title:"If I ever feel better",
        hint:"rise from the ashes"
    },

    6: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/1001.mp3",
        artist:"Arcade fire",
        title:"The suburbs",
        hint:"Canadian indie rock band based in Montreal, Quebec, consisting of husband and wife Win Butler and Régine Chassagne"
    },
    7: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/1002.mp3",
        artist:"Foster the people",
        title:"Pumped up kicks",
        hint:"American indie pop band formed in Los Angeles, California in 2009. It currently consists of lead vocalist Mark Foster"
    },
    8: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/1003.mp3",
        artist:"Iggy Azelia",
        title:"Fancy",
        hint:"Australian rapper. Born in Sydney and raised in Mullumbimby"
    },
    9: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/1004.mp3",
        artist:"LMFAO",
        title:"I'm sexy and I know it",
        hint:"I'm what? and I know it"
    },
    10: {
        url:"https://guessthegroovektq3j5.blob.core.windows.net/songs/1005.mp3",
        artist:"Taylor Swift",
        title:"Shake it off",
        hint:"Cause the players gonna play, play, play, play, play. And the haters gonna hate, hate, hate, hate, hate "
    }
};

var FinalScoreReadOut = {
    0: {
        value:"Sorry, looks like you were shut out. It's only up from here."
    },
    1: {
        value:"You earned one point. At least you got on the board."
    },
    2: {
        value:"You earned two points. The important thing is, you showed up."
    },
    3: {
        value:"You got three points. Nice hustle."
    },
    4: {
        value:"You scored four points. Keep practicing!"
    },
    5: {
        value:"You scored five points. Not too shabby."
    },
    6: {
        value:"You earned six points. You might be a contender."
    },
    7: {
        value:"You scored seven points. You're a good listener."
    },
    8: {
        value:"You got eight points. So close to perfect."
    },
    9: {
        value:"Wow, nine points! You're a true audiophile."
    }
};



/**
* @param {IConversationContext} context
*/
module.exports.havemoreturns_onRun = function (context) {
    console.log("havemoreturns_onRun...");
    var lReturn = "Yes";
    // check context entity to see if we have hit max turns for this session
    if(context.taskEntities.turnIndex) {
        if(parseInt(context.taskEntities.turnIndex[0].value) < 2) {
            lReturn = "Yes";
        } else {
            lReturn ="No";
            // score and prep response
            console.log("Final score::::" + context.taskEntities.score[0].value);
            context.addTaskEntity("finalScoreReadout", FinalScoreReadOut[context.taskEntities.score[0].value].value); 
        }
    } else {
        lReturn = "Yes";
    }

    console.log("returning from havemoreturns_onRun :: " + lReturn);
    return lReturn;
}


/**
* @param {IConversationContext} context
*/
module.exports.turnprep_onRun = function (context) {
    var activity = context.request;
    console.log("In turnprep_onRun ... " + JSON.stringify(context));
    var randomPick = 0;

    // What turn are we in?
    if(context.taskEntities.turnIndex) {
        // we are in the middle of a game and not done yet
        // increment turn index
        context.taskEntities.turnIndex[0].value = parseInt(context.taskEntities.turnIndex[0].value) + 1;
        console.log("Updated turn index: " + context.taskEntities.turnIndex[0].value);

        // set the songs for this turn based on starting seed;
        randomPick = parseInt(context.taskEntities.startingSeed[0].value) + parseInt(context.taskEntities.turnIndex[0].value);
        
        context.taskEntities.url[0].value = guessTheGrooveMasterList[randomPick].url;
        context.taskEntities.ssml[0].value = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" xml:lang="en-us"><emo:emotion><emo:category name="Neutral" value="1.0"/> </emo:emotion><audio src="' + guessTheGrooveMasterList[randomPick].url + '"/></speak>';
        context.taskEntities.qartist[0].value = guessTheGrooveMasterList[randomPick].artist;
        context.taskEntities.title[0].value = guessTheGrooveMasterList[randomPick].title;
        context.taskEntities.qhint[0].value = guessTheGrooveMasterList[randomPick].hint;

        context.taskEntities.guessOutComeEffect[0].value = GuessOutcomeSoundEffect["wrong"].url;
        context.taskEntities.guessOutcome[0].value = 0;
        context.taskEntities.guessOutComeReadout[0].value = "[WrongAnswer] That was {title} by {qartist}.";
        
        console.log("Updated all property bag: " + JSON.stringify(context));
     
    } else {
        // the variability is just built into the starting point for the game. Then the subsequent questions are in succession
        var pseudo_rand = 1 / 3;
        randomPick = Math.floor(pseudo_rand * 10) + 1 - 2;
        if(randomPick <= 0) randomPick = 1;

        console.log("In turn prep");
        console.log("Context ------- " + JSON.stringify(context));

        context.addTaskEntity("startingSeed", randomPick.toString());
        context.addTaskEntity("turnIndex", "0");
        context.addTaskEntity("score", "0");

        context.addTaskEntity("url",guessTheGrooveMasterList[randomPick].url);
        context.addTaskEntity("ssml",'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" xml:lang="en-us"><emo:emotion><emo:category name="Neutral" value="1.0"/> </emo:emotion><audio src="' + guessTheGrooveMasterList[randomPick].url + '"/></speak>');
        context.addTaskEntity("qartist",guessTheGrooveMasterList[randomPick].artist);
        context.addTaskEntity("title",guessTheGrooveMasterList[randomPick].title);
        context.addTaskEntity("qhint",guessTheGrooveMasterList[randomPick].hint);
        context.addTaskEntity("guessOutComeEffect", GuessOutcomeSoundEffect["wrong"].url);
        context.addTaskEntity("guessOutcome", "0"); // 0 - both wrong, 1 - artist correct; 2 - song correct; 3 - both correct
        context.addTaskEntity("guessOutComeReadout", "[WrongAnswer] That was {title} by {qartist}.");
        
        console.log("Updated all property bag: " + JSON.stringify(context));
    }

    console.log("Deleting LU stuff from prior turn!!!!");
    
    // clear out current LU stuff
    if(context.taskEntities.songTitle) {
        console.log("Inside songTitle - json :::: " + JSON.stringify(context.taskEntities.songTitle));
        if (context.taskEntities.songTitle[0].value !== "") {
           delete context.taskEntities["songTitle"];
        }
    }  
    if(context.taskEntities.hint){
        console.log("Inside hint - json :::: " + JSON.stringify(context.taskEntities.hint));
        if (context.taskEntities.hint[0].value !== "") {
            delete context.taskEntities["hint"];
        }
    } 
    if(context.taskEntities.artist) {
        console.log("Inside artist - json :::: " + JSON.stringify(context.taskEntities.artist));
        if (context.taskEntities.artist[0].value !== "") {
            //delete context.taskEntities.artist;
            console.log("Have artist entity ::::: " + JSON.stringify(context));
            //context.taskEntities.artist[0].value = "";
            delete context.taskEntities["artist"];
            console.log("Removed artist entity ::::: " + JSON.stringify(context));
        }
    } 
    if(context.taskEntities.giveup) {
        console.log("Inside giveup - json :::: " + JSON.stringify(context.taskEntities.giveup));
        if (context.taskEntities.giveup[0].value !== "") {
            delete context.taskEntities["giveup"];
        }  
    }

    console.log("Updated all property bag: " + JSON.stringify(context)); 
}


/**
* @param {IConversationContext} context
*/
module.exports.AskForGuessTemplate_onRun = function (context) {
    console.log("AskForGuessTemplate_onRun....");
    if(context.taskEntities.turnIndex) {
        return context.taskEntities.turnIndex[0].value.toString();
    }
    return "0";
}


/**
* @param {IConversationContext} context
*/
module.exports.Turnprompt_repromptWhen = function (context) {
    console.log("Turnprompt_repromptWhen---------" + JSON.stringify(context));

    // never reprompt
    return false;
    // reprompt if we dont have a title or artist or help or giveup
    if(context.taskEntities.songTitle || context.taskEntities.hint || context.taskEntities.artist || context.taskEntities.giveup || context.taskEntities.cancel) {
        return false;
    }
    return true;
}


/**
* @param {IConversationContext} context
*/
module.exports.outcome_onRun = function (context) {
    if(context.taskEntities.hint) {
        console.log("Hinting to user...");
        return "Hint";
    } else if(context.taskEntities.giveup) {
        console.log("User gavge up...");
        return "Giveup";
    } else if (context.taskEntities.cancel) {
        console.log("User would like to cancel...");
        return "cancel";
    } else {
        console.log("user made a guess...");
        return "Guess";
    } 
}


/**
* @param {IConversationContext} context
*/
module.exports.Validateguess_onRun = function (context) {
    console.log("In Validateguess_onRun *****");
    var artistCorrect = false;
    // what do we have?
    if(context.taskEntities.artist) {
        // validate if the artist is correct
        console.log("qartist:::::" + context.taskEntities.qartist[0].value.toLowerCase());
        console.log("artist::::" + context.taskEntities.artist[0].value.toLowerCase());
        if(context.taskEntities.qartist[0].value.toLowerCase().includes(context.taskEntities.artist[0].value.toLowerCase())) {
            // we have the correct artist. so set for credit
            artistCorrect = true;
            context.taskEntities.guessOutcome[0].value = 1;
            console.log("artist match!");
        } else {
            console.log("artist no match");
        }
    }

    if (context.taskEntities.songTitle){
        // validate if the song title is correct
        if(context.taskEntities.title[0].value.toLowerCase().includes(context.taskEntities.songTitle[0].value.toLowerCase())) {
            // we have the correct song name. so set for credit
            if(artistCorrect) {
                // give 3 points
                context.taskEntities.score[0].value = parseInt(context.taskEntities.score[0].value) + 3;
                context.taskEntities.guessOutComeEffect[0].value = GuessOutcomeSoundEffect["Correct2"].url;
                context.taskEntities.guessOutcome[0].value = 3;
                context.taskEntities.guessOutComeReadout[0].value = "[Got2RightTemplate] That's {title} by {qartist}.";
                artistCorrect = false;
            } else {
                // give 2 points
                context.taskEntities.score[0].value = parseInt(context.taskEntities.score[0].value) + 1;
                context.taskEntities.guessOutComeEffect[0].value = GuessOutcomeSoundEffect["Correct1"].url;
                context.taskEntities.guessOutcome[0].value = 2;
                context.taskEntities.guessOutComeReadout[0].value = "[Got1RightTemplate] Yes, that was {title} by {qartist}.";
                artistCorrect = false;
            } 
        }
    }

    if(artistCorrect) {
        // give 2 points
        context.taskEntities.score[0].value = parseInt(context.taskEntities.score[0].value) + 1;
        context.taskEntities.guessOutComeEffect[0].value = GuessOutcomeSoundEffect["Correct1"].url;   
        context.taskEntities.guessOutcome[0].value = 1;
        context.taskEntities.guessOutComeReadout[0].value = "[Got1RightTemplate] Yes, that was {qartist} singing {title}.";
    }

    // 
    console.log("return from validateResult_onRun...");
}


/**
* @param {IConversationContext} context
*/
module.exports.GuessFeedbackTemplate_onRun = function (context) {
    console.log("Inside GuessFeedbackTemplate_onRun ....")
    if(context.taskEntities.guessOutcome[0].value == 0) {
        return "else";
    } else if(context.taskEntities.guessOutcome[0].value == 1) {
        return "gotArtist";
    } else if(context.taskEntities.guessOutcome[0].value == 2) {
        return "gotSong";
    } else if(context.taskEntities.guessOutcome[0].value == 3) {
        return "gotBothRight";
    }
}


/**
* @param {IConversationContext} context
*/
module.exports.ScoreTemplate_onRun = function (context) {
    return context.taskEntities.score[0].value;
}


/**
* @param {IConversationContext} context
*/
module.exports.Gameintro_beforeResponse = function (context) {
    console.log("Gameintro_beforeResponse:::::" + JSON.stringify(context.request));
}


/**
* @param {IConversationContext} context
*/
module.exports.Turnprompt_beforeResponse = function (context) {
    console.log("Turnprompt_beforeResponse:::::" + JSON.stringify(context.request));
}





/**
* @param {IConversationContext} context
*/
module.exports.Guessreadout_beforeResponse = function (context) {
    console.log("Guessreadout_beforeResponse:::" + JSON.stringify(context.request));
}


/**
* @param {IConversationContext} context
*/
module.exports.Turnprompt_promptWhen = function (context) {
    console.log("Turnprompt_promptWhen ...");
    // we must always prompt here
    return true;
}


/**
* @param {IConversationContext} context
*/
module.exports.Howdidtheguessgo_onRun = function (context) {
    if(context.taskEntities.guessOutcome[0].value == 0) {
        return "0";
    } else if(context.taskEntities.guessOutcome[0].value == 1) {
        return "1";
    } else if(context.taskEntities.guessOutcome[0].value == 2) {
        return "1";
    } else if(context.taskEntities.guessOutcome[0].value == 3) {
        return "2";
    }
}


/**
* @param {IConversationContext} context
*/
module.exports.Playhint_promptWhen = function (context) {
    delete context.taskEntities["hint"];
    return true;
}


/**
* @param {IConversationContext} context
*/
module.exports.cancelandscore_onRun = function (context) {
    // score and prep response
    console.log("Final score::::" + context.taskEntities.score[0].value);
    context.addTaskEntity("finalScoreReadout", FinalScoreReadOut[context.taskEntities.score[0].value].value); 
}


/**
* @param {IConversationContext} context
*/
module.exports.Playhint_beforeResponse = function (context) {
    var activity = context.responses[context.responses.length - 1];
    // include a hint card
    activity.attachments = [
        {
            "contentType": "application/vnd.microsoft.card.hero",
            "content": {
                "buttons": [
                    {
                        "type": "imBack",
                        "title": "1",
                        "value": "1"
                    },
                    {
                        "type": "imBack",
                        "title": "2",
                        "value": "2"
                    },
                    {
                        "type": "imBack",
                        "title": "3",
                        "value": "3"
                    },
                    {
                        "type": "imBack",
                        "title": "4",
                        "value": "4"
                    }
                ]
            }
        }
    ];
    
    var pseudo_rand = 1 / 3;
    var randomPick = Math.floor(pseudo_rand * 10) + 1 - 2;
    if(randomPick <= 0) randomPick = 1;

    // generate random values for other slots
    for(var i = 0; i < 4; i++) {
        activity.attachments[0].content.buttons[i].title = guessTheGrooveMasterList[parseInt(randomPick) + i].title + "by" + guessTheGrooveMasterList[parseInt(randomPick) + i].artist;
        activity.attachments[0].content.buttons[i].value = guessTheGrooveMasterList[parseInt(randomPick) + i].title + "by" + guessTheGrooveMasterList[parseInt(randomPick) + i].artist;
    }

    // Figure which slot is going to get the right answer
    var slot = Math.floor(pseudo_rand * 4);
    
    activity.attachments[0].content.buttons[slot].title = context.taskEntities.title[0].value + " by " + context.taskEntities.qartist[0].value + "[*]";
    activity.attachments[0].content.buttons[slot].value = context.taskEntities.title[0].value + " by " + context.taskEntities.qartist[0].value;
}


/**
* @param {IConversationContext} context
*/
module.exports.Respond_beforeResponse = function (context) {
    console.log("Simple response out:" + JSON.stringify(context.request));
}


/**
* @param {IConversationContext} context
*/
module.exports.Echotask_if_onRun = function (context) {
    var activity = context.request;
    if(activity.text.includes("echo")) {
        context.addTaskEntity("Message", activity.text.replace("echo ", ""));
        return true;
    }
    return false;
}

/**
* @param {IConversationContext} context
*/
module.exports.default_onRun = function (context) {
    return context.request.text === 'Santa wants a blue ribbon';
}
