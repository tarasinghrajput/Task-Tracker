const sendTasksToAppsScript = async ({ scriptUrl, payload }) => {
    if (!scriptUrl) {
        throw new Error('Apps Script URL is not configured')
    }

    const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Apps Script request failed')
    }

    return response.json().catch(() => ({}))
}

module.exports = {
    sendTasksToAppsScript,
}
