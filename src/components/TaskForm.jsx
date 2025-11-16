import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function TaskForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const receivedState = location.state
    const tasksRef = useRef([])

    useEffect(() => {
        if(tasksRef.current.length > 0) {
            updateLocalStorage()
        } else {
            localStorage.clear()
        }
    }, [tasksRef])

    const handleTaskFormData = (event) => {
        event.preventDefault()
        const form = document.getElementById('tf-form')
        const formData = new FormData(form)

        tasksRef.current = {
            taskTimeElapsed: formData.get('tf-timeElapsed'),
            taskDate: formData.get('tf-date'),
            taskCategory: formData.get('tf-taskCategory'),
            taskType: formData.get('tf-taskType'),
            taskTitle: formData.get('tf-taskTitle'),
            taskDescription: formData.get('tf-taskDescription'),
            taskPriority: formData.get('tf-taskPriority'),
            taskStatus: formData.get('tf-taskStatus')
        }

        updateLocalStorage()
    }

    const handleTaskSubmit = () => {

    }

    function updateLocalStorage() {
        localStorage.setItem('task', JSON.stringify(tasksRef))
    }

    return (
        <section className="taskFormSection">
            <div className="tf-heading">
                <nav>
                    <button onClick={() => navigate('/')}>&larr; back</button>
                </nav>
                <h2>Task Form Entries</h2>
                <h3>TaskTime: {receivedState}</h3>
            </div>
            <div className="tf-form">
                <form onSubmit={handleTaskFormData} id='tf-form'>
                    <input type="date" name="tf-date" value="2004-06-29"/>
                    <input type="hidden" name="tf-timeElapsed" value={receivedState}/>
                    <label htmlFor="tf-taskCategory">
                        Task Category
                        <select name="tf-taskCategory" id="tf-taskCategory">
                            <option value="error-fix" selected>Error Fix</option>
                            <option value="seo">SEO</option>
                        </select>
                    </label>
                    <label htmlFor="tf-taskType">
                        Task Type
                        <input type="text" name="tf-taskType" id="tf-taskType" value="Default TaskForm Type" />
                    </label>
                    <label htmlFor="tf-taskTitle">
                        Task Title
                        <input type="text" name="tf-taskTitle" id="tf-taskTitle" value="Default TaskForm Title" />
                    </label>
                    <label htmlFor="tf-taskDescription">
                        Task Description
                        <textarea name="tf-taskDescription" id="tf-taskDescription" value="Default TaskForm Description"></textarea>
                    </label>
                    <label htmlFor="tf-taskPriority">
                        Task Priority
                        <input type="range" name="tf-taskPriority" id="tf-taskPriority" min="0" max="3" step="1" />
                    </label>
                    <label htmlFor="tf-taskStatus">
                        Task Status
                        <select name="tf-taskStatus" id="tf-taskStatus">
                            <option value="pending">Pending</option>
                            <option value="in-progress" selected>In Progress</option>
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