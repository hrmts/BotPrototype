# Introduction

Here i test different chatbots in order to teach myself to create
them and see if any of them have any practical use.

To test the bots go into the bot's folder and run node on the main
javascript app.
The bot will then be hosted on localhost:3978 and you can use the
[Microsoft BotFramework Emulator](https://github.com/Microsoft/BotFramework-Emulator) to interact with it.

# Different Bots
## Generell prototype

I use this prototype to test different features of the MS Bot
framework and relevant technologies.

Currently testing: Prompts, LUIS,

## Prototype 1

This bot will be the first real bot developed to accomplish a task.

Here i want to explore the architecture of building a bot with the
framework and research the best ways to handle interacting with the
user.

This bot will be the "father" to the eventual job application bot. I
will be developing this until it has a functioning system to take
all the needed data to submit a job application from the user.

The bot is mostly functional however it turned out to be just as
tedious as filling out a form. Therefore i dont se a chat-bot being
used for this purpose.

If it were to be developed further i would have the bot open a page
with a job application form, then the bot would ask the user if there
was anything they want to change. The current method of sending lots
of text messages and then asking them if they want to change it is
very tedious.

## Python neural net prototype

This bot was intended to use a neuralnet implemented using Python and
Google's TensorFlow in order to interview the user for a job position,
or guide the user to a job that fits them.

If this bot were to be developed further we would need lots of data of
job interviews such as the questions and answers, and the results.
