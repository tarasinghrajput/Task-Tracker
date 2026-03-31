import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from "@/components/ui/spinner"

const ProtectedRoute = () => {
    const { authenticated, loading, isEmailVerified } = useAuth()
    const location = useLocation()

    if(loading) return <Spinner/>

    if(!authenticated) {
        return <Navigate to="/login" replace />
    }

    if (!isEmailVerified && location.pathname !== '/verify-email') {
        return <Navigate to="/verify-email" replace />
    }

    if (isEmailVerified && location.pathname === '/verify-email') {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
