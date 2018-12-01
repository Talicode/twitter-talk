// Get the handle for sending messages back to the API
const vscode = acquireVsCodeApi();

// ------------- Form submit function (tweet message capture) -------------------
//TODO sanitize user-entered content
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
//'Refactor' Required for keeping track of background color 
//  because of browser color return compatibility issues making comparing colors directly difficult
let isColored = false;
window.addEventListener('message', event => {
    const message = event.data // JSON data sent
    switch(message.command){
        case 'refactor':
            // Because of how different browsers may return color data, a boolean is used to store the
            // current box color. If any other method changes it, this will break the toggle
            let darkBlueColor = "#000033";
            let darkGreyColor = "#444444";
            debugger;
            // Get the current background color of the tweetbox
            let bgColor = document.getElementById("tweet-box").style.backgroundColor;
            if(isColored)
            {
                // If it's colored, set it to transparent
                document.getElementById("tweet-box").style.backgroundColor = 'transparent';
                isColored = false;
            } else {
                // If it's transparent, set it to dark blue
                document.getElementById("tweet-box").style.backgroundColor = darkBlueColor;
                isColored = true;
            }
            break;
    }
})

// Count the length of the message string and update the live count
function trackStringLength() {
    // Get the current state of the message string and its length
    let workingString = document.getElementById("message").value;
    let workingLength = workingString.length;
    // Check for negative value and change color if the message is too long
    if((140 - workingLength) > 0) {
        // Return control of the color on the counter text to the stylesheet
        document.getElementById("count").style.color = '';
    } else {
        // Set the counter text red if there aren't any characters left
        document.getElementById("count").style.color = 'red';
    }
    // Write the string to count
    document.getElementById("count").textContent = (140 - workingLength) + ' characters left';
}

// Color handling functions - not currently used, but was attempted for comparing colors returned from the browser
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