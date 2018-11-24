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
    // All media resources are based on the past mediaPath and authorized in extension.ts
    // Note that all will have to be appended with '/' and the file name
    // Then processed into vscode-resource before being valid

    // Initialize media resources
    // External CSS file
    const cssFile = vscode.Uri.file(path.join(mediaPath, '/style.css'));
    const cssFileSrc = cssFile.with({scheme: 'vscode-resource'}).toString();

    // External Javascript file
    const scriptsFile = vscode.Uri.file(path.join(mediaPath, '/scripts.js'));
    const scriptsJSSrc = scriptsFile.with({scheme: 'vscode-resource'}).toString();

    // Twitter logo
    const twitterLogo = vscode.Uri.file(path.join(mediaPath, '/Twitter_Logo_Blue.svg'));
    const twitterLogoSrc =  twitterLogo.with({scheme: 'vscode-resource'}).toString();

    // TODO link the javascript to an external file

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Twitter Talk</title>
            <!-- External CSS File -->
            <link rel="stylesheet" type="text/css" href="${cssFileSrc}">

            <!-- External Javascripts -->
            <script src="${scriptsJSSrc}" type="text/javascript"></script>

            <!-- TODO: A more sane content security policy, this one breaks embedded scripts
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
        
        </body>
        
        </html>`;
    }

}