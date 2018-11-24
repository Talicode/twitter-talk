import * as vscode from 'vscode';
import * as path from 'path';

/* WEBVIEW METHOD
 * There is only one function that is a string html file setting up the webview
 * TODO: restructure so that the getWebviewContent function takes no arguments,
 *   break the css/script/images into their own files and import directly
 *   having to pass it in the function is cumbersome for any webview that is more complicated
 *  Implement a sane access policy
 */

export namespace WebviewHtml {

    export function getWebviewContent(mediaPath: string){
    // All media resources are based on the past mediaPath
    // Note that all will have to be appended with '/' and the file name
    // Then processed into vscode-resource before being valid

    // Initialize media resources
    const twitterLogo = vscode.Uri.file(path.join(mediaPath, '/Twitter_Logo_Blue.svg'));
    const twitterLogoSrc =  twitterLogo.with({scheme: 'vscode-resource'}).toString();

    // TODO link the javascript & css to an external file

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
                <img src="${twitterLogoSrc}" width="300" />

                <!-- Form starts here -->
                <h3>Message:</h3>
                <textarea id="message" placeholder="140 characters or fewer"></textarea>
                <button onClick="submit()">Send Tweet!</button>

            </div>

            <h2>Message is:</h2>

            <p id="message-text">No message entered</p>
        
            <script language="javascript">
            // PREVIEW MESSAGE TEXT
            const vscode = acquireVsCodeApi();
            const text = document.getElementById('message-text');
            //TODO sanitize user-entered content
            //TODO limit the length to 140 characters, though it is handled in tweetHandlers
            function submit(){
                text.textContent = document.getElementById("message").value;
                vscode.postMessage({command: 'message', text: text.textContent});
            }
            </script>

            <script language="javascript">
            // SEND MESSAGE FROM WEBVIEW TO EXTENSION

            </script>

            <script language="javascript">
            // BACKGROUND COLOR CHANGER - MESSAGE SENT FROM EXTENSION
            // In this case the refactor test is sending a message from the extension to the webview
            //  and set the background color to grey

            // Handle the message sent from extension to webview inside the window
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

}