import { useState, useEffect, useRef } from 'react'
import '../App.css'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import {
    ButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText,
} from "@/components/ui/button-group"


function TimerDisplay() {
    const [time, setTime] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const intervalRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1)
            }, 1000)
        } else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [isRunning])

    function formatTime(timeInSec) {
        const hours = Math.floor(timeInSec / 3600)
        const minutes = Math.floor((timeInSec % 3600) / 60)
        const seconds = Math.floor((timeInSec % 60))

        return (
            `${String(hours).padStart(2, '0')}:` +
            `${String(minutes).padStart(2, '0')}:` +
            `${String(seconds).padStart(2, '0')}`
        )
    }

    const handleNextButton = () => {
        navigate('/taskForm', { state: formatTime(time) })
    }

    return (
        <section className="taskTimer">
            <div className="timeHeading">
                <h2>{formatTime(time)}</h2>
            </div>
            <div className="timerControls">
                <ButtonGroup className="flex flex-row justify-center gap-0">
                    <Button variant="outline" className="startTimer" size="icon-lg" onClick={() => setIsRunning(true)} disabled={isRunning}>
                        <img src="/play.svg" alt="Start icon" />
                    </Button>
                    <Button variant="outline" className="pauseTimer" size="icon-lg" onClick={() => setIsRunning(false)} disabled={!isRunning}>
                        <img src="/pause.svg" alt="Pause icon" />
                    </Button>
                    <Button variant="outline" className="resetTimer" size="icon-lg" onClick={() => { setTime(0), setIsRunning(false) }}>
                        <img src="/reset.svg" alt="Reset icon" />
                    </Button>
                </ButtonGroup>
            </div>
            <Button className="taskTimerNextBtn" onClick={handleNextButton}>Next</Button>
        </section>
    )
}

export default TimerDisplay