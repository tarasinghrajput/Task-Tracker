// import { useState, useEffect } from 'react'
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
    const tasks = [{
        id: Date.now(),
        taskTimeElapsed: '00:00:50',
        taskDate: "25 Jun 2025",
        taskCategory: "Error Fix",
        taskType: "SEO",
        taskTitle: "Blog SEO Revamp",
        taskDescription: "Revamped the whole 231 blog' SEO",
        taskPriority: 1,
        taskStatus: "Completed"
    }]
    // if (localStorage.length > 0) {
    //     tasks.push(JSON.parse(localStorage.getItem('task')))
    // }

    return (

        <div className="flex flex-col items-center justify-center">
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => {
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.taskDate}</TableCell>
                                        <TableCell>{task.taskTitle}</TableCell>
                                        <TableCell className="text-right">{task.taskTimeElapsed}</TableCell>
                                    </TableRow>
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