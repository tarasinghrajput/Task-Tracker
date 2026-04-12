const logger = require('../config/logger')

const sendTasksToAppsScript = async ({ scriptUrl, payload }) => {
    if (!scriptUrl) {
        throw new Error('Apps Script URL is not configured')
    }

    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const message = await response.text()
            logger.error('Apps Script request failed', { statusCode: response.status, error: message })
            throw new Error(message || 'Apps Script request failed')
        }

        return response.json().catch(() => ({}))
    } catch (error) {
        if (error.message === 'Apps Script URL is not configured') throw error
        logger.error('Apps Script client error', { error: error.message, scriptUrl })
        throw error
    }
}

module.exports = {
    sendTasksToAppsScript,
}
