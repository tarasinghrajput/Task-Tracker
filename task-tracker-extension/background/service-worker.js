let timerState = 'IDLE'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleMessage = async () => {
        if (message.action === 'START_TIMER' && ['IDLE', 'PAUSE', 'STOP'].includes(timerState)) {
            timerState = 'START'
            chrome.storage.local.get(['isRunning'], (data) => {
                if (data.isRunning) {
                    sendResponse({ success: false, error: 'Timer is already running' })
                } else {
                    startTimer()
                    sendResponse({ success: true })
                }
            })
            return
        }

        if (message.action === 'PAUSE_TIMER' && timerState === 'START') {
            timerState = 'PAUSE'
            chrome.storage.local.get(['isRunning'], (data) => {
                if (!data.isRunning) {
                    sendResponse({ success: false, error: 'Timer is not running' })
                } else {
                    pauseTimer()
                    sendResponse({ success: true })
                }
            })
            return
        }

        if (message.action === 'RESET_TIMER') {
            timerState = 'STOP'
            resetTimer()
            timerState = 'IDLE'
            sendResponse({ success: true })
            return
        }

        if (message.action === 'STOP_TIMER') {
            try {
                await stopTimer(message.payload)
                timerState = 'IDLE'
                sendResponse({ success: true })
            } catch (error) {
                sendResponse({ success: false, error: error.message || 'Failed to sync task note' })
            }
            return
        }

        sendResponse({ success: false, error: 'Unsupported action' })
    }

    handleMessage()
    return true
})

function startTimer() {
    chrome.storage.local.get(['elapsed', 'isRunning'], (data) => {
        if (data.isRunning) {
            console.log('Timer is already running')
            return
        }
        chrome.storage.local.set({
            startTime: Date.now(),
            elapsed: data.elapsed || 0,
            isRunning: true,
        })
    })
}

function pauseTimer() {
    chrome.storage.local.get(['startTime', 'elapsed', 'isRunning'], (data) => {
        if (!data.isRunning) {
            console.log('Timer is not running')
            return
        }
        const elapsed = (data.elapsed || 0) + (Date.now() - data.startTime)

        chrome.storage.local.set({
            elapsed,
            isRunning: false,
        })
    })
}

function resetTimer() {
    chrome.storage.local.set({
        startTime: null,
        elapsed: 0,
        isRunning: false,
    })
}

function getExtensionSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['backendUrl', 'extensionToken'], (data) => {
            resolve({
                backendUrl: (data.backendUrl || 'http://localhost:8000').trim(),
                extensionToken: (data.extensionToken || '').trim(),
            })
        })
    })
}

const stopTimer = async (taskNote) => {
    const { backendUrl, extensionToken } = await getExtensionSettings()

    if (!extensionToken) {
        throw new Error('Missing extension token. Save it in popup settings first.')
    }

    const response = await fetch(`${backendUrl}/api/extension/taskNote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${extensionToken}`,
        },
        body: JSON.stringify({ taskNote }),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Backend rejected the extension request')
    }
}
