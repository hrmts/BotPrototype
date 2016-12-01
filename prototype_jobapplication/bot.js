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
function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
}

function verifyEmail(email){
    var status = false;     
    var emailRegEx = /^[\w\d\W\D]+@[\w\d\W\D]+\.[\w\d\W\D]/i;

    if (emailRegEx.test(email) == 1) {
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

// This is temporary data, replace with a database query.  
var availableJobs  = {
    IT: {'Programmer': 0, 'Help desk support': 0},
    Sports: {'Baseball player': 0, 'Pro gamer': 0},
};

bot.dialog('/getjob', [
    function (session) {
        builder.Prompts.choice(session, 'What section do you want to apply to?', availableJobs);
    },
    function (session, results) {
        var section = results.response.entity
        builder.Prompts.choice(session, 'What section do you want to apply to?', availableJobs[section]);
    },
    function (session, results) {
        session.privateConversationData.jobtitle = results.response.entity;
        session.endDialog();
    }
]);

bot.dialog('/getemail', [
    function (session) {
        builder.Prompts.text(session, 'What is your e-mail address?');
    },
    function (session, results) {
        if (!verifyEmail(results.response)){
            session.send('Please provide an valid e-mail address!')
            session.beginDialog('/getemail')
        } else {
            session.dialogData.email = results.response;
            builder.Prompts.confirm(session, 
                                    'Your email will be set to ' +
                                    results.response + ' Are you sure?');
        }
    },
    function (session, results) {
        if (results.response){
            session.privateConversationData.email = session.dialogData.email;
            session.endDialog();
        } else {
            session.beginDialog('/getemail');
        }
    },
]);


// Main control --- Apply to job
bot.dialog('/applytojob', [
    function (session) {
        session.beginDialog('/getjob');
    },
    function (session, results) {
        session.send('You are applying for ' + session.privateConversationData.jobtitle);
        session.beginDialog('/getemail');
    },
    function (session, results) {
        builder.Prompts.text(session, 'What is your first name?');
    },
    function (session, results) {
        session.privateConversationData.fName = capitalizeFirst(results.response);
        builder.Prompts.text(session, 'Hi ' + session.privateConversationData.fName + '. What is your last name?');
    },
    function (session, results) {
        session.privateConversationData.lName = capitalizeFirst(results.response);
        session.send('Thank you ' + session.privateConversationData.fName + ' ' + session.privateConversationData.lName + '!')
        builder.Prompts.text(session, 'What is your street address?');
    },
    function (session, results) {
        session.privateConversationData.address = results.response;

        session.send('Here is the data i recieved from you!');
        session.send('E-Mail : ' + session.privateConversationData.email);
        session.send('First Name : ' + session.privateConversationData.fName);
        session.send('Last Name : ' + session.privateConversationData.lName);
        session.send('Address : ' + session.privateConversationData.address);
        builder.Prompts.choice(session,
                               'Is there anything you would like to change?',
                               ['E-Mail', 'First name', 'Last name',
                                'Address',
                                'No, confirm & send application.'])
        session.endDialog();
    }
    function (session, results) {
        var answer = results.response.entity;

        session.endDialog();
    }
]);

// MAIN CONTROL
intents.onDefault([
    function (session) {
        session.send('Hello! I am HR-Manager Bot.')
        builder.Prompts.choice(session,
                               'What can we do for you today?',
                               ['Apply for a job']);
    },
    function (session, results) {
        var answer = results.response.entity;
        if (answer == 'Apply for a job'){
            session.beginDialog('/applytojob');
        }
    }
]);
