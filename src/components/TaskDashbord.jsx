import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


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
                <table className="taskList" border="5">
                    <tbody>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Time Elapsed</th>
                        </tr>
                        {tasks[0].map(task => (
                            <tr>
                                <td>{task.taskDate}</td>
                                <td>{task.taskTitle}</td>
                                <td>{task.taskTimeElapsed}</td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
            </div>

            <button onClick={() => navigate('/taskTimer')}>Add Task</button>
        </section>
    )
}

export default TaskDashboard