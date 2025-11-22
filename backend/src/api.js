export async function saveTask(entry) {
    const url = "https://script.google.com/macros/s/AKfycbx7uP3vwEiKpyThhBduh8HtmJ7k5iQeAq6Eo_FxIbbJS-L_9TNleq6ZPjLtHaap-wFyEQ/exec"

    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(entry),
        headers: { "Content-Type": "application/json" }
    })

    return res.json()
}