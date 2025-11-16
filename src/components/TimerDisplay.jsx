import { useState, useEffect, useRef } from 'react'
import '../App.css'


function TimerDisplay() {
    const [ time, setTime ] = useState(0)
    const [ isRunning, setIsRunning ] = useState(false)
    const [ isReset, setIsReset ] = useState(false)
    const intervalRef = useRef(null)
    const timeHr = 0
    const timeMin = 0
    const timeSec = 0

    useEffect(() => {
        if(isRunning) {
            intervalRef.current = setInterval(() => {
                if(time >= 60) {
                    setTime(0)
                } else {
                    setTime(prevTime => prevTime + 1)
                }
            }, 1000)
        } else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [isRunning, isReset])

    function formatTime(timeInSec) {
        const hours = Math.floor(timeInSec / 36000)
        const minutes = Math.floor((timeInSec % 36000) / 60)
        const seconds = Math.floor(timeInSec)

        return (
            `${String(hours).padStart(2,'0')}:` +
            `${String(minutes).padStart(2,'0')}:` +
            `${String(seconds).padStart(2,'0')}`
        )
    }

    return (
        <section>
            <div className="timeHeading">
                <h1>This is the Timer</h1>
                <h2>{formatTime(time)}</h2>
            </div>
            <div className="timerControls">
                <button className="startTimer" onClick={() => setIsRunning(true)} disabled={isRunning}>
                    <img src="/play.svg" alt="Start icon" />
                </button>
                <button className="pauseTimer" onClick={() => setIsRunning(false)} disabled={!isRunning}>
                    <img src="/pause.svg" alt="Pause icon" />
                </button>
                <button className="resetTimer" onClick={() => { setTime(0), setIsRunning(false), setIsReset(true) }} disabled={!isRunning}>
                    <img src="/reset.svg" alt="Reset icon" />
                </button>
            </div>
        </section>
    )
}

export default TimerDisplay