// BACKEND WHICH WILL BE USED FOR SETTINGS IN THE FUTURE!
const process = function(request,sender) {

} 

const actionTable = {}

actionTable["disableExetension"] = process



// Website listner!
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
       if(request.action == undefined) 
       {
            sendResponse("Request property action not defined.")
       }else{
            let act = actionTable[request.action] 
            if (act == undefined) 
            {   
                sendResponse("Action '" + request.action + "' not found!");
            }else{ 
                sendResponse(act(request,sender))
            }
       }
    }
  );