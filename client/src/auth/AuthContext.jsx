/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import fetchAPI from '../api.js'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    const refreshAuth = async () => {
        try {
            const data = await fetchAPI('/auth/is-authenticated', {
                method: 'GET',
            })

            if (data.success) {
                setAuthenticated(true)
                setIsEmailVerified(Boolean(data.user?.isEmailVerified))
                setUserEmail(data.user?.email || '')
            } else {
                setAuthenticated(false)
                setIsEmailVerified(false)
                setUserEmail('')
            }
        } catch {
            setAuthenticated(false)
            setIsEmailVerified(false)
            setUserEmail('')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshAuth()
    }, [])

    const value = {
        loading,
        authenticated,
        isEmailVerified,
        userEmail,
        setAuthenticated,
        setIsEmailVerified,
        refreshAuth,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
