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
    // Initialize media resources
    // TODO base all the media resources on the above mediaPath
    const boneSheltie = vscode.Uri.file(path.join(context.extensionPath, 'media', 'bone.gif'));
    const boneSheltieSrc =  boneSheltie.with({scheme: 'vscode-resource'}).toString();

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

            currentPanel.webview.html = getWebviewContent(boneSheltieSrc);

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

        // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
    </head>
    <body>
        <img src="${imgSrc}" width="300" />

        <h1 id="lines-of-code-counter">0</h1>

        <script>
            const counter = document.getElementById('lines-of-code-counter');
    
            let count = 0;
            // TODO: This count seems to increment forever, want it to stop at 100
            setInterval(() => {
                counter.textContent = count++;
            }, 100);

            // Handle the message inside the window
            window.addEventListener('message', event => {
                const message = event.data // JSON data sent
                switch(message.command){
                    case 'refactor':
                        count = Math.ceil(count * 0.5);
                        counter.textContent = count;
                        break;
                }
            })
        </script>
    </body>
    
    </html>`;
}
