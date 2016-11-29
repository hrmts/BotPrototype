var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
     
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

// FUNCTIONS
bot.dialog('/template', [
    function (session) {
        // do stuff
    },
    function (session, results) {
        // do other stuff
        session.endDialog();
    }
]);

bot.dialog('/uploadcv', [
    // Dosent seem to want to work
    function (session) {;
        builder.Prompts.attachment(session, 'Please upload your cv');
    },
    function (session, results) {
        // do other stuff
        session.endDialog();
    }
]);

bot.dialog('/getname', [
    function (session) {
        builder.Prompts.choice(session, 'Please choose your name', 'Mike|Steve|Joe')
    },
    function (session, results) {
        session.dialogData.name = results.response.entity;
        builder.Prompts.confirm(session, 'Your name will be set to ' + session.dialogData.name + '. Are you sure?');
    },
    function (session, results) {
        if(results.response){
            session.privateConversationData.name = session.dialogData.name;
        }
        session.endDialog();
    }
]);

// MAIN CONTROL
intents.onDefault([
    function (session, args, next) {
        if (!session.privateConversationData.name){
            session.beginDialog('/getname');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s! What can we do for you today?', session.privateConversationData.name);
    }
]);

intents.matches(/^change name/i, [
    function (session, args, next) {
        session.beginDialog('/getname');
    },
    function (session, results) {
        session.send('Hello %s!', session.privateConversationData.name);
        session.endDialog
    }
]);

intents.matches(/^upload cv/i, [
    function (session, args, next) {
        session.beginDialog('/uploadcv');
    },
    function (session, results) {
        session.endDialog
    }
]);

