const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiURL = `${backendURL}/api`

export default async function fetchAPI(endpoint, options){
    try {
        const response = await fetch(`${apiURL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(!response.ok) {
            return console.error("Response was not ok")
        }
        const body = response.json()
        return body
    } catch(error) {
        throw new Error("Fetching the API failed....", error)
    }
}