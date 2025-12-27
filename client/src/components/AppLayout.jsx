import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import fetchAPI from '../api.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const navItems = [
    { to: '/', label: 'Dashboard', description: 'View logged tasks' },
    { to: '/taskTimer', label: 'Task Timer', description: 'Track time before logging' },
    { to: '/taskForm', label: 'Task Form', description: 'Add a new task manually' },
    { to: '/settings', label: 'Settings', description: 'Configure integrations' },
]

function AppLayout() {
    const { setAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await fetchAPI('/auth/logout', { method: 'POST' })
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error(error?.message || 'Failed to logout. Clearing session.')
        } finally {
            setAuthenticated(false)
            navigate('/login', { replace: true })
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <aside className="w-64 border-r bg-white flex flex-col">
                <div className="px-6 py-6 border-b">
                    <p className="text-xl font-semibold">Task Tracker</p>
                    <p className="text-sm text-muted-foreground">Stay on top of your work</p>
                </div>
                <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "rounded-lg px-3 py-3 transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-700 hover:bg-slate-100"
                                )
                            }
                        >
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.description}</p>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
