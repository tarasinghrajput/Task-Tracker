import express from 'express'
import cors from 'cors'

const PORT = 8000

const app = express();

app.use(express.json())
app.use(cors())

app.get('/api/tasks', (req, res) => {
    res.status(200).send({
        tasks: "All tasks",
        date: Date.now()
    })
})

app.post('/api/tasks/:id', (req, res) => {
    const { id } = req.params
    const { taskTimeElapsed, taskDate, taskCategory, taskType,
        taskTitle, taskDescription, taskPriority, taskStatus
    } = req.body

    if (id !== String(req.body.id)) {
        return res.status(418).send({ message: 'We still need the id' })
    }

    console.log(req.body)
    res.status(200).send({ "message": "The response is OK" })
})

app.listen(PORT, () => console.log(`The server is running on th PORT ${PORT}`))