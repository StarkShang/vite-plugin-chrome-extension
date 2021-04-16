function reddenPage() {
    document.body.style.backgroundColor = "red";
}

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: reddenPage
        });
    }
});
