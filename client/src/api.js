const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiURL = `${backendURL}/api`

export default async function fetchAPI(endpoint, options){

    const headers = { 
        "Content-Type": "application/json" ,
        "Access-Control-Allow-Credentials": true
    }
    try {
        const response = await fetch(`${apiURL}${endpoint}`, {
            ...options,
            headers: headers,
        })
        if(!response.ok) {
            return console.error("Response is not ok")
        }
        const data = await response.json()
        return data
    } catch(error) {
        throw new Error(`Fetching the API failed....: ${error}`)
    }
}