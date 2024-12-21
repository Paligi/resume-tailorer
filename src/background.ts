/// <reference types="chrome"/>

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_AND_TAILOR") {
    setTimeout(async () => {
      try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const tabId = tabs[0]?.id;
        
        if (!tabId) {
          sendResponse({
            success: false,
            message: "Error: No active tab found"
          });
          return;
        }

        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['contentScript.js']
        });

        chrome.tabs.sendMessage(tabId, {type: "EXTRACT_AND_TAILOR"}, (result) => {
          sendResponse(result);
        });

      } catch (error) {
        sendResponse({
          success: false,
          message: "Error: " + (error instanceof Error ? error.message : "Unknown error")
        });
      }
    }, 1);

    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Resume Tailorer extension installed');
});

