chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_TIMER") {
        startTimer();
        sendResponse({ success: true });
    }

    if (message.action === "PAUSE_TIMER") {
        pauseTimer();
        sendResponse({ success: true });
    }

    if (message.action === "RESET_TIMER") {
        resetTimer();
        sendResponse({ success: true });
    }
});


function startTimer() {
    chrome.storage.local.get(["elapsed"], (data) => {
        chrome.storage.local.set({
            startTime: Date.now(),
            elapsed: data.elapsed || 0,
            isRunning: true
        });
    });
}

function pauseTimer() {
    chrome.storage.local.get(["startTime", "elapsed"], (data) => {
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