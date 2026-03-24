chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_TIMER") {
        chrome.storage.local.get(["isRunning"], (data) => {
            if (data.isRunning) {
                sendResponse({ success: false, error: "Timer is already running" });
            } else {
                startTimer();
                sendResponse({ success: true });
            }
        });
        return true;
    }

    if (message.action === "PAUSE_TIMER") {
        chrome.storage.local.get(["isRunning"], (data) => {
            if (!data.isRunning) {
                sendResponse({ success: false, error: "Timer is not running" });
            } else {
                pauseTimer();
                sendResponse({ success: true });
            }
        });
        return true;
    }

    if (message.action === "RESET_TIMER") {
        resetTimer();
        sendResponse({ success: true });
    }
});


function startTimer() {
    chrome.storage.local.get(["elapsed", "isRunning"], (data) => {
        if (data.isRunning) {
            console.log("Timer is already running");
            return;
        }
        chrome.storage.local.set({
            startTime: Date.now(),
            elapsed: data.elapsed || 0,
            isRunning: true
        });
    });
}

function pauseTimer() {
    chrome.storage.local.get(["startTime", "elapsed", "isRunning"], (data) => {
        if (!data.isRunning) {
            console.log("Timer is not running");
            return;
        }
        const elapsed = (data.elapsed || 0) + (Date.now() - data.startTime);
        
        chrome.storage.local.set({
            elapsed: elapsed,
            isRunning: false
        });
    });
}

function resetTimer() {
    chrome.storage.local.set({
        startTime: null,
        elapsed: 0,
        isRunning: false
    });
}