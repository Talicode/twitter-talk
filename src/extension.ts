// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
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
 *   Test the message by hitting "Preview Message" which will print it below the box
 *   TODO: Post message to twitter (post function not connected to onDidReceiveMessage)
 * 
 * Twitter Talk: Send a random length test tweet
 *   Creates a random string of words and tweets the string
 * 
 * Twitter Talk: Change background color as a message passing test
 *   Activate command to change the background of the tweet box as a test of passing
 *   a message from the extension to the webview
 *   TODO: Make the command toggle between colored and transparent
 *   
 * -------------------------------------------------------------------------------------
 * Planned Improvements
 * Offload the HTML/JS/CSS into their own files and import them for the webview
 * Restructure the credentials, twitter functionality, aux functions their own file
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

// Twitter API dependencies
var Twitter = require ('twitter');
// Credientials connect to @talicode
import {Config} from "./config";
const config: Config = require('../src/config.json');

// This method is called when your extension is activated. Activation is
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

    // TEST TWEET COMMAND SETUP
    let disposable = vscode.commands.registerCommand('twitterTalk.test', () => {
        // This needed to be dynamically created as twitter will reject identical tweets
        let randomMessage = generateRandomWords();
        postTweet(randomMessage, T);
    });

    // WEBVIEW SETUP
    // Only allow a single webview to exist at a time. If it's in the background, then bring it to the foreground

    // Track current webview panel
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

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

            currentPanel.webview.html = getWebviewContent(twitterLogoSrc);

            // Reset when current panel is closed
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
        }

        // Listener for messages posted back to webview
        // TODO: connect this with the form, and then the tweet post
        currentPanel.webview.onDidReceiveMessage(e => {
            vscode.window.showInformationMessage('Recieved a message from client JS!');
            console.log(e);
        });
    }));

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

/* WEBVIEW METHOD
 *
 */

function getWebviewContent(imgSrc: string){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Twitter Talk</title>
        <!-- TODO: Change to external file. This doesn't work, embedding styles for now 
        <link rel="stylesheet" href="./style.css"> -->
        <style>
            h1 {
                color: blue;
                text-align: center;
            }
            h2 {
                text-align: center;
                margin: 0px;
                padding: 10px;
            }
            img {
                width: 80%;
                display: block;
                margin-left: auto;
                margin-right: auto;
            }
            div.box {
                width: 40%;
                margin: 0 auto;
                padding: 10px;
                border: 1px solid #38A1F3;
            }
            textarea {
                width: 100%;
                display: inline-block;
                margin: 0px;
                padding: 10px;
                box-sizing: border-box;
            }
            input {
                width: 100%;
                font-size: 150%; 
                display: inline-block;
                background-color: #38A1F3;
                border: none;
                padding: 10px;
                box-sizing: border-box;                
            }
            button {
                width: 100%;
                font-size: 150%; 
                display: inline-block;
                background-color: #38A1F3;
                border: none;
                padding: 10px; margin-top: 2px; margin-bottom: 2px;
                box-sizing: border-box;
            }
            p {
                width: 40%;
                margin: 0 auto;
                padding: 10px;
            }
        </style>

        <!-- Not used just yet, jQuery for form support
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
        -->

        <!-- Not working just yet, trying to get external scripts to load
        <script src="./scripts.js" type="text/javascript"></script>
        -->

        <!-- TODO: A more sane content security policy, but it breaks embedded scripts
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
        -->

    </head>
    <body>

        <div class="box" id="tweet-box">
            <h2>Send a Tweet!</h2>
            <img src="${imgSrc}" width="300" />

            <!-- Form starts here -->
            <h3>Message:</h3>
            <textarea id="message" placeholder="140 characters or fewer"></textarea>
            <button onClick="submit()">Preview Message</button>

            <!-- Form for testing Node.js value passing -->
            <form method="post" action="/">
                <input type="hidden" name="testVariable" value="this is passing from the webview to Node.js">
                <input type="submit" name="submit" value="Post Message"
            </form>
        </div>

        <h2>Message is:</h2>

        <p id="message-text">No message entered</p>
    
        <script language="javascript">
        const text = document.getElementById('message-text');
        //TODO sanitize content
        //TODO limit the length to 140 characters
        function submit(){
            text.textContent = document.getElementById("message").value;
        }
        </script>

        <script language="javascript">
        // In this case the refactor test is sending a message from the extension to the webview
        //  and set the background color to grey

        // Handle the message inside the window
        window.addEventListener('message', event => {
            const message = event.data // JSON data sent
            switch(message.command){
                case 'refactor':
                    let darkBlueColor = "#000033";
                    let bgColor = document.getElementById("tweet-box").style.backgroundColor;
                    if(bgColor == darkBlueColor)
                    {
                        //TODO: fix this so it works. Currently not being set transparent, or not comparing properly
                        document.getElementById("tweet-box").style.backgroundColor = "transparent";
                    } else {
                        document.getElementById("tweet-box").style.backgroundColor = darkBlueColor;
                    }
                    break;
            }
        })
        </script>

    </body>
    
    </html>`;
}

/* TWITTER METHODS
 *
 */

function postTweet(stringMsg: string, twit: any){
    vscode.window.showInformationMessage('Preparing tweet: ' + stringMsg);
    var tweet = { status: stringMsg }; // The tweet message
    twit.post('statuses/update', tweet, tweeted);
}
//Callback function which responds depending on whether the tweet was successful or not
function tweeted(err: string, data: string, response: any){
    if(err){
        vscode.window.showInformationMessage('Tweeted: Something went wrong!');
    } else {
        vscode.window.showInformationMessage('Tweeted: You tweeted!');
    }
}

// This function generates a string containing a set of random words from 3 to 7 from this list
function generateRandomWords() : string {
    var random_words:string[] = [
        "kill", "arrogant", "scarecrow", "crazy", "replace", 
        "twist", "reach", "ground", "astonishing", "angry", 
        "nonchalant", "billowy", "burly", "month", "bat",
        "wholesale", "bed", "faithful", "rain", "narrow",
        "fresh", "decorate", "room", "excite", "original"
    ];
    var randomString = "";
    var n:number = Math.floor(Math.random()*5)+3;
    do {
        randomString = randomString + " " + random_words[Math.floor(Math.random()*random_words.length)];
        n--;
    } while (n > 0);
    return randomString;
}
