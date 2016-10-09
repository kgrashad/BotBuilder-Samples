/*-----------------------------------------------------------------------------
A Spell Check bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

// This loads the environment variables from the .env file
require('dotenv-extended').load();

const builder = require('botbuilder'),
    spellService = require('./spell-service'),
    restify = require('restify'),
    request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3979, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Events
//=========================================================

//Sends greeting message when the bot is first added to a conversation
bot.on('conversationUpdate', message => {
    if (message.membersAdded) {
        message.membersAdded.forEach(identity => {
            if (identity.id === message.address.bot.id) {
                const reply = new builder.Message()
                    .address(message.address)
                    .text("Hi! I am SpellCheck Bot. I correct the spelling of your messages. Try sending me some text");
                bot.send(reply);
            }
        });
    }
});


//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', session => {
    if (session.message.text) {
        spellService
            .getCorrectedText(session.message.text)
            .then(text => session.send(text))
            .catch(error => handleErrorResponse(session, error));
    }
    else {
        session.send("No text found. Try sending me a message with text.");
    }
});

//=========================================================
// Response Handling
//=========================================================

const handleErrorResponse = (session, error) => {
    session.send("Oops! Something went wrong. Try again later.");
    console.error(error);
}
