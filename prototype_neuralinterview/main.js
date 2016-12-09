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

var client = restify.createJsonClient({url: '127.0.0.1:5000/'});

//=========================================================
// Bots Dialogs
//=========================================================

// FUNCTIONS
function talkNeural(text){
}

bot.dialog('/template', [
    function (session) {
        // do stuff
    },
    function (session, results) {
        // do other stuff
        session.endDialog();
    }
]);

// MAIN CONTROL
bot.dialog('/', new builder.SimpleDialog(function (session, results) {
    if (session.dialogData.botResponse == null){
    }

    if (results && results.response) {
        client.post('/messages/',
                   {message: results.response,
                    headers: {"content-type": "application/json"}},
                    function (err, req, res, next, obj){
            
            builder.Prompts.text(session, req.res.body);
        });

    } else {
        builder.Prompts.text(session, 'Hi!');
    }



}));
