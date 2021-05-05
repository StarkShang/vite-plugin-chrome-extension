import { greetings } from "./common/const";
import { log } from "./common/logs";
chrome.runtime.onInstalled.addListener(async () => {
    log("background", greetings);
});

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [ " content-scripts/utils.ts " ]
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [ " content-scripts/utils2.ts " ]
        });
        // chrome.scripting.insertCSS({
        //     target: { tabId: tab.id },
        //     files: ["assets/main.css"]
        // });
    }
});
