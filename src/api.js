export async function saveTask(entry) {
    const url = "https://script.google.com/macros/s/AKfycbyFJjaIyZr64cQjDhmM6QrbDsfeIwNcyW5CAgiLsLUAZbwMIOvC5y5DcgSZmDRt0WG-Vw/exec"

    try {
        // Send JSON data as form data with a 'data' field
        // This works around CORS restrictions while allowing Google Apps Script to parse JSON
        const formData = new FormData()
        formData.append('data', JSON.stringify(entry))

        // Use no-cors mode to bypass CORS restrictions with Google Apps Script
        // Note: With no-cors, we cannot read the response, but the request will be sent
        await fetch(url, {
            method: "POST",
            body: formData
            // Don't set Content-Type header - browser will set it automatically for FormData
        })

        // With no-cors mode, response is opaque and we can't read it
        // If fetch doesn't throw an error, we assume the request was sent successfully
        return { success: true, message: "Data sent to Google Sheets" }
    } catch (error) {
        console.error("Error saving task to Google Apps Script:", error)
        // Re-throw to allow caller to handle
        throw error
    }
}