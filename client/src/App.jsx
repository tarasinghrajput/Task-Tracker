import './App.css'
import AppRoutes from './routes/AppRoutes'
import { useAuth } from './auth/AuthContext'
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/sonner"


function App() {
  const { loading } = useAuth()

  if(loading) {
    return <Spinner/>
  }

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  )
}

export default App
