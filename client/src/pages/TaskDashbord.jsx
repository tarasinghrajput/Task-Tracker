import { useEffect, useState } from 'react'
import fetchAPI from '../api'
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
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

    const getAllTask = async () => {
        return fetchAPI('/task/get-tasks', { method: 'GET' })
    }

    const getAllTaskWithToast = async () => {
        return toast.promise(
            getAllTask(),
            {
                loading: "fetching the tasks.....",
                success: (data) => {
                    setTasks(data.tasks)
                    return data.message || "Tasks fetched succcessfully"
                },
                error: (error) => error?.message || "Tasks fetched unsucccessfully, please try refreshing the page"
            }
        )
    }

    useEffect(() => {
        getAllTaskWithToast()
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

    const handleDeleteTask = async (task) => {
        toast.promise(
            fetchAPI('/task/delete-task', {
                method: 'POST',
                body: JSON.stringify({id: task._id})
            }),
            {
                loading: "The task is being deleted......",
                success: (data) => data.message || "The task deleted successfully",
                error: (error) => error.message || "The tasks deletion failed an error"
            }
        )
        getAllTaskWithToast()
    }

    return (

        <div className="flex flex-col items-center justify-center">
            <Toaster />
            <section className="taskDashboardSection flex flex-col p-10 rounded-sm bg-white border border-[#e8e8e8] w-full h-180">
                <div className="flex w-full flex-row justify-between border-b-2 pb-2 mb-8">
                    <h2 className="text-heading gray-800 text-3xl font-semibold mb-4">Task List</h2>
                    <Button asChild>
                        <Link to="/taskTimer">+ Add Task</Link>
                    </Button>
                </div>
                <div className="taskDashboardList">
                    {tasks.length > 0 ?
                        <Table>
                            <TableCaption>A list of your tasks.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Date</TableHead>
                                    <TableHead>Task Title</TableHead>
                                    <TableHead className="text-right">Time Elapsed</TableHead>
                                    {/* <TableHead className="text-right">Actions</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => {
                                    return (
                                        <TableRow key={task._id} className="taskList">
                                            <TableCell className="font-medium">{formatTaskDate(task.taskDate)}</TableCell>
                                            <TableCell>{task.taskTitle}</TableCell>
                                            <TableCell className="text-right">{task.taskTimeElapsed}</TableCell>
                                            {/* <TableCell className="flex justify-end">
                                                <img src="trash-solid-full.svg" alt="Trash can to delete the task" className="w-5" onClick={() => handleDeleteTask(task)}/>
                                            </TableCell> */}
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
