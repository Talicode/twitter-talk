import * as vscode from 'vscode';

/* TWITTER METHODS
 * Exported functions
 * postTweet takes two arguments, the message to tweet and a link to the twitter object,
 *   it also passes the response to the internal function tweeted that sends an information
 *   message to the extension informing the user of the result
 * generateRandomWords takes no arguments, returns a string of a random selection of words
 *   from the included array list between 3-7 words long
 */

export namespace TweetHandlers {

    export function postTweet(stringMsg: string, twit: any){
        // Let's run it through some sanitizers before passing it on
        var tweet = { status: tweetCheck(stringMsg) }; // The tweet message
        twit.post('statuses/update', tweet, tweeted);
    }
    //Callback function which responds depending on whether the tweet was successful or not
    function tweeted(err: string, data: string, response: any){
        if(err){
            vscode.window.showInformationMessage('Twitter Talk: Something went wrong!');
        } else {
            vscode.window.showInformationMessage('Twitter Talk: You tweeted!');
        }
    }

    function tweetCheck(stringMsg: string){
        var tweetMsg = stringMsg;
        // First truncate for length
        if (tweetMsg.length > 140){
            tweetMsg = tweetMsg.slice(0, 140);
        }
        // TODO: Run some other santization addon
        return tweetMsg;
    }

    // This function generates a string containing a set of random words from 3 to 7 from this list
    export function generateRandomWords() : string {
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

}