const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiURL = `${backendURL}/api`

export default async function fetchAPI(endpoint){
    const response = await fetch(`${apiURL}${endpoint}`)
    return response
}