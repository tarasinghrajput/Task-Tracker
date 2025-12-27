// import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {
    ButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText,
} from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import fetchAPI from '../api.js'

function TaskForm() {
    const location = useLocation()
    const receivedState = location.state
    const tasks = JSON.parse(localStorage.getItem('task')) || []

    const handleTaskFormData = async (event) => {
        event.preventDefault()
        const form = document.getElementById('tf-form')
        const formData = new FormData(form)
        const newTask = {
            taskTimeElapsed: formData.get('tf-timeElapsed'),
            taskDate: formData.get('tf-date'),
            taskCategory: formData.get('tf-taskCategory'),
            taskType: formData.get('tf-taskType'),
            taskTitle: formData.get('tf-taskTitle'),
            taskDescription: formData.get('tf-taskDescription'),
            taskPriority: formData.get('tf-taskPriority'),
            taskStatus: formData.get('tf-taskStatus')
        }

        toast.promise(
            fetchAPI("/task/add-task", {
                method: "POST",
                body: JSON.stringify(newTask),
            }),
            {
                loading: "Adding task...",
                success: (data) => data.message || "Task added successfully",
                error: (error) =>
                    error?.message || "Failed to add task. Please try again.",
            }
        )


    }

    return (
        <>
            <Toaster />
            <section className="taskFormSection flex flex-row items-stretch justify-between">
                <div className="tf-heading">
                    <nav>
                        <ButtonGroup>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/taskTimer">&larr; back</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/">Dashboard</Link>
                            </Button>
                        </ButtonGroup>
                    </nav>
                    <h2 className="text-5xl font-bold text-gray-900 mt-10 mb-10">Task Form Entries</h2>
                    <h3 className="text-2xl font-semibold">TaskTime: {receivedState}</h3>
                </div>
                <div className="tf-form border-1 border-solid py-8 px-12 mt-20 w-200 rounded-sm">
                    <form onSubmit={handleTaskFormData} id='tf-form' className="flex flex-col justify-center gap-8">
                        <label htmlFor="tf-date" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Date <input type="date" name="tf-date" defaultValue="2004-06-29" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </label>
                        <label htmlFor="tf-timeElapsed" className="hidden">
                            Time Elapsed <input type="hidden" name="tf-timeElapsed" value={receivedState} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </label>
                        <label htmlFor="tf-taskCategory" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Category
                            <select name="tf-taskCategory" id="tf-taskCategory" className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand shadow-xs">
                                <option value="error-fix" defaultValue>Error Fix</option>
                                <option value="seo">SEO</option>
                            </select>
                        </label>
                        <label htmlFor="tf-taskType" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Type
                            <input type="text" name="tf-taskType" id="tf-taskType" defaultValue="Default TaskForm Type" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400" />
                        </label>
                        <label htmlFor="tf-taskTitle" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Title
                            <input type="text" name="tf-taskTitle" id="tf-taskTitle" defaultValue="Default TaskForm Title" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400" />
                        </label>
                        <label htmlFor="tf-taskDescription" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Description
                            <textarea name="tf-taskDescription" id="tf-taskDescription" defaultValue="Default TaskForm Description" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                        </label>
                        <label htmlFor="tf-taskPriority" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Priority
                            <input type="range" name="tf-taskPriority" id="tf-taskPriority" min="0" max="3" step="1" className="w-full h-5" />
                        </label>
                        <label htmlFor="tf-taskStatus" className="flex flex-col items-start mb-2 text-l font-semibold">
                            Task Status
                            <select name="tf-taskStatus" id="tf-taskStatus" className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand shadow-xs">
                                <option value="pending">Pending</option>
                                <option value="in-progress" defaultValue>In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                            </select>
                        </label>
                        <input type="submit" value="Add Task" className="bg-gray-800 text-white p-2 rounded-sm cursor-pointer hover:bg-gray-700" />
                    </form>
                </div>
            </section>
        </>
    )
}

export default TaskForm