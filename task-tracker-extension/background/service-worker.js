// chrome.storage.local.set({ "timerState": "IDLE" });
let timerState = "IDLE"

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    if (message.action === "START_TIMER" && (timerState === "IDLE" || timerState === "PAUSE" || timerState === "STOP")) {
        timerState = "START"
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
    
    if (message.action === "PAUSE_TIMER" && timerState === "START" && timerState !== "STOP") {
        timerState = "PAUSE"
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
    
    if (message.action === "RESET_TIMER" && (timerState !== "STOP" || timerState !== "PAUSE")) {
        timerState = "STOP"
        resetTimer();
        timerState = "IDLE"
        sendResponse({ success: true });
    }

    if (message.action === "STOP_TIMER" && (timerState !== "IDLE" || timerState !== "START")) {
        await stopTimer(message.payload);
        timerState = "IDLE"
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

const stopTimer = async (taskNote) => {
    chrome.storage.local.get(["elapsed", "isRunning"], (data) => {
        if(!data.isRunning){
            console.log("Timer is not running");
            return;
        }
    })

    try{
        const response = await fetch("http://localhost:8000/api/extension/taskNote", {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({taskNote: taskNote})
        });
        
        const responseData = await response.json();
        if(responseData.success) {
            console.log("Task note sent successfully to backend");
        } else {
            console.error("Backend error:", responseData.message);
        }
    } catch(error) {
        console.error("Task Tracker Backend API fetch failed", error.message)
    }
}