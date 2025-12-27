const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiURL = `${backendURL}/api`

export default async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${apiURL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            credentials: options.credentials ?? 'include',
        })

        const contentType = response.headers.get('content-type') || ''
        let data

        if (contentType.includes('application/json')) {
            data = await response.json()
        } else {
            const text = await response.text()
            data = text ? { message: text } : null
        }

        if (!response.ok) {
            throw new Error(data?.message || 'API request failed')
        }

        return data
    } catch (error) {
        console.error('API Error: ', error)
        throw error
    }
}
