// import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"


function TaskDashboard() {
    const tasks = []
    if (localStorage.length > 0) {
        tasks.push(JSON.parse(localStorage.getItem('task')))
    }

    return (

        <div className="flex min-h-svh flex-col items-center justify-center">
            <section className="taskDashboardSection">
                <div className="taskDashboardList">
                    <h2>Task List</h2>
                    <hr />
                    {!tasks ?
                        <table className="taskList" border="5">
                            <tbody>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Time Elapsed</th>
                                </tr>
                                {tasks[0].map(task => (
                                    <tr key={task.id}>
                                        <td>{task.taskDate}</td>
                                        <td>{task.taskTitle}</td>
                                        <td>{task.taskTimeElapsed}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table> : <p>No Tasks Added</p>
                    }
                </div>
                <Button asChild>
                    <Link to="/taskTimer">+ Add Task</Link>
                </Button>
            </section>
        </div>
    )
}

export default TaskDashboard