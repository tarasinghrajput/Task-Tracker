import { useState, useEffect } from 'react'
import {useNavigate} from 'react-router-dom'


function TaskDashboard() {
    const tasks = []
    if (localStorage.length > 0) {
        tasks.push(JSON.parse(localStorage.getItem('task')))
    }
    const navigate = useNavigate()

    return (
        <section className="taskDashboardSection">
            <div className="taskDashboardList">
                <h2>Task List</h2>
                <hr />
                <ul className="taskList">
                    {tasks[0].map(task => (
                        <li className="taskListItem" key={task.id}>{task.taskDate} - {task.taskTitle}</li>
                    ))
                    }
                </ul>
            </div>

            <button onClick={() => navigate('/')}>Add Task</button>
        </section>
    )
}

export default TaskDashboard