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
            credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'API request failed')
        }

        return data
    } catch (error) {
        console.error('API Error: ', error)
        throw error
    }
}