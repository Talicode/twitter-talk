// Get the handle for sending messages back to the API
const vscode = acquireVsCodeApi();

// ------------- Form submit function (tweet message capture) -------------------
//TODO sanitize user-entered content
//TODO limit the length to 140 characters, though it is handled in tweetHandlers
function submit(){
    // Grab the message from the text box
    const text = document.getElementById('message-text');
    // Set the message string to the webview output to show the user
    text.textContent = document.getElementById("message").value;
    // Send the message back to the extension for processing (tweeting)
    vscode.postMessage({command: 'message', text: text.textContent});
}

// ------------ Message sent to Webview from Extension Handler (background color changer)
// In this case the sending a message from the extension to the webview and set the background color to blue

// Handle message(s) sent from extension to webview inside the window
window.addEventListener('message', event => {
    const message = event.data // JSON data sent
    switch(message.command){
        case 'refactor':
            let darkBlueColor = "#000033";
            let darkGreyColor = "#333333";
            debugger;
            let bgColor = document.getElementById("tweet-box").style.backgroundColor;
            if(rgbMatches(bgColor,darkBlueColor))
            {
                //TODO: fix this so it works. Currently not being set transparent, or not comparing properly
                document.getElementById("tweet-box").style.backgroundColor = darkGreyColor;
            } else {
                document.getElementById("tweet-box").style.backgroundColor = darkBlueColor;
            }
            break;
    }
})

// Color handling functions
function rgbExtract(s) {
    var match = /^\s*rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)\s*$/.exec(s);
    if (match === null) {
      return null;
    }
    return { r: parseInt(match[1], 10),
             g: parseInt(match[2], 10),
             b: parseInt(match[3], 10) };
  }
  
  function rgbMatches(sText, tText) {
    var sColor = rgbExtract(sText),
        tColor = rgbExtract(tText);
    if (sColor === null || tColor === null) {
      return false;
    }
    var componentNames = [ 'r', 'g', 'b' ];
    for (var i = 0; i < componentNames.length; ++i) {
      var name = componentNames[i];
      if (sColor[name] != tColor[name]) {
        return false;
      }
    } 
    return true;
  }