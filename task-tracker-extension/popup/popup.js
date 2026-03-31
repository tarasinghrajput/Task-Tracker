document.addEventListener('DOMContentLoaded', function () {
    const taskNoteInputField = document.getElementById('taskNote')
    const backendUrlInputField = document.getElementById('backendUrl')
    const extensionTokenInputField = document.getElementById('extensionToken')
    const settingsStatus = document.getElementById('settingsStatus')

    function updateUI() {
        chrome.storage.local.get(['startTime', 'elapsed', 'isRunning'], (data) => {
            let total = data.elapsed || 0

            if (data.isRunning && data.startTime) {
                total += Date.now() - data.startTime
            }

            const seconds = Math.floor(total / 1000)
            const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0')
            const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
            const secs = String(seconds % 60).padStart(2, '0')

            document.getElementById('time').textContent = `${hrs}:${mins}:${secs}`
        })
    }

    function showSettingsStatus(message) {
        settingsStatus.textContent = message
        setTimeout(() => {
            if (settingsStatus.textContent === message) {
                settingsStatus.textContent = ''
            }
        }, 2500)
    }

    chrome.storage.local.get(['backendUrl', 'extensionToken'], (data) => {
        backendUrlInputField.value = data.backendUrl || 'http://localhost:8000'
        extensionTokenInputField.value = data.extensionToken || ''
    })

    document.getElementById('saveSettings').addEventListener('click', function () {
        const backendUrl = backendUrlInputField.value.trim()
        const extensionToken = extensionTokenInputField.value.trim()

        chrome.storage.local.set({ backendUrl, extensionToken }, () => {
            showSettingsStatus('Settings saved')
        })
    })

    setInterval(updateUI, 1000)
    updateUI()

    document.getElementById('start').addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'START_TIMER' }, (response) => {
            if (response && !response.success) {
                alert(response.error)
            }
        })
    })

    document.getElementById('pause').addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'PAUSE_TIMER' }, (response) => {
            if (response && !response.success) {
                alert(response.error)
            }
        })
    })

    document.getElementById('reset').addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'RESET_TIMER' }, (response) => {
            if (response && !response.success) {
                alert(response.error)
            }
        })
    })

    document.getElementById('stop').addEventListener('click', function () {
        const taskNote = taskNoteInputField.value

        chrome.runtime.sendMessage({ action: 'STOP_TIMER', payload: taskNote }, (response) => {
            if (response && !response.success) {
                alert(response.error)
            }
        })
    })
})
