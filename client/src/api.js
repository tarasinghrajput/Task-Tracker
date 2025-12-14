const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiURL = `${backendURL}/api`

export default async function fetchAPI(endpoint){
    try {
        const response = await fetch(`${apiURL}${endpoint}`)
        if(!response.ok) {
            return console.error("Response was not ok")
        }
        return response
    } catch(error) {
        throw new Error("Fetching the API failed....", error)
    }
}