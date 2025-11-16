import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TaskTimer from './components/TaskTimer'
import TaskForm from './components/TaskForm'
import TaskDashboard from './components/TaskDashbord'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<TaskTimer />} />
        <Route path="/taskForm" element={<TaskForm />} />
        <Route path="/taskDashboard" element={<TaskDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
