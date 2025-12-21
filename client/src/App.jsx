import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TaskTimer from './components/TaskTimer'
import TaskForm from './components/TaskForm'
import TaskDashboard from './components/TaskDashbord'
import LoginPage from './components/LoginPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<TaskDashboard />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/taskForm" element={<TaskForm />} />
        <Route path="/taskTimer" element={<TaskTimer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
