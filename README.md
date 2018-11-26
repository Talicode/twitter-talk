# twitter-talk README

Extension "twitter-talk" for Visual Studio Code written in Typescript utilizing Node.js on the backend with HTML/CSS/Javascript on the front-end loading in a Webview. This extension utilizes saved credentials in an external .json config file to send out test tweets to the twitter profile associated with the credentials through Twitter's API.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[Webview\]\(TwitterTalk-Webview.jpg\)
\!\[Commands\]\(TwitterTalk-Commands.jpg\)

There are three commands:
Twitter Talk: Enter a new tweet!
Twitter Talk: Send a random length test tweet
Twitter Talk: Change background color as a message passing test

## Requirements

src/config.json is required to connect to a twitter account. The requirements for config.json is described in config.ts and are the standard keys offered by the Twitter API. When you have created the file, put it in the src folder.

## Known Issues

"Twitter Talk: Send a random length test tweet" command does not function unless "Twitter Talk: Enter a new tweet!" has been called, initializing the extension.

## Release Notes

### 1.0.0

Initial release of the extension.

### 1.0.1

Restructured files to use external style.css and scripts.js for client side formatting and scripting
