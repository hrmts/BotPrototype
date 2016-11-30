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

function verifyEmail(email){
    var status = false;     
    var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    if (email.value.search(emailRegEx) == 1) {
        status = true;
    }

    return status;

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

bot.dialog('/getname', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.privateConversationData.name = results.response;
        session.endDialog();
    }
]);

// functions    --- Apply to job
bot.dialog('/getemail', [
    function (session) {
        builder.Prompts.text(session, 'What is your e-mail adress?');
    },
    function (session, results) {
        session.dialogData.email = results.response.entity;
        builder.Prompts.confirm(session, 
                                'Your email will be set to ' +
                                results.response.entity + ' Are you sure?');
    },
    function (session, results) {
        if (results.response.entity){
            session.privateConversationData.email = session.dialogData.email;
        } else {
            session.beginDialog('/getemail');
        }
    },
]);


// Main control --- Apply to job
bot.dialog('/applytojob', [
    function (session) {
        builder.Prompts.choice(session, 
                              'What Job do you want to apply to?',
                              'IT|NOTIT|ITIT|OTHERIT');
    },
    function (session, results) {
        session.dialogData.jobtitle = results.response.entity;
        session.send('Ok, you are applying for %s at CoolCompanyInc!', session.dialogData.jobtitle)
        builder.Prompts.text(session, 'What is your e-mail adress?')
    },
    function (session, results) {
        session.dialogData.email = results.response.entity;
        builder.Prompts.confirm(session, 
                                'Your email will be set to ' +
                                results.response.entity + ' Are you sure?');
    },
    function (session, results) {
        if (results.response.entity){
            session.privateConversationData.email = session.dialogData.email;
        } else {
            back();
        }
    },
    function (session, results) {
        builder.Prompts.text(session, 'What is your first name?')
    },
    function (session, results) {
        endDialog();
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
        session.endDialog;
    }
]);

intents.matches(/^apply/i, [
    function (session, args, next) {
        session.beginDialog('/applytojob');
    },
    function (session, results) {
        session.endDialog;
    }
]);

