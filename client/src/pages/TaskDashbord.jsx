import { useEffect, useState } from 'react'
import fetchAPI from '../api.js'
import { toast } from "sonner"
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"


function TaskDashboard() {
    const [tasks, setTasks] = useState([])

    const fetchTasks = () => {
        const tasksPromise = fetchAPI('/task/get-tasks', { method: 'GET' }).then((data) => {
            setTasks(Array.isArray(data.tasks) ? data.tasks : [])
            return data
        })

        toast.promise(tasksPromise, {
            loading: "Fetching tasks...",
            success: (data) => data.message || "Tasks fetched successfully",
            error: (error) => error?.message || "Fetching tasks failed. Please try refreshing the page.",
        })

        return tasksPromise
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const formatTaskDate = (dateValue) => {
        if (!dateValue) return '—'
        const parsedDate = new Date(dateValue)
        if (Number.isNaN(parsedDate.getTime())) {
            return dateValue
        }
        return parsedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
        })
    }

    const handleDeleteTask = (taskId) => {
        const deletePromise = fetchAPI(`/task/${taskId}`, {
            method: 'DELETE',
        }).then((data) => {
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId))
            return data
        })

        toast.promise(deletePromise, {
            loading: "Deleting task...",
            success: (data) => data.message || "Task deleted successfully",
            error: (error) => error?.message || "Failed to delete the task",
        })
    }

    return (

        <div className="flex flex-col items-center justify-center">
            <section className="taskDashboardSection flex flex-col p-10 rounded-sm bg-white border border-[#e8e8e8] w-full gap-6">
                <div className="flex w-full flex-row justify-between border-b-2 pb-2 mb-8">
                    <h2 className="text-heading gray-800 text-3xl font-semibold mb-4">Task List</h2>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={fetchTasks}>
                            Refresh
                        </Button>
                        <Button asChild>
                            <Link to="/taskTimer">+ Add Task</Link>
                        </Button>
                    </div>
                </div>
                <div className="taskDashboardList overflow-x-auto">
                    {tasks.length > 0 ?
                        <Table>
                            <TableCaption>A list of your tasks.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Task ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Task Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Impact Level</TableHead>
                                    <TableHead className="text-right">Time Spent</TableHead>
                                    <TableHead className="text-right">Synced</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => {
                                    return (
                                        <TableRow key={task._id} className="taskList">
                                            <TableCell className="font-semibold">{task.taskIdentifier}</TableCell>
                                            <TableCell>{formatTaskDate(task.taskDate)}</TableCell>
                                            <TableCell>{task.taskTitle}</TableCell>
                                            <TableCell>{task.taskCategory}</TableCell>
                                            <TableCell>{task.taskStatus}</TableCell>
                                            <TableCell className="capitalize">{task.impactLevel}</TableCell>
                                            <TableCell className="text-right">{task.taskTimeElapsed}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={task.isSyncedToSheet ? "text-green-600 text-sm font-medium" : "text-amber-600 text-sm font-medium"}>
                                                    {task.isSyncedToSheet ? 'Synced' : 'Pending'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    aria-label="Delete task"
                                                    onClick={() => handleDeleteTask(task._id)}
                                                >
                                                    <img src="/trash-solid-full.svg" alt="Delete task" className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        : <p>No tasks added yet.</p>
                    }
                </div>
            </section>
        </div>
    )
}

export default TaskDashboard
