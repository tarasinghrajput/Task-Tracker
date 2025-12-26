import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRoutes from './routes/AppRoutes'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { Spinner } from "@/components/ui/spinner"


function App() {
  const { loading } = useAuth()

  if(loading) {
    return <Spinner/>
  }

  return <AppRoutes />
}

export default App
