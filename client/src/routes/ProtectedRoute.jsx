import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from "@/components/ui/spinner"

const ProtectedRoute = () => {
    const { authenticated, loading } = useAuth()

    if(loading) return <Spinner/>

    if(!authenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute