import { useState, useEffect, useRef } from 'react'
import '../App.css'
import { useNavigate } from 'react-router-dom'


function TimerDisplay() {
    const [ time, setTime ] = useState(0)
    const [ isRunning, setIsRunning ] = useState(false)
    const intervalRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if(isRunning) {
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
            `${String(hours).padStart(2,'0')}:` +
            `${String(minutes).padStart(2,'0')}:` +
            `${String(seconds).padStart(2,'0')}`
        )
    }

    const handleNextButton = () => {
        navigate('/taskForm', { state: formatTime(time) })
    }

    return (
        <section>
            <div className="timeHeading">
                <h2>{formatTime(time)}</h2>
            </div>
            <div className="timerControls">
                <button className="startTimer" onClick={() => setIsRunning(true)} disabled={isRunning}>
                    <img src="/play.svg" alt="Start icon" />
                </button>
                <button className="pauseTimer" onClick={() => setIsRunning(false)} disabled={!isRunning}>
                    <img src="/pause.svg" alt="Pause icon" />
                </button>
                <button className="resetTimer" onClick={() => { setTime(0), setIsRunning(false) }}>
                    <img src="/reset.svg" alt="Reset icon" />
                </button>
            </div>
            <button onClick={handleNextButton}>Next</button>
        </section>
    )
}

export default TimerDisplay