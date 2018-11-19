// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types
import * as vscode from 'vscode';
import * as path from 'path';

/* -------------------------------------------------------------------------------------
 * Twitter-Talk: Visual Studio Code Extension in typescript and Node.js which sends tweets.
 * coder: Anya talisancreations@gmail.com   date: 11.18.18  twitter: @talicode
 * github: https://github.com/Talicode/twitter-talk
 * 
 * There are three commands
 * 
 * Twitter Talk: Enter a new tweet!
 *   Begins the extension and opens the webview, displays a form which the user can enter a message
 *   Clicking Send Tweet! will send the concents of the text box as a tweet and print it below the box
 * 
 * Twitter Talk: Send a random length test tweet
 *   Creates a random string of (3-7) words and tweets the string
 * 
 * Twitter Talk: Change background color as a message passing test
 *   Activate command to change the background of the tweet box as a test of passing
 *   a message from the extension to the webview
 *   TODO: Make the command toggle between colored and transparent
 *   
 * -------------------------------------------------------------------------------------
 * Planned Improvements
 * Offload the HTML/JS/CSS into their own files and import them for the webview
 * Scrub the imput box, fix the background color toggle
 * -------------------------------------------------------------------------------------
 * Helpful Resources:
 * Visual Studio Code Extension Examples https://code.visualstudio.com/docs/extensions/samples
 * Visual Studio Code Webview API https://code.visualstudio.com/docs/extensions/webview
 * Visual Studio Code extension API https://code.visualstudio.com/docs/extensionAPI/vscode-api
 * Twitter API https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/post-statuses-update
 * DZone - How to use Twitter API With Node.js https://dzone.com/articles/how-to-use-twitter-api-using-nodejs
 * Working On:
 * Stack Overflow - Pass Variables from Javascript to Node.js
 *   https://stackoverflow.com/questions/27238231/pass-variables-from-javascript-to-node-js
 * How to use CSS Modules with Typescript and webpack
 *   https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
 * Setting up Visual Studio Code - HTML CSS and Javascript settings
 *   https://zellwk.com/blog/vscode-2/
 * DZone - Learn jQuery in 4 Steps https://dzone.com/articles/4-steps-to-learn-jquery-for-beginners
 * Stack Overflow - Use HTML files in Visual Studio Code extension development
 *   https://stackoverflow.com/questions/51236058/use-html-files-in-visual-studio-code-extension-development/51332941
 * -------------------------------------------------------------------------------------*/

// ------- Twitter API files ----------
var Twitter = require ('twitter');
// Used this resource https://stackoverflow.com/questions/41467801/how-to-create-an-application-specific-config-file-for-typescript
import {Config} from "./config";
// JSON file is credientials connecting to @talicode
const config: Config = require('../src/config.json');
// Methods for handling tweets
import {TweetHandlers} from './tweetHandlers';

// --------- Webview setup files ----------
import {WebviewHtml} from './webviewHtml';

// ------------------ Extension Activation Method ----------------------
// This method is called when the extension is activated. Activation is
// controlled by the activation events defined in package.json.

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "Twitter Talk" is now active!');

    // Set up a twitter client
    // Learning from this resource https://github.com/austin-----/vscode-twitter
    // But trying to build simply from this one https://codeburst.io/build-a-simple-twitter-bot-with-node-js-in-just-38-lines-of-code-ed92db9eb078
    // This was the most helpful https://dzone.com/articles/how-to-use-twitter-api-using-nodejs
   var T = new Twitter(config);
    
    // Path to media resources on disk
    const mediaPath = vscode.Uri.file(path.join(context.extensionPath, 'media'));
    // TODO base all the media resources on the above mediaPath
    // Initialize media resources
    const twitterLogo = vscode.Uri.file(path.join(context.extensionPath, 'media', 'Twitter_Logo_Blue.svg'));
    const twitterLogoSrc =  twitterLogo.with({scheme: 'vscode-resource'}).toString();
    // TODO link the javascript & css to an external file

    // COMMAND: RANDOM TEST TWEET
    let disposable = vscode.commands.registerCommand('twitterTalk.test', () => {
        // This needed to be dynamically created as twitter will reject identical tweets
        let randomMessage = TweetHandlers.generateRandomWords();
        TweetHandlers.postTweet(randomMessage, T);
    });

    // WEBVIEW SETUP
    // Only allow a single webview to exist at a time. If it's in the background, then bring it to the foreground

    // Track current webview panel
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    // COMMAND: START TWITTER TALK AND LOAD WEBVIEW
    context.subscriptions.push(vscode.commands.registerCommand('twitterTalk.start', () => {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (currentPanel){
            // If there is already a panel, show it in the column
            currentPanel.reveal(columnToShowIn);
        } else {
            // Otherwise set up a new panel
            currentPanel = vscode.window.createWebviewPanel(
            'twitterTalk', // Identifies the type of webview. Used internally
            "Twitter Talk", // Title of the panel displayed to the user
            //TODO: This won't accept a dynamically set columnToShowIn for some reason (maybe the possibly undefined issue), 
            // hard coded to One as a temporary solution until I figure it out
            vscode.ViewColumn.One, // Editor column to show the new webview panel in 
            
            { // Webview options
                // Only allow webview to access resources in the media directory
                localResourceRoots: [
                    //TODO change this to the genericised single source when I figure out how
                    mediaPath
                ],
                // Enable scripts in the webview (NOTE! NOT SECURE)
                enableScripts: true,
                // WARNING: High overhead, only use if really needed
                retainContextWhenHidden: true
            }
            );

            // Having to pass in each media file to the webview is problematic
            // TODO: restructure to be able to import from the filesystem in webviewHtml directly
            currentPanel.webview.html = WebviewHtml.getWebviewContent(twitterLogoSrc);

            // Reset when current panel is closed
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
        }

        // Listener for messages posted back to webview
        currentPanel.webview.onDidReceiveMessage(e => {
        //    console.log(e);
            switch(e.command){
                case 'message':
                // This is a tweet from the webform
                TweetHandlers.postTweet(e.text, T);
            }
        });
    }));

    // COMMAND: MESSAGE FROM EXTENSION TO WEBVIEW
    // Pass message from an extension to a webview to refactor (reduce the count)
    context.subscriptions.push(vscode.commands.registerCommand('twitterTalk.refactor', () => {
        if(!currentPanel){
            return;
        }
        // Send a message to webview, any JSON serializable data is allowed
        currentPanel.webview.postMessage({command: 'refactor'});

    }));

    // Collect disposibles - this is for the twitterTalk.test extension command
    context.subscriptions.push(disposable);
}