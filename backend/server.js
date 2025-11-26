import express from 'express'

const PORT = 8000

const app = express();

app.use(express.json())

app.get('/tasks', (req, res) => {
    res.status(200).send({
        tasks: "All tasks",
        date: Date.now()
    })
})

app.post('/tasks/:id', (req, res) => {
    const { id } = req.params
    const { tasks, date } = req.body

    if(!tasks || !date) {
        res.status(418).send({ message: 'We still need the id' })
    }

    res.status(200).send({"message": "The response is OK"})
})

app.listen(PORT, () => console.log(`The server is running on th PORT ${PORT}`))