// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import * as vscode from 'vscode';
import * as path from 'path';

/* NOT WORKING for now, come back to later
const shelties = {
    'Bone Sheltie': vscode.Uri,
    'Swing Sheltie': vscode.Uri,
    'Treadmill Sheltie': vscode.Uri,
    'Scritch Sheltie': vscode.Uri
};
*/

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "Twitter Talk" is now active!');
    
    // Path to media resources on disk
    const mediaPath = vscode.Uri.file(path.join(context.extensionPath, 'media'));
    // TODO base all the media resources on the above mediaPath
    // Initialize media resources
    const twitterLogo = vscode.Uri.file(path.join(context.extensionPath, 'media', 'Twitter_Logo_Blue.svg'));
    const twitterLogoSrc =  twitterLogo.with({scheme: 'vscode-resource'}).toString();
    // TODO link the javascript & css file

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
            //TODO: This won't accept columnToShowIn for some reason, hard coded to One as a temporary solution until I figure it out
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

            /* Not working for now, testing URI conversions
            // Update contents based on view state changes
            currentPanel.onDidChangeViewState(e => {
                const currentPanel = e.webviewPanel;
                switch (currentPanel.viewColumn){
                    case vscode.ViewColumn.One:
                    updateWebviewBySheltie(currentPanel, 'Bone Sheltie');
                    return;

                    case vscode.ViewColumn.Two:
                    updateWebviewBySheltie(currentPanel, 'Swing Sheltie');
                    return;

                    case vscode.ViewColumn.Three:
                    updateWebviewBySheltie(currentPanel, 'Treadmill Sheltie');
                    return;      
                }
            });
            */

            // Reset when current panel is closed
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            }, null, context.subscriptions);
        }

        // Listener for messages posted back to webview
        currentPanel.webview.onDidReceiveMessage(e => {
            vscode.window.showInformationMessage('Recieved a message from client JS!');
            console.log(e);
        });
    }));

    // Pass message from an extension to a webview to refactor (reduce the count)
    context.subscriptions.push(vscode.commands.registerCommand('twitterTalk.doRefactor', () => {
        if(!currentPanel){
            return;
        }
        // Send a message to webview, any JSON serializable data is allowed
        currentPanel.webview.postMessage({command: 'refactor'});

    }));

}

/*
function updateWebviewBySheltie(panel: vscode.WebviewPanel, sheltieAction: keyof typeof shelties){
    panel.title = sheltieAction;
    panel.webview.html = getWebviewContent(sheltieAction);
}
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
                padding: 10px;
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

        <div class="box">
            <h2>Send a Tweet!</h2>
            <img src="${imgSrc}" width="300" />

            <!-- Form starts here -->
            <h3>Message:</h3>
            <textarea id="message" placeholder="140 characters or fewer"></textarea>
            <button onClick="submit()">Send Message</button>

            <!-- Form for testing Node.js value passing -->
            <form method="post" action="/">
                <input type="hidden" name="testVariable" value="this is passing from the webview to Node.js">
                <input type="submit" name="submit" value="Submit"
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

    </body>
    
    </html>`;
}
