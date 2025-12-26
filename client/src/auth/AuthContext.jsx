import { createContext, useContext, useEffect, useState } from 'react'
import fetchAPI from '../api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    // const [verified, setVerified] = useState(false)
    // const [user, setUser] = useState(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {

                const data = await fetchAPI('/auth/is-authenticated', {
                    method: 'GET',
                })

                if(data.success) {
                    setAuthenticated(true)
                } else {
                    setAuthenticated(false)
                }
            } catch(error) {

                setAuthenticated(false)

            } finally {

                setLoading(false)

            }
        }

        checkAuth()
    }, [])

    const value = {
        loading,
        authenticated,
        setAuthenticated,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)