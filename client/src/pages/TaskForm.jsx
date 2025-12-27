import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from "sonner"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import fetchAPI from '../api.js'

const CATEGORY_OPTIONS = [
    "Bug Fix",
    "Speed OPT",
    "Security OPT",
    "SEO",
    "Plugin Install",
    "Design Fix",
    "Content Upload",
    "DOWNTIME",
    "AWS",
    "Other",
    "Feature",
    "SOP",
    "Content Fix",
    "Design",
]

const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

function TaskForm() {
    const location = useLocation()
    const taskTimeElapsed = typeof location.state === 'string'
        ? location.state
        : location.state?.taskTimeElapsed || '00:00:00'
    const [taskId, setTaskId] = useState('')
    const [loadingTaskId, setLoadingTaskId] = useState(false)
    const [dateInput] = useState(formatDateForDisplay(new Date()))

    const fetchNextTaskId = async () => {
        setLoadingTaskId(true)
        try {
            const data = await fetchAPI('/task/next-id', { method: 'GET' })
            setTaskId(data.nextId || '')
        } catch (error) {
            toast.error(error?.message || 'Unable to fetch next Task ID')
        } finally {
            setLoadingTaskId(false)
        }
    }

    useEffect(() => {
        fetchNextTaskId()
    }, [])

    const handleTaskFormData = async (event) => {
        event.preventDefault()
        const formElement = event.currentTarget
        const formData = new FormData(formElement)
        const newTask = {
            taskIdentifier: formData.get('tf-taskId'),
            taskTimeElapsed,
            taskDate: formData.get('tf-date'),
            taskCategory: formData.get('tf-taskCategory'),
            taskType: formData.get('tf-taskType'),
            taskTitle: formData.get('tf-taskTitle'),
            taskDescription: formData.get('tf-taskDescription'),
            taskPriority: Number(formData.get('tf-taskPriority')),
            taskStatus: formData.get('tf-taskStatus'),
            impactArea: formData.get('tf-impactArea'),
            impactLevel: formData.get('tf-impactLevel'),
            issueSource: formData.get('tf-issueSource'),
            toolsInvolved: formData.get('tf-toolsInvolved'),
        }

        const saveTaskPromise = fetchAPI("/task/add-task", {
            method: "POST",
            body: JSON.stringify(newTask),
        }).then((data) => {
            formElement.reset()
            fetchNextTaskId()
            return data
        })

        toast.promise(saveTaskPromise, {
            loading: "Adding task...",
            success: (data) => data.message || "Task added successfully",
            error: (error) => error?.message || "Failed to add task. Please try again.",
        })

    }

    return (
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
                    <h3 className="text-2xl font-semibold">Task Time: {taskTimeElapsed}</h3>
                </div>
                <div className="tf-form border-1 border-solid py-8 px-12 mt-20 w-200 rounded-sm">
                    <form onSubmit={handleTaskFormData} id='tf-form' className="grid grid-cols-2 gap-6">
                        <label htmlFor="tf-taskId" className="flex flex-col items-start text-l font-semibold">
                            Task ID
                            <input
                                type="text"
                                name="tf-taskId"
                                id="tf-taskId"
                                value={taskId}
                                readOnly
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            {loadingTaskId && <span className="text-xs text-muted-foreground mt-1">Fetching Task ID...</span>}
                        </label>
                        <label htmlFor="tf-date" className="flex flex-col items-start text-l font-semibold">
                            Date (dd/mm/yyyy)
                            <input
                                type="text"
                                name="tf-date"
                                id="tf-date"
                                defaultValue={dateInput}
                                placeholder="dd/mm/yyyy"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </label>
                        <label htmlFor="tf-timeElapsed" className="flex flex-col items-start text-l font-semibold">
                            Time Spent (hh:mm:ss)
                            <input
                                type="text"
                                name="tf-timeElapsed"
                                id="tf-timeElapsed"
                                value={taskTimeElapsed}
                                readOnly
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </label>
                        <label htmlFor="tf-taskCategory" className="flex flex-col items-start text-l font-semibold">
                            Task Category
                            <select
                                name="tf-taskCategory"
                                id="tf-taskCategory"
                                defaultValue={CATEGORY_OPTIONS[0]}
                                className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand shadow-xs"
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option value={option} key={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <label htmlFor="tf-taskType" className="flex flex-col items-start text-l font-semibold col-span-2">
                            Task Type
                            <input type="text" name="tf-taskType" id="tf-taskType" placeholder="e.g. API integration" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400" required />
                        </label>
                        <label htmlFor="tf-taskTitle" className="flex flex-col items-start text-l font-semibold col-span-2">
                            Task Title
                            <input type="text" name="tf-taskTitle" id="tf-taskTitle" placeholder="Enter a concise task title" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-400" required />
                        </label>
                        <label htmlFor="tf-taskDescription" className="flex flex-col items-start text-l font-semibold col-span-2">
                            Detailed Description
                            <textarea name="tf-taskDescription" id="tf-taskDescription" placeholder="Add all the relevant details" className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline min-h-32" required></textarea>
                        </label>
                        <label htmlFor="tf-taskPriority" className="flex flex-col items-start text-l font-semibold">
                            Task Priority (0-3)
                            <input type="number" name="tf-taskPriority" id="tf-taskPriority" min="0" max="3" step="1" defaultValue="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </label>
                        <label htmlFor="tf-taskStatus" className="flex flex-col items-start text-l font-semibold">
                            Status
                            <select
                                name="tf-taskStatus"
                                id="tf-taskStatus"
                                defaultValue="in-progress"
                                className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand shadow-xs"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                            </select>
                        </label>
                        <label htmlFor="tf-impactArea" className="flex flex-col items-start text-l font-semibold">
                            Impact Area
                            <input type="text" name="tf-impactArea" id="tf-impactArea" placeholder="e.g. Checkout flow" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </label>
                        <label htmlFor="tf-impactLevel" className="flex flex-col items-start text-l font-semibold">
                            Impact Level
                            <select
                                name="tf-impactLevel"
                                id="tf-impactLevel"
                                defaultValue="medium"
                                className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-sm focus:ring-brand focus:border-brand shadow-xs"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>
                        <label htmlFor="tf-issueSource" className="flex flex-col items-start text-l font-semibold">
                            Error / Issue Source
                            <input type="text" name="tf-issueSource" id="tf-issueSource" placeholder="e.g. Lighthouse audit" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </label>
                        <label htmlFor="tf-toolsInvolved" className="flex flex-col items-start text-l font-semibold">
                            Tools / Plugins Involved
                            <input type="text" name="tf-toolsInvolved" id="tf-toolsInvolved" placeholder="e.g. RankMath, Cloudflare" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                        </label>
                        <div className="col-span-2">
                            <input
                                type="submit"
                                value="Add Task"
                                disabled={loadingTaskId || !taskId}
                                className="bg-gray-800 text-white p-3 rounded-sm cursor-pointer hover:bg-gray-700 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                        </div>
                    </form>
                </div>
        </section>
    )
}

export default TaskForm
