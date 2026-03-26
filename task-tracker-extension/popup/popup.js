document.addEventListener('DOMContentLoaded', function() {

    const taskNoteInputField = document.getElementById("taskNote");

    function updateUI() {
        chrome.storage.local.get(["startTime", "elapsed", "isRunning"], (data) => {
            let total = data.elapsed || 0;

            if (data.isRunning && data.startTime) {
                total += Date.now() - data.startTime;
            }

            const seconds = Math.floor(total / 1000);

            const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const secs = String(seconds % 60).padStart(2, '0');

            document.getElementById("time").textContent = `${hrs}:${mins}:${secs}`;
        });
    }

    setInterval(updateUI, 1000);
    updateUI();

    document.getElementById("start").addEventListener("click", function() {
        chrome.runtime.sendMessage({ action: "START_TIMER" }, (response) => {
            if (response && !response.success) {
                alert(response.error);
            }
        });
    });

    document.getElementById("pause").addEventListener("click", function() {
        chrome.runtime.sendMessage({ action: "PAUSE_TIMER" }, (response) => {
            if (response && !response.success) {
                alert(response.error);
            }
        });
    });
    
    document.getElementById("reset").addEventListener("click", function() {
        chrome.runtime.sendMessage({ action: "RESET_TIMER" });
    });

    document.getElementById("stop").addEventListener("click", function() {
        let taskNote = taskNoteInputField.value;

        chrome.runtime.sendMessage({ action: "STOP_TIMER", payload: taskNote }, (response) => {
            if (response && !response.success) {
                alert(response.error);
            }
        });
    });
});