chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handleMessage = async () => {
        if (message.action === 'START_TIMER') {
            const snapshot = await getTimerSnapshot()
            if (snapshot.isRunning) {
                sendResponse({ success: false, error: 'Timer is already running' })
                return
            }

            startTimer(snapshot.elapsed)
            sendResponse({ success: true })
            return
        }

        if (message.action === 'PAUSE_TIMER') {
            const snapshot = await getTimerSnapshot()
            if (!snapshot.isRunning) {
                sendResponse({ success: false, error: 'Timer is not running' })
                return
            }

            pauseTimer(snapshot)
            sendResponse({ success: true })
            return
        }

        if (message.action === 'RESET_TIMER') {
            resetTimer()
            sendResponse({ success: true })
            return
        }

        if (message.action === 'STOP_TIMER') {
            try {
                await stopTimer(message.payload)
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

function getTimerSnapshot() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['startTime', 'elapsed', 'isRunning'], (data) => {
            resolve({
                startTime: data.startTime || null,
                elapsed: data.elapsed || 0,
                isRunning: Boolean(data.isRunning),
            })
        })
    })
}

function formatElapsedTime(totalMilliseconds) {
    const totalSeconds = Math.max(0, Math.floor(totalMilliseconds / 1000))
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const secs = String(totalSeconds % 60).padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
}

function startTimer(previousElapsed = 0) {
    chrome.storage.local.set({
        startTime: Date.now(),
        elapsed: previousElapsed || 0,
        isRunning: true,
    })
}

function pauseTimer(snapshot) {
    const elapsed = snapshot.startTime
        ? snapshot.elapsed + (Date.now() - snapshot.startTime)
        : snapshot.elapsed
    chrome.storage.local.set({
        startTime: null,
        elapsed,
        isRunning: false,
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
    const snapshot = await getTimerSnapshot()
    const totalElapsed = snapshot.isRunning
        ? snapshot.elapsed + (snapshot.startTime ? (Date.now() - snapshot.startTime) : 0)
        : snapshot.elapsed

    if (!totalElapsed || totalElapsed <= 0) {
        throw new Error('Timer has no elapsed duration to save')
    }

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
        body: JSON.stringify({
            taskNote: String(taskNote || '').trim() || 'Draft task from extension',
            taskTimeElapsed: formatElapsedTime(totalElapsed),
            elapsedMs: totalElapsed,
            stoppedAt: new Date().toISOString(),
        }),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Backend rejected the extension request')
    }

    resetTimer()
}
