import { Routes, Route } from 'react-router-dom'
import TaskTimer from '../pages/TaskTimer'
import TaskForm from '../pages/TaskForm'
import TaskDashboard from '../pages/TaskDashbord'
import LoginPage from '../pages/LoginPage'
import NotFound from '../pages/NotFound'
import SignupPage from '../pages/SignupPage'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '../components/AppLayout.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />


            {/* Protected Pages */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<TaskDashboard />} />
                    <Route path="/taskForm" element={<TaskForm />} />
                    <Route path="/taskTimer" element={<TaskTimer />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Fallback Page */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
