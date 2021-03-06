var restify = require('restify');
var builder = require('botbuilder');
var mongodb = require('mongodb');

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



// functions    --- Apply to job
var mongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/hr-managerDB';
var promiseCount = 0;

var availableJobs = new Promise( function( resolve, reject ) {
    mongoClient.connect(url, function(err, db){
        if(err){
            console.log('Error connecting to database', err);
        } else{
            var jobCollection = db.collection('availableJobs');
            jobCollection.find().toArray(function(err, result){
                if(err){
                    console.log('Error', err);
                } else{
                    delete result[0]._id;
                    resolve(result);
                }
            });

        }
        db.close();
    });
});


bot.dialog('/getjob', [
    function (session) {
        availableJobs.then( function(val){
            builder.Prompts.choice(session, 'What section do you want to apply to?', val[0]);
        });
    },
    function (session, results) {
        var section = results.response.entity
        session.privateConversationData.jobSection = section;
        availableJobs.then( function(val){
            builder.Prompts.choice(session, 'What section do you want to apply to?', val[0][section]);
        });
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
            session.send('Please provide an valid e-mail address!');
            session.beginDialog('/getemail');
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

bot.dialog('/getfName', [
    function (session, results) {
        builder.Prompts.text(session, 'What is your first name?');
    },
    function (session, results) {
        session.privateConversationData.fName = capitalizeFirst(results.response);
        session.endDialog();
    },
]);

bot.dialog('/getlName', [
    function (session, results) {
        builder.Prompts.text(session, 'Hi ' + session.privateConversationData.fName + '. What is your last name?');
    },
    function (session, results) {
        session.privateConversationData.lName = capitalizeFirst(results.response);
        session.endDialog();
    },
]);

bot.dialog('/getaddress', [
    function (session, results) {
        builder.Prompts.text(session, 'What is your address?');
    },
    function (session, results) {
        session.privateConversationData.lName = capitalizeFirst(results.response);
        session.endDialog();
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
        session.beginDialog('/getfName');
    },
    function (session, results) {
        session.beginDialog('/getlName');
    },
    function (session, results) {
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
                               ['Change email', 'Change first name',
                               'Change last name', 'Change address',
                                'No, confirm & send application.'])
    },
    function (session, results) {
        var answer = results.response.entity;
        console.log(asnwer)
        if(answer == 'No, confirm & send application.'){
            session.send('Thank you! Your application has been sent.');
        }
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
