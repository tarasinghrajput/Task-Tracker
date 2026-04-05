(() => {
    const EXISTING_WIDGET_ID = 'tt-floating-timer'
    const HIDE_ZONE_ID = 'tt-floating-hide-zone'
    const POSITION_KEY = 'floatingTimerPosition'
    const CONTROLLER_ENABLED_KEY = 'floatingControllerEnabled'
    const SAFE_MARGIN = 8

    if (document.getElementById(EXISTING_WIDGET_ID)) {
        return
    }

    const widget = document.createElement('div')
    widget.id = EXISTING_WIDGET_ID
    widget.innerHTML = `
        <div class="tt-floating-top" id="ttFloatingDragHandle">
            <span class="tt-floating-title">Timer</span>
            <span class="tt-floating-time" id="ttFloatingTime">00:00:00</span>
        </div>
        <div class="tt-floating-actions">
            <button type="button" class="tt-btn tt-btn-start" id="ttFloatingStart">Start</button>
            <button type="button" class="tt-btn tt-btn-pause" id="ttFloatingPause">Pause</button>
            <button type="button" class="tt-btn tt-btn-stop" id="ttFloatingStop">Stop</button>
        </div>
        <p id="ttFloatingStatus"></p>
    `

    const hideZone = document.createElement('div')
    hideZone.id = HIDE_ZONE_ID
    hideZone.innerHTML = '<span>X</span>'

    document.documentElement.appendChild(widget)
    document.documentElement.appendChild(hideZone)

    const timeLabel = widget.querySelector('#ttFloatingTime')
    const statusLabel = widget.querySelector('#ttFloatingStatus')
    const dragHandle = widget.querySelector('#ttFloatingDragHandle')

    let currentPosition = { x: 20, y: 20 }
    let isDragging = false
    let dragOffsetX = 0
    let dragOffsetY = 0
    let statusTimeout = null
    let controllerEnabled = true

    function formatElapsedTime(totalMilliseconds) {
        const totalSeconds = Math.max(0, Math.floor(totalMilliseconds / 1000))
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
        const secs = String(totalSeconds % 60).padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    function clampPosition(x, y) {
        const widgetWidth = widget.offsetWidth || 220
        const widgetHeight = widget.offsetHeight || 92
        const maxX = Math.max(SAFE_MARGIN, window.innerWidth - widgetWidth - SAFE_MARGIN)
        const maxY = Math.max(SAFE_MARGIN, window.innerHeight - widgetHeight - SAFE_MARGIN)
        return {
            x: Math.min(Math.max(x, SAFE_MARGIN), maxX),
            y: Math.min(Math.max(y, SAFE_MARGIN), maxY),
        }
    }

    function setPosition(x, y, persist = false) {
        const nextPosition = clampPosition(x, y)
        currentPosition = nextPosition
        widget.style.left = `${nextPosition.x}px`
        widget.style.top = `${nextPosition.y}px`

        if (persist) {
            chrome.storage.local.set({ [POSITION_KEY]: nextPosition })
        }
    }

    function showStatus(message, isError = false) {
        statusLabel.textContent = message
        statusLabel.classList.toggle('tt-error', isError)

        if (statusTimeout) {
            clearTimeout(statusTimeout)
        }

        statusTimeout = setTimeout(() => {
            statusLabel.textContent = ''
            statusLabel.classList.remove('tt-error')
        }, 2400)
    }

    function updateTimeDisplay() {
        chrome.storage.local.get(['startTime', 'elapsed', 'isRunning'], (data) => {
            let totalElapsed = data.elapsed || 0
            if (data.isRunning && data.startTime) {
                totalElapsed += Date.now() - data.startTime
            }
            timeLabel.textContent = formatElapsedTime(totalElapsed)
        })
    }

    function setControllerVisibility(isEnabled, persist = false) {
        controllerEnabled = Boolean(isEnabled)
        widget.classList.toggle('tt-hidden', !controllerEnabled)

        if (!controllerEnabled) {
            hideZone.classList.remove('tt-visible', 'tt-active')
            isDragging = false
            widget.classList.remove('tt-dragging')
        }

        if (persist) {
            chrome.storage.local.set({ [CONTROLLER_ENABLED_KEY]: controllerEnabled })
        }
    }

    function sendTimerAction(action) {
        chrome.runtime.sendMessage({ action }, (response) => {
            if (chrome.runtime.lastError) {
                showStatus('Extension unavailable', true)
                return
            }

            if (!response || !response.success) {
                showStatus(response?.error || 'Action failed', true)
                return
            }

            updateTimeDisplay()
        })
    }

    function updateHideZoneState(clientX, clientY) {
        const rect = hideZone.getBoundingClientRect()
        const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
        hideZone.classList.toggle('tt-active', isInside)
        return isInside
    }

    function handleMouseMove(event) {
        if (!isDragging || !controllerEnabled) {
            return
        }
        setPosition(event.clientX - dragOffsetX, event.clientY - dragOffsetY)
        updateHideZoneState(event.clientX, event.clientY)
    }

    function handleMouseUp(event) {
        if (!isDragging) {
            return
        }

        const shouldHide = updateHideZoneState(event.clientX, event.clientY)

        isDragging = false
        widget.classList.remove('tt-dragging')
        hideZone.classList.remove('tt-visible', 'tt-active')

        if (shouldHide) {
            setControllerVisibility(false, true)
            return
        }

        chrome.storage.local.set({ [POSITION_KEY]: currentPosition })
    }

    dragHandle.addEventListener('mousedown', (event) => {
        if (!controllerEnabled || event.button !== 0) {
            return
        }

        event.preventDefault()
        isDragging = true
        widget.classList.add('tt-dragging')
        hideZone.classList.add('tt-visible')
        dragOffsetX = event.clientX - currentPosition.x
        dragOffsetY = event.clientY - currentPosition.y
    })

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', () => {
        setPosition(currentPosition.x, currentPosition.y)
    })

    widget.querySelector('#ttFloatingStart').addEventListener('click', () => {
        sendTimerAction('START_TIMER')
    })
    widget.querySelector('#ttFloatingPause').addEventListener('click', () => {
        sendTimerAction('PAUSE_TIMER')
    })
    widget.querySelector('#ttFloatingStop').addEventListener('click', () => {
        sendTimerAction('STOP_TIMER')
    })

    chrome.storage.local.get([POSITION_KEY, CONTROLLER_ENABLED_KEY], (data) => {
        const savedPosition = data[POSITION_KEY]
        const startX = Number.isFinite(savedPosition?.x) ? savedPosition.x : window.innerWidth - 240
        const startY = Number.isFinite(savedPosition?.y) ? savedPosition.y : 16
        setPosition(startX, startY)

        const isEnabled = data[CONTROLLER_ENABLED_KEY] !== false
        setControllerVisibility(isEnabled)
    })

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') {
            return
        }

        if (changes.startTime || changes.elapsed || changes.isRunning) {
            updateTimeDisplay()
        }

        if (changes[CONTROLLER_ENABLED_KEY]) {
            setControllerVisibility(changes[CONTROLLER_ENABLED_KEY].newValue !== false)
        }
    })

    updateTimeDisplay()
    setInterval(updateTimeDisplay, 1000)
})()
