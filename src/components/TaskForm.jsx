import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function TaskForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const receivedState = location.state
    const tasks = JSON.parse(localStorage.getItem('task'))

    useEffect(() => {
        if(tasks.length > 0) {
            updateLocalStorage()
        }
    }, [tasks])

    const handleTaskFormData = (event) => {
        event.preventDefault()
        const form = document.getElementById('tf-form')
        const formData = new FormData(form)
        const newTask = {
            id: Date.now(),
            taskTimeElapsed: formData.get('tf-timeElapsed'),
            taskDate: formData.get('tf-date'),
            taskCategory: formData.get('tf-taskCategory'),
            taskType: formData.get('tf-taskType'),
            taskTitle: formData.get('tf-taskTitle'),
            taskDescription: formData.get('tf-taskDescription'),
            taskPriority: formData.get('tf-taskPriority'),
            taskStatus: formData.get('tf-taskStatus')
        }

        tasks.push(newTask)

        updateLocalStorage()
    }

    const handleTaskSubmit = () => {

    }

    function updateLocalStorage() {
        localStorage.setItem('task', JSON.stringify(tasks))
    }

    return (
        <section className="taskFormSection">
            <div className="tf-heading">
                <nav>
                    <button onClick={() => navigate('/taskTimer')}>&larr; back</button>
                    <button onClick={() => navigate('/')}>&#127968; Dashboard</button>
                </nav>
                <h2>Task Form Entries</h2>
                <h3>TaskTime: {receivedState}</h3>
            </div>
            <div className="tf-form">
                <form onSubmit={handleTaskFormData} id='tf-form'>
                    <input type="date" name="tf-date" defaultValue="2004-06-29"/>
                    <input type="hidden" name="tf-timeElapsed" value={receivedState}/>
                    <label htmlFor="tf-taskCategory">
                        Task Category
                        <select name="tf-taskCategory" id="tf-taskCategory">
                            <option value="error-fix" defaultValue>Error Fix</option>
                            <option value="seo">SEO</option>
                        </select>
                    </label>
                    <label htmlFor="tf-taskType">
                        Task Type
                        <input type="text" name="tf-taskType" id="tf-taskType" defaultValue="Default TaskForm Type" />
                    </label>
                    <label htmlFor="tf-taskTitle">
                        Task Title
                        <input type="text" name="tf-taskTitle" id="tf-taskTitle" defaultValue="Default TaskForm Title" />
                    </label>
                    <label htmlFor="tf-taskDescription">
                        Task Description
                        <textarea name="tf-taskDescription" id="tf-taskDescription" defaultValue="Default TaskForm Description"></textarea>
                    </label>
                    <label htmlFor="tf-taskPriority">
                        Task Priority
                        <input type="range" name="tf-taskPriority" id="tf-taskPriority" min="0" max="3" step="1" />
                    </label>
                    <label htmlFor="tf-taskStatus">
                        Task Status
                        <select name="tf-taskStatus" id="tf-taskStatus">
                            <option value="pending">Pending</option>
                            <option value="in-progress" defaultValue>In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                        </select>
                    </label>
                    <input type="submit" value="Add Task" />
                </form>
            </div>
        </section>
    )
}

export default TaskForm